// Requiring the User Schema from the models folder.
const User = require('../models/userModel');

// requiring the library which is used to hash (encypt) the password.
const bcrypt = require('bcrypt');

// Rendering the login page
const renderLogin = (req, res) => {
  res.render('login', { title: 'Login' });
};

const login = async (req, res) => {
  // Extracting username and password from the request body.
  const { username, pin } = req.body;

  try {
    // If user is not found, set an error message in session and redirect to the login page.
    const user = await User.findOne({ username });
    if (!user) {
      return res.send(`
          <script>
            alert('Invalid username or password');
            window.location.href = '/login';
          </script>
        `);
    }

    // Compare the provided password with the hashed password in the database.
    const isPinValid = await bcrypt.compare(pin, user.pin);

    if (isPinValid) {
      // If password is valid, set user session data and authentication status.
      req.session.user = user;
      req.session.isAuthenticated = true;

      // This below lines of code will be responsible for redirecting URL based on user type.
      let redirectUrl = '/dashboard';

      res.send(`
          <script>
            alert('Login successful');
            window.location.href = '${redirectUrl}';
          </script>
        `);
    } else {
      res.send(`
          <script>
            alert('Invalid username or password');
            window.location.href = '/login';
          </script>
        `);
    }
  } catch (err) {
    // Log the error and set an error message in session, then redirect to the login page.
    console.log('Error during login:', err);
    res.status(500).send(`
        <script>
          alert('Error during login');
          window.location.href = '/login';
        </script>
      `);
  }
};

// Exporting both controllers and is used in the routes folder.
module.exports = {
  renderLogin,
  login,
};
