# ⚡ React + Supabase + shadcn/ui + Tailwind Starter

## Speak for 1 Minute. Get Job-Winning Feedback!

**Used by 100+ freshers to crack TCS, Infosys & MBA interviews.**

[Start Practicing for Free](#getting-started) | [View Demo](#live-demo) | [What Users Say](#testimonials)

---

A modern, mobile-first web app boilerplate using:

- ✅ **React** for the frontend (via [Next.js](https://nextjs.org/))
- ✅ **Supabase** for authentication & backend
- ✅ **shadcn/ui** + **Tailwind CSS** for a modern, accessible UI
- ✅ **SSG** for landing pages, **CSR** for the dashboard & auth-protected routes

This project is a platform for practicing "Just A Minute" (JAM) speaking sessions and helps users improve their communication skills.

## Target Market

### 🎓 MBA Aspirants

- **Focus Areas**: Business case discussions, group discussions, personal interviews
- **Key Features**: Corporate communication, leadership scenarios, business topics
- **Pain Points**: Nervousness in GD/PI rounds, lack of structured practice
- **Topics**: Startup culture, digital transformation, market trends, leadership

### 🏢 Mass Recruiters (TCS, Infosys, Wipro, etc.)

- **Focus Areas**: Technical interviews, HR rounds, communication assessment
- **Key Features**: Technical vocabulary, professional communication, confidence building
- **Pain Points**: Technical knowledge vs communication skills gap
- **Topics**: Technology trends, workplace culture, career growth, teamwork

### 🏛️ Government Job Seekers (SBI, SSC, RBI, UPSC, etc.)

- **Focus Areas**: Descriptive papers, interview rounds, current affairs
- **Key Features**: Formal communication, current events, policy discussions
- **Pain Points**: Structured thinking, time management, formal language
- **Topics**: Government policies, current affairs, social issues, economic reforms

### 💼 Private Job Seekers

- **Focus Areas**: Interview preparation, elevator pitches, networking
- **Key Features**: Personal branding, industry-specific topics, confidence building
- **Pain Points**: Interview anxiety, lack of practice opportunities
- **Topics**: Industry trends, career development, personal growth, networking

### 🎯 Platform Benefits by Segment

| Segment             | Primary Need            | Key Benefit                       | Success Metric         |
| ------------------- | ----------------------- | --------------------------------- | ---------------------- |
| MBA Aspirants       | GD/PI preparation       | Structured practice with feedback | Admission success rate |
| Mass Recruiters     | Technical communication | Confidence in interviews          | Job placement rate     |
| Govt Job Seekers    | Current affairs fluency | Time-bound practice               | Exam performance       |
| Private Job Seekers | Interview confidence    | Real-world scenarios              | Career advancement     |

## Screenshots

_(Coming Soon: Add screenshots of the dashboard, recording screen, and feedback report here.)_

## Live Demo

_(Coming Soon: Link to a live demo on Cloudflare Pages will be added here.)_

**Deployment**: Our frontend is deployed using [Cloudflare Pages](https://pages.cloudflare.com/) for static site hosting, providing fast global CDN distribution and excellent performance.

## What Our Users Say

<p align="center">
  <strong>"This platform was a game-changer for my MBA interviews. The instant feedback helped me identify and fix my filler words."</strong>
  <br>
  <em>- Anjali, IIM-A Aspirant</em>
</p>

_(More testimonials will be added as they become available.)_

---

## <p align="center"><strong>The following sections are for developers and contributors.</strong></p>

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm (or yarn/pnpm)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/eurpep.git
cd eurpep
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

First, copy the example environment file:

```bash
cp .env.example .env.local
```

Now, open `.env.local` and fill in the required values for your Supabase project, API keys, etc.

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 5. Supabase Setup (Optional)

If you are running Supabase locally, you can start it with:

```bash
supabase start
```

This is not required if you are using a hosted Supabase project.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI**: [shadcn/ui](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **Backend-as-a-Service (BaaS)**: [Supabase](https://supabase.io/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)

### Authentication: Google OAuth via Supabase

Based on our discussion, the application will use Supabase for authentication, with Google as the primary OAuth provider. This provides a secure and streamlined login experience for users.

### AI Services: External Integration

The core AI functionalities for audio transcription and speech feedback will be handled by an external service, as you've specified. The Next.js application will feature API routes (`/api/transcribe` and `/api/feedback`) that will act as a proxy to this service. This architecture keeps the frontend decoupled from the AI implementation details.

## Proposed Database Schema

To support the application's features, the following database schema is proposed. It is designed for scalability and the feedback table is specifically designed to be extensible and configurable as requested.

### `profiles` table

Stores public user data, linked to Supabase's `auth.users` table.

| Column       | Type          | Constraints                                 | Description                      |
| ------------ | ------------- | ------------------------------------------- | -------------------------------- |
| `id`         | `uuid`        | Primary Key, Foreign Key to `auth.users.id` | User's unique identifier.        |
| `full_name`  | `text`        |                                             | User's full name.                |
| `avatar_url` | `text`        |                                             | URL for the user's avatar image. |
| `created_at` | `timestamptz` | `NOT NULL`                                  | Timestamp of profile creation.   |

### `recordings` table

Stores metadata for each audio recording.

| Column             | Type          | Constraints                    | Description                                           |
| ------------------ | ------------- | ------------------------------ | ----------------------------------------------------- |
| `id`               | `uuid`        | Primary Key                    | Unique identifier for the recording.                  |
| `user_id`          | `uuid`        | Foreign Key to `auth.users.id` | The user who created the recording.                   |
| `storage_path`     | `text`        | `NOT NULL`                     | Path to the audio file in Supabase Storage.           |
| `duration_seconds` | `integer`     |                                | Duration of the recording in seconds.                 |
| `transcript`       | `text`        | `nullable`                     | The transcribed text of the recording.                |
| `status`           | `text`        | `default: 'pending'`           | e.g., 'pending', 'processing', 'completed', 'failed'. |
| `created_at`       | `timestamptz` | `NOT NULL`                     | Timestamp of recording creation.                      |

### `feedback` table

Stores the analysis and feedback for each recording. The `feedback_data` column uses `jsonb` to allow for a flexible and extensible structure.

| Column          | Type          | Constraints                              | Description                                                                           |
| --------------- | ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `id`            | `uuid`        | Primary Key                              | Unique identifier for the feedback.                                                   |
| `recording_id`  | `uuid`        | Foreign Key to `recordings.id`, `UNIQUE` | The recording this feedback belongs to.                                               |
| `user_id`       | `uuid`        | Foreign Key to `auth.users.id`           | The user who owns the feedback.                                                       |
| `feedback_data` | `jsonb`       | `NOT NULL`                               | Flexible JSONB field to store detailed, extensible feedback data from the AI service. |
| `created_at`    | `timestamptz` | `NOT NULL`                               | Timestamp of feedback creation.                                                       |

## UI/Branding Direction (For Discussion)

As a starting point for our discussion on UI and branding, here is a proposed direction:

- **Overall Feel**: Clean, modern, and professional to instill confidence in users who are practicing for professional interviews.
- **Color Palette**:
  - **Primary**: A trustworthy and calm shade of blue (e.g., `slate-700` from Tailwind CSS).
  - **Accent**: A brighter color for calls-to-action (e.g., `sky-500`).
  - **Text**: Dark gray (`gray-800`) for readability.
  - **Background**: White (`#FFFFFF`) and light gray (`slate-50`) for a clean look.
- **Typography**: A highly-readable, modern sans-serif font like **Inter**. It's versatile for both headings and body text.
- **Logo**: We should aim for a simple, memorable logo. If one doesn't exist, we can use a text-based logo initially.

This provides a solid foundation that we can refine together.

## Architecture

This project employs a hybrid rendering approach and a mobile-first design philosophy to optimize for performance and user experience.

### Mobile-First Design

The UI is built with a mobile-first approach. This means that styling and layout are designed for small screens first, and then scaled up for tablets and desktops using responsive design principles. This ensures a seamless user experience across all devices.

### Landing Pages vs Post-Login Pages: Clear Separation

Our application uses a strategic separation between public landing pages and authenticated user experiences to optimize performance and security.

#### **Landing Pages (Public - SSG)**

- **Purpose**: Marketing, SEO, user acquisition
- **Rendering**: Static Site Generation (SSG)
- **Content**: Static, non-user-specific information
- **Examples**: Homepage, About, Pricing, Contact, Features
- **Benefits**:
  - Lightning-fast loading times
  - Perfect SEO optimization
  - Global CDN distribution
  - Zero server-side processing per request

#### **Post-Login Pages (Protected - CSR)**

- **Purpose**: User-specific functionality and data
- **Rendering**: Client-Side Rendering (CSR)
- **Content**: Dynamic, user-specific data
- **Examples**: Dashboard, Recording Sessions, Feedback Reports, Profile
- **Benefits**:
  - Real-time data updates
  - Secure user data handling
  - Interactive user experiences
  - No sensitive data in server-rendered HTML

### Static Site Generation (SSG) for Landing Pages

The public-facing pages are statically generated at build time. This results in incredibly fast load times and excellent SEO.

### Client-Side Rendering (CSR) for Authenticated Routes

After a user logs in, the application transitions to a client-side rendering model. This is ideal for displaying user-specific, dynamic data in a secure and interactive way.

### Resolving CSR vs SSR Conflicts

Our hybrid approach eliminates conflicts between Client-Side Rendering (CSR) and Server-Side Rendering (SSR) through strategic architecture decisions:

#### **1. Route-Based Separation**

```
Public Routes (SSG - No Conflicts):
├── / (landing page)
├── /about
├── /pricing
├── /features
└── /contact

Protected Routes (CSR - No Conflicts):
├── /dashboard
├── /record
├── /feedback
├── /profile
└── /settings
```

#### **2. Authentication Boundary**

- **Pre-authentication**: Users interact with SSG pages (fast, SEO-optimized)
- **Post-authentication**: Application transitions to CSR for dynamic content
- **Clear separation**: No overlap between SSG and CSR rendering contexts

#### **3. Component Architecture**

```typescript
// Landing Page Component (SSG - No Client State)
export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Static content, no client-side state */}
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
    </div>
  );
}

// Dashboard Component (CSR - Dynamic State)
("use client");
export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [recordings, setRecordings] = useState([]);

  // Dynamic content with client-side state
  return (
    <div className="dashboard-container">
      {/* User-specific content */}
      <UserStats userData={userData} />
      <RecordingHistory recordings={recordings} />
      <RecentFeedback />
    </div>
  );
}
```

#### **4. Performance Optimization Strategy**

- **Landing Pages**:
  - Static HTML served from CDN
  - Zero JavaScript for initial render
  - Perfect Core Web Vitals scores
- **Dashboard Pages**:
  - JavaScript bundles loaded only when needed
  - Client-side state management
  - Real-time data fetching

#### **5. Security Implementation**

- **Public pages**: No sensitive data exposure
- **Protected pages**: Authentication required, data secured
- **No hydration mismatches**: SSG and CSR are completely separate

#### **6. SEO and Performance Benefits**

- **Landing pages**: Fully indexed, fast loading
- **Dashboard pages**: User-specific, no SEO requirements
- **No conflicts**: Each page type optimized for its specific use case

### Supabase for Backend Services

[Supabase](https://supabase.io/) provides a scalable and secure backend for authentication, database management, and other services.

## API Documentation

The API will be available at `http://localhost:9090`.

### Transcribe Audio

```
POST /api/transcribe
```

Upload an audio file to transcribe it to text.

**Request Body:**

- Form data with a file field named `audio`

**Response:**

```json
{
  "success": true,
  "data": {
    "text": "Transcribed text will appear here."
  }
}
```

### English Speech Feedback

```
POST /api/feedback
```

Submit a speech transcript to get detailed English language feedback and evaluation.

**Request Body:**

```json
{
  "text": "Your speech transcript goes here."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "analysis": {
      "grammar": {
        "score": 8,
        "issues": ["Issue 1", "Issue 2"],
        "suggestions": ["Suggestion 1", "Suggestion 2"]
      },
      "vocabulary": {
        "score": 7,
        "issues": ["Issue 1", "Issue 2"],
        "suggestions": ["Suggestion 1", "Suggestion 2"]
      },
      "fluency": {
        "score": 6,
        "issues": ["Issue 1", "Issue 2"],
        "suggestions": ["Suggestion 1", "Suggestion 2"]
      },
      "sentence_structure": {
        "score": 7,
        "issues": ["Issue 1"],
        "suggestions": ["Suggestion 1"]
      },
      "coherence": {
        "score": 8,
        "issues": ["Issue 1"],
        "suggestions": ["Suggestion 1"]
      },
      "tone_and_formality": {
        "score": 7,
        "issues": ["Issue 1"],
        "suggestions": ["Suggestion 1"]
      },
      "word_choice": {
        "score": 6,
        "issues": ["Issue 1", "Issue 2"],
        "suggestions": ["Suggestion 1", "Suggestion 2"]
      },
      "filler_words": {
        "score": 5,
        "issues": ["Issue 1"],
        "suggestions": ["Suggestion 1"],
        "count": {
          "um": 3,
          "uh": 2,
          "like": 4,
          "you_know": 2,
          "other": 1
        }
      },
      "clarity": {
        "score": 7,
        "issues": ["Issue 1"],
        "suggestions": ["Suggestion 1"]
      }
    },
    "summary": {
      "overallScore": 7,
      "strengths": ["Strength 1", "Strength 2"],
      "areasForImprovement": ["Area 1", "Area 2"],
      "generalAdvice": "General advice goes here."
    },
    "metadata": {
      "textLength": 150,
      "wordCount": 30,
      "analysisVersion": "1.0",
      "modelUsed": "gpt-4o"
    }
  },
  "meta": {
    "version": "1.0",
    "timestamp": "2023-06-01T12:34:56.789Z"
  }
}
```

## API Usage with cURL

### 1. Transcription Endpoint

**POST** `/api/transcribe`

Transcribes an audio file.

#### Request

```sh
curl -X POST http://localhost:9090/api/transcribe \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@path/to/your/audio-sample.wav"
```

#### Response

```json
{
  "success": true,
  "transcription": "This is the transcribed text from the audio file."
}
```

### 2. Feedback Endpoint

**POST** `/api/feedback`

Submits a transcript to get speech analysis.

#### Request

```sh
curl -X POST http://localhost:9090/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is the transcript of the speech I would like to have analyzed for feedback."
  }'
```

#### Response

The response for this endpoint is the detailed JSON object described in the "English Speech Feedback" section above.

## Folder Structure

- `components/`: Contains reusable React components.
- `pages/`: Contains the application's pages and API routes.
- `lib/`: Contains utility functions and the Supabase client configuration.
- `styles/`: Contains global styles.
- `public/`: Contains static assets like images and fonts.
- `supabase/`: Contains Supabase-specific configurations and database migrations.

## Testing

This project uses [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit testing.

To run the tests, use the following command:

```bash
npm run test
```

All new components and utility functions should have corresponding unit tests.

## Available Scripts

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the project files.
- `npm run test`: Runs the test suite.

## Performance & Scalability

- Audio recordings are stored in Supabase Storage under the `recordings/` bucket. Consider enabling a CDN and setting lifecycle rules for pruning old files if storage cost is a concern.
- The application streams audio uploads directly to the storage backend; no files live on the Next.js server, keeping memory usage constant regardless of upload size.
- For production, configure Supabase’s Storage egress and Postgres connection limits according to your expected traffic.

## Troubleshooting

### Common Issues

**Recording not working:**

- Check microphone permissions in browser
- Ensure HTTPS in production (required for audio API)
- Try refreshing the page
- Verify microphone is not being used by other applications
- Check browser console for permission errors

**Processing taking too long:**

- Check internet connection
- Verify API endpoints are accessible
- Audio file size should be under 10MB
- Ensure stable network connection for upload

**Authentication issues:**

- Clear browser cache and cookies
- Verify Supabase configuration
- Check environment variables

### Microphone Setup Guide

1. **Browser Permissions**: Click the microphone icon in your browser's address bar.
2. **System Permissions**: Ensure microphone access is enabled in system settings.
3. **Test Recording**: Use browser's built-in microphone test.
4. **Refresh Page**: Reload if permissions were recently granted.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
