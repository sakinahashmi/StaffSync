const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Announcement = require('./models/Announcement');
const Training = require('./models/Training');
const TrainingEnrollment = require('./models/TrainingEnrollment');

dotenv.config();

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Cleaning existing records for fresh seed...');
    await User.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Announcement.deleteMany();
    await Training.deleteMany();
    await TrainingEnrollment.deleteMany();

    console.log('Seeding Users...');
    // Seed initial users
    const users = await User.create([
      {
        name: 'Sarah Jenkins',
        email: 'admin@staffsync.com',
        password: 'Password123!',
        role: 'hr',
        department: 'Human Resources',
        position: 'VP of Human Resources',
        phone: '+1 (555) 234-5678',
        salary: 115000,
        status: 'active',
        address: '742 Evergreen Terrace, Springfield',
        skills: ['Talent Acquisition', 'HR Strategy', 'Labor Laws', 'Executive Leadership'],
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      },
      {
        name: 'David Chen',
        email: 'manager@staffsync.com',
        password: 'Password123!',
        role: 'manager',
        department: 'Engineering',
        position: 'Engineering Team Lead',
        phone: '+1 (555) 345-6789',
        salary: 105000,
        status: 'active',
        address: '10880 Wilshire Blvd, Los Angeles, CA',
        skills: ['System Architecture', 'Agile Scrum', 'React', 'Node.js', 'Mentorship'],
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      {
        name: 'Alex Rivera',
        email: 'employee@staffsync.com',
        password: 'Password123!',
        role: 'employee',
        department: 'Engineering',
        position: 'Full Stack Developer',
        phone: '+1 (555) 456-7890',
        salary: 82000,
        status: 'active',
        address: '452 Pine Crest Lane, Austin, TX',
        skills: ['JavaScript', 'React.js', 'Express', 'MongoDB', 'REST APIs'],
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@staffsync.com',
        password: 'Password123!',
        role: 'employee',
        department: 'Product & Design',
        position: 'Senior UI/UX Designer',
        phone: '+1 (555) 567-8901',
        salary: 92000,
        status: 'active',
        address: '88 Design Street, Seattle, WA',
        skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      {
        name: 'Marcus Johnson',
        email: 'marcus.j@staffsync.com',
        password: 'Password123!',
        role: 'manager',
        department: 'Marketing',
        position: 'Growth Marketing Director',
        phone: '+1 (555) 678-9012',
        salary: 98000,
        status: 'active',
        address: '210 Market St, Chicago, IL',
        skills: ['SEO/SEM', 'Brand Strategy', 'Performance Analytics', 'Campaign Management'],
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@staffsync.com',
        password: 'Password123!',
        role: 'employee',
        department: 'Customer Operations',
        position: 'Customer Success Specialist',
        phone: '+1 (555) 789-0123',
        salary: 68000,
        status: 'active',
        address: '320 Peachtree Rd, Atlanta, GA',
        skills: ['Customer Support', 'CRM', 'Zendesk', 'Client Retention'],
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      },
      {
        name: 'Liam O’Connor',
        email: 'liam.o@staffsync.com',
        password: 'Password123!',
        role: 'employee',
        department: 'Finance & Legal',
        position: 'Financial Analyst',
        phone: '+1 (555) 890-1234',
        salary: 86000,
        status: 'inactive',
        address: '55 Wall Street, New York, NY',
        skills: ['Budgeting', 'Financial Modeling', 'Excel', 'Forecasting'],
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      },
    ]);

    const adminUser = users[0];
    const managerUser = users[1];
    const devUser = users[2];
    const designerUser = users[3];
    const marketingUser = users[4];
    const csUser = users[5];

    console.log(`Created ${users.length} sample users.`);

    // Seed Attendance records for past 7 days
    console.log('Seeding Attendance records...');
    const now = new Date();
    const todayStr = formatDate(now);

    const attendanceRecords = [];

    // Today's attendance
    attendanceRecords.push(
      {
        user: adminUser._id,
        date: todayStr,
        checkIn: new Date(`${todayStr}T08:50:00`),
        checkOut: null,
        workingHours: 0,
        status: 'Present',
        location: 'Office (HQ)',
        notes: 'In-office HR planning session',
      },
      {
        user: managerUser._id,
        date: todayStr,
        checkIn: new Date(`${todayStr}T09:05:00`),
        checkOut: null,
        workingHours: 0,
        status: 'Present',
        location: 'Office (HQ)',
        notes: 'Engineering standup leader',
      },
      {
        user: devUser._id,
        date: todayStr,
        checkIn: new Date(`${todayStr}T09:45:00`),
        checkOut: null,
        workingHours: 0,
        status: 'Late',
        location: 'Remote',
        notes: 'Traffic delay / Remote check-in',
      },
      {
        user: designerUser._id,
        date: todayStr,
        checkIn: new Date(`${todayStr}T08:55:00`),
        checkOut: null,
        workingHours: 0,
        status: 'Present',
        location: 'Office (HQ)',
        notes: 'Figma review session',
      },
      {
        user: csUser._id,
        date: todayStr,
        checkIn: new Date(`${todayStr}T09:00:00`),
        checkOut: null,
        workingHours: 0,
        status: 'Present',
        location: 'Remote',
        notes: 'Customer support queue',
      }
    );

    // Past 5 days attendance for weekly charts
    for (let i = 1; i <= 5; i++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - i);
      const pStr = formatDate(pastDate);

      users.slice(0, 5).forEach((u, idx) => {
        const isLate = idx === 2 && i % 2 === 0;
        const inHour = isLate ? '09:40:00' : '08:55:00';
        const outHour = '17:30:00';
        attendanceRecords.push({
          user: u._id,
          date: pStr,
          checkIn: new Date(`${pStr}T${inHour}`),
          checkOut: new Date(`${pStr}T${outHour}`),
          workingHours: isLate ? 7.8 : 8.5,
          status: isLate ? 'Late' : 'Present',
          location: idx % 2 === 0 ? 'Office (HQ)' : 'Remote',
          notes: 'Standard workday logged',
        });
      });
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records.`);

    // Seed Leaves
    console.log('Seeding Leave requests...');
    await Leave.create([
      {
        user: devUser._id,
        leaveType: 'Annual Leave',
        startDate: new Date(Date.now() + 86400000 * 3),
        endDate: new Date(Date.now() + 86400000 * 5),
        daysCount: 3,
        reason: 'Family wedding out of town',
        status: 'Pending',
      },
      {
        user: designerUser._id,
        leaveType: 'Sick Leave',
        startDate: new Date(Date.now() - 86400000 * 4),
        endDate: new Date(Date.now() - 86400000 * 3),
        daysCount: 2,
        reason: 'High fever and viral flu',
        status: 'Approved',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 86400000 * 4),
        reviewNotes: 'Get well soon! Approved by HR.',
      },
      {
        user: csUser._id,
        leaveType: 'Casual Leave',
        startDate: new Date(Date.now() + 86400000 * 10),
        endDate: new Date(Date.now() + 86400000 * 11),
        daysCount: 2,
        reason: 'Personal errands and bank appointments',
        status: 'Pending',
      },
      {
        user: managerUser._id,
        leaveType: 'Casual Leave',
        startDate: new Date(Date.now() - 86400000 * 15),
        endDate: new Date(Date.now() - 86400000 * 14),
        daysCount: 2,
        reason: 'Home renovation inspection',
        status: 'Approved',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 86400000 * 15),
        reviewNotes: 'Approved.',
      },
    ]);

    // Seed Announcements
    console.log('Seeding Announcements...');
    await Announcement.create([
      {
        title: 'Q4 Annual Company All-Hands & Strategy Meeting',
        content:
          'Join the executive team this Friday at 3:00 PM EST for the quarterly wrap-up, employee milestone recognitions, and 2027 roadmap unveiling.',
        category: 'Event',
        priority: 'High',
        targetAudience: 'All',
        pinned: true,
        createdBy: adminUser._id,
      },
      {
        title: 'New Hybrid Work & Equipment Stipend Policy',
        content:
          'HR has published updated guidelines regarding flexible remote working hours and the newly approved $500 annual home-office wellness stipend.',
        category: 'Policy',
        priority: 'Medium',
        targetAudience: 'All',
        pinned: true,
        createdBy: adminUser._id,
      },
      {
        title: 'Upcoming Office Holiday: Thanksgiving Observance',
        content:
          'Please note that corporate offices will be closed Thursday and Friday next week. Ensure all project deliverables and on-call rotations are synchronized.',
        category: 'Holiday',
        priority: 'Medium',
        targetAudience: 'All',
        pinned: false,
        createdBy: adminUser._id,
      },
      {
        title: 'StaffSync v2.0 Platform Launch Demonstration',
        content:
          'Welcome to StaffSync — our newly modernized Human Resource Management System built for seamless attendance, leave approvals, and talent training.',
        category: 'General',
        priority: 'Urgent',
        targetAudience: 'All',
        pinned: false,
        createdBy: adminUser._id,
      },
    ]);

    // Seed Trainings
    console.log('Seeding Trainings and Enrollments...');
    const trainings = await Training.create([
      {
        title: 'Modern Full-Stack Architecture with React 19 & Node',
        description:
          'Deep dive into state management, scalable REST APIs, microservices integration, and modern cloud deployment patterns.',
        instructor: 'Dr. Robert Vance, Principal Architect',
        department: 'Engineering',
        startDate: new Date(Date.now() + 86400000 * 2),
        endDate: new Date(Date.now() + 86400000 * 14),
        capacity: 25,
        enrolledCount: 2,
        status: 'Ongoing',
        skillsCovered: ['React', 'Node.js', 'System Design', 'Docker', 'Performance'],
        mode: 'Online',
        locationOrLink: 'https://meet.staffsync.internal/arch-masterclass',
        createdBy: adminUser._id,
      },
      {
        title: 'Inclusive Leadership & Workplace Dynamics',
        description:
          'Interactive workshop exploring conflict resolution, empathetic team leadership, bias mitigation, and high-performance collaboration.',
        instructor: 'Sarah Jenkins, VP of HR',
        department: 'All',
        startDate: new Date(Date.now() + 86400000 * 7),
        endDate: new Date(Date.now() + 86400000 * 21),
        capacity: 35,
        enrolledCount: 1,
        status: 'Upcoming',
        skillsCovered: ['Leadership', 'Communication', 'Emotional Intelligence', 'Team Building'],
        mode: 'Hybrid',
        locationOrLink: 'Conference Room 4B & Zoom Livestream',
        createdBy: adminUser._id,
      },
      {
        title: 'Cybersecurity Best Practices & Data Privacy 2026',
        description:
          'Mandatory compliance course covering phishing defense, secure token storage, GDPR standards, and multi-factor security safeguards.',
        instructor: 'CyberSec Training Institute',
        department: 'All',
        startDate: new Date(Date.now() - 86400000 * 10),
        endDate: new Date(Date.now() - 86400000 * 2),
        capacity: 50,
        enrolledCount: 3,
        status: 'Completed',
        skillsCovered: ['Information Security', 'GDPR', 'Access Control', 'Identity Verification'],
        mode: 'Online',
        locationOrLink: 'LMS Portal',
        createdBy: adminUser._id,
      },
    ]);

    // Seed Training Enrollments
    await TrainingEnrollment.create([
      {
        training: trainings[0]._id,
        user: devUser._id,
        status: 'In Progress',
        enrolledAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        training: trainings[0]._id,
        user: designerUser._id,
        status: 'Enrolled',
        enrolledAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        training: trainings[1]._id,
        user: managerUser._id,
        status: 'Enrolled',
        enrolledAt: new Date(),
      },
      {
        training: trainings[2]._id,
        user: devUser._id,
        status: 'Completed',
        completionDate: new Date(Date.now() - 86400000 * 2),
        gradeOrScore: '98%',
        feedback: 'Excellent refresher on modern credential hygiene.',
      },
    ]);

    console.log('\n=============================================');
    console.log(' StaffSync Seed Complete!');
    console.log('=============================================');
    console.log('Demo Accounts Ready:');
    console.log('1. HR Admin   : admin@staffsync.com    / Password123!');
    console.log('2. Manager    : manager@staffsync.com  / Password123!');
    console.log('3. Employee   : employee@staffsync.com / Password123!');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
