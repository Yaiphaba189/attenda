// Run: node seed.js
const prisma = require('./prisma');

async function main() {
  // Clean up existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Create roles
  const adminRole = await prisma.role.create({ data: { name: 'admin' } });
  const teacherRole = await prisma.role.create({ data: { name: 'teacher' } });
  const studentRole = await prisma.role.create({ data: { name: 'student' } });

  // Create a class
  const classA = await prisma.class.create({
    data: {
      name: 'Class A',
      teacher: {
        create: {
          name: 'Teacher User',
          email: 'teacher@example.com',
          password: 'teacher123', // Replace with a real hash in production
          roleId: teacherRole.id,
        },
      },
    },
    include: { teacher: true },
  });

  // Create admin user
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // Replace with a real hash in production
      roleId: adminRole.id,
    },
  });

  // Create student user
  await prisma.user.create({
    data: {
      name: 'Student User',
      email: 'student@example.com',
      password: 'student123', // Replace with a real hash in production
      roleId: studentRole.id,
      classId: classA.id,
    },
  });

  console.log('Seeded roles, class, admin, teacher, and student users!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
