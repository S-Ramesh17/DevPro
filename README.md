# DevOpsPro — Real-Time Workforce Automation Platform

A full-stack MERN application for IT teams to manage projects, tasks, and collaborate in real time.

---

## Features

- Role-based authentication (Admin / Developer / QA / DevOps)
- Project management with tech stack tracking
- Task management with priority levels and status tracking
- Real-time updates via Socket.IO
- Smart workload balancing suggestions
- Deadline alerts (overdue / urgent highlighting)
- Live notification system
- Team productivity analytics

---

## Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | React.js, Context API       |
| Backend   | Node.js, Express.js         |
| Database  | MongoDB Atlas               |
| Real-Time | Socket.IO                   |
| Deploy FE | Vercel                      |
| Deploy BE | Render                      |

---

## Demo Accounts

| Role         | Email              | Password |
|--------------|--------------------|----------|
| Admin        | admin@test.com     | 1234     |
| Developer    | dev@test.com       | 1234     |
| QA Tester    | qa@test.com        | 1234     |
| DevOps Engr  | devops@test.com    | 1234     |

---

## Folder Structure

```
devops-platform/
├── server/
│   ├── models/           # MongoDB schemas
│   ├── controllers/      # Business logic
│   ├── routes/           # API endpoints
│   ├── db.js             # MongoDB connection
│   └── index.js          # Entry point + Socket.IO
├── client/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page-level components
│       ├── context/      # AuthContext + Socket
│       ├── services/     # API call functions
│       └── styles/       # CSS
└── README.md
```

---

## Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/devops-platform.git
cd devops-platform
```

### 2. Install dependencies
```bash
npm run install-all
```

### 3. Configure environment
```bash
cd server
cp .env.example .env
# Edit .env and set your MONGO_URI from MongoDB Atlas
```

### 4. Run in development
```bash
# From root folder
npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000

---
## Key Concepts Explained

### Role-Based Access
- Admin: full CRUD on projects and tasks, analytics view
- Developer/QA/DevOps: read-only on projects, can update their task statuses

### Real-Time (Socket.IO)
- Server creates an HTTP server, attaches Socket.IO
- On login, client connects and joins their user ID room
- Controllers call `global.io.emit()` after mutations
- All connected dashboards update instantly

### Smart Workload Balancing
- Counts active (non-completed) tasks per employee
- Sorts employees by active task count ascending
- Admin sees "least busy" suggestions when assigning tasks

### Deadline Alerts
- `alertType: 'overdue'` if deadline < now
- `alertType: 'urgent'` if deadline within 48 hours
- Task cards get colored left borders for visibility

---
