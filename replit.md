# Urge90

A craving management mobile app. Core promise: "When a craving hits, this app gets you through the next 90 seconds."

## Architecture

- **Frontend**: Expo Router (file-based routing), React Native
- **Backend**: Express.js server on port 5000 (landing page)
- **State**: AsyncStorage for all local persistence (no remote DB)
- **Navigation**: 5 Tabs (Home, Habits, Log, Progress, Settings) + Stack screens (Onboarding, Rescue, Log Trigger)

## File Structure

```
app/
  _layout.tsx          # Root layout with providers
  index.tsx            # Entry - redirects to onboarding or tabs
  onboarding.tsx       # 4-step onboarding flow
  rescue.tsx           # Full-screen 90-second rescue flow
  log-trigger.tsx      # Manual trigger log entry (formSheet)
  (tabs)/
    _layout.tsx        # Tab layout with NativeTabs / ClassicTabs
    index.tsx          # Home screen (panic button, stats)
    habits.tsx         # Healthy habits tracker
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
- Primary: `#FF751F` (warm orange)
- Accent: `#C8A96B`
- Success: `#5FCB8B`
- Warning: `#F08A5D`
- Text: `#F7F4EE`
- Rounded corners: 24px
- Font: Inter (400/500/600/700)

## Key Features

- **Onboarding**: cigarettes/vaping, daily spend, trigger, emergency contact, quit reason
- **Home**: Breathing-glow panic button, money saved, smoke-free days, cravings resisted
- **Rescue Flow**: 90s timer, breathe/distract/text interventions, before/after intensity rating
- **Habits Tracker**: Add suggested or custom healthy habits, daily check-offs, streaks, progress bar
- **Trigger Log**: time, trigger type, urge strength, resisted/slipped
- **Progress**: money saved, smoke-free time, urges survived, time-of-day craving patterns
- **Settings**: edit reasons, contact, spend, haptics, reset data

## Habits Feature

`SUGGESTED_HABITS` in `context/AppContext.tsx` defines the preset habits (breathing, water, walk, meditation, journal, stretch, fruit, call). Users can add any of these with one tap or create fully custom habits with name, icon, color picker. Daily completions are stored by date for streak tracking.
