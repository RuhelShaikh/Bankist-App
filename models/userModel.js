const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  pin: { type: String, required: true },
  balance: { type: Number, default: 1000 }, // Default value set to 1000
  movements: { type: Array },
  interestRate: { type: Number },
  movementsDates: { type: Array },
  currency: { type: String, default: '$' },
  locale: { type: String },
  age: { type: Number },
});

// Hashing the password before saving user document.
userSchema.pre('save', async function (next) {
  // This conditional statement will check if the password field is modified or if this is a new document.
  if (this.isModified('pin') || this.isNew) {
    // This will hash the password with bcrypt and set it on the user document.
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  // It will proceed to the next middleware or save operation.
  next();
});

// This below line is exporting the User model based on the defined schema.
module.exports = mongoose.model('User', userSchema);
