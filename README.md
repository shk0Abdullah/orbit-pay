# OrbitPay — Mobile Wallet & Payment MVP ✅

**OrbitPay** is a cross-platform prototype built with Expo + React Native that demonstrates peer-to-peer (Bluetooth) payments, Solana devnet wallet operations, and a credit-score prediction workflow. The app uses Clerk for authentication and Convex for server-side logic and persisted data.

---

## Table of contents 📚
- [Project status](#project-status)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Local setup & running](#local-setup--running)
- [Key flows & architecture](#key-flows--architecture)
- [Testing & debugging notes](#testing--debugging-notes)
- [Security & production notes](#security--production-notes)
- [Contributing](#contributing)
- [License](#license)
- [FAQ / Known issues](#faq--known-issues)

---

## Project status ✅
- Prototype / MVP. Working features include:
  - Clerk-based authentication (Sign up / Sign in / email verification)
  - Convex server functions & DB: `users`, `payments`, `credit_predictions`
  - Bluetooth client/server for OrbitPay-style transfers
  - Solana devnet wallet creation, balance check, send/receive helpers
  - Credit score prediction via an external ML endpoint (persisted)

---

## Features ⚡
- Authentication with Clerk (email verification)
- On-device Solana keypair creation and secure storage (`expo-secure-store`)
- Bluetooth P2P payment flow (client scans, server accepts and records payment)
- Convex actions/mutations for user management, payments, and predictions
- External credit-score model integration via Convex action
- File-based routing using `expo-router` (under `app/`)

---

## Tech stack 🔧
- Expo (React Native) + TypeScript
- Authentication: Clerk (`@clerk/clerk-expo`)
- Backend & DB: Convex (server functions in `convex/`)
- Solana (devnet): `@solana/web3.js`
- Bluetooth: `react-native-bluetooth-classic`
- State: `jotai` / Recoil-style atoms
- Styling: Tailwind (NativeWind)

---

## Repository layout 🗂️
Important folders/files:
- `app/` — Expo Router pages & UI
  - `(auth)/` — sign in/signup flows
  - `(protected)/` — main app screens (home, bluetooth, blockchain, credit-score)
- `convex/` — Convex schema & server functions (`users.ts`, `payments.ts`, `predictions.ts`)
- `lib/Solana/` — wallet helpers (`walletCreate.ts`)
- `lib/bluetooth/` — Bluetooth client/server implementations
- `assets/` — images and resources
- `global.css`, `tailwind.config.js` — styling
- `package.json` — scripts & dependencies

---

## Prerequisites 🧰
- Node (LTS) and npm/yarn/pnpm
- Expo CLI (optional; `npx expo` works)
- Android Studio (for Android emulator) or a physical device for Bluetooth testing
- For Convex: Convex CLI or a Convex deployment
- Clerk: Clerk publishable key & app configured

---

## Environment variables (.env) 🔐
Create a `.env` or `.env.local` in the repo root (do NOT commit secrets).
Example variables used by the project:

```env
# Clerk (frontend public key)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Convex (deployment + URL)
CONVEX_DEPLOYMENT=dev:your-deployment
EXPO_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud

# Optional: credit-score ML model endpoint (used by Convex action)
MODEL_URL=https://your-model.example.com/api/v1/predict
```

Tip: Add a `.env.example` with these names (but no secrets) so new devs know what to set.

---

## Local setup & running — Quick Start 🚀
1. Clone and install

```bash
git clone <repo-url>
cd orbit-pay
npm install
```

2. Add `.env` / `.env.local` with required variables.

3. (Optional) Run Convex locally for backend dev:

```bash
npx convex dev
```

4. Start the Expo dev server

```bash
npm run start
# or run on Android
npm run android
# or web
npm run web
```

Notes:
- For Bluetooth testing use a physical Android device (emulators usually lack Bluetooth stack support).
- For iOS testing you need macOS + Xcode.

---

## Scripts (from `package.json`) 🧭
- `start` — start Expo dev server
- `android` — build & run on Android
- `ios` — build & run on iOS
- `web` — run web
- `clean` — clean node_modules and ignores
- `lint` — run lint

---

## Key flows & architecture 🏗️

### Authentication & User Sync
- Sign up / sign in is handled by Clerk UI (`(auth)/signup.tsx`, `signin.tsx`).
- After verification, the app calls Convex `api.users.createOrGetUser` to create or fetch a `users` DB row.
- Convex stores minimal user data: `clerkId`, `email`, `phone`, (hashed) `cnic`, `balance`.

### Solana Wallet (Devnet)
- Sign up triggers on-device Solana keypair generation (`lib/Solana/walletCreate.ts`) and stores the secret in `expo-secure-store` under `SOL_PRIVATE_KEY` (base58).
- Helpers: `createWallet`, `loadWallet`, `getSolBalance`, `sendSol`.

### Bluetooth Payments
- `BluetoothClient` scans and connects to a `BluetoothServer`, then writes a JSON payload with payment details.
- `BluetoothServer` accepts the connection, parses JSON, and calls `api.payments.createBluetoothPayment` in Convex. Balances are updated atomically.

### Credit Score Prediction
- Frontend triggers Convex action `predictCreditScore` which POSTs to an external ML endpoint (configurable by `MODEL_URL`).
- The response is stored in Convex `credit_predictions` for audit/history.

---

## Testing & debugging notes 🐞
- Bluetooth requires real hardware; Android physical devices are recommended.
- Ensure runtime Bluetooth permissions on Android manifest for Android 12+.
- Convex: run `npx convex dev` to iterate on backend functions locally.
- Solana: use devnet airdrops for testing balances.
- Logs: use console logs and remote debugging to capture runtime issues.

---

## Security & production notes 🔒
- Do not commit `.env` or secret keys.
- Consider requiring an API key for the credit-score model and store it as a Convex secret.
- CNICs are hashed before storage in Convex (`users.ts`) — continue to handle PII carefully.
- For real-money flows, add robust accounting, audits, KYC and legal reviews — this app is an MVP prototype.

---

## Contributing 🤝
- Open issues for bugs/feature requests.
- Create branches for features: `feat/your-feature` or `fix/issue`.
- Run `npm run lint` and test locally before a PR.

---

## License 📜
- No license included by default. Recommended: add `LICENSE` (MIT) if you plan to open-source this project.

---

## FAQ / Known issues ❓
- Q: Does Bluetooth work on emulators?
  - A: Usually not — use physical devices.
- Q: How to add SOL to dev wallets?
  - A: Use Solana devnet faucet or `solana airdrop` against devnet.
- Q: Where is the Solana secret stored?
  - A: `expo-secure-store` key `SOL_PRIVATE_KEY` (base58 encoded).

---

If you'd like, I can also add a `.env.example` file and a `CONTRIBUTING.md`. Let me know if you want me to commit these changes to the repository or create any follow-up files.
