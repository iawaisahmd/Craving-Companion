# Urge90 - Craving Recovery Companion 

<p align="center">
  <img src="assets/images/icon.png" width="120" alt="Urge90 Icon">
</p>

<p align="center">
  <strong>Ride out cravings in 90 seconds. Build healthier habits. Track your progress.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#scripts">Scripts</a> •
  <a href="#license">License</a>
</p>

---

## About

**Urge90** is a mobile app that helps you overcome cravings and break bad habits. When an urge hits, the app guides you through a 90-second rescue intervention — breathing exercises, distraction tasks, or reaching out to someone — to ride out the wave. Track your triggers, build positive replacement habits, and watch your progress over time.

Whether you're quitting smoking, vaping, alcohol, junk food, social media, or any other habit — Urge90 gives you the tools to resist in the moment and stay accountable in the long run.

## Features

### Rescue Mode
The flagship feature. When a craving hits:
1. Rate your urge intensity (1-10)
2. Choose an intervention: **breathing exercise**, **distraction task**, or **text someone**
3. Follow a guided 90-second countdown
4. Rate your urge strength after — track what works

### Onboarding
A 6-step personalized setup wizard:
- Select which habits you want to quit
- Set your daily spend amount on the habit
- Identify your biggest triggers
- Add emergency contacts
- Write your personal quit reason
- Confirm your commitment

### Trigger Log
Manually log cravings and triggers to understand your patterns:
- Record trigger type, urge strength, and outcome (resisted or slipped)
- Add notes for context
- View chronological history with daily summaries

### Habit Tracker
Build positive replacement habits alongside breaking bad ones:
- 12 pre-built habit templates (deep breathing, walking, meditating, journaling, etc.)
- Create custom habits with custom icons and colors
- Track daily completions and maintain streaks

### Progress Dashboard
Visualize your recovery journey:
- Days smoke-free
- Money saved
- Cravings resisted count and resist rate percentage
- Craving time patterns (morning/afternoon/evening/night)
- Top triggers bar chart
- 7-day habit completion grid
- Motivational messages that evolve with your progress

### Settings
- Edit quit reason and daily spend
- Manage multiple emergency contacts
- Dark/Light theme toggle
- Haptic feedback toggle
- Reset all data

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Expo SDK 54](https://expo.dev) (React Native 0.81.5, React 19.1.0) |
| **Routing** | [Expo Router v6](https://docs.expo.dev/router/introduction) (file-based routing) |
| **Language** | TypeScript 5.9 |
| **State Management** | React Context + AsyncStorage |
| **Animations** | React Native Reanimated v4, Expo Linear Gradient, Expo Blur |
| **Icons** | @expo/vector-icons (Ionicons) |
| **Fonts** | Inter (400/500/600/700) via @expo-google-fonts |
| **Backend** | Express 5 (Node.js) |
| **Database** | Drizzle ORM + PostgreSQL |
| **API Client** | TanStack React Query v5 |
| **Validation** | Zod + drizzle-zod |
| **Build** | Metro Bundler, esbuild |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your phone (for development)
- (Optional) [PostgreSQL](https://www.postgresql.org/) database for backend features

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Craving-Companion.git

# Navigate to the project directory
cd Craving-Companion

# Install dependencies
npm install
```

> The `postinstall` script runs `patch-package` automatically.

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database (required for backend features)
DATABASE_URL=postgresql://user:password@localhost:5432/urge90

# API domain (required for client-side API calls)
EXPO_PUBLIC_DOMAIN=http://localhost:5000

# Server port (optional, defaults to 5000)
PORT=5000
```

### Running the App

```bash
# Start the Expo development server
npm start

# Or run individual commands:
npx expo start          # Expo dev server
npm run server:dev      # Express backend server
```

Scan the QR code with Expo Go on your phone to load the app.

## Project Structure

```
Craving-Companion/
├── app/                        # Expo Router file-based screens
│   ├── _layout.tsx             # Root layout (providers, Stack navigator)
│   ├── index.tsx               # Entry: redirects to onboarding or tabs
│   ├── onboarding.tsx          # 6-step onboarding wizard
│   ├── rescue.tsx              # 90-second craving rescue flow
│   ├── log-trigger.tsx         # Manual trigger logging form
│   └── (tabs)/                 # Tab navigator group
│       ├── index.tsx           # Home screen
│       ├── habits.tsx          # Habit tracker
│       ├── log.tsx             # Trigger log list
│       ├── progress.tsx        # Progress/stats dashboard
│       └── settings.tsx        # Settings screen
├── context/
│   ├── AppContext.tsx           # App state, AsyncStorage persistence
│   └── ThemeContext.tsx         # Dark/light theme management
├── components/
│   ├── ErrorBoundary.tsx       # React error boundary
│   └── ErrorFallback.tsx       # Error UI with modal stack trace
├── constants/
│   └── colors.ts               # Light + dark color themes
├── lib/
│   └── query-client.ts         # TanStack Query client, API URL helper
├── server/
│   ├── index.ts                # Express server
│   ├── routes.ts               # API routes
│   └── storage.ts              # In-memory storage
├── shared/
│   └── schema.ts               # Drizzle ORM schema
├── scripts/
│   └── build.js                # Static build script
├── assets/
│   └── images/                 # App icons, splash screens, favicons
└── patches/
    └── expo-asset+12.0.12.patch
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo development server |
| `npm run expo:dev` | Expo dev server (Replit-compatible) |
| `npm run server:dev` | Start Express backend (port 5000) |
| `npm run expo:static:build` | Production Metro build (no dev, minified) |
| `npm run expo:start:static:build` | Full static build (bundles + manifests + assets) |
| `npm run server:build` | Bundle server with esbuild for production |
| `npm run server:prod` | Run production server |
| `npm run db:push` | Push Drizzle schema to PostgreSQL |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |

## Branding

| Property | Value |
|---|---|
| **App Name** | Urge90 |
| **Slug** | `urge90` |
| **Deep Link Scheme** | `urge90://` |
| **iOS Bundle ID** | `com.urge90` |
| **Android Package** | `com.urge90` |
| **Version** | 1.0.0 |
| **Primary Color** | `#7DBB78` (muted green) |
| **Background Color** | `#0B1020` (deep navy) |

## GitHub Repository Details

Use these when creating/pushing to GitHub:

- **Repository Name:** `Craving-Companion`
- **Description:** `Urge90 — A craving recovery companion app. Ride out urges in 90 seconds with guided interventions, track triggers, build healthy habits, and visualize your progress. Built with Expo + React Native.`
- **Topics/Tags:** `expo`, `react-native`, `mobile-app`, `addiction-recovery`, `craving-management`, `habit-tracker`, `health-app`, `typescript`, `urge90`, `recovery`, `wellness`, `mental-health`, `breathing-exercise`
- **Visibility:** Public (recommended) or Private

### Suggested GitHub Description (short)

```
Urge90 — Ride out cravings in 90 seconds. A mobile companion for addiction recovery with guided interventions, trigger tracking, habit building, and progress visualization. Built with Expo + React Native.
```

### Suggested GitHub About Section

```
Urge90 is a craving recovery companion app. When a craving hits, the app helps you ride out the next 90 seconds through breathing exercises, distraction tasks, or reaching out to someone. Track your triggers, build positive replacement habits, and visualize your recovery journey.
```

### Topics

```
expo react-native mobile-app addiction-recovery craving-management habit-tracker health-app typescript urge90 recovery wellness mental-health breathing-exercise react-native-app
```

### Short Description (for social media / bio)

```
📱 Urge90 — Your 90-second craving recovery companion. Built with Expo + React Native.
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is currently unlicensed. Consider adding an [MIT License](https://opensource.org/licenses/MIT) or your preferred license.

## Contact

Built by Awais Ahmad

---

<p align="center">
  Made with <strong>Expo</strong> + <strong>React Native</strong>
</p>
