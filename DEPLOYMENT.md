# Deployment Guide

## Routing Structure

This application uses a hybrid approach with:

- **Static Marketing Site**: Served from root (`/`, `/about`, `/contact`, etc.)
- **React Application**: Served from `/app/*` routes

### File Structure

```
dist/
├── index.html          # Marketing homepage
├── about.html          # About page
├── contact.html        # Contact page
├── _routes.json        # Cloudflare Pages routing
├── assets/             # Shared assets
└── app/                # React application
    ├── index.html      # React app entry point
    └── assets/         # React app assets
```

### URL Structure

- `yourapp.com` → Marketing homepage
- `yourapp.com/about` → About page
- `yourapp.com/contact` → Contact page
- `yourapp.com/app` → React app dashboard
- `yourapp.com/app/login` → React app login
- `yourapp.com/app/dashboard` → React app dashboard

## Deployment to Cloudflare Pages

### 1. Build the Application

```bash
npm run build
```

This will:

- Build the React app to `dist/app/`
- Copy static HTML files to `dist/`
- Set up proper routing configuration

### 2. Deploy to Cloudflare Pages

#### Option A: Using Wrangler CLI

```bash
# Install Wrangler if not already installed
npm install -g wrangler

# Deploy
wrangler pages deploy dist
```

#### Option B: Using Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Pages
2. Create a new project
3. Connect your GitHub repository
4. Set build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (leave empty)

### 3. Routing Configuration

The `_routes.json` file in the `dist/` directory configures Cloudflare Pages routing:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/app/*",
    "/assets/*",
    "/favicon.svg",
    "/site.webmanifest",
    "/icon-192.png"
  ],
  "routes": [
    {
      "src": "/app/*",
      "dest": "/app/index.html"
    },
    {
      "src": "/assets/*",
      "dest": "/assets/*"
    }
  ]
}
```

## Development

### Local Development

```bash
npm run dev
```

The development server will serve:

- Static files from `public/` at root
- React app at `/app/*` routes

### Testing the Build

```bash
npm run build
npm run preview
```

## Authentication Flow

1. Users visit marketing site at root URLs
2. Click "Login" or "Get Started" → redirected to `/app/login`
3. After authentication → redirected to `/app/dashboard`
4. Logout → redirected back to marketing site

## SEO Considerations

- Marketing pages (home, about, contact) are static HTML for optimal SEO
- React app routes are client-side rendered and don't need SEO optimization
- Meta tags are included in static HTML files
- Sitemap can be generated for marketing pages

## Troubleshooting

### Common Issues

1. **404 on React routes**: Ensure `_routes.json` is properly configured
2. **Assets not loading**: Check that assets are in the correct directories
3. **Authentication redirects**: Verify redirect URLs use `/app/` base path

### Debugging

- Check Cloudflare Pages logs in the dashboard
- Verify build output structure matches expected layout
- Test routing locally with `npm run preview`
