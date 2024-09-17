// Middleware to check if the user is authenticated.
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.user) {
    // Set the user object in res.locals for easy access in views or other middlewares
    res.locals.user = req.session.user;
    return next();
  }

  // If not authenticated, redirect to login
  res.redirect('/login');
};

module.exports = {
  isAuthenticated,
};
