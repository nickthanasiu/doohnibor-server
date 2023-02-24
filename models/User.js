/*eslint-disable*/
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.ObjectId,
    auto: true,
  },
  firstName: {
    type: String,
    required: true,
    default: '',
  },
  lastName: {
    type: String,
    required: true,
    default: '',
  },
  email: {
    type: String,
    required: true,
    default: '',
  },
  password: {
    type: String,
    required: true,
    default: '',
  },
  buyingPower: {
    type: Number,
    required: true,
    default: 5000,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

// Before saving the model, hash the password String
userSchema.pre('save', function(next) {
  // Get access to the user model
  let user = this;

  // Generate , then run callback
  bcrypt.genSalt(10, function(saltError, salt) {
    if (saltError) {
      return next(saltError);
    }

    // Use Salt to Hash the password
    bcrypt.hash(user.password, salt, null, function(hashError, hash) {
      if (hashError) {
        return next(hashError);
      }

      // Overwrite Plain Text password with hashed password
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  const user = this;
  bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
    if (err) {
      return callback(err);
    }

    callback(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);
