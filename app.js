//app.js

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


const express = require('express');
const app = express();
const connectDB = require('./config/db');
const path = require("path");




// NEW: security libs
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitize = require('mongo-sanitize');
const xss = require('xss-clean');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const examAttemptRoutes = require('./routes/examAttemptRoutes');


const { swaggerUi, swaggerSpec } = require('./swagger');

//DB connection
connectDB();

// Security hardening
//helmet
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://cdn.socket.io",   // allow socket.io CDN
        "'unsafe-eval'",   //  needed for tesseract.js
      ],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      connectSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://cdn.jsdelivr.net",   //allow worker importScripts
        "https://cdn.socket.io",
        "http://localhost:5000",
        //"https://onrender.com",
      ],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "https://fake-drug-verification.onrender.com"], // 👈 FIX: allow blob: images
    },
  })
);




//mongoSanitize
app.use((req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  if (req.query) req.query = sanitize(req.query);
  next();
});


// xss
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }

  if (req.params && typeof req.params === 'object') {
    for (let key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key]);
      }
    }
  }

  next();   
});

  //ratelimit
const limiter = rateLimit({ 
windowMs: 15 * 60 * 1000, // 15 minutes 
max: 30, // max 30 requests per IP 
message: 'Too many requests from this IP, please try again later.' 
}); 
app.use('/api', limiter);



// CORS configuration
const allowedOrigins = [
  'null', //To allow frontend guys to work freely for now  
  ]; 

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked CORS origin:", origin);
    return callback(null, false); // 🔥 DO NOT throw error
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



//Middleware to parse JSON
app.use(express.json());

app.use(express.urlencoded({ extended: true }));



//Routes
app.use('/api/auth', authRoutes);
app.use('/api', studentRoutes);
app.use('/api/subject', subjectRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/attempt', examAttemptRoutes);

// Swagger docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;