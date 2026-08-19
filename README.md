# PranaSetu

PranaSetu is an AI emergency response coordination platform demo.

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

The demo uses explicit demo-mode transcript and Pune location fallbacks. Real browser speech recognition and geolocation are used when available. No API keys are required.

The local API exposes `GET /api/health`, `POST /api/emergencies`, `GET /api/emergencies/:id`, `PATCH /api/emergencies/:id/status`, `GET /api/emergencies/:id/events`, `GET /api/hospitals/nearby`, `POST /api/hospitals/recommend`, `POST /api/notifications/create`, and `GET /api/analytics`. Hospital availability and notifications are explicitly demo/simulated unless connected to verified providers.

## Checks

```bash
npm run lint
npm run build
```
