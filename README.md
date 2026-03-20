# HelpDeskPro Mobile

Mobile application for an **Issue Reporting & Tracking System** built for a **multi-branch company**.

This repository contains the **mobile client** built with **Expo (React Native)** and **Expo Router** (file-based routing). The backend is a **.NET Core Web API** secured with **JWT authentication**.

---

## Key Features

### Ticket / Issue Management
- Create and submit issues (tickets)
- Track issue lifecycle via **status** updates
- Categorize issues by **category**
- Prioritize issues with **priority levels**

### Multi-Branch Support
- Designed for organizations with multiple branches
- Issues can be reported and managed in a branch-aware workflow

### Attachments
- Supports attaching **images**, **files**, and **recordings** to issues (implementation/storage depends on backend configuration)

### Roles
- **User** (reporter)
- **IT Staff** (triage/resolve)
- **Managers** (oversight/approval/escalation)
- **Admin** (system management)

---

## Tech Stack

### Mobile
- **Expo SDK**: 54
- **React Native**
- **TypeScript**
- **Expo Router**

### Backend
- **.NET Core Web API**
- **JWT Authentication**

---

## Project Structure (high-level)

- `app/` — Routes (Expo Router)
  - `app/_layout.tsx` — Root stack layout
  - `app/(tabs)/_layout.tsx` — Tab navigator layout
  - `app/(tabs)/index.tsx` — Home tab
  - `app/(tabs)/explore.tsx` — Explore tab
  - `app/modal.tsx` — Modal screen
- `components/` — Shared UI components
- `hooks/` — Theme hooks
- `constants/` — Theme constants
- `assets/` — App assets

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm (this repo includes `package-lock.json`)
- Expo Go (optional) or Android Studio Emulator / iOS Simulator (macOS)

### Install

```bash
npm install
```

### Run (development)

```bash
npm run start
```

Then:
- press `a` for Android
- press `i` for iOS (macOS)
- press `w` for web

Or run directly:

```bash
npm run android
npm run ios
npm run web
```

### Lint

```bash
npm run lint
```

---

## Configuration

### API Base URL

This app will need to know the backend API base URL. A common Expo approach is to use `EXPO_PUBLIC_*` environment variables.

Create a `.env` file (if your implementation uses env vars) and add for example:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
```

> Update the URL/port to match your .NET API.

### Authentication

Authentication is handled by the backend using **JWT**. The mobile app is expected to:
- authenticate with username/email + password
- receive a JWT
- send `Authorization: Bearer <token>` for protected requests

---

## Backend Repository

> Add your backend repository link here (e.g., `DanushkaMadush/HelpDeskPro-API`).

---

## Contributing

1. Create a feature branch
2. Make changes
3. Open a pull request

---

## License

See [`LICENSE`](./LICENSE).
