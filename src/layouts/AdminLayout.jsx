import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';
import PageTransition from '../components/PageTransition';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  Trees,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const sidebarLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/parks', label: 'Park Directory', icon: Trees },
  { path: '/admin/analytics', label: 'Visitor Analytics', icon: BarChart3 },
  { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { path: '/admin/maintenance', label: 'Maintenance Requests', icon: Wrench },
  { path: '/admin/employees', label: 'Staff Management', icon: Users },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifs = async () => {
    const { data } = await getNotifications(profile?.id);
    if (data) {
      setNotifications(data);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // refresh every 15s
    
    const handleUpdate = () => fetchNotifs();
    window.addEventListener('notificationsUpdated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', handleUpdate);
    };
  }, [profile?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await markNotificationAsRead(notif.id);
      fetchNotifs();
    }
    setNotifOpen(false);
    navigate('/admin/maintenance');
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(profile?.id);
    fetchNotifs();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto flex flex-col flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">PM</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Park MS</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {sidebarLinks.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
            </NavLink>
          ))}
        </nav>

        {/* Logout button at bottom */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
              <p className="text-xs text-gray-400">Park Maintenance System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Interactive Notification Center */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden text-left">
                  <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-amber-400" />
                      <span className="font-bold text-sm">Notifications Center</span>
                      {unreadCount > 0 && (
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {unreadCount} UNREAD
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-slate-300 hover:text-white flex items-center gap-1 hover:underline"
                      >
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isEscalation = n.type === 'escalation';
                        const isResolution = n.type === 'resolution';

                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-amber-50/40 border-l-4 border-l-amber-500' : ''}`}
                          >
                            <div className="flex items-start gap-2.5">
                              {isEscalation ? (
                                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                              ) : isResolution ? (
                                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Wrench size={18} className="text-primary flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 leading-snug">
                                  {n.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                  {new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {!n.is_read && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/admin/maintenance');
                      }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View All Maintenance Tickets
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
                <Users size={16} className="text-primary" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">
                  {profile?.full_name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-400">{role || 'Role'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
