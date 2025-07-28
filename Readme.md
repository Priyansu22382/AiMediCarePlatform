# AIMedicare 🩺 - AI-Powered Medication Adherence Tracker

AIMedicare is a full-stack healthcare web application designed to improve **medication adherence** through intelligent scheduling, real-time reminders, caretaker support, and AI-driven patient insights. Built using the **MERN stack**, the platform empowers **patients, caretakers, and healthcare providers** to work together seamlessly.

---

## 🚀 Live Demo

> [Visit AIMedicare →](https://aimedicare.netlify.app/)

---

## 📌 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## ✨ Features

### 👩‍⚕️ Patient Dashboard
- Add medications with dosage, frequency, and timings.
- Receive SMS reminders for each scheduled dose.
- Track taken/missed doses on a daily calendar.

### 👥 Caretaker Module
- Link to multiple patients using a secure code.
- Log doses on behalf of the patient.
- Manually trigger SMS reminders.
- Receive alerts for missed doses.

### 📊 Analytics
- Medication adherence stats and trends.
- Daily/weekly/monthly reports for patients and caretakers.

### 🔐 Role-Based Access
- Separate login/signup for **Patient** and **Caretaker**.
- Protected routes using JWT & middleware.

### 📱 SMS Reminder System
- Powered by **Twilio API**
- Reminders sent using **Node-Cron Scheduler**

---

## 🛠 Tech Stack

| Category          | Technology                           |
|-------------------|---------------------------------------|
| Frontend          | React.js, Tailwind CSS, Axios         |
| Backend           | Node.js, Express.js                   |
| Database          | MongoDB, Mongoose                     |
| Authentication    | JWT (JSON Web Tokens), Bcrypt         |
| SMS Integration   | Twilio API                            |
| Scheduling        | node-cron                             |
| Deployment        | Render / Vercel / Railway             |

---

## 🧩 System Architecture

```txt
Frontend (React)
     ↓
Backend API (Express + JWT Middleware)
     ↓
MongoDB (Data Models: User, Medication, Adherence Log)
     ↓
SMS Gateway (Twilio for reminders)
     ↓
Caretaker Notifications & Patient Reports
```

## Getting Started

1. Clone the Repository

- git clone https://github.com/Priyansu22382/aimedicare.git
- cd AIMedicareProject

2. Backend Setup

- cd Backend
- npm install

3. Create a .env File

- PORT=YOUR_PORT_NUMBER
- MONGO_URI=your_mongo_connection_string
- JWT_SECRET=your_jwt_secret
- TWILIO_ACCOUNT_SID=your_twilio_sid
- TWILIO_AUTH_TOKEN=your_twilio_auth_token
- TWILIO_PHONE_NUMBER=your_twilio_phone

4. Run the Server

- npm run dev

5. Frontend Setup

- cd ../Frontend
- npm install
- npm run dev

## API Endpoints

- ##✅ Authentication Routes

| Method | Endpoint                     | Description          |
| ------ | ---------------------------- | -------------------- |
| POST   | `/api/auth/patient/signup`   | Register new patient |
| POST   | `/api/auth/caretaker/signup` | Register caretaker   |
| POST   | `/api/auth/patient/login`    | Login for patient    |
| POST   | `/api/auth/caretaker/login`  | Login for caretaker  |

- ##💊 Medication Routes

| Method | Endpoint                      | Description                   |
| ------ | ----------------------------- | ----------------------------- |
| POST   | `/api/medication/add`         | Add new medication            |
| GET    | `/api/medication/patient/:id` | Get medications for a patient |
| DELETE | `/api/medication/:id`         | Delete a medication           |

- ##📅 Adherence Routes

| Method | Endpoint                           | Description                       |
| ------ | ---------------------------------- | --------------------------------- |
| POST   | `/api/adherence/log`               | Log dose taken or missed          |
| GET    | `/api/adherence/patient/:id`       | Get adherence log for a patient   |
| GET    | `/api/adherence/patient/:id/stats` | Get adherence stats (percentages) |

- ##👥 Caretaker Routes

| Method | Endpoint                              | Description                         |
| ------ | ------------------------------------- | ----------------------------------- |
| POST   | `/api/caretaker/link-patient`         | Link caretaker to patient           |
| GET    | `/api/caretaker/:id/patients`         | Get all linked patients             |
| POST   | `/api/caretaker/send-reminder/:medId` | Send a manual reminder to a patient |



