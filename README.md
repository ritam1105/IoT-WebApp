# 🌊 IoT + WebApp

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.3+-blue.svg)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-13.7+-orange.svg)](https://firebase.google.com/)

A comprehensive IoT web application for monitoring water quality parameters in real-time. Built with Node.js, Express, and Firebase, this project integrates sensor data collection, user authentication, and interactive dashboards for environmental monitoring.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 User Management
- Secure user registration and login
- Session-based authentication
- Password hashing with bcrypt
- Protected routes and middleware

### 📊 Real-Time Sensor Monitoring
- Live data collection from IoT sensors
- Parameters: Temperature, pH, Water Level, Turbidity
- Firebase Realtime Database integration
- Automatic data synchronization to MongoDB

### 📈 Data Visualization
- Interactive dashboard with sensor cards
- Real-time graphs and charts
- Historical data analysis
- Session-based data management

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- EJS templating engine
- Custom animations and transitions
- Mobile-friendly interface

### 🔄 Session Management
- Start, stop, and create new monitoring sessions
- Persistent session storage
- Data aggregation and averaging

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Primary database
- **Mongoose** - ODM for MongoDB
- **Firebase Admin SDK** - IoT data source

### Frontend
- **EJS** - Templating engine
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Vanilla JavaScript** - Client-side interactions

### Security & Tools
- **bcrypt** - Password hashing
- **express-session** - Session management
- **connect-mongo** - Session store
- **node-cron** - Scheduled tasks
- **nodemon** - Development auto-restart

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Firebase project with Realtime Database
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ritam1105/IoT-WebApp.git
   cd IoT-WebApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build CSS**
   ```bash
   npm run build:css
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URL=mongodb://localhost:27017/iot-webapp
SESSION_SECRET=your-super-secret-session-key
FireBase_URL=https://your-firebase-project.firebaseio.com/
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Realtime Database
4. Go to Project Settings > Service Accounts
5. Generate a new private key and download the JSON file
6. Rename the downloaded file to `serviceAccountKey.json` and place it in the project root

### Database Structure

The Firebase Realtime Database should have sensor data in one of these paths:
- `/sensor_data`
- `/sensor`

Expected data structure:
```json
{
  "temperature": 25.5,
  "pH": 7.2,
  "waterLevel": 85.3,
  "turbidity": 12.1
}
```

## 🎯 Usage

### Development Mode

Start the development server with hot reload:
```bash
npm run dev
```

### Production Mode

Build CSS and start the server:
```bash
npm run build:css
npm start
```

The application will be available at `http://localhost:3000`

### User Workflow

1. **Register/Login**: Create an account or log in
2. **Dashboard**: View current sensor readings
3. **Start Session**: Begin monitoring sensor data
4. **View Graphs**: Analyze historical data with interactive charts
5. **Manage Sessions**: Stop current session or start a new one

## 📁 Project Structure

```
IoT-WebApp/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── serviceAccountKey.json # Firebase service account key
├── simulation.js          # IoT sensor simulation script
├── .env                   # Environment variables (create this)
├── controllers/
│   └── userController.js  # User-related controllers
├── middleware/
│   └── auth.js            # Authentication middleware
├── models/
│   ├── user.js            # User model
│   ├── sensorData.js      # Sensor data model
│   └── Session.js         # Session model
├── public/
│   ├── output.css         # Compiled Tailwind CSS
│   └── images/            # Static images
│       └── scripts/       # Client-side JavaScript
│           ├── dashboard.js
│           └── firebaseSync.js
├── routes/
│   ├── userRoutes.js      # User authentication routes
│   └── sensor.js          # Sensor data routes
├── services/
│   └── firebaseSync.js    # Firebase data synchronization
└── views/
    ├── index.ejs          # Home page
    ├── login.ejs          # Login page
    ├── signup.ejs         # Registration page
    ├── dashboard.ejs      # Main dashboard
    ├── graph.ejs          # Data visualization
    └── input.css          # Tailwind input CSS
```

## 🔗 API Endpoints

### Authentication Routes (`/`)
- `GET /` - Home page
- `GET /login` - Login page
- `POST /login` - User login
- `GET /signup` - Registration page
- `POST /signup` - User registration
- `GET /dashboard` - User dashboard (protected)
- `GET /logout` - User logout

### Sensor Routes (`/sensor`)
- `POST /start` - Start/resume data fetching
- `POST /stop` - Stop data fetching
- `POST /new` - Start new session
- `GET /session` - Get current session info
- `GET /latest` - Get latest sensor reading
- `GET /data/:sessionId` - Get session data (last 50 records)
- `GET /averages/:sessionId` - Get session averages

### Graph Routes
- `GET /graph/:sessionId/:sensor` - View sensor graph (protected)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ritam Majumdar**
- GitHub: [@ritam1105](https://github.com/ritam1105)
- Repository: [IoT-WebApp](https://github.com/ritam1105/IoT-WebApp)

---

⭐ If you found this project helpful, please give it a star! 