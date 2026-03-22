const mongoose = require('mongoose');

const userSchema = new mongoose.Schema( {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,   
      trim:      true,
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,  
    },

    role: {
      type:    String,
      enum:    {
        values:  ['agent', 'manager', 'admin'],
        message: 'Role must be agent, manager, or admin',
      },
      default: 'agent',
    },

    isActive: {
      type:    Boolean,
      default: true,     
    },

    lastLogin: {
      type:    Date,
      default: null,
    },

    loginAttempts: {
      type:    Number,
      default: 0,        
    },

    lockedUntil: {
      type:    Date,
      default: null,     
    },
  },
  {
    timestamps: true,     
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User ;