// Importing neccessary libraries.
const express = require('express');

// Creating a router instance using Express router.
const router = express.Router();

// Importing controllers for handling login, signup, and logout operations
const loginController = require('../controllers/loginController');
const signupController = require('../controllers/signupController');
const logoutController = require('../controllers/logoutController');

// Routes for rendering the login page,signup and logout as wel as the authentication with it.

router.get('/login', loginController.renderLogin);
router.post('/login', loginController.login);
router.get('/signup', signupController.renderSignup);
router.post('/signup', signupController.signup);
router.get('/logout', logoutController.logout);

// router.get('/logout', logoutController.logout);

// Exporting routers to be used in the app.js
module.exports = router;
