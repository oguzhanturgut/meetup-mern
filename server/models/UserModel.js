const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    index: {
      unique: true,
    },
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: {
      unique: true,
    },
    validate: {
      validator: emailValidator.validate,
      message: props => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    index: {
      unique: true,
    },
    minlength: 8,
  },
  avatar: {
    type: String,
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function preSave(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  try {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    user.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.comparePassword = async function comparePassword(pass) {
  return bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('user', UserSchema);
