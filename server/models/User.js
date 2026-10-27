const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide employee name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in normal queries
    },
    role: {
      type: String,
      enum: ['hr', 'manager', 'employee'],
      default: 'employee',
      lowercase: true,
    },
    department: {
      type: String,
      required: [true, 'Please specify a department'],
      enum: [
        'Engineering',
        'Human Resources',
        'Product & Design',
        'Marketing',
        'Sales',
        'Finance & Legal',
        'Customer Operations',
      ],
      default: 'Engineering',
    },
    position: {
      type: String,
      required: [true, 'Please specify a job title/position'],
      trim: true,
      default: 'Staff Associate',
    },
    phone: {
      type: String,
      trim: true,
      default: '+1 (555) 000-0000',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 65000,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    address: {
      type: String,
      trim: true,
      default: '123 Corporate Blvd, Suite 400',
    },
    emergencyContact: {
      name: { type: String, default: 'Emergency Contact' },
      phone: { type: String, default: '+1 (555) 999-9999' },
      relationship: { type: String, default: 'Family' },
    },
    skills: {
      type: [String],
      default: ['Communication', 'Teamwork', 'Project Management'],
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare hashed password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
