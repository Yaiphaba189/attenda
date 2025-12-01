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

export default function Dashboard() {
  const router = useRouter();

  const [showAddNotification, setShowAddNotification] = useState(false);
  const [addNotifTitle, setAddNotifTitle] = useState("");
  const [addNotifMessage, setAddNotifMessage] = useState("");
  const [addingNotif, setAddingNotif] = useState(false);
  // Get teacherId from localStorage (set on login), fallback to 9 (seeded teacher)
  const [teacherId, setTeacherId] = useState<number | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('teacherId');
    if (storedId) {
      setTeacherId(Number(storedId));
    } else {
      // setTeacherId(15); // fallback to seeded teacher (teacher@example.com)
    }
  }, []);
  const [profile, setProfile] = React.useState<{ name: string; email: string }>({ name: 'Teacher', email: '' });

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState({ name: '', email: '', password: '', classId: '' });

  // Teacher dashboard state
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: number; name: string; email: string; classId: number }[]>([]);

  // Fetch teacher dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!teacherId) return;
      try {
        const res = await fetch(`http://localhost:3001/api/teacher/${teacherId}/dashboard`);
        if (!res.ok) throw new Error("Failed to fetch teacher dashboard");
        const data = await res.json();
        setProfile({ name: data.teacher.name, email: data.teacher.email });
        setClasses(data.classes || []);
        setStudents(data.students || []);
        // If you have notifications state:
        // setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Error fetching teacher dashboard:", err);
      }
    };
    fetchDashboard();
  }, [teacherId]);

  // Fetch teacher dashboard data
  const fetchData = async () => {
    if (!teacherId) return;
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teacher/${teacherId}/dashboard`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setClasses(data.classes || [])
      setStudents(data.students || [])
      if (data.teacher) {
        setProfile({ name: data.teacher.name, email: data.teacher.email });
      }
      setStats(prevStats => [
        {
          ...prevStats[0],
          value: data.students?.length?.toString() || '0',
          loading: false
        },
        {
          ...prevStats[1],
          value: data.classes?.length?.toString() || '0',
          loading: false
        },
      ])
      if (data.notifications && data.notifications.length > 0) {
        setNotifications(data.notifications.map((n: any) => ({
          id: n.id,
          title: n.title,
          description: n.message,
          date: n.sentAt
        })))
      } else {
        setNotifications([{
          title: "No recent activity",
          description: "No notifications found"
        }])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
      setStats(prevStats => prevStats.map(stat => ({
        ...stat,
        value: '!',
        loading: false,
        color: 'text-gray-400',
        bgColor: 'bg-gray-50'
      })))
    } finally {
      setIsLoading(false)
    }
  }

  const [currentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<Stat[]>([
    {
      title: "Total Students",
      value: "-",
      icon: Users2,
      color: "text-primary-600",
      bgColor: "bg-primary-50",
      loading: true
    },
    {
      title: "Total Classes",
      value: "-",
      icon: UserX,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      loading: true
    },
  ])

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'loading',
      title: "Loading notifications...",
      description: "",
    },
  ])

  const handleLogout = () => {
    // Just redirect to logout page (no token logic)
    router.push('/logout')
  }

  // Fetch dashboard stats
  useEffect(() => {
    if (teacherId) {
      fetchData();
      // Refresh data every 5 minutes
      const intervalId = setInterval(fetchData, 5 * 60 * 1000)
      return () => clearInterval(intervalId);
    }
  }, [teacherId])

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
            <h1 className="text-2xl font-bold text-white drop-shadow-md">Teacher Dashboard</h1>
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
                <div className="text-lg text-green-100">{year}</div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 ${stat.title.includes('Students') ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        <stat.icon className={`w-5 h-5 ${stat.loading ? 'animate-pulse' : ''}`} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">
                      {stat.loading ? (
                        <div className="h-8 w-16 bg-white/10 rounded animate-pulse"></div>
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{stat.title}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Take Attendance Section */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl mb-6">
              <CardContent className="p-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Take Attendance</h3>
                <Button
                  className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2 rounded-lg shadow-lg shadow-green-900/20 hover:scale-105 transition-all duration-300"
                  onClick={() => router.push('/teacher-dashboard/attendance')}
                >
                  Take Attendance
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  Notifications & Reminders
                  <span className="text-xs font-normal text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">{notifications.length}</span>
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {notifications.map((notif, idx) => (
                    <div key={notif.id || idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-blue-500/30">
                        <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_5px_rgba(96,165,250,0.5)]"></div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-medium text-green-100 mb-1 truncate">{notif.title}</div>
                          <div className="text-sm text-gray-400 leading-relaxed">{notif.description}</div>
                          {notif.date && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(notif.date).toLocaleString()}
                            </div>
                          )}
                        </div>
                        {notif.id && (
                          <button
                            className="mt-2 sm:mt-0 sm:ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded shadow-sm text-sm transition-all"
                            onClick={async () => {
                              if (!window.confirm('Are you sure you want to delete this notification?')) return;
                              try {
                                const res = await fetch(`http://localhost:3001/api/admin/notifications/${notif.id}`, { method: 'DELETE' });
                                if (!res.ok) throw new Error('Failed to delete');
                                toast.success('Notification deleted');
                                // Re-fetch notifications from backend
                                const notifRes = await fetch('http://localhost:3001/api/admin/notifications');
                                if (notifRes.ok) {
                                  const notifData = await notifRes.json();
                                  setNotifications(Array.isArray(notifData) ? notifData : []);
                                } else {
                                  setNotifications([]);
                                }
                              } catch (err) {
                                toast.error('Failed to delete notification');
                              }
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="w-12 h-12 bg-green-600 hover:bg-green-500 text-white rounded-full mt-6 mx-auto flex items-center justify-center shadow-lg shadow-green-900/20 hover:scale-110 transition-all duration-300"
                  onClick={() => setShowAddNotification(true)}
                  title="Add notification"
                >
                  <Plus className="w-6 h-6" />
                </Button>

                {/* Add Notification Modal */}
                {showAddNotification && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-200"
                    aria-modal="true"
                    role="dialog"
                  >
                    <div className="relative w-full max-w-md mx-auto">
                      <div className="bg-[#0a2e18] border border-green-800/50 rounded-2xl shadow-2xl p-8 pt-10 relative animate-fadeIn">
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl transition-colors"
                          onClick={() => setShowAddNotification(false)}
                          title="Close"
                          aria-label="Close modal"
                        >
                          &times;
                        </button>
                        <h3 className="text-xl font-bold mb-5 text-white text-center">Add Notification</h3>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!addNotifTitle.trim() || !addNotifMessage.trim()) {
                              toast.error('Title and message are required');
                              return;
                            }
                            setAddingNotif(true);
                            try {
                              const res = await fetch('http://localhost:3001/api/admin/notifications', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ title: addNotifTitle, message: addNotifMessage })
                              });
                              if (!res.ok) throw new Error('Failed to add notification');
                              toast.success('Notification added');
                              setShowAddNotification(false);
                              setAddNotifTitle('');
                              setAddNotifMessage('');
                              // Refresh notifications
                              const notifRes = await fetch('http://localhost:3001/api/admin/notifications');
                              setNotifications(await notifRes.json());
                            } catch (err) {
                              toast.error('Failed to add notification');
                            } finally {
                              setAddingNotif(false);
                            }
                          }}
                        >
                          <label className="block text-sm font-medium text-green-200 mb-1" htmlFor="notif-title">Title</label>
                          <input
                            id="notif-title"
                            type="text"
                            className="w-full border border-green-800 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 bg-black/20 text-white placeholder-green-700/50 transition"
                            placeholder="Enter notification title"
                            value={addNotifTitle}
                            onChange={e => setAddNotifTitle(e.target.value)}
                            disabled={addingNotif}
                            required
                            autoFocus
                          />
                          <label className="block text-sm font-medium text-green-200 mb-1" htmlFor="notif-message">Message</label>
                          <textarea
                            id="notif-message"
                            className="w-full border border-green-800 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 bg-black/20 text-white placeholder-green-700/50 transition min-h-[80px] resize-none"
                            placeholder="Enter notification message"
                            value={addNotifMessage}
                            onChange={e => setAddNotifMessage(e.target.value)}
                            disabled={addingNotif}
                            required
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg bg-white/5 text-green-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                              onClick={() => setShowAddNotification(false)}
                              disabled={addingNotif}
                            >Cancel</button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                              disabled={addingNotif}
                            >{addingNotif ? 'Adding...' : 'Add'}</button>
                          </div>
                        </form>
                      </div>
                    </div>
                    <style jsx>{`
      .animate-fadeIn {
        animation: fadeInModal 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      @keyframes fadeInModal {
        from { opacity: 0; transform: translateY(24px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Classes Table */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Your Classes</h3>
                {classes.length === 0 ? (
                  <div className="text-gray-400">No classes assigned.</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-green-400">
                        <th className="py-1 px-2">Class Name</th>
                        <th className="py-1 px-2">Class ID</th>
                        <th className="py-1 px-2">Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((c) => (
                        <tr key={c.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors">
                          <td className="py-1 px-2 text-gray-300">
                            <a href={`/teacher-dashboard/attendance/${c.id}`} className="text-green-400 hover:text-green-300 hover:underline">
                              {c.name}
                            </a>
                          </td>
                          <td className="py-1 px-2 text-gray-300">{c.id}</td>
                          <td className="py-1 px-2 text-gray-300">{profile.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Students Table */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Your Students</h3>
                {students.length === 0 ? (
                  <div className="text-gray-400">No students found for your classes.</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-green-400">
                        <th className="py-1 px-2">Name</th>
                        <th className="py-1 px-2">Email</th>
                        <th className="py-1 px-2">Class ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors">
                          <td className="py-1 px-2 text-gray-300">
                            <a
                              href={`/teacher-dashboard/attendance/student/${s.id}?classId=${s.classId}`}
                              className="text-green-400 hover:text-green-300 hover:underline"
                            >
                              {s.name}
                            </a>
                          </td>
                          <td className="py-1 px-2 text-gray-300">{s.email}</td>
                          <td className="py-1 px-2 text-gray-300">{s.classId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </div>
  );
}
