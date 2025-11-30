const express = require('express');
const router = express.Router();
const prisma = require('./prisma');
const jwt = require('jsonwebtoken');

// JWT authentication middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Get all subjects for a class (or all subjects if no classId)
router.get('/subjects', async (req, res) => {
  const { classId } = req.query;
  try {
    let subjects;
    if (classId) {
      subjects = await prisma.subject.findMany({
        where: { classId: Number(classId) },
        select: { id: true, name: true, classId: true }
      });
    } else {
      subjects = await prisma.subject.findMany({
        select: { id: true, name: true, classId: true }
      });
    }
    res.json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Edit a subject by ID
router.patch('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, classId } = req.body;
  if (!id) return res.status(400).json({ error: 'Subject ID required.' });
  try {
    const updated = await prisma.subject.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(classId !== undefined && { classId: Number(classId) })
      }
    });
    res.json({ success: true, subject: updated });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Subject not found.' });
    }
    console.error('Error editing subject:', error);
    res.status(500).json({ error: 'Failed to edit subject.' });
  }
});

// Delete a subject by ID
router.delete('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Subject ID required.' });
  try {
    await prisma.subject.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Subject not found.' });
    }
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject.' });
  }
});

// Add a new subject
router.post('/subjects', async (req, res) => {
  const { name, classId } = req.body;
  if (!name || !classId) {
    return res.status(400).json({ error: 'Subject name and classId are required.' });
  }
  try {
    const subject = await prisma.subject.create({
      data: { name: name.trim(), classId: Number(classId) }
    });
    res.status(201).json({ success: true, subject });
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).json({ error: 'Failed to add subject.' });
  }
});

// Admin profile endpoint (public, loads from DB)
router.get('/profile', async (req, res) => {
  try {
    // Find the first user with the admin role
    const admin = await prisma.user.findFirst({
      where: {
        role: {
          name: { in: ['admin', 'ADMIN'] }
        }
      },
      select: { name: true, email: true }
    });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalStudents,
      totalTeachers,
      { _count: { id: presentToday } },
      totalClasses,
      { _count: { id: absentToday } },
      { _count: { id: lateToday } }
    ] = await Promise.all([
      // Count total students
      prisma.user.count({
        where: { 
          role: {
            name: { in: ['student', 'STUDENT'] }
          }
        }
      }),
    
      prisma.user.count({
        where: { 
          role: {
            name: { in: ['teacher', 'TEACHER'] }
          }
        }
      }),
      
      // Count present students today
      prisma.attendance.aggregate({
        where: { 
          status: 'Present',
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
          }
        },
        _count: { id: true }
      }),
      // Count total classes
      prisma.class.count(),
      
      // Count absent students today
      prisma.attendance.aggregate({
        where: { 
          status: 'Absent',
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        _count: { id: true }
      }),
      
      // Count late arrivals today
      prisma.attendance.aggregate({
        where: { 
          status: 'Late',
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        _count: { id: true }
      }),
      // Count total teachers
      
    ]);

    res.json({
      totalStudents,
      totalTeachers,
      presentToday,
      totalClasses,
      absentToday,
      lateArrivalsToday: lateToday
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent notifications
router.get('/notifications', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get recent notifications
    const notifications = await prisma.notification.findMany({
      where: {
        sentAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 5,
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    // Format notifications
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      description: notification.message
    }));

    // If no notifications, return a default one
    if (formattedNotifications.length === 0) {
      return res.json([
        {
          title: "No recent notifications",
          description: "Check back later for updates"
        }
      ]);
    }

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json([
      {
        title: "Error loading notifications",
        description: "Failed to load notifications. Please try again later."
      }
    ]);
  }
});

// Add a new notification
router.post('/notifications', async (req, res) => {
  const { title, message, userId } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }
  try {
    let targetUserId = userId;
    if (!targetUserId) {
      // Default to first admin user
      const admin = await prisma.user.findFirst({
        where: { role: { name: { in: ['admin', 'ADMIN'] } } },
        select: { id: true }
      });
      if (!admin) return res.status(404).json({ error: 'Admin user not found.' });
      targetUserId = admin.id;
    }
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        userId: targetUserId
      }
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification.' });
  }
});

// Delete a notification by ID
router.delete('/notifications/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Notification ID required.' });
  try {
    await prisma.notification.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification.' });
  }
});

// Get all classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: {
          select: { name: true }
        }
      }
    });
    // Map to include teacher name as 'teacher' field
    const result = classes.map(c => ({
      id: c.id,
      name: c.name,
      teacher: c.teacher ? c.teacher.name : null
    }));
    res.json({ classes: result });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes.' });
  }
});

// Edit class by ID
router.patch('/classes/:id', async (req, res) => {
  const { id } = req.params;
  const { name, teacherId } = req.body;
  if (!id) return res.status(400).json({ error: 'Class ID required.' });
  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (teacherId !== undefined) updateData.teacherId = teacherId === null || teacherId === '' ? null : Number(teacherId);
    const updated = await prisma.class.update({
      where: { id: Number(id) },
      data: updateData
    });
    res.json({ success: true, class: updated });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Class not found.' });
    }
    console.error('Error editing class:', error);
    res.status(500).json({ error: 'Failed to edit class.' });
  }
});

// Delete class by ID
router.delete('/classes/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Class ID required.' });
  try {
    await prisma.class.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Class not found.' });
    }
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Failed to delete class.' });
  }
});

// Add a new class
router.post('/classes', async (req, res) => {
  const { name, teacherId, subject } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Class name is required.' });
  }
  try {
    const data = { name };
    if (teacherId !== undefined) data.teacherId = teacherId === null || teacherId === '' ? null : Number(teacherId);
    const newClass = await prisma.class.create({
      data
    });
    let newSubject = null;
    if (subject && subject.trim().length > 0) {
      newSubject = await prisma.subject.create({
        data: { name: subject.trim(), classId: newClass.id }
      });
    }
    res.status(201).json({ success: true, class: newClass, subject: newSubject });
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).json({ error: 'Failed to add class.' });
  }
});

// Get all teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: {
          name: { in: ['teacher', 'TEACHER'] }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers.' });
  }
});

// Edit teacher by ID
router.patch('/teachers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!id) return res.status(400).json({ error: 'Teacher ID required.' });
  try {
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(email && { email })
      }
    });
    res.json({ success: true, teacher: updated });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Teacher not found.' });
    }
    console.error('Error editing teacher:', error);
    res.status(500).json({ error: 'Failed to edit teacher.' });
  }
});

// Delete teacher by ID
router.delete('/teachers/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Teacher ID required.' });
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Teacher not found.' });
    }
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Failed to delete teacher.' });
  }
});

// Add new teacher
router.post('/teachers', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  try {
    // Find the teacher role
    const teacherRole = await prisma.role.findFirst({ where: { name: { in: ['teacher', 'TEACHER'] } } });
    if (!teacherRole) {
      return res.status(500).json({ error: 'Teacher role not found.' });
    }
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    
    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        password, // use password from req.body directly
        roleId: teacherRole.id
      }
    });
    res.status(201).json({ success: true, teacher });
  } catch (error) {
    console.error('Error adding teacher:', error);
    res.status(500).json({ error: 'Failed to add teacher.' });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: {
          name: { in: ['student', 'STUDENT'] }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        classId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});

// Edit student by ID
router.patch('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, classId } = req.body;
  if (!id) return res.status(400).json({ error: 'Student ID required.' });
  try {
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(classId !== undefined && { classId }),
      }
    });
    res.json({ success: true, student: updated });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Student not found.' });
    }
    console.error('Error editing student:', error);
    res.status(500).json({ error: 'Failed to edit student.' });
  }
});

// Delete student by ID
router.delete('/students/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Student ID required.' });
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Student not found.' });
    }
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student.' });
  }
});

// Add new student
router.post('/students', async (req, res) => {
  const { name, email, password, classId } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  try {
    // Find the student role
    const studentRole = await prisma.role.findFirst({ where: { name: { in: ['student', 'STUDENT'] } } });
    if (!studentRole) {
      return res.status(500).json({ error: 'Student role not found.' });
    }
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    // For demo: use a simple hash (in production, use bcrypt!)
    const student = await prisma.user.create({
      data: {
        name,
        email,
        password, // use password from req.body directly
        roleId: studentRole.id,
        classId: classId || null,
      }
    });
    res.status(201).json({ success: true, student });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: 'Failed to add student.' });
  }
});

// Delete a student by ID
router.delete('/students/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Student ID required.' });
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student.' });
  }
});

// Edit (update) a student by ID
router.patch('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, classId } = req.body;
  if (!id) return res.status(400).json({ error: 'Student ID required.' });
  try {
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        classId: classId !== undefined ? (classId === '' ? null : Number(classId)) : undefined,
      },
    });
    res.json({ success: true, student: updated });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    // Demo: check password hash (in production, use bcrypt!)
    const password = password;
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Return token and user info (omit password)
    const { password: _, ...userData } = user;
    res.json({ token, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get teacher dashboard stats
router.get('/teacher/:id/dashboard', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Teacher ID required.' });
  try {
    // Classes taught by this teacher
    const classes = await prisma.class.findMany({
      where: { teacherId: Number(id) },
      select: { id: true, name: true }
    });
    // Students in these classes
    const classIds = classes.map(c => c.id);
    const students = await prisma.user.findMany({
      where: {
        role: { name: { in: ['student', 'STUDENT'] } },
        classId: { in: classIds }
      },
      select: { id: true, name: true, email: true, classId: true }
    });
    // Recent notifications for this teacher
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(id) },
      orderBy: { sentAt: 'desc' },
      take: 5
    });
    res.json({
      totalClasses: classes.length,
      totalStudents: students.length,
      notifications,
      classes,
      students
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch teacher dashboard.' });
  }
});

// Get classes taught by teacher
router.get('/teacher/:id/classes', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Teacher ID required.' });
  try {
    const classes = await prisma.class.findMany({
      where: { teacherId: Number(id) },
      select: { id: true, name: true }
    });
    res.json(classes);
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ error: 'Failed to fetch teacher classes.' });
  }
});

// Get notifications for teacher
router.get('/teacher/:id/notifications', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Teacher ID required.' });
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(id) },
      orderBy: { sentAt: 'desc' },
      take: 10
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching teacher notifications:', error);
    res.status(500).json({ error: 'Failed to fetch teacher notifications.' });
  }
});

module.exports = router;
