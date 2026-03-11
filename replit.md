# Craveaway

A craving management mobile app built with Expo React Native. The core promise: "When a craving hits, this app gets me through the next 90 seconds."

## Architecture

- **Frontend**: Expo Router (file-based routing), React Native
- **Backend**: Express.js server on port 5000 (landing page + future APIs)
- **State**: AsyncStorage for all local persistence (no remote DB)
- **Navigation**: Tabs (Home, Log, Progress, Settings) + Stack screens (Onboarding, Rescue, Log Trigger)

## File Structure

```
app/
  _layout.tsx          # Root layout with providers (AppProvider, QueryClient, etc.)
  index.tsx            # Entry - redirects to onboarding or tabs
  onboarding.tsx       # 4-step onboarding flow
  rescue.tsx           # Full-screen 90-second rescue flow
  log-trigger.tsx      # Manual trigger log entry (formSheet)
  (tabs)/
    _layout.tsx        # Tab layout with NativeTabs / ClassicTabs
    index.tsx          # Home screen (panic button, stats)
    log.tsx            # Trigger log list
    progress.tsx       # Progress dashboard
    settings.tsx       # Settings & edit profile
context/
  AppContext.tsx        # Global state, AsyncStorage persistence
constants/
  colors.ts            # Design system colors
```

## Design System

- Background: `#0B1020`
- Surface: `#121A2B`
- Primary: `#6E56CF`
- Accent: `#C8A96B`
- Success: `#5FCB8B`
- Warning: `#F08A5D`
- Text: `#F7F4EE`
- Rounded corners: 24px
- Font: Inter (400/500/600/700)

## Brand Tone

Warm, supportive, not preachy. Short sentences. Human microcopy.
Examples: "Craving hit?", "Stay with me for 90 seconds.", "That wave passed. Good."

## Key Features

- **Onboarding**: cigarettes/vaping, daily spend, trigger, emergency contact, quit reason
- **Home**: Breathing-glow panic button, money saved, smoke-free days, cravings resisted
- **Rescue Flow**: 90s timer, breathe/distract/text interventions, before/after intensity rating
- **Trigger Log**: time, trigger type, urge strength, resisted/slipped
- **Progress**: money saved, smoke-free time, urges survived, time-of-day craving patterns
- **Settings**: edit reasons, contact, spend, haptics, reset data

## Workflows

- `Start Backend`: `npm run server:dev` → Express on port 5000
- `Start Frontend`: `npm run expo:dev` → Expo dev server on port 8081
