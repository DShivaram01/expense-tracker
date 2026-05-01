# Quick Start — 3 Commands

After unzipping and opening in VSCode, you need TWO terminals running at the same time.

## Terminal 1 — Start the backend

```bash
cd server
npm install
npm run dev
```

Wait until you see:
```
✓ Server running on http://localhost:5000
✓ MongoDB connected
```

## Terminal 2 — Start the frontend

```bash
cd client
npm install
npm run dev
```

The browser opens automatically at http://localhost:3000.

---

## Don't have MongoDB?

The fastest option is **MongoDB Atlas** (free cloud DB):

1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster (M0 tier)
3. Click "Connect" → "Drivers" → copy the connection string
4. Paste it into `server/.env` as `MONGO_URI=...` (replace `<password>` with your actual password)
5. Whitelist your IP in Network Access → Add IP Address → "Allow Access from Anywhere"

Then run the commands above.

---

See `README.md` for the full guide, API reference, and screenshots checklist.
