//models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//User Schema
const userSchema = new mongoose.Schema({
  surname: {
    type: String,
    required: true,
    trim: true
  },
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'principal', 'teacher', 'student'],
    default: 'student'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
}, 
  {timestamps: true}
);

//Password Hashing Middleware
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        
    } catch (err) {
        throw err;
    }
});


// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare (password, this.password);
};

module.exports = mongoose.model('User', userSchema);