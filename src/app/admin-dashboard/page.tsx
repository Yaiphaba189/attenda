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
  useEffect(() => {
  }, [router]);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [addNotifTitle, setAddNotifTitle] = useState("");
  const [addNotifMessage, setAddNotifMessage] = useState("");
  const [addingNotif, setAddingNotif] = useState(false);
  const [adminProfile, setAdminProfile] = React.useState<{ name: string; email: string }>({ name: '', email: '' });
  React.useEffect(() => {
    fetch('/api/admin/profile')
      .then(res => {
        if (!res.ok) throw new Error('Profile fetch failed');
        return res.json();
      })
      .then(data => {
        setAdminProfile(data);
      })
      .catch(() => {
        setAdminProfile({ name: '', email: '' });
      });
  }, []);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState({ name: '', email: '', password: '', classId: '' });

  // Make fetchData available for refresh after add
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      setStats(prevStats => [
        {
          ...prevStats[0],
          value: data.stats?.totalStudents?.toString() || '0',
          loading: false
        },
        {
          ...prevStats[1],
          value: data.stats?.totalTeachers?.toString() || '0',
          loading: false
        },
        {
          ...prevStats[2],
          value: data.stats?.absentToday?.toString() || '0',
          loading: false
        },
        {
          ...prevStats[3],
          value: data.stats?.lateArrivalsToday?.toString() || '0',
          loading: false
        },
      ])
      
      if (data.notifications && data.notifications.length > 0) {
        setNotifications(data.notifications)
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
      color: "text-red-500",
      bgColor: "bg-red-50",
      loading: true
    },
    {
      title: "Total Teachers",
      value: "-",
      icon: GraduationCap,
      color: "text-green-500",
      bgColor: "bg-green-50",
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
    {
      title: "Total Leave Request",
      value: "-",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
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
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setStats(prevStats => [
          {
            ...prevStats[0],
            value: data.stats?.totalStudents?.toString() || '0',
            loading: false
          },
          {
            ...prevStats[1],
            value: data.stats?.totalTeachers?.toString() || '0',
            loading: false
          },
          {
            ...prevStats[2],
            value: data.stats?.totalClasses?.toString() || '0',
            loading: false
          },
          {
            ...prevStats[3],
            value: data.stats?.lateArrivalsToday?.toString() || '0',
            loading: false
          },
        ])
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

    fetchData()
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [])

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/admin/notifications')
        const data = await res.json()
        setNotifications(data)
      } catch (err) {
        setNotifications([
          { title: 'No recent notifications', description: 'Check back later for updates' }
        ])
      }
    }
    fetchNotifications()
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      <div className="p-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center transform rotate-12">
        <div className="w-4 h-4 bg-white rounded-sm"></div>
      </div>
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      {isLoading && (
        <div className="ml-2 text-sm text-gray-500 flex items-center">
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          Updating...
        </div>
      )}
    </div>
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <div className="text-sm font-medium text-gray-800">{adminProfile.name}</div>
        <div className="text-xs text-gray-500">{adminProfile.email}</div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"
        onClick={handleLogout}
        title="Logout"
      >
        <LogOut className="w-6 h-6" />
      </Button>
    </div>
  </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Time and Date Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-pink-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Sun className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">
                        <TimeDisplay />
                      </div>
                      <div className="text-sm text-gray-500">Realtime Insight</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-lg font-semibold text-gray-800">Today:</div>
                    <div className="text-lg text-gray-800">
                      {formatDate(currentDate)}
                    </div>
                    <div className="text-lg text-gray-800">{year}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm border-pink-100 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 ${stat.loading ? 'animate-pulse' : ''} ${stat.color}`} />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-800 mb-1">
                        {stat.loading ? (
                          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          stat.value
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{stat.title}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Notifications */}
              <Card className="bg-white/80 backdrop-blur-sm border-pink-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Notifications & Reminders</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {notifications.map((notif, idx) => (
  <div 
    key={notif.id || idx} 
    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
  >
    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
      <div className="w-2 h-2 bg-blue-500 rounded-full dark:bg-blue-400"></div>
    </div>
    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-medium text-gray-800 mb-1 truncate">{notif.title}</div>
        <div className="text-sm text-gray-500 leading-relaxed">{notif.description}</div>
        {notif.date && (
          <div className="text-xs text-gray-400 mt-1">
            {new Date(notif.date).toLocaleString()}
          </div>
        )}
      </div>
      {notif.id && (
        <button
          className="mt-2 sm:mt-0 sm:ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded shadow text-sm transition-colors"
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
                    className="w-12 h-12 bg-red-400 hover:bg-red-500 text-white rounded-full mt-6 mx-auto block"
                    onClick={() => setShowAddNotification(true)}
                    title="Add notification"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>

                {/* Add Notification Modal */}
                {showAddNotification && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md transition-opacity duration-200"
    aria-modal="true"
    role="dialog"
  >
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 pt-10 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl transition-colors"
          onClick={() => setShowAddNotification(false)}
          title="Close"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-5 text-gray-800 text-center">Add Notification</h3>
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
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notif-title">Title</label>
          <input
            id="notif-title"
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 transition"
            placeholder="Enter notification title"
            value={addNotifTitle}
            onChange={e => setAddNotifTitle(e.target.value)}
            disabled={addingNotif}
            required
            autoFocus
          />
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notif-message">Message</label>
          <textarea
            id="notif-message"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 transition min-h-[80px] resize-none"
            placeholder="Enter notification message"
            value={addNotifMessage}
            onChange={e => setAddNotifMessage(e.target.value)}
            disabled={addingNotif}
            required
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              onClick={() => setShowAddNotification(false)}
              disabled={addingNotif}
            >Cancel</button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
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
            </div>

            {/* Right Column - Calendar */}
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-pink-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Calendar</h3>
                      <div className="text-sm text-gray-500">{currentMonth}</div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="text-xs font-medium text-gray-500 text-center p-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {calendarDays.map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 gap-1">
                        {week.map((day, dayIndex) => (
                          <div key={dayIndex} className="aspect-square flex items-center justify-center">
                            {day ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`w-8 h-8 p-0 text-sm ${
                                  day === today
                                    ? "bg-red-500 text-white hover:bg-red-600 rounded-full"
                                    : "text-gray-700 hover:bg-pink-50"
                                }`}
                              >
                                {day.toString().padStart(2, "0")}
                              </Button>
                            ) : (
                              <div className="w-8 h-8" />
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-pink-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/students')}>
                      <Users2 className="w-4 h-4 mr-2" />
                      Manage Students
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/teachers')}>
                      <Users2 className="w-4 h-4 mr-2" />
                      Manage Teachers
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/classes')}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Manage Classes
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/subjects')}>
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Manage Subjects
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}
