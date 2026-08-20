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

The current lightweight structure keeps the React client in `src/` and the Node coordination server in `server.js` at the repository root. It is intentionally dependency-light and runs without API keys or a database service.

Optional environment values are documented in `.env.example`. Never commit a real `.env` file or provider secret.

## Flagship demos

### Demo A: active multilingual report

1. Start the backend and frontend.
2. Choose a language, enter demo access, and press **Emergency**.
3. Use the microphone or type `There has been a road accident, one person is unconscious.`.
4. PranaSetu AI detects the language, calls the zero-key `/api/ai/chat` demo provider, displays the response, and speaks it using the selected locale.
5. Continue through triage, GPS, hospital ranking, map, simulated responder tracking, and resolution.

Try the same flow with Hindi, Telugu, Marathi, or any of the other supported languages. Browser speech recognition/TTS availability varies by browser; the typed and demo transcript paths work without microphone support.

### Demo B: silent/passive Guardian flow

1. Open Home and select **Guardian** or **Test crash detection**.
2. Allow motion/location permissions when the browser requests them, or use the labeled demo trigger.
3. Choose **Send Help**, or let the 15-second safety countdown expire.
4. The app captures the best available GPS position, creates a `PS-*` incident, prepares simulated family/hospital/police alerts, shows nearby hospitals, and continues live GPS updates when permission is available.

All external notifications, responder dispatch, hospital contact, police contact, bed/ICU status, and emergency calls are visibly demo/future integrations. The browser cannot diagnose an accident or monitor a closed tab.

## Exact commands

```bash
npm install
npm run server
# In a second terminal:
npm run dev
```

Run checks with:

```bash
npm run build
npm run lint
node --check server.js
```

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

The local API exposes `GET /api/health`, `POST /api/ai/chat`, `POST /api/emergencies`, `GET /api/emergencies/:id`, `PATCH /api/emergencies/:id/status`, `GET /api/emergencies/:id/events`, `GET /api/hospitals/nearby`, `POST /api/hospitals/recommend`, `POST /api/notifications/create`, and `GET /api/analytics`. `/api/ai/chat` uses the zero-key demo provider and always returns the requested supported language. Hospital availability and notifications are explicitly demo/simulated unless connected to verified providers.

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
| Back button on listed routes     | 🟢 Demo flow                        | Shared accessible back control, logical fallback, and confirmation before leaving active emergency steps        |
| Bottom navigation                | 🟢 Demo flow                        | Home, Emergency, Map, Hospitals, and Settings controls are keyboard/touch accessible                            |
| API rate limiting/input limits   | 🟢 Demo server                      | Per-IP request windows and bounded JSON bodies; production gateway still recommended                            |

### Language verification

All 11 supported languages are present in the selector, persist through local storage, and map to a Web Speech locale. Demo transcript fallback and the core emergency copy are available for each language. Recognition quality still depends on browser and installed speech model.

| Language  | UI selector | Voice recognition | Same-language AI text/TTS | Demo fallback |
| --------- | ----------- | ----------------- | ------------------------- | ------------- |
| English   | 🟢          | 🟢 `en-IN`        | 🟢                        | 🟢            |
| Hindi     | 🟢          | 🟢 `hi-IN`        | 🟢                        | 🟢            |
| Marathi   | 🟢          | 🟢 `mr-IN`        | 🟢                        | 🟢            |
| Telugu    | 🟢          | 🟢 `te-IN`        | 🟢                        | 🟢            |
| Tamil     | 🟢          | 🟢 `ta-IN`        | 🟢                        | 🟢            |
| Bengali   | 🟢          | 🟢 `bn-IN`        | 🟢                        | 🟢            |
| Kannada   | 🟢          | 🟢 `kn-IN`        | 🟢                        | 🟢            |
| Gujarati  | 🟢          | 🟢 `gu-IN`        | 🟢                        | 🟢            |
| Punjabi   | 🟢          | 🟢 `pa-IN`        | 🟢                        | 🟢            |
| Urdu      | 🟢          | 🟢 `ur-IN`        | 🟢                        | 🟢            |
| Malayalam | 🟢          | 🟢 `ml-IN`        | 🟢                        | 🟢            |
