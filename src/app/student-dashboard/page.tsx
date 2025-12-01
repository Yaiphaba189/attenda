'use client'

import React, { useState, useEffect } from "react"
import { Card, CardContent, Button } from "@/components/ui"
import TimeDisplay from "@/components/TimeDisplay"
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  GraduationCap,
  Calendar,
  Mail,
  Sun,
  Users2,
  UserCheck,
  UserX,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Loader2
} from "lucide-react"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'


type Stat = {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  loading?: boolean
}

type Notification = {
  id?: string | number
  title: string
  description: string
  date?: string | Date
}

export default function StudentDashboard() {
  const router = useRouter();

  // Student dashboard state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ name: string; email: string; classId: number | null }>({ name: '', email: '', classId: null });
  const [classInfo, setClassInfo] = useState<{ name: string; teacher: string | null } | null>(null);
  const [attendancePct, setAttendancePct] = useState<number | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddNotification, setShowAddNotification] = useState(false);

  // Fetch studentId from localStorage or similar (adapt as needed)
  useEffect(() => {
    const storedUser = localStorage.getItem('studentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Fetch student dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('User for dashboard fetch:', user);
      if (!user || !user.id) return;
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/student/${user.id}/dashboard`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Dashboard API response:', data);
        setProfile({ name: data.profile.name, email: data.profile.email, classId: data.profile.classId });
        setClassInfo(data.classInfo);
        setAttendancePct(data.attendancePct);
        setAttendanceRecords(data.attendanceRecords || []);
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Error fetching student dashboard data:', error);
        toast.error('Failed to load student dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user.id) fetchDashboardData();
  }, [user]);

  const [currentDate] = useState(new Date())

  const handleLogout = () => {
    // Just redirect to logout page (no token logic)
    router.push('/logout')
  }




  // No separate notifications fetch needed

  // Generate calendar for the current month
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-indexed
  const today = currentDate.getDate()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const currentMonth = `${monthNames[month]} ${year}`
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Calculate days in month and first day
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  // Build calendar grid
  const calendarDays: (number | null)[][] = []
  let week: (number | null)[] = Array(firstDay).fill(null)
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      calendarDays.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    calendarDays.push(week)
  }

  const formatDate = (date: Date) => {
    const day = date.getDate()
    const suffix = (d: number) => {
      if (d > 3 && d < 21) return "th"
      switch (d % 10) {
        case 1: return "st"
        case 2: return "nd"
        case 3: return "rd"
        default: return "th"
      }
    }
    return (
      <>
        {day}
        <sup className="text-sm">{suffix(day)}</sup> {monthNames[date.getMonth()]}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-black text-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg flex items-center justify-center transform rotate-12">
              <div className="w-4 h-4 bg-green-400 rounded-sm shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-md">Student Dashboard</h1>
            {isLoading && (
              <div className="ml-2 text-sm text-green-400 flex items-center">
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Updating...
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-green-100">{profile.name}</div>
              <div className="text-xs text-green-400/80">{profile.email}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-green-400 hover:text-white hover:bg-white/10 transition-colors"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            {/* Time and Date Card */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                    <Sun className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      <TimeDisplay />
                    </div>
                    <div className="text-sm text-green-400/80">Realtime Insight</div>
                  </div>
                </div>
                <div className="text-lg text-green-100">{formatDate(currentDate)}</div>
              </CardContent>
            </Card>
            {/* Student Profile */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Profile</h3>
                <div className="mb-2"><span className="font-semibold text-green-400">Name:</span> <span className="text-gray-300">{profile.name}</span></div>
                <div className="mb-2"><span className="font-semibold text-green-400">Email:</span> <span className="text-gray-300">{profile.email}</span></div>
                <div className="mb-2"><span className="font-semibold text-green-400">Class ID:</span> <span className="text-gray-300">{profile.classId ?? 'N/A'}</span></div>
              </CardContent>
            </Card>

            {/* Class Info */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl mb-6">
              <CardContent className="p-6 text-gray-300">
                <h3 className="text-lg font-semibold text-white mb-3">Class Info</h3>
                {classInfo ? (
                  <>
                    <div className="mb-2"><span className="font-semibold text-green-400">Class Name:</span> <span className="text-gray-300">{classInfo.name}</span></div>
                    <div className="mb-2"><span className="font-semibold text-green-400">Teacher:</span> <span className="text-gray-300">{classInfo.teacher ?? 'N/A'}</span></div>
                  </>
                ) : (
                  <div className="text-gray-500">No class assigned.</div>
                )}
              </CardContent>
            </Card>

            {/* Attendance Percentage */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Attendance This Month</h3>
                {attendancePct !== null ? (
                  <div className="text-2xl font-bold text-green-400 drop-shadow-sm">{attendancePct}%</div>
                ) : (
                  <div className="text-gray-500">No attendance data.</div>
                )}
              </CardContent>
            </Card>

            {/* Recent Attendance Records */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Recent Attendance</h3>
                {attendanceRecords.length === 0 ? (
                  <div className="text-gray-500">No attendance records found.</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-green-400">
                        <th className="py-1 px-2">Date</th>
                        <th className="py-1 px-2">Status</th>
                        <th className="py-1 px-2">Subject</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((rec, idx) => (
                        <tr key={idx} className="border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors">
                          <td className="py-1 px-2 text-gray-300">{rec.date ? new Date(rec.date).toLocaleDateString() : ''}</td>
                          <td className={`py-1 px-2 font-medium ${rec.status === 'Present' ? 'text-green-400' :
                              rec.status === 'Absent' ? 'text-red-400' : 'text-yellow-400'
                            }`}>{rec.status}</td>
                          <td className="py-1 px-2 text-gray-300">{rec.subject?.name ?? ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Notifications</h3>
                {notifications.length === 0 ? (
                  <div className="text-gray-500">No notifications found.</div>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {notifications.map((notif) => (
                      <li key={notif.id} className="py-2 hover:bg-white/5 transition-colors rounded px-2">
                        <div className="font-semibold text-green-100">{notif.title}</div>
                        <div className="text-gray-400 text-sm">{notif.description}</div>
                        <div className="text-gray-600 text-xs mt-1">{notif.date ? new Date(notif.date).toLocaleString() : ''}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>




          </div>
        </div>
      </div>
    </div>

  );
}   
