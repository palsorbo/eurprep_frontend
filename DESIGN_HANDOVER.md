# 🎨 Design System - Essentials

## Eurprep - AI-Powered Speech Analysis Platform

### 📋 Quick Reference

- **Tech Stack**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Supabase
- **Target**: Job seekers improving communication skills
- **Key Features**: One-minute practice sessions, AI feedback, multiple tracks, progress tracking

---

## 🎨 Brand Identity

### Colors

- **Primary**: Sky Blue (`#0ea5e9`, `sky-500`) - trust, professionalism
- **Accent**: Yellow (`#eab308`, `yellow-500`) - energy, optimism
- **Success**: Green (`#22c55e`, `green-500`) / Emerald (`#10b981`, `emerald-500`)
- **Warning**: Orange (`#f97316`, `orange-500`) / Amber (`#f59e0b`, `amber-500`)
- **Error**: Red (`#ef4444`, `red-500`)
- **Info**: Blue (`#3b82f6`, `blue-500`) / Teal (`#14b8a6`, `teal-500`)
- **Neutral**: Slate (`#64748b`, `slate-500`) / Gray (`#6b7280`, `gray-500`)

### Color Usage

```css
/* Text colors */
text-slate-900    /* Primary text */
text-slate-600    /* Secondary text */
text-gray-600     /* Muted text */

/* Background colors */
bg-white          /* Main content */
bg-slate-50       /* Subtle background */
bg-sky-100        /* Hover states */
bg-yellow-100     /* Highlights */

/* Status colors */
bg-emerald-100 text-emerald-700    /* Success */
bg-amber-100 text-amber-700        /* Warning */
bg-red-100 text-red-700            /* Error */
bg-blue-100 text-blue-700          /* Info */
```

### Typography

- **Font**: Inter (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Scale**: text-xs (12px) to text-3xl (30px)

---

## 🧩 Core Components

### Navigation

- **Header**: Landing page nav with logo and CTA
- **AuthenticatedHeader**: Post-login nav with user menu
- **Breadcrumb**: Page navigation hierarchy

### Content

- **CTA**: Call-to-action sections with gradient backgrounds
- **TrackCard**: Individual track/topic cards with progress
- **InsightCard**: Feedback insights with color-coded types
- **ProgressBar**: Linear and circular progress indicators

### Interactive

- **AnimatedTarget**: Loading and recording state animations
- **CollapsibleTips**: Expandable help content
- **Sparkline**: Mini charts for progress visualization

### Feedback

- **AnimatedScore**: Score display with animations
- **DetailedExamples**: Feedback examples and suggestions
- **FillerWordsBreakdown**: Specific filler word analysis
- **SkillProgress**: Individual skill progress tracking

---

## 📐 Layout & Spacing

### Spacing Scale

```css
space-0 (0px), space-1 (4px), space-2 (8px), space-3 (12px),
space-4 (16px), space-6 (24px), space-8 (32px), space-12 (48px)
```

### Container System

```css
/* Main container */
max-w-7xl mx-auto px-6

/* Content sections */
max-w-4xl mx-auto

/* Cards */
p-6 rounded-xl
```

### Responsive Breakpoints

```css
sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
```

---

## ✨ Interactions & Animations

### Animation Principles

- **Duration**: 200-300ms for most interactions
- **Easing**: Consistent curves across similar interactions
- **Purpose**: Enhance usability, not decoration

### Common Interactions

```css
/* Hover effects */
hover:scale-105 hover:shadow-lg hover:-translate-y-1

/* Transitions */
transition-all duration-300
transition-transform duration-200

/* Loading */
animate-spin animate-pulse
```

---

## ♿ Accessibility

### Requirements

- **WCAG 2.1 AA** compliance
- **Contrast**: 4.5:1 minimum for text, 3:1 for large text
- **Keyboard navigation**: All interactive elements accessible
- **Screen readers**: Semantic HTML and ARIA labels
- **Motion**: Respect `prefers-reduced-motion`

### Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Color contrast meets standards
- [ ] Focus indicators visible
- [ ] Form labels properly associated
- [ ] Error messages clear and helpful

---

## 📱 Responsive Design

### Mobile-First Approach

- **Base styles**: Mobile layout
- **Progressive enhancement**: Add complexity for larger screens
- **Touch targets**: Minimum 44px

### Common Patterns

```css
/* Responsive grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Responsive typography */
text-lg md:text-xl lg:text-2xl

/* Responsive spacing */
p-4 md:p-6 lg:p-8
```

---

## 🎯 User Personas

### Target Segments

1. **MBA Aspirants**: GD/PI preparation, business topics
2. **Mass Recruiters**: Technical interviews, HR rounds
3. **Government Job Seekers**: Descriptive papers, current affairs
4. **Private Job Seekers**: Interview preparation, networking

### User Journey

1. **Discovery**: Landing page → Learn benefits
2. **Onboarding**: Sign up → Choose track → First practice
3. **Practice**: Record → AI feedback → Review insights
4. **Progress**: Track improvement → Regular practice → Achieve goals

---

### Component Development

- **Mobile-first**: Design for mobile, scale up
- **Component-driven**: Reusable, consistent components
- **Accessibility-first**: WCAG compliance built-in
- **Performance**: Fast loading, smooth interactions

### Design Principles

1. **Clarity**: Clear hierarchy and readable typography
2. **Consistency**: Unified design language
3. **Efficiency**: Streamlined user flows
4. **Trust**: Professional appearance

---

## 📞 Quick Reference

### Key Files

- **Colors**: `src/lib/constants/colors.ts`
- **Types**: `src/lib/types/`
- **Global Styles**: `src/index.css`
- **Tailwind Config**: `tailwind.config.js`

### Common Patterns

- **Cards**: `p-6 rounded-xl bg-white shadow-sm`
- **Buttons**: `px-6 py-3 rounded-lg font-medium`
- **Sections**: `py-20 max-w-7xl mx-auto px-6`
- **Grid**: `grid gap-8 md:grid-cols-2 lg:grid-cols-3`

---

_This document contains the essential design system information needed for development. For detailed specifications, refer to Figma designs._
