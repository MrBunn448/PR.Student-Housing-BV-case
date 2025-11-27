# Student Housing - Party Notification System

This is the repository for the Student Housing B.V. project. It is a web application designed to manage student announcements, specifically focused on announcing parties and reporting noise complaints.

The system integrates with an Arduino (hardware) to provide visual and audio feedback when parties are announced or reported.

## Prerequisites

Before you start, make sure you have the following installed on your computer:

1. Node.js (v16 or higher) - [Download here](https://nodejs.org/)
2. MySQL Server (via XAMPP)

## Getting Started (Step-by-Step)

Since the database is hosted locally on your own computer, every team member must follow these steps to set up their own version of the database.

### 1. Install Dependencies

We have two separate applications: the Server (Backend) and the Client (Frontend). You need to install libraries for both.

Open your terminal in the project root and run:

```bash
# 1. Install Server dependencies
cd server
npm install

# 2. Install Client dependencies
cd ../client
npm install
```

### 2. Database Configuration (Important)

Because we are working on different computers, your MySQL password might differ from mine.

1. Open the file: `server/setup_database.js`
2. Look for the `dbConfig` section at the top:

```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',      // Default for XAMPP is 'root'
  password: '',      // Default for XAMPP is empty. CHANGE IF NEEDED.
  multipleStatements: true 
};
```

3. Update the `user` and `password` to match your local MySQL settings.
4. Repeat this step for the file `server/server.js` (it also needs the password to connect).

### 3. Run Migrations & Seeders

We have a script that automatically creates the database, tables, and fills them with dummy data (Seeders).

Make sure your MySQL server (XAMPP/MAMP) is running, then execute:

```bash
# Inside the 'server' folder
npm run db:setup
```

**Expected Output:**

```
Database setup complete!
```

**Note:** Running this script will wipe the existing `student_housing` database and recreate it. Do not run this if you have data you want to keep.

## Running the Application

You need to run the Backend and Frontend in two separate terminals.

**Terminal 1: Start the Backend (API)**

```bash
cd server
npm start
```

Output should say: `Server running on port 3001`

**Terminal 2: Start the Frontend (React)**

```bash
cd client
npm run dev
```

Click the link shown (usually `http://localhost:5173`) to open the website.

## Tech Stack & Features

- **Frontend:** React (Vite), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Real-time:** Socket.io (Used to trigger the Arduino)

## Implemented Use Cases (Gio's Part)

- UC1: Create Announcement (Triggers Arduino Light)
- UC2: Filter Announcements (Future vs All)
- UC3: Report Unexpected Party (Triggers Arduino Alarm)
- UC4: Read Receipts (See who read an announcement)

## Arduino Integration (For Luuk)

The backend emits Socket.io events that the hardware client should listen to:

### Event: `trigger_light`

- **Payload:** `{ state: 'ON', color: 'orange' }`
- **Triggered when:** A new party announcement is posted.

### Event: `trigger_alarm`

- **Payload:** `{ state: 'ON', sound: 'siren' }`
- **Triggered when:** A user reports an unexpected party.

## Troubleshooting

- **"Client cannot connect to Server":** Ensure the server terminal is running on port 3001.
- **"Access denied for user 'root'@'localhost'":** You forgot to update the password in `server/server.js` or `server/setup_database.js`.
- **"Module not found":** You forgot to run `npm install` in the specific folder (client or server).
- **If you get a error related to windows policy restrictions use the "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted" command in powershell to allow scripts to run.