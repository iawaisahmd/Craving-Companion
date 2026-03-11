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
  _layout.tsx          # Root layout with providers (ThemeProvider, AppProvider, etc.)
  index.tsx            # Entry - redirects to onboarding or tabs
  onboarding.tsx       # 6-step onboarding flow (bad habits, spend, triggers, reason, commitment, ready)
  rescue.tsx           # Full-screen 90-second rescue flow
  log-trigger.tsx      # Manual trigger log entry (formSheet)
  (tabs)/
    _layout.tsx        # Tab layout with NativeTabs / ClassicTabs (theme-aware)
    index.tsx          # Home screen (breathing glow panic button, stats)
    habits.tsx         # Healthy habits tracker (My habits / Templates tabs)
    log.tsx            # Trigger log list
    progress.tsx       # Progress dashboard (craving + habits tracking)
    settings.tsx       # Settings & edit profile + dark/light toggle
context/
  AppContext.tsx        # Global state, AsyncStorage persistence
  ThemeContext.tsx      # Light/dark theme toggle, useTheme() and useThemeColors() hooks
constants/
  colors.ts            # LIGHT_COLORS and DARK_COLORS design system tokens
```

## Design System

- **Primary**: `#7DBB78` (light green) — same in both themes
- **Gradient**: `gradStart: #96CC91` → `gradEnd: #7DBB78`
- **onPrimary**: `#FFFFFF` (white text on all primary-colored buttons/gradients)

### Light Theme
- Background: `#F6FBF8` | Surface: `#FFFFFF` | Text: `#17313A`

### Dark Theme
- Background: `#0D1B12` | Surface: `#142019` | Text: `#EFF7EE`

- Rounded corners: 20-24px | Font: Inter (400/500/600/700)

## Theme System

- `context/ThemeContext.tsx` exports `ThemeProvider`, `useTheme()`, `useThemeColors()`
- Theme persisted to AsyncStorage under `@urge90_theme`
- Toggle in Settings > Appearance
- All screen files use `const C = useThemeColors()` + `useMemo(() => makeStyles(C), [C])` pattern
- StatusBar adjusts to `dark`/`light` based on theme

## Key Features

- **Onboarding**: multi-select bad habits (12 types), daily spend, triggers, emergency contact, quit reason, commitment review
- **Home**: Breathing-glow panic button with white text, money saved, smoke-free days, cravings resisted
- **Rescue Flow**: 90s timer, breathe/distract/text interventions, before/after intensity rating
- **Habits Tracker**: My habits / Templates segment, 12 preset habits, custom habit modal, daily check-offs, streaks
- **Trigger Log**: time, trigger type, urge strength, resisted/slipped
- **Progress**: money saved, smoke-free time, urges survived, craving patterns, habit weekly grid, streak bars
- **Settings**: edit reasons, contact, spend, haptics, dark/light theme toggle, reset data

## AsyncStorage Keys

- `@urge90_profile` — user profile
- `@urge90_triggers` — trigger log entries
- `@urge90_rescue` — rescue sessions
- `@urge90_habits` — habit list
- `@urge90_habit_completions` — daily habit check-offs
- `@urge90_theme` — "light" or "dark"
