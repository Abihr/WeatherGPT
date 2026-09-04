# WeatherCircle

A weather + social location app: check your weather, add friends, share weather
and location with people you've accepted, compare conditions, and see your
circle on a map.

This is a UI-complete demo build. It runs entirely on realistic mock data
(`src/data/mockData.js`) so you can develop and review the interface before
wiring up real services.

## Run it

```bash
npm install
npm run dev
```

Sign in with anything on the login screen (demo auth — no real check yet).

## Where to plug in real services

- **Firebase Auth + Firestore** — `src/firebase/firebase.js` has a config
  placeholder and a `USE_FIREBASE` flag. `src/firebase/firestore.js` documents
  every read/write the app needs (user search, friend requests, friends,
  blocking, sharing preferences) as stub functions ready to swap for real
  Firestore calls.
- **Weather API** — `src/services/weatherService.js` currently returns
  randomized data. Point `BASE_URL` / `WEATHER_API_KEY` at a real provider
  (OpenWeatherMap, WeatherAPI, etc.) and replace the fetch logic.
- **Geolocation** — `src/services/locationService.js` already uses the real
  browser Geolocation API (`navigator.geolocation.getCurrentPosition`), plus
  a haversine distance helper and an "approximate location" jitter helper.

## Structure

```
src/
├── components/   Reusable UI: cards, modals, map, sharing toggles, toasts
├── pages/        Home, Friends, Requests, Compare, Map, Profile, Blocked,
│                 Alerts, Settings, Login
├── context/      AppContext — in-memory state for friends/requests/blocking,
│                 wired through the firestore.js stubs
├── firebase/     firebase.js (init) + firestore.js (data-access stubs)
├── services/     weatherService.js + locationService.js
└── data/         mockData.js — dummy users/friends/requests for the demo
```

## Notes

- Friend logic follows: search -> send request -> pending -> accept -> friends.
  Weather/location sharing only unlock after acceptance.
- Blocking removes any existing friendship/requests; unblocking does **not**
  restore the friendship, per the spec.
- The map (Leaflet + OpenStreetMap) spreads friend markers around your
  location for demo purposes since mock friends don't have real coordinates;
  swap in real `latitude`/`longitude` from Firestore and it'll place them
  precisely.
- Tailwind tokens (colors, shadows, radii) live in `tailwind.config.js`.
