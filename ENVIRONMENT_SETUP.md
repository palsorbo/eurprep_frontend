# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay Configuration (for development)
VITE_RAZORPAY_KEY_ID=rzp_test_64B5eSzV0aIVXB
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Backend URL (for production)
VITE_BACKEND_URL=https://your-app.fly.dev

# Development Settings
VITE_DEV_MODE=true
```

## Getting Razorpay Keys

1. **Sign up for Razorpay**: Go to https://razorpay.com and create an account
2. **Create a new app**: In your Razorpay dashboard, create a new application
3. **Get API keys**: Navigate to Settings > API Keys
4. **Copy the keys**: Use the test keys for development, live keys for production

## Development vs Production

### Development Mode

- Uses mock APIs for testing
- No real payments processed
- Razorpay keys not required for basic testing

### Production Mode

- Requires real Razorpay keys
- Real payments processed
- Backend integration required

## Backend Environment Variables

For your Fly.io backend, you'll need:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_64B5eSzV0aIVXB
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Backend Configuration
PORT=3000
NODE_ENV=production
```

## Security Notes

1. **Never commit `.env.local`** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** for security
4. **Use environment-specific** configurations

## Troubleshooting Common Issues

### Issue 1: "Unrecognized feature: 'otp-credentials'"

- **Cause**: Browser compatibility issue with Razorpay's new features
- **Solution**: This is a warning and doesn't affect functionality

### Issue 2: "POST https://lumberjack.razorpay.com/v1/track net::ERR_BLOCKED_BY_CLIENT"

- **Cause**: Ad blocker or privacy extension blocking Razorpay analytics
- **Solution**: This is expected and doesn't affect payment flow

### Issue 3: "400 (Bad Request)" errors

- **Cause**: Missing or incorrect Razorpay configuration
- **Solution**: Ensure proper environment variables are set

### Issue 4: Razorpay modal not opening

- **Cause**: Missing or invalid Razorpay key
- **Solution**: Check that `VITE_RAZORPAY_KEY_ID` is set correctly
