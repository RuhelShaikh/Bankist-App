// Importing neccessary libraries.
const express = require('express');

const { isAuthenticated } = require('../middleware/auth');

// Creating a router instance using Express router.
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

// Routes for rendering the different sort of pages as per the requirement for the user.
router.get('/dashboard', isAuthenticated, dashboardController.renderDashboard);

// Route to handle loan requests
router.post('/request-loan', isAuthenticated, dashboardController.requestLoan);

// Route for transferring money
router.post('/transfer', isAuthenticated, dashboardController.transferMoney);

// Route for transferring money
router.post(
  '/close-account',
  isAuthenticated,
  dashboardController.closeAccount
);

// Exporting routers to be used in the app.js
module.exports = router;
