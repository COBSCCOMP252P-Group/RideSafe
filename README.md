# RideSafe 🚌

**A digital school transport management platform for safer, smarter student commutes.**

RideSafe replaces manual, error-prone school transport tracking with a real-time digital system — giving parents peace of mind, drivers less paperwork, and admins full visibility into fleet operations.

---

Status: Under active development — this project is a work in progress. Features, structure, and documentation are subject to change.

---


##  Introduction

School transport today relies heavily on manual processes — paper attendance sheets, phone calls for updates, and no way for parents to know where the bus (or their child) actually is. This creates safety gaps and wastes everyone's time.

**RideSafe** solves this with:
- Real-time bus and student tracking
- Digital, QR-based attendance
- Instant emergency and delay notifications
- A centralized dashboard for school administrators

Built for three core users: **parents**, **drivers**, and **admins** — enabling a transparent, efficient, and safe transport experience for everyone.

---

##  Problem Statement

- **No real-time visibility** — parents have no way to confirm their child boarded the bus safely or track its location.
- **Manual attendance** is slow, inconsistent, and prone to human error.
- **Communication gaps** — delays, accidents, or route changes reach parents late or not at all.
- **Net result:** reduced operational efficiency and increased safety risk for students.

---

##  Proposed Solution

RideSafe addresses these gaps through:

- **Real-time GPS tracking** of buses with live location updates
- **QR code-based attendance** for fast, accurate check-in/check-out
- **SMS & email notifications** for delays, incidents, and emergencies
- **Admin dashboard** for managing routes, students, and attendance reports
- **Analytics** on route performance and system usage

---

##  Key Features

###  Bus Tracking
- Simulated live GPS tracking
- Route map display
- ETA calculations

###  Attendance System
- Digital check-in on boarding
- Auto-sync to school records
- Absence flagging & alerts

###  Notifications
- Real-time SMS & email alerts
- Delay and incident notifications
- Parent opt-in preferences

###  Admin Dashboard
- Route management
- Attendance reports & CSV/PDF export
- Student & driver management

###  Analytics
- Attendance trends
- On-time performance KPIs
- Monthly summary reports

###  Safety & Security
- Role-based access control (Admin / Driver / Parent)
- Session timeout management


---

##  Tech Stack

| Layer      | Technology            |
|------------|------------------------|
| Frontend   | React, Tailwind CSS    |
| Backend    | Python, FastAPI        |
| Database   | PostgreSQL             |
| Tools      | Jira, VS Code, GitHub  |

---

##  User Roles

| Role       | Capabilities                                                        |
|------------|-----------------------------------------------------------------------|
| **Parent** | View live bus location, receive alerts, manage notification preferences |
| **Driver** | Digital attendance check-in, report delays/incidents                  |
| **Admin**  | Manage routes, students, drivers; view analytics and reports          |

##  Project Structure
```bash

RideSafe/
├── Backend/                   
│   ├── auth/                   # Authentication & authorization 
│   ├── models/                 # Database models/schemas 
│   ├── routes/                 # API endpoints/routers
│   ├── utils/                  # Helper functions
│   ├── database.py             # Database connection
│   ├── main.py                
│   └── requirements.txt       
│
├── Frontend/                  
│   ├── public/                
│   ├── src/
│   │   ├── components/          # Reusable UI building blocks, grouped by role/purpose
│   │   ├── hooks/               # Custom React hooks (shared logic across components)       
│   │   ├── pages/               # Full page views, grouped by role        
│   │   ├── services/            # API call logic 
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # Frontend helper functions 
│   │   ├── App.tsx             
│   │   ├── global.d.tsx        
│   │   ├── index.css            
│   │   └── index.tsx            
│   └── package.json            
│
└── README.md                    


```
---

### Installation

```bash
# Clone the repository
git clone [https://github.com/COBSCCOMP252P-Group/RideSafe]
cd ridesafe

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup
cd ../frontend
npm install
npm run dev



```
---
