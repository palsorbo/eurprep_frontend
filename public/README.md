# Static HTML Conversion - Eurprep

This directory contains the static HTML version of the Eurprep website, converted from the Next.js application.

## Files

- `index.html` - Main landing page
- `about.html` - About page with company information
- `contact.html` - Contact page with email functionality
- `login.html` - Login page (demo mode)
- `favicon.ico` - Website favicon

## Features

### ✅ Converted Components

- **Header & Navigation** - Responsive navigation with logo and auth buttons
- **Footer** - Company links and copyright information
- **CTA Sections** - Call-to-action components with proper styling
- **AnimatedTarget** - CSS animations preserved and converted to HTML
- **Logo Component** - Converted to use Lucide CDN icons

### ✅ Preserved Functionality

- **Responsive Design** - All Tailwind classes maintained
- **CSS Animations** - Custom keyframes and transitions extracted
- **Interactive Elements** - Email copying, hover effects, form handling
- **SEO Meta Tags** - Proper meta descriptions and Open Graph tags
- **Accessibility** - ARIA attributes and semantic HTML structure

### ✅ Technical Implementation

- **Tailwind CSS CDN** - For styling and responsive design
- **Lucide Icons CDN** - For consistent iconography
- **Vanilla JavaScript** - For interactive functionality
- **Relative Links** - All internal navigation updated to .html extensions

## Usage

### Local Development

1. Open any HTML file in a web browser
2. All assets are loaded from CDN, so internet connection is required
3. No build process or server setup needed

### Deployment

- Can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)
- All files are self-contained with CDN dependencies

## Browser Compatibility

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support required
- JavaScript enabled for interactive features

## Demo Mode

The login page includes a demo notice indicating this is a static HTML version. In a production environment, this would connect to the actual authentication system.

## File Structure

```
static-html/
├── index.html          # Main landing page
├── about.html          # About page
├── contact.html        # Contact page with email functionality
├── login.html          # Login page (demo)
├── favicon.ico         # Website icon
└── README.md           # This file
```

## Conversion Notes

- All React components converted to pure HTML
- Next.js Link components replaced with standard anchor tags
- Lucide React icons replaced with Lucide CDN implementation
- CSS-in-JS styles extracted to inline CSS
- Client-side interactivity converted to vanilla JavaScript
- All responsive breakpoints and animations preserved

## Performance

- Minimal file sizes (no React bundle)
- CDN-based dependencies for faster loading
- Optimized CSS with only required styles
- No build process required

---

_Converted from Next.js application on July 28, 2024_
