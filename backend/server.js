// HostelEZ Backend API - server.js
// Node.js + Express + MongoDB

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

const app = express();
app.use(express.json());
app.use(cors());

// ============================================
// DATABASE CONNECTION
// ============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelez', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ============================================
// SCHEMAS & MODELS
// ============================================

// User/Student Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  phoneNumber: String,
  bloodType: String,
  birthday: Date,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  hostelDetails: {
    hostelName: String,
    roomNumber: String,
    floor: Number,
    block: String
  },
  branch: String,
  semester: Number,
  profilePicture: String,
  createdAt: { type: Date, default: Date.now }
});

// Timetable Schema
const timetableSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: Number,
  classes: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    subject: String,
    subjectCode: String,
    startTime: String,
    endTime: String,
    room: String,
    block: String,
    professor: String,
    type: { type: String, enum: ['Lecture', 'Lab', 'Tutorial'] }
  }],
  updatedAt: { type: Date, default: Date.now }
});

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  subjectCode: String,
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
  records: [{
    date: Date,
    status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Medical'] },
    reason: String,
    certificate: String // URL to uploaded certificate
  }],
  requiredPercentage: { type: Number, default: 75 },
  semester: Number
});

// Laundry Schema
const laundrySchema = new mongoose.Schema({
  hostelName: String,
  roomNumber: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slots: [{
    date: Date,
    time: String,
    status: { type: String, enum: ['Booked', 'Available', 'Completed', 'Cancelled'], default: 'Booked' },
    reminderSent: { type: Boolean, default: false }
  }],
  weeklySchedule: {
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    defaultTime: String
  }
});

// Roommate Schema
const roommateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roommates: [{
    roommateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    phoneNumber: String,
    status: { type: String, enum: ['In', 'Out'], default: 'In' },
    lastCheckIn: Date,
    lastCheckOut: Date,
    locationSharing: { type: Boolean, default: false }
  }]
});

// Health Tracker Schema
const healthSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  waterIntake: { type: Number, default: 0 }, // in liters
  waterGoal: { type: Number, default: 3.5 },
  steps: { type: Number, default: 0 },
  stepsGoal: { type: Number, default: 10000 },
  medicines: [{
    name: String,
    dosage: String,
    times: [String], // ["8:00 AM", "2:00 PM", "8:00 PM"]
    taken: [Boolean],
    reminderSent: [Boolean]
  }],
  heartRate: Number,
  oxygenLevel: Number,
  caloriesBurned: Number,
  sleepHours: Number,
  screenTime: Number // in minutes
});

// Assignments Schema
const assignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  title: String,
  description: String,
  dueDate: Date,
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Overdue'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  attachments: [String],
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Notices/Updates Schema
const noticeSchema = new mongoose.Schema({
  hostelName: String,
  title: String,
  description: String,
  type: { type: String, enum: ['Inspection', 'Laundry', 'Maintenance', 'Event', 'Emergency', 'General'] },
  date: Date,
  time: String,
  postedBy: String, // Faculty/Warden name
  targetAudience: { type: String, enum: ['All', 'Boys', 'Girls', 'Specific Block'], default: 'All' },
  block: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Checklist Schema
const checklistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    name: String,
    emoji: String,
    isChecked: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: true } // Default items vs user-added
  }],
  lastReset: { type: Date, default: Date.now }
});

// Mess/Food Schema
const foodSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['Mess', 'Canteen', 'Restaurant', 'Cafe'] },
  location: String,
  distance: Number, // in meters
  timings: {
    breakfast: String,
    lunch: String,
    dinner: String
  },
  menu: [{
    day: String,
    items: [String]
  }],
  priceRange: String,
  rating: Number,
  contactNumber: String,
  isOpen: { type: Boolean, default: true }
});

// Events/Calendar Schema
const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  eventType: { type: String, enum: ['Cultural', 'Sports', 'Academic', 'Club', 'Volunteering', 'Internship', 'Personal'] },
  date: Date,
  startTime: String,
  endTime: String,
  location: String,
  reminderBefore: Number, // in minutes
  isRecurring: { type: Boolean, default: false },
  recurringPattern: String,
  attendanceExemption: { type: Boolean, default: false }, // If this event grants attendance exemption
  certificate: String
});

// Maintenance Request Schema
const maintenanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomNumber: String,
  issueType: { type: String, enum: ['Electrical', 'Plumbing', 'Furniture', 'AC', 'Internet', 'Other'] },
  description: String,
  urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending' },
  images: [String],
  assignedTo: String,
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Timetable = mongoose.model('Timetable', timetableSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Laundry = mongoose.model('Laundry', laundrySchema);
const Roommate = mongoose.model('Roommate', roommateSchema);
const Health = mongoose.model('Health', healthSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Notice = mongoose.model('Notice', noticeSchema);
const Checklist = mongoose.model('Checklist', checklistSchema);
const Food = mongoose.model('Food', foodSchema);
const Event = mongoose.model('Event', eventSchema);
const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

// ============================================
// MIDDLEWARE - JWT Authentication
// ============================================
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ============================================
// API ROUTES
// ============================================

// ===== AUTHENTICATION =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, usn, phoneNumber, hostelDetails } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      usn,
      phoneNumber,
      hostelDetails
    });
    
    await user.save();
    
    // Create default checklist items
    const defaultChecklist = new Checklist({
      userId: user._id,
      items: [
        { name: 'ID Card', emoji: '🪪', isDefault: true },
        { name: 'Keys', emoji: '🔑', isDefault: true },
        { name: 'Wallet', emoji: '💳', isDefault: true },
        { name: 'Phone', emoji: '📱', isDefault: true },
        { name: 'Books', emoji: '📚', isDefault: true }
      ]
    });
    await defaultChecklist.save();
    
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== USER PROFILE =====
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TIMETABLE =====
app.post('/api/timetable', authenticateToken, async (req, res) => {
  try {
    const timetable = new Timetable({
      userId: req.user.userId,
      ...req.body
    });
    await timetable.save();
    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/timetable', authenticateToken, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ userId: req.user.userId });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/timetable/today', authenticateToken, async (req, res) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    const timetable = await Timetable.findOne({ userId: req.user.userId });
    const todayClasses = timetable?.classes.filter(c => c.day === today) || [];
    
    res.json(todayClasses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ATTENDANCE =====
app.post('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const attendance = new Attendance({
      userId: req.user.userId,
      ...req.body
    });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const attendance = await Attendance.find({ userId: req.user.userId });
    const calculated = attendance.map(att => ({
      ...att.toObject(),
      percentage: att.totalClasses > 0 ? ((att.attendedClasses / att.totalClasses) * 100).toFixed(2) : 0,
      classesToAttend: Math.max(0, Math.ceil((att.requiredPercentage * att.totalClasses - 100 * att.attendedClasses) / (100 - att.requiredPercentage)))
    }));
    res.json(calculated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance/:id/mark', authenticateToken, async (req, res) => {
  try {
    const { status, reason, certificate } = req.body;
    const attendance = await Attendance.findById(req.params.id);
    
    attendance.totalClasses += 1;
    if (status === 'Present') attendance.attendedClasses += 1;
    
    attendance.records.push({
      date: new Date(),
      status,
      reason,
      certificate
    });
    
    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== LAUNDRY =====
app.post('/api/laundry/book', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    let laundry = await Laundry.findOne({ roomNumber: user.hostelDetails.roomNumber });
    
    if (!laundry) {
      laundry = new Laundry({
        hostelName: user.hostelDetails.hostelName,
        roomNumber: user.hostelDetails.roomNumber,
        userId: req.user.userId,
        slots: []
      });
    }
    
    laundry.slots.push({
      date: req.body.date,
      time: req.body.time,
      status: 'Booked'
    });
    
    await laundry.save();
    res.status(201).json(laundry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/laundry', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const laundry = await Laundry.findOne({ roomNumber: user.hostelDetails.roomNumber });
    res.json(laundry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ROOMMATES =====
app.post('/api/roommates', authenticateToken, async (req, res) => {
  try {
    let roommate = await Roommate.findOne({ userId: req.user.userId });
    
    if (!roommate) {
      roommate = new Roommate({ userId: req.user.userId, roommates: [] });
    }
    
    roommate.roommates.push(req.body);
    await roommate.save();
    res.status(201).json(roommate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/roommates', authenticateToken, async (req, res) => {
  try {
    const roommate = await Roommate.findOne({ userId: req.user.userId }).populate('roommates.roommateId', 'name phoneNumber');
    res.json(roommate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/roommates/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const roommate = await Roommate.findOne({ userId: req.user.userId });
    const mate = roommate.roommates.id(req.params.id);
    
    mate.status = status;
    if (status === 'In') mate.lastCheckIn = new Date();
    if (status === 'Out') mate.lastCheckOut = new Date();
    
    await roommate.save();
    res.json(roommate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== HEALTH TRACKER =====
app.post('/api/health', authenticateToken, async (req, res) => {
  try {
    const health = new Health({
      userId: req.user.userId,
      ...req.body
    });
    await health.save();
    res.status(201).json(health);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/health/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let health = await Health.findOne({
      userId: req.user.userId,
      date: { $gte: today }
    });
    
    if (!health) {
      health = new Health({ userId: req.user.userId });
      await health.save();
    }
    
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/health/:id', authenticateToken, async (req, res) => {
  try {
    const health = await Health.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ASSIGNMENTS =====
app.post('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const assignment = new Assignment({
      userId: req.user.userId,
      ...req.body
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user.userId }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/assignments/:id', authenticateToken, async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== NOTICES =====
app.get('/api/notices', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const notices = await Notice.find({
      hostelName: user.hostelDetails.hostelName,
      isActive: true
    }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CHECKLIST =====
app.get('/api/checklist', authenticateToken, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({ userId: req.user.userId });
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/checklist/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({ userId: req.user.userId });
    const item = checklist.items.id(req.params.id);
    item.isChecked = !item.isChecked;
    await checklist.save();
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/checklist/reset', authenticateToken, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({ userId: req.user.userId });
    checklist.items.forEach(item => item.isChecked = false);
    checklist.lastReset = new Date();
    await checklist.save();
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== FOOD/MESS =====
app.get('/api/food/nearby', authenticateToken, async (req, res) => {
  try {
    const food = await Food.find({ isOpen: true }).sort({ distance: 1 }).limit(5);
    res.json(food);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== EVENTS =====
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const event = new Event({
      userId: req.user.userId,
      ...req.body
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.userId }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== MAINTENANCE =====
app.post('/api/maintenance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const maintenance = new Maintenance({
      userId: req.user.userId,
      roomNumber: user.hostelDetails.roomNumber,
      ...req.body
    });
    await maintenance.save();
    res.status(201).json(maintenance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/maintenance', authenticateToken, async (req, res) => {
  try {
    const maintenance = await Maintenance.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CRON JOBS - Automated Reminders
// ============================================

// Daily checklist reset at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Resetting daily checklists...');
  await Checklist.updateMany({}, { 
    $set: { 
      'items.$[].isChecked': false,
      lastReset: new Date()
    }
  });
});

// Send class reminders 10 minutes before
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const tenMinutesLater = new Date(now.getTime() + 10 * 60000);
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5);
  
  // Find all timetables and send notifications
  const timetables = await Timetable.find();
  // Implement push notification logic here
});

// Send laundry reminders
cron.schedule('0 * * * *', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const laundrySlots = await Laundry.find({
    'slots.date': { $gte: tomorrow, $lt: new Date(tomorrow.getTime() + 86400000) },
    'slots.reminderSent': false
  });
  
  // Send push notifications
});

// Send medicine reminders
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const healthRecords = await Health.find({
    'medicines.times': currentTime
  });
  
  // Send push notifications for medicine
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HostelEZ Backend running on port ${PORT}`);
});

module.exports = app;