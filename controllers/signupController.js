// Requiring the DB (Schema).
const User = require('../models/userModel');

const renderSignup = (req, res) => {
  res.render('/login', { title: 'Login' });
};

const signup = async (req, res) => {
  const { username, pin, confirmPin } = req.body;

  // This below if else block will check if the passwords match or not.
  if (pin !== confirmPin) {
    return res.send(`
        <script>
          alert('Pins do not match');
          window.location.href = '/signup';
        </script>
      `);
  }

  // This will check from the DB (User) if the same username in the DB exists or not.

  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.send(`
          <script>
            alert('Username already exists. Please login or choose a different username.');
            window.location.href = '/login';
          </script>
        `);
    }

    // Creating new User inside the database.
    const newUser = new User({
      username,
      pin,
    });

    // Giving an alert that user is saved.
    await newUser.save();
    res.send(`
        <script>
          alert('User registered successfully');
          window.location.href = '/login';
        </script>
      `);

    // If there is an error saving data then this catch block will give an error with a message.
  } catch (err) {
    console.log('Error saving user data:', err);
    res.status(500).send(`
        <script>
          alert('Error saving user data');
          window.location.href = '/login';
        </script>
      `);
  }
};

// Exporting the whole controller and is used in the routes folder.
module.exports = {
  signup,
  renderSignup,
};
