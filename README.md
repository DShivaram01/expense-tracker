# Expense Tracker — MERN Stack

A full-stack personal expense tracker that lets you log spending, categorize transactions, set a monthly budget, and visualize where your money goes. Built with **MongoDB, Express, React, and Node.js**.

![Tech Stack](https://img.shields.io/badge/stack-MERN-success) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- **Add, view, and delete expenses** with description, amount, category, and date
- **8 categories** with color-coded icons (Food, Transport, Shopping, Entertainment, Bills, Health, Education, Other)
- **Monthly budget tracking** with a live progress bar that turns red when over-budget
- **Live statistics**: all-time total, transaction count, daily average, top category
- **Two charts** powered by Recharts:
  - 7-day spending velocity (area chart)
  - Category breakdown (donut chart)
- **Search and filter** transactions by description or category
- **Persistent storage** in MongoDB
- **Responsive design** — works on desktop and mobile
- **RESTful API** with proper error handling and validation

---

## 🏗️ Tech Stack

**Frontend**
- React 18 (with Hooks)
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (data visualization)
- Lucide React (icons)
- Axios (HTTP client)

**Backend**
- Node.js
- Express 4
- MongoDB (with Mongoose ODM)
- CORS, dotenv

---

## 📁 Project Structure

```
expense-tracker/
├── server/                       # Backend
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── Expense.js            # Expense schema
│   │   └── Budget.js             # Budget schema
│   ├── controllers/
│   │   ├── expenseController.js  # Expense CRUD logic
│   │   └── budgetController.js   # Budget logic
│   ├── routes/
│   │   ├── expenses.js           # /api/expenses routes
│   │   └── budget.js             # /api/budget routes
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express entry point
│   └── package.json
│
├── client/                       # Frontend
│   ├── src/
│   │   ├── App.jsx               # Main React component
│   │   ├── api.js                # Axios API helpers
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Tailwind directives
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                      # Frontend env (API URL)
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Install these on your machine first:

1. **Node.js** (v18+) — [download](https://nodejs.org)
2. **MongoDB** — choose one:
   - **Local install**: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - **Cloud (free)**: [MongoDB Atlas](https://www.mongodb.com/atlas) — recommended, no install needed
3. **VSCode** — [download](https://code.visualstudio.com)

### Setup

**1. Open the project in VSCode**

```bash
cd expense-tracker
code .
```

**2. Configure MongoDB**

Open `server/.env` and confirm the connection string:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
```

If you're using **MongoDB Atlas**, replace `MONGO_URI` with your Atlas connection string:
```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

**3. Install backend dependencies and start the server**

In a VSCode terminal:

```bash
cd server
npm install
npm run dev
```

You should see:
```
✓ Server running on http://localhost:5000
✓ MongoDB connected: localhost
```

**4. Install frontend dependencies and start the client**

Open a **second** terminal in VSCode (`Terminal → New Terminal`):

```bash
cd client
npm install
npm run dev
```

The app opens automatically at **http://localhost:3000**.

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

### Expenses

| Method | Endpoint            | Description              | Body                                        |
|--------|---------------------|--------------------------|---------------------------------------------|
| GET    | `/expenses`         | Fetch all expenses       | —                                           |
| POST   | `/expenses`         | Create a new expense     | `{ description, amount, category, date }`   |
| PUT    | `/expenses/:id`     | Update an expense        | `{ description?, amount?, category?, date? }` |
| DELETE | `/expenses/:id`     | Delete an expense        | —                                           |

**Sample expense object:**
```json
{
  "_id": "65f...",
  "description": "Groceries at Trader Joe's",
  "amount": 52.30,
  "category": "food",
  "date": "2026-04-28",
  "createdAt": "2026-04-28T15:32:11.000Z",
  "updatedAt": "2026-04-28T15:32:11.000Z"
}
```

**Valid categories:** `food`, `transport`, `shopping`, `entertainment`, `bills`, `health`, `education`, `other`

### Budget

| Method | Endpoint   | Description           | Body                |
|--------|------------|-----------------------|---------------------|
| GET    | `/budget`  | Fetch the budget      | —                   |
| PUT    | `/budget`  | Update the budget     | `{ amount: 2000 }`  |

---

## 🧪 Testing the API

The easiest way is the **Thunder Client** extension in VSCode (search "Thunder Client" in extensions, install, and click the lightning bolt icon).

**Sample requests:**

**Create expense:**
```
POST http://localhost:5000/api/expenses
Content-Type: application/json

{
  "description": "Lunch with friends",
  "amount": 23.50,
  "category": "food",
  "date": "2026-04-28"
}
```

**Get all expenses:**
```
GET http://localhost:5000/api/expenses
```

**Update budget:**
```
PUT http://localhost:5000/api/budget
Content-Type: application/json

{ "amount": 2500 }
```

**Or with curl from the terminal:**
```bash
# List all expenses
curl http://localhost:5000/api/expenses

# Create one
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"description":"Coffee","amount":4.50,"category":"food","date":"2026-04-28"}'
```

---

## 🧱 How It Works

### Data flow

```
React component  →  axios (api.js)  →  Express route  →  Controller  →  Mongoose model  →  MongoDB
                                            ↓
                                         JSON response
                                            ↓
                                    Component re-renders
```

### Key design decisions

- **Singleton budget**: only one budget document ever exists, queried by `singleton: 'budget'`.
- **Stats computed on the frontend**: avoids extra API calls when filtering/sorting; the dataset is small so this is fine.
- **Optimistic UI**: state updates immediately on user actions; errors are surfaced via alerts.
- **Categories defined once**: in `App.jsx` for the frontend and validated by the Mongoose `enum` on the backend.

---

## 🐛 Troubleshooting

**"Cannot reach the backend"** — the server isn't running. Open a terminal in `server/` and run `npm run dev`.

**"MongoDB connection error"** — your local MongoDB isn't running, or the Atlas connection string is wrong.
- Local: start MongoDB (`mongod` or via Services on Windows)
- Atlas: check the connection string and make sure your IP is whitelisted

**Port 5000 already in use** — change `PORT` in `server/.env` to `5001` and update `client/.env`'s `VITE_API_URL` to match.

**`npm install` errors** — delete `node_modules` and `package-lock.json`, then run `npm install` again.

---

## 📸 Suggested Screenshots for Submission

For your assignment writeup, take screenshots of:

1. The empty dashboard (initial state)
2. The "New Expense" modal open
3. The dashboard with several expenses, both charts populated
4. The budget edit modal
5. The over-budget state (set a low budget, add expenses past it)
6. The transactions list with a category filter applied
7. A POST request in Thunder Client / Postman
8. The MongoDB data viewed in MongoDB Compass

---

## 📝 License

MIT

---

## 👤 Author

Built as a MERN stack assignment. Feel free to fork and extend.
