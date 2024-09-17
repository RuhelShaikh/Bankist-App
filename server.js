const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// Importing all the route handlers.
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { isAuthenticated } = require('./middleware/auth');

const app = express();

// Set up view engine (for EJS)
app.set('view engine', 'ejs');

// Setting the directory where the EJS views are located.
app.set('views', path.join(__dirname, 'views'));

// Serve the frontend
app.get('/', (req, res) => {
  res.render('login');
});

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Using built-in middleware functions to parse URL-encoded data and JSON data
// This urlencoded parses is in the form of key-value pairs.
app.use(express.urlencoded({ extended: true }));

// Parses JSON request bodies. (req.body)
app.use(express.json());

// Setting up the session middleware.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 5, // 5 minutes
    },
  })
);

// Middleware to set global variables for EJS templates.
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  res.locals.user = req.session.user || null;
  next();
});

// Using Routes that are imported on the top.
app.use(authRoutes);
app.use(userRoutes);
app.use(isAuthenticated);

// Connecting to MongoDB using Mongoose package which is installed already using (npm i mongoose).
mongoose
  .connect(URI)
  .then(result =>
    app.listen(PORT, (req, res) => {
      // The Server will only start if the database is connected.
      console.log(
        `DB is connected & Server is running on http://localhost:${PORT}.`
      );
    })
  )
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
