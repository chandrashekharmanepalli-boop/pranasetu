# PranaSetu

PranaSetu (Prana = life, Setu = bridge) is an AI emergency-response coordination demo: a bridge between danger and help. It is intentionally honest about the boundary between browser capabilities, simulated walkthrough data, and provider integrations that still need configuration.

Core loop: **Speak -> Understand -> Locate -> Assess -> Recommend -> Respond -> Track**

## Run locally

Install dependencies:

```bash
npm install
```

Start the coordination backend in one terminal:

```bash
npm run server
```

Start the frontend in another terminal:

```bash
npm run dev
```

Open the local URL printed by Vite. The frontend proxies `/api` requests to the coordination server on port `8787`.

## Judge flow

1. Choose English, Hindi, or Marathi on the landing screen.
2. Enter with demo access.
3. Press **Emergency**.
4. Use **Use demo voice transcript** when microphone permissions are unavailable, or press **Start speaking** for browser speech recognition.
5. Continue through transcript, AI classification, follow-up questions, device/demo GPS, hospital ranking, route, navigation, tracking, timeline, command center, live status, and resolution.
6. Return home and press **Test crash detection**.
7. Choose **Send Help** to escalate immediately, or **I'm Safe** to dismiss it. Letting the 15-second countdown expire automatically enters the emergency GPS flow.
8. From the landing page, open **Emergency Console** to view the operator dashboard with live map markers, severity KPIs, and incident queue.

The demo uses explicit demo-mode transcript and Pune location fallbacks. Real browser speech recognition and geolocation are used when available. No API keys are required. The quick-action surfaces cover Guardian, Devices, Map, Hospitals, Contacts, Emergency Profile, Incidents, Responder, Admin, Settings, Privacy, and demo signup without changing the existing visual theme.

The local API exposes `GET /api/health`, `POST /api/emergencies`, `GET /api/emergencies/:id`, `PATCH /api/emergencies/:id/status`, `GET /api/emergencies/:id/events`, `GET /api/hospitals/nearby`, `POST /api/hospitals/recommend`, `POST /api/notifications/create`, and `GET /api/analytics`. Hospital availability and notifications are explicitly demo/simulated unless connected to verified providers.

## Checks

```bash
npm run lint
npm run build
```

## Verification checklist

| Capability                       | Status                              | Notes                                                                                                           |
| -------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Active voice/text emergency flow | 🟢 Real browser flow                | Web Speech API when supported; demo transcript fallback otherwise                                               |
| Passive no-response flow         | 🟡 DEMO / SIMULATED                 | Countdown, browser motion signal, GPS fallback, and incident state are implemented; this is not crash diagnosis |
| GPS capture                      | 🟢 Browser capability / 🟡 fallback | Permission-based device GPS; Pune fallback is labeled demo                                                      |
| Hospital discovery               | 🟢 OSM map data / 🟡 ranking        | Live bed, ICU, ambulance, and responder availability are unavailable                                            |
| Family/contact notifications     | 🟡 DEMO / SIMULATED                 | No SMS, push, police, ambulance, or hospital message is sent                                                    |
| Responder and admin actions      | 🟡 DEMO / SIMULATED                 | Local walkthrough state only                                                                                    |
| AI classification                | 🟡 DEMO provider                    | Provider keys can be added later; no diagnosis is claimed                                                       |
| Authentication/database/RLS      | 🔵 FUTURE INTEGRATION               | Current demo server is in-memory and has no production auth boundary                                            |
| Realtime sync/PWA queue          | 🔵 FUTURE INTEGRATION               | Browser session flow works without refresh; Supabase/WebSocket sync is not configured                           |

### Language verification

All 11 supported languages are present in the selector, persist through local storage, and map to a Web Speech locale. Demo transcript fallback and the core emergency copy are available for each language. Recognition quality still depends on browser and installed speech model.

| Language  | UI selector | Speech locale | Demo fallback |
| --------- | ----------- | ------------- | ------------- |
| English   | 🟢          | 🟢 `en-IN`    | 🟢            |
| Hindi     | 🟢          | 🟢 `hi-IN`    | 🟢            |
| Marathi   | 🟢          | 🟢 `mr-IN`    | 🟢            |
| Telugu    | 🟢          | 🟢 `te-IN`    | 🟢            |
| Tamil     | 🟢          | 🟢 `ta-IN`    | 🟢            |
| Bengali   | 🟢          | 🟢 `bn-IN`    | 🟢            |
| Kannada   | 🟢          | 🟢 `kn-IN`    | 🟢            |
| Gujarati  | 🟢          | 🟢 `gu-IN`    | 🟢            |
| Punjabi   | 🟢          | 🟢 `pa-IN`    | 🟢            |
| Urdu      | 🟢          | 🟢 `ur-IN`    | 🟢            |
| Malayalam | 🟢          | 🟢 `ml-IN`    | 🟢            |
