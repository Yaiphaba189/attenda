const express = require('express');
const prisma = require('./prisma');
const router = express.Router();

// Total admins
router.get('/admins', async (req, res) => {
  const count = await prisma.user.count({ where: { role: { name: 'admin' } } });
  res.json({ count });
});

// Total students
router.get('/students', async (req, res) => {
  const count = await prisma.user.count({ where: { role: { name: 'student' } } });
  res.json({ count });
});

// Total teachers
router.get('/teachers', async (req, res) => {
  const count = await prisma.user.count({ where: { role: { name: 'teacher' } } });
  res.json({ count });
});

// Total classes
router.get('/classes', async (req, res) => {
  const count = await prisma.class.count();
  res.json({ count });
});

// Total attendance records
router.get('/attendance', async (req, res) => {
  const count = await prisma.attendance.count();
  res.json({ count });
});

// Today's attendance rate
router.get('/today-rate', async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const total = await prisma.attendance.count({ where: { date: { gte: today } } });
  const students = await prisma.user.count({ where: { role: { name: 'student' } } });
  const rate = students ? Math.round((total / students) * 100) : 0;
  res.json({ rate });
});

module.exports = router;
