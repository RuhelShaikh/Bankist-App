// Controller for the Logout.
const logout = (req, res) => {
  // This will destroy the user session.
  req.session.destroy(err => {
    // If an error occurs while destroying the session, send a 500 status with an error message
    if (err) return res.status(500).send('Error logging out');

    // If session destruction is successful, redirect the user to the login page.
    res.redirect('/login');
  });
};

// Exporting the logout controller and is used in the routes folder.
module.exports = {
  logout,
};
