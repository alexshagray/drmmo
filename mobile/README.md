# Balansag Mobile App

Expo + React Native + TypeScript mobile companion for the Balansag emergency response system.

## Setup

```bash
cd mobile
npm install
npx expo start
```

## Structure

```
mobile/
  App.tsx              # Entry point
  src/
    App.tsx            # Root app with navigation
    screens/           # Screen components
      DashboardScreen.tsx
      IncidentsScreen.tsx
      InventoryScreen.tsx
      SettingsScreen.tsx
    api/               # API client & endpoints
      client.ts
      incidents.ts
      inventory.ts
    types/             # Shared TypeScript types
      index.ts
```

## API

Update `src/api/client.ts` `baseURL` to point to your Laravel backend.
