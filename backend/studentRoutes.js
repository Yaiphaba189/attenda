const express = require('express');
const prisma = require('./prisma');
const router = express.Router();

// --- STUDENT DASHBOARD DATA ROUTE ---
// GET /api/student/:id/dashboard
router.get('/:id/dashboard', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Student ID required.' });
  try {
    // Student profile
    const student = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, email: true, classId: true, roleId: true }
    });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    // Check role
    const role = await prisma.role.findUnique({ where: { id: student.roleId } });
    if (!role || role.name !== 'student') {
      return res.status(403).json({ error: 'User is not a student.' });
    }

    // Class info
    let classInfo = null;
    if (student.classId) {
      classInfo = await prisma.class.findUnique({
        where: { id: student.classId },
        select: {
          id: true,
          name: true,
          teacher: { select: { name: true } }
        }
      });
      if (classInfo && classInfo.teacher) {
        classInfo.teacher = classInfo.teacher.name;
      }
    }

    // Attendance percentage for current month
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    let attendancePct = null;
    if (student.classId) {
      const total = await prisma.attendance.count({
        where: {
          studentId: student.id,
          subject: { classId: student.classId },
          date: {
            gte: new Date(`${month}-01T00:00:00.000Z`),
            lt: firstOfNextMonth
          }
        }
      });
      const presents = await prisma.attendance.count({
        where: {
          studentId: student.id,
          subject: { classId: student.classId },
          status: 'Present',
          date: {
            gte: new Date(`${month}-01T00:00:00.000Z`),
            lt: firstOfNextMonth
          }
        }
      });
      attendancePct = total > 0 ? Math.round((presents / total) * 100) : 0;
    }

    // Recent attendance records (this month)
    let attendanceRecords = [];
    if (student.classId) {
      attendanceRecords = await prisma.attendance.findMany({
        where: {
          studentId: student.id,
          subject: { classId: student.classId },
          date: {
            gte: new Date(`${month}-01T00:00:00.000Z`),
            lt: firstOfNextMonth
          }
        },
        orderBy: { date: 'desc' },
        include: { subject: { select: { name: true } } },
        take: 10
      });
    }

    // Notifications (for now, fetch all for student class or global)
    let notifications = [];
    notifications = await prisma.notification.findMany({
  where: { userId: student.id },
  orderBy: { sentAt: 'desc' },
  take: 10
});

    res.json({
      profile: student,
      classInfo,
      attendancePct,
      attendanceRecords,
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        description: n.message,
        date: n.sentAt
      }))
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch student dashboard.' });
  }
});

module.exports = router;
