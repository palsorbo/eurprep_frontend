# Cloudflare Pages Deployment Guide

## Routing Configuration for React SPA

This project uses a hybrid approach with static marketing pages and a React SPA. The routing configuration ensures that:

- Static HTML files are served from root (`/`, `/about`, `/contact`)
- React app routes are handled by the SPA (`/app/*`)

## Files Included in Build

The build process creates these routing files in the `dist/` directory:

### `_routes.json` (Primary Cloudflare Pages routing)

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/assets/*",
    "/favicon.svg",
    "/site.webmanifest",
    "/icon-192.png"
  ],
  "routes": [
    {
      "src": "/app/*",
      "dest": "/app/index.html",
      "status": 200
    },
    {
      "src": "/assets/*",
      "dest": "/assets/*"
    }
  ]
}
```

### `_redirects` (Alternative routing for other hosts)

```
/app/*    /app/index.html   200
```

## Deployment Steps

### 1. Build the Project

```bash
npm run build
```

### 2. Deploy to Cloudflare Pages

#### Option A: Using Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Deploy
wrangler pages deploy dist
```

#### Option B: Using Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Pages
2. Create a new project
3. Connect your GitHub repository
4. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

### 3. Verify Routing

After deployment, test these URLs:

- `yourapp.com` → Marketing homepage ✅
- `yourapp.com/about` → About page ✅
- `yourapp.com/contact` → Contact page ✅
- `yourapp.com/app` → React app dashboard ✅
- `yourapp.com/app/login` → React login page ✅
- `yourapp.com/app/dashboard` → React dashboard ✅

## Troubleshooting

### Issue: React routes return 404

**Solution**: Ensure `_routes.json` is in the root of your `dist/` directory and contains the correct routing rules.

### Issue: Assets not loading

**Solution**: Check that the `exclude` array in `_routes.json` doesn't block necessary assets.

### Issue: Marketing pages not working

**Solution**: Verify that static HTML files are in the root of `dist/` directory.

## Build Output Structure

```
dist/
├── index.html          # Marketing homepage
├── about.html          # About page
├── contact.html        # Contact page
├── _routes.json        # Cloudflare Pages routing
├── _redirects          # Alternative routing
├── favicon.svg         # Favicon
├── site.webmanifest    # Web manifest
├── icon-192.png        # App icon
└── app/                # React application
    ├── index.html      # React app entry point
    └── assets/         # React app assets
```

## Environment Variables

If you need to set environment variables for the React app:

1. Go to Cloudflare Pages project settings
2. Navigate to "Environment variables"
3. Add your variables (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

## Custom Domain

1. In Cloudflare Pages project settings
2. Go to "Custom domains"
3. Add your domain
4. Update DNS records as instructed

## Performance Optimization

- Static marketing pages are served directly (fast)
- React app is code-split and lazy-loaded
- Assets are optimized and cached
- CDN distribution via Cloudflare's global network
