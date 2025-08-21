# Backend Integration Guide for Credit System

This guide provides the complete implementation for integrating the credit system with your Fly.io backend, including Razorpay webhook handling and credit management API endpoints.

## Overview

The credit system requires the following backend components:

1. **Razorpay Webhook Handler** - Processes payment confirmations
2. **Credit Management API** - Handles credit operations
3. **Database Integration** - Manages credit balances and transactions

## Environment Variables

Add these to your backend environment:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Backend Configuration
PORT=3000
NODE_ENV=production
```

## Database Schema

Ensure your Supabase database has the credit system tables. Run the SQL from `src/lib/database/schema.sql` in your Supabase SQL editor.

## API Endpoints

### 1. Razorpay Webhook Handler

**Endpoint:** `POST /api/webhooks/razorpay`

**Purpose:** This endpoint receives payment confirmations from Razorpay when a user successfully completes a payment. It verifies the payment signature for security and adds credits to the user's account.

**When it's called:** Automatically by Razorpay when payment is captured

```javascript
// webhooks/razorpay.js
const crypto = require("crypto");
const { supabase } = require("../lib/supabase");
const { CREDIT_PACKS } = require("../lib/credit-packs");

/**
 * Verifies the webhook signature from Razorpay to ensure the request is legitimate
 * This prevents malicious actors from spoofing payment confirmations
 *
 * @param {string} payload - The raw request body as string
 * @param {string} signature - The signature sent by Razorpay in x-razorpay-signature header
 * @returns {boolean} - True if signature is valid, false otherwise
 */
async function verifyWebhookSignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Adds credits to a user's account after successful payment
 * This function handles the complete credit addition process including:
 * - Validating the credit pack
 * - Getting current user balance
 * - Adding new credits (including bonus credits)
 * - Creating an audit trail transaction
 *
 * @param {Object} paymentData - Payment information from Razorpay
 * @param {string} paymentData.userId - User's unique identifier
 * @param {string} paymentData.packId - ID of the credit pack purchased
 * @param {string} paymentData.paymentId - Razorpay payment ID
 * @param {Object} paymentData.metadata - Additional payment metadata
 * @returns {Object} - Success status and new balance
 */
async function addCreditsFromPurchase(paymentData) {
  const { userId, packId, paymentId, metadata } = paymentData;

  try {
    // Validate that the credit pack exists
    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) {
      throw new Error("Invalid credit pack");
    }

    // Get current user balance from database
    const { data: currentCredits, error: fetchError } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    // Handle case where user has no credit record yet
    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    const currentBalance = currentCredits?.balance || 0;
    const newBalance = currentBalance + pack.total; // Add base + bonus credits

    // Update user's credit balance in database
    const { error: updateError } = await supabase.from("user_credits").upsert({
      user_id: userId,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    });

    if (updateError) throw updateError;

    // Create audit trail transaction for transparency
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        transaction_type: "purchase",
        amount: pack.total,
        balance_before: currentBalance,
        balance_after: newBalance,
        description: `Purchased ${pack.name} pack: ${pack.credits} credits + ${pack.bonus} bonus`,
        metadata: {
          ...metadata,
          pack_id: packId,
          pack_name: pack.name,
          base_credits: pack.credits,
          bonus_credits: pack.bonus,
          price: pack.price,
        },
        payment_id: paymentId,
      });

    if (transactionError) throw transactionError;

    return { success: true, new_balance: newBalance };
  } catch (error) {
    console.error("Error adding credits from purchase:", error);
    throw error;
  }
}

/**
 * Main webhook handler for Razorpay payment confirmations
 * This endpoint is called by Razorpay when payment events occur
 * It processes payment.captured events and adds credits to user accounts
 */
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Security: Verify the webhook signature to ensure it's from Razorpay
    const signature = req.headers["x-razorpay-signature"];
    const payload = JSON.stringify(req.body);

    const isValid = await verifyWebhookSignature(payload, signature);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const { event, payload: eventPayload } = req.body;

    // Process payment.captured event (when payment is successfully completed)
    if (event === "payment.captured") {
      const {
        id: paymentId,
        amount,
        currency,
        notes,
      } = eventPayload.payment.entity;

      // Extract user and pack information from payment notes
      // These were added when creating the Razorpay order
      const packId = notes?.pack_id;
      const userId = notes?.user_id;

      if (!packId || !userId) {
        return res
          .status(400)
          .json({ error: "Missing pack_id or user_id in notes" });
      }

      // Add credits to user account and create audit trail
      const result = await addCreditsFromPurchase({
        userId,
        packId,
        paymentId,
        metadata: {
          amount,
          currency,
          notes,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Credits added successfully",
        data: result,
      });
    }

    // Handle other Razorpay events if needed (payment.failed, etc.)
    return res.status(200).json({ success: true, message: "Event processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
```

### 2. Credit Management API

**Endpoint:** `POST /api/credits/consume`

**Purpose:** This endpoint deducts credits from a user's account when they perform a feedback analysis. It ensures users have sufficient credits before allowing the analysis and creates an audit trail.

**When it's called:** When a user submits a recording for analysis (after successful feedback analysis)

```javascript
// api/credits/consume.js
const { supabase } = require("../lib/supabase");

/**
 * Consumes credits from user account for feedback analysis
 * This endpoint is called after successful feedback analysis to deduct credits
 * It ensures users can only perform analysis if they have sufficient credits
 */
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, recordingId, description, metadata } = req.body;

    // Validate required fields
    if (!userId || !recordingId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get current user credit balance from database
    const { data: currentCredits, error: fetchError } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    // Handle case where user has no credit record yet
    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    const currentBalance = currentCredits?.balance || 0;
    const requiredCredits = 1; // 1 credit per analysis

    // Check if user has sufficient credits
    if (currentBalance < requiredCredits) {
      return res.status(400).json({
        success: false,
        error: "Insufficient credits",
        current_balance: currentBalance,
        required_credits: requiredCredits,
      });
    }

    const newBalance = currentBalance - requiredCredits;

    // Update user's credit balance in database
    const { error: updateError } = await supabase.from("user_credits").upsert({
      user_id: userId,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    });

    if (updateError) throw updateError;

    // Create audit trail transaction for transparency
    const { data: transaction, error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        transaction_type: "consumption",
        amount: -requiredCredits,
        balance_before: currentBalance,
        balance_after: newBalance,
        description: description || "Credit consumed for feedback analysis",
        metadata: metadata || {},
        recording_id: recordingId,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    return res.status(200).json({
      success: true,
      new_balance: newBalance,
      transaction_id: transaction.id,
      message: "Credits consumed successfully",
    });
  } catch (error) {
    console.error("Error consuming credits:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to consume credits",
    });
  }
};
```

**Endpoint:** `POST /api/credits/refund`

**Purpose:** This endpoint refunds credits to a user's account when a feedback analysis fails. It ensures users don't lose credits due to technical issues and maintains trust in the system.

**When it's called:** When a feedback analysis fails due to network errors, AI service issues, or other technical problems

```javascript
// api/credits/refund.js
const { supabase } = require("../lib/supabase");

/**
 * Refunds credits to user account when analysis fails
 * This endpoint is called when feedback analysis fails due to technical issues
 * It ensures users don't lose credits due to system problems
 */
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, recordingId, reason, metadata } = req.body;

    // Validate required fields
    if (!userId || !recordingId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get current user credit balance from database
    const { data: currentCredits, error: fetchError } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    // Handle case where user has no credit record yet
    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    const currentBalance = currentCredits?.balance || 0;
    const refundAmount = 1; // 1 credit refund
    const newBalance = currentBalance + refundAmount;

    // Update user's credit balance in database
    const { error: updateError } = await supabase.from("user_credits").upsert({
      user_id: userId,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    });

    if (updateError) throw updateError;

    // Create audit trail transaction for transparency
    const { data: transaction, error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        transaction_type: "refund",
        amount: refundAmount,
        balance_before: currentBalance,
        balance_after: newBalance,
        description: `Credit refund: ${reason}`,
        metadata: metadata || {},
        recording_id: recordingId,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    return res.status(200).json({
      success: true,
      new_balance: newBalance,
      transaction_id: transaction.id,
      message: "Credits refunded successfully",
    });
  } catch (error) {
    console.error("Error refunding credits:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to refund credits",
    });
  }
};
```

**Endpoint:** `GET /api/credits/balance/:userId`

**Purpose:** This endpoint retrieves a user's current credit balance. It's used by the frontend to display credit information and check if users can perform analysis.

**When it's called:** When the frontend needs to display user's credit balance or check credit availability

```javascript
// api/credits/balance/[userId].js
const { supabase } = require("../lib/supabase");

/**
 * Retrieves user's current credit balance
 * This endpoint is used by the frontend to display credit information
 * It returns 0 if user has no credit record yet
 */
module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.query;

    // Validate user ID parameter
    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    // Get user's credit balance from database
    const { data, error } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    // Handle case where user has no credit record yet
    if (error && error.code !== "PGRST116") {
      throw error;
    }

    const balance = data?.balance || 0;

    return res.status(200).json({
      success: true,
      balance,
      user_id: userId,
    });
  } catch (error) {
    console.error("Error getting credit balance:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get credit balance",
    });
  }
};
```

### 3. Credit Pack Configuration

**Purpose:** This configuration file defines all available credit packs with their pricing, bonus credits, and features. It's used by both frontend and backend to ensure consistency.

**When it's used:** When creating Razorpay orders, displaying pack information, and calculating credit amounts

Create `lib/credit-packs.js`:

```javascript
// lib/credit-packs.js
/**
 * Credit pack configuration for the application
 * This defines all available credit packs with pricing and features
 * Used by both frontend and backend for consistency
 */
const CREDIT_PACKS = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    credits: 10,
    bonus: 0,
    total: 10,
    description: "Perfect for casual users",
    popular: false,
    features: ["10 feedback analyses", "Basic support"],
  },
  {
    id: "value",
    name: "Value (Most Popular)",
    price: 299,
    credits: 30,
    bonus: 5,
    total: 35,
    description: "Great value for serious seekers",
    popular: true,
    features: ["35 feedback analyses", "Priority support", "25% bonus credits"],
  },
  {
    id: "pro-max",
    name: "Pro Max",
    price: 999,
    credits: 100,
    bonus: 25,
    total: 125,
    description: "Best for power learners & pros",
    popular: false,
    features: [
      "125 feedback analyses",
      "Premium support",
      "25% bonus credits",
      "Best value",
    ],
  },
];

/**
 * Get a credit pack by its ID
 * @param {string} id - The pack ID to find
 * @returns {Object|undefined} - The credit pack or undefined if not found
 */
const getCreditPackById = (id) => {
  return CREDIT_PACKS.find((pack) => pack.id === id);
};

/**
 * Get the most popular credit pack
 * @returns {Object|undefined} - The popular pack or undefined if none marked as popular
 */
const getPopularPack = () => {
  return CREDIT_PACKS.find((pack) => pack.popular);
};

module.exports = {
  CREDIT_PACKS,
  getCreditPackById,
  getPopularPack,
};
```

## Frontend Integration

### 1. Update Frontend API Calls

**Purpose:** These functions connect the frontend to the backend credit management APIs. They handle credit consumption, refunds, and balance queries.

**When they're used:** When the frontend needs to interact with the credit system (purchases, analysis, balance checks)

Update your frontend credit system to call the backend APIs:

```javascript
// lib/api/credits.js
const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:3000";

export async function consumeCredits(params) {
  const response = await fetch(`${BACKEND_URL}/api/credits/consume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  return response.json();
}

export async function refundCredits(params) {
  const response = await fetch(`${BACKEND_URL}/api/credits/refund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  return response.json();
}

export async function getCreditBalance(userId) {
  const response = await fetch(`${BACKEND_URL}/api/credits/balance/${userId}`);
  return response.json();
}
```

### 2. Razorpay Integration

**Purpose:** This section shows how to integrate Razorpay for payment processing. It includes order creation and payment handling.

**When it's used:** When users want to purchase credits through the payment gateway

Install Razorpay SDK:

```bash
npm install razorpay
```

Create payment handler:

````javascript
// lib/razorpay.js
/**
 * Razorpay payment integration for credit purchases
 * Handles order creation and payment processing
 */
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Creates a Razorpay order for credit pack purchase
 * @param {string} packId - The credit pack ID
 * @param {string} userId - The user's ID
 * @returns {Object} - Razorpay order object
 */
async function createOrder(packId, userId) {
    const pack = getCreditPackById(packId);
    if (!pack) {
        throw new Error('Invalid credit pack');
    }

    const options = {
        amount: pack.price * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `credit_pack_${packId}_${Date.now()}`,
        notes: {
            pack_id: packId,
            user_id: userId,
            pack_name: pack.name,
            credits: pack.total
        }
    };

    const order = await razorpay.orders.create(options);
    return order;
}

module.exports = {
    razorpay,
    createOrder
};

```javascript
// lib/razorpay.js
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createOrder(packId, userId) {
    const pack = getCreditPackById(packId);
    if (!pack) {
        throw new Error('Invalid credit pack');
    }

    const options = {
        amount: pack.price * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `credit_pack_${packId}_${Date.now()}`,
        notes: {
            pack_id: packId,
            user_id: userId,
            pack_name: pack.name,
            credits: pack.total
        }
    };

    const order = await razorpay.orders.create(options);
    return order;
}

module.exports = {
    razorpay,
    createOrder
};
````

## Testing

### 1. Test Credit Consumption

```bash
curl -X POST http://localhost:3000/api/credits/consume \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "recordingId": "recording-uuid",
    "description": "Test consumption",
    "metadata": {"test": true}
  }'
```

### 2. Test Credit Refund

```bash
curl -X POST http://localhost:3000/api/credits/refund \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "recordingId": "recording-uuid",
    "reason": "Test refund",
    "metadata": {"test": true}
  }'
```

### 3. Test Webhook (using ngrok)

```bash
# Start ngrok to expose local server
ngrok http 3000

# Use the ngrok URL in Razorpay webhook settings
# Test with Razorpay webhook simulator
```

## Deployment

### 1. Fly.io Deployment

```bash
# Deploy to Fly.io
fly deploy

# Set environment variables
fly secrets set RAZORPAY_KEY_ID=your_key_id
fly secrets set RAZORPAY_KEY_SECRET=your_key_secret
fly secrets set RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
fly secrets set SUPABASE_URL=your_supabase_url
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Webhook Configuration

1. Go to Razorpay Dashboard
2. Navigate to Settings > Webhooks
3. Add webhook URL: `https://your-app.fly.dev/api/webhooks/razorpay`
4. Select events: `payment.captured`
5. Save and copy the webhook secret

### 3. Update Frontend Environment

```env
VITE_BACKEND_URL=https://your-app.fly.dev
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Security Considerations

1. **Webhook Verification**: Always verify Razorpay webhook signatures
2. **Database Security**: Use RLS policies in Supabase
3. **API Security**: Implement proper authentication for credit APIs
4. **Error Handling**: Log all credit operations for audit
5. **Rate Limiting**: Implement rate limiting on credit APIs

## Monitoring

### 1. Credit Transaction Logs

Monitor credit transactions in Supabase:

```sql
-- Recent credit transactions
SELECT * FROM credit_transactions
ORDER BY created_at DESC
LIMIT 10;

-- Failed transactions
SELECT * FROM credit_transactions
WHERE transaction_type = 'refund'
ORDER BY created_at DESC;
```

### 2. Webhook Monitoring

Monitor webhook delivery in Razorpay dashboard and your application logs.

## Troubleshooting

### Common Issues

1. **Webhook not received**: Check webhook URL and network connectivity
2. **Credits not added**: Verify webhook signature and database permissions
3. **Transaction errors**: Check Supabase RLS policies
4. **Payment failures**: Verify Razorpay configuration

### Debug Commands

```bash
# Check webhook logs
fly logs

# Check environment variables
fly secrets list

# Test database connection
fly ssh console
```

## Support

For issues with:

- **Razorpay Integration**: Check Razorpay documentation
- **Database Issues**: Check Supabase logs and RLS policies
- **Webhook Problems**: Verify webhook URL and signature verification
- **Credit System**: Review transaction logs and API responses

This completes the backend integration for the credit system. The implementation provides secure, scalable credit management with proper audit trails and error handling.
