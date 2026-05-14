# Title
CBT Platform Backend

## Description
A scalable and secure Computer-Based Test (CBT) backend system built with Node.js, designed for schools, institutions, and online examination platforms. This backend handles authentication, exam management, teacher verification workflows, student access control, result processing, and performance optimization using modern backend technologies.


## Features

**Authentication & Authorization**
  JWT-based authentication
  Role-based access control (RBAC)
  Secure password hashing

**Teacher Management**
  Teacher registration system
  Principal/Admin verification workflow
  Teacher approval & suspension controls

**Student Management**
  Students do not self-register
  Admin-generated student credentials
  Student login using:
  Student ID
  Default password (surname)

**CBT & Examination System**
  Exam creation and scheduling
  Multiple question types
  Timed examinations
  Automatic submission on timeout
  Randomized questions support
  Exam instructions & rules

**Results & Analytics**
  Automatic grading
  Result computation
  Score tracking
  Student performance records



## Installation & Usage instructions\
git clone https://github.com/flama-tech-gs/flama-cbt-backend.git

# Navigate into the project folder
cd flama-cbt-backend

# Install dependencies
npm install

# Start the server
node server.js


src/
│
├── config/          # App & database configuration
├── controllers/     # Route controllers
├── middleware/      # Authentication & validations
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Helper functions
└── app.js           # Main application entry




## Technologies used
# Backend
- Node.js
- Express.js
- Cloudinary (file uploads)
- Mongoose (MongoDB ODM)

# Authentication & Security
- JWT Authentication
- Bcrypt.js (password hashing)
- Crypto
- dotenv
- Helmet
- Express-rate-limit
- Mongo-sanitize
- XSS-clean

# Queue & Realtime
- Redis (caching, driver presence, job queues)


# Integrations
- SMS/WhatsApp service
- Email services



## API Endpoints




## Example .env Configuration

Create a .env file in the root directory with the following keys:
  # === SERVER CONFIG ===
  PORT=

  # === DATABASE ===
  MONGO_URI=

  # === JWT AUTH ===
  JWT_SECRET=

  # === EMAIL SERVICE (optional, for OTP or reset links) ===
  SMTP_HOST=
  SMTP_PORT=
  SMTP_USER=
  SMTP_PASS=

  # === TWILIO SMS CONFIG ===
  TWILIO_ACCOUNT_SID=
  TWILIO_AUTH_TOKEN=
  TWILIO_PHONE_NUMBER=

  # === TERMII SMS CONFIG ===
  TERMII_API_KEY=
  TERMII_SENDER=


  # === REDIS CONFIG ===
  REDIS_HOST=
  REDIS_PORT=
  REDIS_PASS=

  # === EMAIL SERVICE ===
  MAIL_HOST=
  MAIL_PORT=
  MAIL_USER=
  MAIL_PASS=





## Author name

-Asiru Adedolapo

## Stage, Commit, and Push**

```bash

git add .
git commit -m "feat: initial project setup with folder structure and README"
git branch -M main
git remote add origin https://github.com/flama-tech-gs/flama-cbt-backend.git
git push -u origin main

