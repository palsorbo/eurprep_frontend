# FlyIO Speech Analysis API Integration

This document describes the integration of the FlyIO Speech Analysis API into the Courage application.

## Overview

The integration provides:

- **Transcription**: Convert audio recordings to text
- **Feedback Analysis**: Analyze speech for JAM feedback
- **Credit Management**: Handle credit consumption and refunds
- **Payment Integration**: Process payments via Razorpay

## API Endpoints

### Base Configuration

- **Base URL**: `http://localhost:9090` (configurable via `VITE_API_BASE_URL`)
- **Authentication**: Bearer token (JWT from Supabase)

### Core Endpoints

#### Transcription

- **URL**: `/api/v1/transcribe`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Required
- **Description**: Upload audio file and get transcription

#### Feedback Analysis

- **URL**: `/api/v1/speech/jam`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Required
- **Description**: Analyze speech transcript and provide JAM feedback

### Credit System Endpoints

#### Get Credit Balance

- **URL**: `/api/v1/credits/balance`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get authenticated user's credit balance

#### Consume Credits

- **URL**: `/api/v1/credits/consume`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Required
- **Description**: Consume credits for feedback analysis

#### Refund Credits

- **URL**: `/api/v1/credits/refund`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Required
- **Description**: Refund credits on analysis failure

#### Add Bonus Credits

- **URL**: `/api/v1/credits/bonus`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Required
- **Description**: Add bonus credits to user

#### Get Credit Packs

- **URL**: `/api/v1/credits/packs`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get available credit packs for purchase

#### Get Transaction History

- **URL**: `/api/v1/credits/transactions`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Get user's transaction history

### Payment Integration

#### Razorpay Webhook

- **URL**: `/api/v1/webhooks/razorpay`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: None (called by Razorpay)
- **Description**: Process payment confirmations from Razorpay

## Implementation Details

### Authentication

The API uses JWT tokens from Supabase authentication. The token is automatically included in all authenticated requests.

### Complete Analysis Workflow

The `performCompleteAnalysis` function handles the entire workflow:

1. Transcribe audio
2. Consume credits
3. Get feedback analysis
4. Refund credits on failure

### Error Handling

- Network errors are caught and logged
- Authentication errors trigger re-authentication
- Analysis failures automatically refund credits
- Fallback to mock data for better UX

### Credit Management

- Credits are consumed after successful analysis
- Failed analyses automatically refund credits
- Bonus credits can be added for promotions
- Transaction history is maintained

## Environment Variables

```bash
# FlyIO API Configuration
VITE_API_BASE_URL=http://localhost:9090

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
```

## Usage Examples

### Basic Transcription

```typescript
import { transcribeAudio } from "../lib/flyio-api";

const result = await transcribeAudio(audioBlob);
if (result.error) {
  console.error("Transcription failed:", result.error);
} else {
  console.log("Transcript:", result.text);
}
```

### Complete Analysis

```typescript
import { performCompleteAnalysis } from "../lib/api";

const result = await performCompleteAnalysis(
  audioBlob,
  "Project Management",
  45.2,
  "rec_123456789"
);

if (result.error) {
  console.error("Analysis failed:", result.error);
} else {
  console.log("Feedback:", result.feedback);
}
```

### Credit Management

```typescript
import { useCredits } from "../hooks/useCredits";

const { balance, consume, refund } = useCredits();

// Consume credits
const result = await consume("rec_123456789", "JAM feedback analysis");

// Refund credits
const refundResult = await refund("rec_123456789", "Technical issue");
```

## Components

### CreditDisplay

Displays current credit balance with loading and error states.

### CreditPacksDisplay

Shows available credit packs for purchase with pricing and features.

### TransactionHistory

Displays user's transaction history with detailed information.

## Testing

The integration includes fallback mechanisms:

- Mock feedback data for development
- Error handling for network issues
- Graceful degradation when API is unavailable

## Security

- All API calls require authentication
- JWT tokens are automatically managed
- Sensitive data is not logged
- Webhook signatures are verified

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Ensure user is logged in
   - Check JWT token validity
   - Verify Supabase configuration

2. **Network Errors**

   - Check API base URL
   - Verify network connectivity
   - Check CORS configuration

3. **Credit Issues**
   - Verify credit balance
   - Check transaction history
   - Ensure proper error handling

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem("debug", "true");
```

## Future Enhancements

- Real-time credit balance updates
- Advanced error reporting
- Analytics integration
- Multi-language support
- Offline mode support
