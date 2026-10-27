# StaffSync — Modern Human Resource Management System (HRMS)

StaffSync is an enterprise-grade, full-stack Human Resource Management System (HRMS) designed to streamline personnel management, daily biometric attendance, multi-tiered leave approvals, corporate broadcasts, and employee skill development.

Built with **React (Vite)**, **Bootstrap 5**, **Node.js/Express**, and **MongoDB with Mongoose**, StaffSync provides a modern, responsive Software-as-a-Service (SaaS) experience tailored for HR Administrators, Team Managers, and Staff Employees.

---

## 🚀 Key Features

### 1. Role-Based Authentication & Security
- **Triple-Role Access Control**: Seamless access separation for **HR Administrator**, **Team Manager**, and **Staff Employee**.
- **JWT & bcryptjs**: Secure password hashing with salt rounds and JSON Web Token (JWT) authorization via HTTP Bearer headers.
- **Protected Routing**: Role-enforced client routes and backend authorization middleware on all private endpoints.
- **One-Click Demo Switcher**: Pre-configured role switchers on the login portal for live presentations and academic evaluation.

### 2. Executive & Operational Dashboard
- **Consolidated Key Metrics**: Real-time counters for Total Active Employees, Daily Attendance Rate, Pending Leave Requests, and Active Training Programs.
- **Interactive Recharts Visualization**:
  - **Weekly Attendance Dynamics**: Visualized comparison of Present, Late Arrivals, and Absent personnel across the prior 7 days.
  - **Department Ratio**: Interactive doughnut/pie distribution chart of workforce allocations across engineering, design, marketing, sales, and HR.
- **Today's Punch Status Widget**: Instant check-in/out button with active status pill and time computation.
- **Recent Leaves & Broadcasts**: Real-time snapshot of pending leave requests and pinned company notices.

### 3. Employee Directory & Profiles
- **Comprehensive Workforce Registry**: Full directory with search across names, positions, and email addresses.
- **Multi-Dimensional Filters**: Filter by Department, Role, and Active/Inactive status.
- **Employee CRUD (HR Only)**: Form validation for adding new employees with customizable compensation, position, address, and skills.
- **Account Status Toggling**: Deactivate or reactivate personnel accounts with safeguard preventing HR self-deactivation.
- **Modal Profile Viewer**: In-depth personnel modal displaying direct contact numbers, residential address, emergency contact, technical competencies, and role-restricted salary.

### 4. Biometric Attendance & Shift Tracking
- **Live Digital Clock & Punch Terminal**: Punch in and punch out with real-time clock and location tagging (Office HQ, Remote, Client Site).
- **Automated Hours & Punctuality**:
  - Automatically calculates working hours (hours & decimals).
  - Flags late arrivals if checked in after 09:30 AM.
  - Categorizes shifts into **Present**, **Late**, and **Half Day** (under 4 hours).
- **Personal Log & Register**: 60-day attendance history with personal attendance rate and average daily hours.
- **Company Attendance Register (HR/Manager)**: Full-company attendance view filterable by date, department, and status.
- **Manual Adjustment Entry (HR Only)**: HR administrators can record or correct punch entries for staff who forgot to log their shift.

### 5. Leave & Absence Management
- **Time-Off Application**: Employees can apply for Annual, Sick, Casual, Maternity/Paternity, and Unpaid leaves.
- **Automated Duration Calculation**: Validates that start date precedes end date and automatically computes calendar day totals.
- **Approval Workflow**: Managers and HR administrators can approve or reject pending leaves with supervisory notes.
- **Employee Self-Service**: Track application status (*Pending*, *Approved*, *Rejected*) or cancel pending applications.

### 6. Corporate Announcements
- **Company-Wide Notice Board**: Broadcasts corporate events, policy amendments, and holiday closures.
- **Categorization & Priority**: Tagged with categories (*General*, *Policy*, *Event*, *Urgent*, *Holiday*) and priority chips (*Low*, *Medium*, *High*, *Urgent*).
- **Pinned Announcements**: Crucial notices pinned to the top of employee dashboards.
- **HR Publishing Control**: Only HR administrators can publish or delete announcements.

### 7. Learning & Development (L&D)
- **Course Catalog**: HR creates training programs with instructor details, syllabus descriptions, delivery mode (*Online*, *In-Person*, *Hybrid*), and capacity limits.
- **One-Click Self-Enrollment**: Employees enroll in available programs with automatic capacity checking.
- **Learning Dashboard**: Track course progress from *Enrolled* to *In Progress* to *Completed* with certification timestamps.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Bootstrap 5, Custom CSS Design System, React Router DOM, React Icons, Recharts, Axios |
| **Backend** | Node.js, Express.js, JSON Web Tokens (jsonwebtoken), bcryptjs, CORS, dotenv |
| **Database** | MongoDB, Mongoose ODM |
| **Deployment** | Vercel (Frontend SPA), Render (Backend API), MongoDB Atlas (Cloud Database) |

---

## 📂 Project Architecture

```
StaffSync/
├── client/                     # React.js Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # Axios instance with JWT interceptors
│   │   ├── components/
│   │   │   ├── common/         # StatCard, ProtectedRoute, LoadingSpinner
│   │   │   └── layout/         # Navbar, Sidebar, Layout wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication & Session state
│   │   ├── pages/
│   │   │   ├── Login.jsx       # Auth portal with 1-click demo switcher
│   │   │   ├── Dashboard.jsx   # Metrics, Recharts trends, quick punch
│   │   │   ├── Employees.jsx   # Employee directory, CRUD, profile modal
│   │   │   ├── Attendance.jsx  # Punch clock, personal & company registers
│   │   │   ├── Leaves.jsx      # Leave workflow & approval dialog
│   │   │   ├── Announcements.jsx # Corporate broadcast notice board
│   │   │   ├── Training.jsx    # L&D catalog & enrollment tracking
│   │   │   ├── Profile.jsx     # Personal info & password management
│   │   │   └── NotFound.jsx    # 404 handler
│   │   ├── App.jsx             # Route definitions
│   │   ├── index.css           # Navy Blue design system & tokens
│   │   └── main.jsx
│   ├── .env.example
│   ├── vercel.json             # Vercel SPA rewrites
│   └── package.json
│
├── server/                     # Express.js REST API Backend
│   ├── config/
│   │   └── db.js               # Mongoose MongoDB connection
│   ├── controllers/            # Business logic for all 7 HRMS modules
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── announcementController.js
│   │   ├── trainingController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect & role authorize
│   │   └── errorMiddleware.js  # Global error and 404 handlers
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Announcement.js
│   │   ├── Training.js
│   │   └── TrainingEnrollment.js
│   ├── routes/                 # API endpoint routers
│   ├── seed.js                 # Database seeder with sample accounts
│   ├── server.js               # Express application entrypoint
│   ├── .env.example
│   └── package.json
│
├── .env.example                # Root environment guide
├── .gitignore
├── render.yaml                 # Render Blueprint configuration
├── vercel.json                 # Root Vercel deployment configuration
├── package.json                # Root orchestrator scripts
└── README.md
```

---

## 👥 Pre-Configured Demo Accounts

For immediate project presentation and evaluation, use the following credentials (or use the one-click demo buttons on the login page):

| Role | Email Address | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `admin@staffsync.com` | `Password123!` | Full administrative control: employee CRUD, status toggle, manual attendance adjustment, leave approvals, announcements, training creation |
| **Team Manager** | `manager@staffsync.com` | `Password123!` | Management level: team leave approvals, organization attendance register, employee directory, view announcements & courses |
| **Staff Employee** | `employee@staffsync.com` | `Password123!` | Self-service portal: live punch in/out, view personal history, apply for leaves, enroll in trainings, update personal profile |

---

## ⚡ Quick Start Guide (Local Setup)

### 1. Prerequisites
- **Node.js** >= v18.0.0
- **npm** >= v9.0.0
- **MongoDB** (Local daemon or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 2. Install Dependencies
Run the installation script from the root directory:
```bash
npm run install:all
```
*(Alternatively, run `npm install` inside both `server/` and `client/` directories.)*

### 3. Environment Configuration
Create the environment files from the provided examples:

**Server Configuration (`server/.env`):**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=staffsync_secret_jwt_key_2026_modern_hrms_super_secure
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```
*(If using MongoDB Atlas, replace `MONGO_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/staffsync?retryWrites=true&w=majority`)*

**Client Configuration (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed the Database
Populate initial demo users, attendance logs, leaves, announcements, and training courses:
```bash
npm run seed
```
*(Or `npm --prefix server run seed`)*

### 5. Start the Application
Run both servers concurrently:

In Terminal 1 (Backend API):
```bash
npm run server
```
*Backend runs at `http://localhost:5000`*

In Terminal 2 (Frontend Client):
```bash
npm run client
```
*Frontend runs at `http://localhost:5173`*

---

## 🌐 Production Deployment

### 1. Database: MongoDB Atlas
1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Network Access**, add IP Address `0.0.0.0/0` (Allow access from anywhere).
3. Under **Database Access**, create a user (e.g. `staffsync_admin`) with password.
4. Copy the connection string into your backend environment variable `MONGO_URI`.

### 2. Backend: Render
1. Connect this repository to [Render.com](https://render.com).
2. Select **New Web Service**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/staffsync?retryWrites=true&w=majority`
   - `JWT_SECRET`: `<your_secure_secret>`
   - `CLIENT_URL`: `https://your-staffsync-app.vercel.app`
4. Deploy the service. Your backend URL will be: `https://staffsync-api.onrender.com`.

### 3. Frontend: Vercel
1. Connect this repository to [Vercel](https://vercel.com).
2. Set the configuration:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://staffsync-api.onrender.com/api`
4. Deploy. The included `vercel.json` ensures that single-page application routes (e.g. `/attendance`, `/leaves`) reload without 404 errors.

---

## 🧪 Testing & Verification Checklist

- [x] **Frontend Production Build**: `npm run build` passed with 0 errors via Vite.
- [x] **Backend Syntax Validation**: Node `-c` syntax verification passed on all controllers, models, routes, and middleware.
- [x] **API Health Check**: `/api/health` confirmed online.
- [x] **Demo Authentication Provider**: `/api/auth/demo-credentials` active for 1-click evaluation.
- [x] **Role Authorization**: Granular access control for HR Admin, Manager, and Staff Employee.
- [x] **Responsive SaaS UI**: Polished Navy Blue design with mobile-collapsible sidebar and interactive Recharts data charts.

---

## 📄 License
This project is licensed under the MIT License — created for academic capstone presentation and professional HRMS portfolio demonstration.
