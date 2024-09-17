const bcrypt = require('bcrypt');
// Requiring the DB (Schema).
const User = require('../models/userModel');

// Render dashboard page with user data.
const renderDashboard = async (req, res) => {
  if (res.locals.isAuthenticated) {
    try {
      const userId = res.locals.user._id;

      // Fetching user data by ID.
      const user = await User.findById(userId);

      // Check if user exists
      if (!user) {
        return res.status(404).send('User not found');
      }

      console.log('Fetched user data:', user);

      // Prepare dynamic values for summary (calculating totals)
      const totalIn = user.movements
        .filter(mov => mov.amount > 0)
        .reduce((acc, mov) => acc + mov.amount, 0);

      const totalOut = user.movements
        .filter(mov => mov.amount < 0)
        .reduce((acc, mov) => acc + mov.amount, 0);

      // Ensure totalIn and totalOut are numbers
      const totalInNumber = Number(totalIn);
      const totalOutNumber = Number(totalOut);

      // Round totalIn and totalOut to 2 decimal places
      const roundedTotalIn = parseFloat(totalInNumber.toFixed(2)); // Number
      const roundedTotalOut = parseFloat(totalOutNumber.toFixed(2)); // Number

      // Calculate total interest from deposits
      const totalInterest = user.movements
        .filter(mov => mov.amount > 0)
        .map(deposit => (deposit.amount * user.interestRate) / 100)
        .filter(interest => interest >= 1) // Interest must be at least 1 currency unit
        .reduce((acc, int) => acc + int, 0);

      // Round total interest to 2 decimal places
      const roundedTotalInterest = parseFloat(totalInterest.toFixed(2)); // Number

      // Render the dashboard with dynamic user data
      res.render('dashboard', {
        title: 'Dashboard',
        username: user.username,
        balance: user.balance, // Current balance
        movements: user.movements, // Transaction movements
        movementsDates: user.movementsDates, // Transaction dates
        totalIn: roundedTotalIn, // Total deposits
        totalOut: roundedTotalOut, // Total withdrawals
        totalInterest: roundedTotalInterest, // Total interest
        currency: user.currency, // Currency
        locale: user.locale,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).send('Server error');
    }
  }
};

// Handle loan request and update user data.
const requestLoan = async (req, res) => {
  const userId = res.locals.user._id;
  const { amount } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Update balance
    user.balance += parseFloat(amount);

    // Add new loan movement at the beginning of the array
    user.movements.unshift({
      amount: parseFloat(amount), // Ensure toFixed(2) for consistency
      date: new Date().toISOString(), // Use ISO string format
    });

    // Optionally, you might also want to update movementsDates array
    user.movementsDates.unshift(new Date().toISOString());

    await user.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error processing loan request:', error);
    res.status(500).send('Internal Server Error');
  }
};

const transferMoney = async (req, res) => {
  const senderId = res.locals.user._id;
  const { to, amount } = req.body;

  try {
    // Find sender and receiver
    const sender = await User.findById(senderId);
    const receiver = await User.findOne({ username: to });

    if (!sender) {
      return res.status(404).send('Sender not found');
    }
    if (!receiver) {
      return res.status(404).send('Receiver not found');
    }

    // Parse and validate amount
    const transferAmount = parseFloat(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).send('Invalid transfer amount');
    }

    // Check if sender has enough balance
    if (transferAmount > parseFloat(sender.balance)) {
      return res.status(400).send('Insufficient funds');
    }

    // Convert sender's balance to a number
    const senderBalance = parseFloat(sender.balance);
    const receiverBalance = parseFloat(receiver.balance);

    if (isNaN(senderBalance) || isNaN(receiverBalance)) {
      console.error('Invalid balance detected:', {
        senderBalance,
        receiverBalance,
      });
      return res.status(500).send('Internal Server Error: Invalid balance');
    }

    // Update balances
    sender.balance = senderBalance - transferAmount;
    receiver.balance = receiverBalance + transferAmount;

    // Update movements
    sender.movements.unshift({
      amount: -transferAmount.toFixed(2),
      date: new Date().toISOString(),
    });
    sender.movementsDates.unshift(new Date().toISOString());

    receiver.movements.unshift({
      amount: transferAmount.toFixed(2),
      date: new Date().toISOString(),
    });
    receiver.movementsDates.unshift(new Date().toISOString());

    // Save the updated documents
    await sender.save();
    await receiver.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error processing money transfer:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Handle close account request and delete user.
const closeAccount = async (req, res) => {
  const userId = res.locals.user._id;
  const { username, pin } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Check if username matches
    if (user.username !== username) {
      return res.status(400).send('Username does not match');
    }

    // Verify the PIN
    const isPinValid = await bcrypt.compare(pin, user.pin);

    if (!isPinValid) {
      return res.status(400).send('Incorrect PIN');
    }

    // If everything is okay, proceed to close the account
    await User.findByIdAndDelete(userId);

    // Optionally, you might want to log the user out or redirect them
    res.redirect('/logout');
  } catch (error) {
    console.error('Error processing close account request:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  renderDashboard,
  requestLoan,
  transferMoney,
  closeAccount,
};
