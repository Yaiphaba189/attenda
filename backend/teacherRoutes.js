const express = require('express');
const prisma = require('./prisma');
const router = express.Router();

// --- ATTENDANCE ROUTES: Place these BEFORE generic /:id routes ---

// Get all attendance records for a student, class, and month
router.get('/attendance/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const { classId, month } = req.query;
  if (!studentId || !classId || !month) {
    return res.status(400).json({ error: 'studentId, classId, and month are required.' });
  }
  try {
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    const records = await prisma.attendance.findMany({
      where: {
        studentId: Number(studentId),
        subject: { classId: Number(classId) },
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      include: { subject: { select: { name: true } } }
    });
    res.json({ records });
  } catch (error) {
    console.error('Error fetching student attendance records:', error);
    res.status(500).json({ error: 'Failed to fetch records.' });
  }
});

// Update attendance percentage route to support month filter
router.get('/attendance/percentage', async (req, res) => {
  const { studentId, classId, month } = req.query;
  if (!studentId || !classId) {
    return res.status(400).json({ error: 'studentId and classId are required.' });
  }
  try {
    let dateFilter = {};
    if (month) {
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      dateFilter = { gte: startDate, lt: endDate };
    }
    const total = await prisma.attendance.count({
      where: {
        studentId: Number(studentId),
        subject: { classId: Number(classId) },
        ...(month ? { date: dateFilter } : {})
      }
    });
    const presents = await prisma.attendance.count({
      where: {
        studentId: Number(studentId),
        subject: { classId: Number(classId) },
        status: 'Present',
        ...(month ? { date: dateFilter } : {})
      }
    });
    const percentage = total > 0 ? Math.round((presents / total) * 100) : 0;
    res.json({ percentage });
  } catch (error) {
    console.error('Error fetching attendance percentage:', error);
    res.status(500).json({ error: 'Failed to fetch attendance percentage.' });
  }
});

// Save attendance for a class
router.post('/attendance', async (req, res) => {
  const { classId, date, records } = req.body;
  if (!classId || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'classId, date, and records are required.' });
  }
  try {
    for (const rec of records) {
      if (!rec.studentId || !rec.subjectId || !rec.markedById || !rec.status) {
        return res.status(400).json({ error: 'Each record must include studentId, subjectId, markedById, and status.' });
      }
      await prisma.attendance.create({
        data: {
          studentId: rec.studentId,
          subjectId: rec.subjectId,
          markedById: rec.markedById,
          date: new Date(date),
          status: rec.status,
        }
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: 'Failed to save attendance.' });
  }
});

// Accept attendance records at POST /
router.post('/', async (req, res) => {
  const { classId, date, records } = req.body;
  if (!classId || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'classId, date, and records are required.' });
  }
  try {
    for (const rec of records) {
      if (!rec.studentId || !rec.subjectId || !rec.markedById || !rec.status) {
        return res.status(400).json({ error: 'Each record must include studentId, subjectId, markedById, and status.' });
      }
      await prisma.attendance.create({
        data: {
          studentId: rec.studentId,
          subjectId: rec.subjectId,
          markedById: rec.markedById,
          date: new Date(date),
          status: rec.status,
        }
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: 'Failed to save attendance.' });
  }
});

// --- GENERIC ROUTES BELOW ---
// Get all data for teacher dashboard
router.get('/:id/dashboard', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Teacher ID required.' });
  try {
    // Teacher profile
    const teacher = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, email: true }
    });
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
    // Notifications (common to all teachers)
    const notifications = await prisma.notification.findMany({
      orderBy: { sentAt: 'desc' },
      take: 10
    });
    res.json({
      teacher,
      classes,
      students,
      notifications
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch teacher dashboard.' });
  }
});

// Save attendance for a class
router.post('/attendance', async (req, res) => {
  const { classId, date, records } = req.body;
  if (!classId || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'classId, date, and records are required.' });
  }
  try {
    for (const rec of records) {
      if (!rec.studentId || !rec.subjectId || !rec.markedById || !rec.status) {
        return res.status(400).json({ error: 'Each record must include studentId, subjectId, markedById, and status.' });
      }
      await prisma.attendance.create({
        data: {
          studentId: rec.studentId,
          subjectId: rec.subjectId,
          markedById: rec.markedById,
                    date: new Date(date),
          status: rec.status, // Should be one of 'Present', 'Absent', 'Late', 'Leave'
        }
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: 'Failed to save attendance.' });
  }
});

// Accept attendance records at POST /
router.post('/', async (req, res) => {
  const { classId, date, records } = req.body;
  if (!classId || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'classId, date, and records are required.' });
  }
  try {
    for (const rec of records) {
      if (!rec.studentId || !rec.subjectId || !rec.markedById || !rec.status) {
        return res.status(400).json({ error: 'Each record must include studentId, subjectId, markedById, and status.' });
      }
      await prisma.attendance.create({
        data: {
          studentId: rec.studentId,
          subjectId: rec.subjectId,
          markedById: rec.markedById,
          date: new Date(date),
          status: rec.status,
        }
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: 'Failed to save attendance.' });
  }
});


// Get all attendance records for a student, class, and month
router.get('/attendance/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const { classId, month } = req.query;
  if (!studentId || !classId || !month) {
    return res.status(400).json({ error: 'studentId, classId, and month are required.' });
  }
  try {
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    const records = await prisma.attendance.findMany({
      where: {
        studentId: Number(studentId),
        subject: { classId: Number(classId) },
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      include: { subject: { select: { name: true } } }
    });
    res.json({ records });
  } catch (error) {
    console.error('Error fetching student attendance records:', error);
    res.status(500).json({ error: 'Failed to fetch records.' });
  }
});

// Update attendance percentage route to support month filter
router.get('/attendance/percentage', async (req, res) => {
  const { studentId, classId, month } = req.query;
  if (!studentId || !classId) {
    return res.status(400).json({ error: 'studentId and classId are required.' });
  }
  try {
    let dateFilter = {};
    if (month) {
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      dateFilter = { gte: startDate, lt: endDate };
    }
    const total = await prisma.attendance.count({
      where: {
        studentId: Number(studentId),
        subject: { classId: Number(classId) },
        ...(month ? { date: dateFilter } : {})
      }
    });
    const presents = await prisma.attendance.count({
      where: {
        studentId: Number(studentId),
        subject: { classId: Number(classId) },
        status: 'Present',
        ...(month ? { date: dateFilter } : {})
      }
    });
    const percentage = total > 0 ? Math.round((presents / total) * 100) : 0;
    res.json({ percentage });
  } catch (error) {
    console.error('Error fetching attendance percentage:', error);
    res.status(500).json({ error: 'Failed to fetch attendance percentage.' });
  }
});

module.exports = router;
