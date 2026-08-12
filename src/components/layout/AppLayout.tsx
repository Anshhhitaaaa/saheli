import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Sparkles,
  Users,
  UserCircle,
  Menu,
  X,
  Bell,
  Baby,
  BarChart3,
  Stethoscope,
  Pill,
  Share2,
  FileText,
  EyeOff,
  CheckCheck,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { pageTransition, drawerTransition, backdropTransition } from '../../animations/variants';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  mobile?: boolean;
}

function navItems(pregnancyMode: boolean): NavItem[] {
  const items: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tracker', label: 'Tracker', icon: CalendarDays },
    { to: '/assistant', label: 'Assistant', icon: Sparkles },
    { to: '/library', label: 'Library', icon: BookOpen },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/meds', label: 'Medications', icon: Pill },
    { to: '/community', label: 'Community', icon: Users },
    { to: '/care/find', label: 'Find Care', icon: Stethoscope },
    { to: '/sharing', label: 'Sharing', icon: Share2 },
    { to: '/doctor-summary', label: 'Doctor Summary', icon: FileText },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ];
  if (pregnancyMode) {
    items.splice(2, 0, { to: '/pregnancy', label: 'Pregnancy', icon: Baby });
  }
  return items;
}

const mobileItems: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, mobile: true },
  { to: '/tracker', label: 'Tracker', icon: CalendarDays, mobile: true },
  { to: '/assistant', label: 'Ask', icon: Sparkles, mobile: true },
  { to: '/library', label: 'Library', icon: BookOpen, mobile: true },
  { to: '/profile', label: 'Profile', icon: UserCircle, mobile: true },
];

function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return `Today, ${timeStr}`;
  }
  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }
  if (date.getFullYear() === now.getFullYear()) {
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateStr}, ${timeStr}`;
  }
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return `${dateStr}, ${timeStr}`;
}

export function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const { notifications, unreadCount, settings, markAsRead, markAllAsRead, updateSettings } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-clay-300 border-t-clay-600" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const items = navItems(user.pregnancyMode);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-sand-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sand-200/60 bg-white dark:border-sand-700/60 dark:bg-sand-800 md:flex">
        <div className="flex h-16 items-center px-5">
          <Link to="/dashboard" aria-label="Saheli dashboard">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-500 transition-colors ${
                  active
                    ? 'text-clay-700 dark:text-clay-100'
                    : 'text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-700/50'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-clay-100 dark:bg-clay-800/40"
                  />
                )}
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sand-200/60 p-3 dark:border-sand-700/60">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-clay-100 text-sm font-600 text-clay-700 dark:bg-clay-800/50 dark:text-clay-200">
              {(user.username || user.name).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-600 text-sand-800 dark:text-sand-100">@{user.username || user.name}</p>
              <p className="truncate text-xs text-sand-500 dark:text-sand-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-sand-500 hover:bg-sand-100 hover:text-sand-800 dark:hover:bg-sand-700/50"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sand-200/60 bg-sand-50/80 px-4 backdrop-blur-md dark:border-sand-700/60 dark:bg-sand-900/80 md:hidden">
        <Link to="/dashboard" aria-label="Saheli dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <button
            aria-label="Notifications"
            onClick={() => setNotifDrawerOpen(true)}
            className="relative rounded-full p-2 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay-500 text-[10px] font-700 text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <ThemeToggle />
          <button
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-full p-2 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="md:pl-64">
        {/* Desktop top bar */}
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-sand-200/60 bg-sand-50/80 px-6 backdrop-blur-md dark:border-sand-700/60 dark:bg-sand-900/80 md:flex">
          <p className="text-sm text-sand-500 dark:text-sand-400">
            {greeting()}, <span className="font-600 text-sand-800 dark:text-sand-200">@{user.username || user.name}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              onClick={() => setNotifDrawerOpen(true)}
              className="relative flex items-center gap-2 rounded-xl border border-sand-200 px-3 py-1.5 text-xs font-600 text-sand-700 hover:bg-sand-100 dark:border-sand-700 dark:text-sand-200 dark:hover:bg-sand-800"
            >
              <Bell className="h-4 w-4 text-clay-500" />
              <span>Inbox</span>
              {unreadCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-clay-500 text-[10px] font-700 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main className="px-4 py-6 pb-24 sm:px-6 md:px-8 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Slide-over Notification Inbox Drawer */}
      <AnimatePresence>
        {notifDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              variants={backdropTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-sand-900/40"
              onClick={() => setNotifDrawerOpen(false)}
            />
            <motion.aside
              variants={drawerTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-sand-800 transform-gpu will-change-transform"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-sand-200/60 px-5 py-4 dark:border-sand-700/60">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-clay-100 text-clay-600 dark:bg-clay-800/60 dark:text-clay-200">
                    <Bell className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">Notifications</h2>
                    <p className="text-xs text-sand-500 dark:text-sand-400">
                      {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Controls bar: Filter & Discreet Mode Toggle */}
              <div className="flex items-center justify-between border-b border-sand-200/60 bg-sand-50 px-5 py-2.5 dark:border-sand-700/60 dark:bg-sand-900/50">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-600 transition-colors ${
                      filter === 'all'
                        ? 'bg-clay-500 text-white'
                        : 'text-sand-600 hover:bg-sand-200/60 dark:text-sand-300 dark:hover:bg-sand-700'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-600 transition-colors ${
                      filter === 'unread'
                        ? 'bg-clay-500 text-white'
                        : 'text-sand-600 hover:bg-sand-200/60 dark:text-sand-300 dark:hover:bg-sand-700'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSettings(!settings.discreetMode, settings.categories)}
                    title={settings.discreetMode ? 'Discreet Mode Active (Lock-screen privacy on)' : 'Explicit Mode Active'}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-600 transition-colors ${
                      settings.discreetMode
                        ? 'bg-clay-100 text-clay-700 dark:bg-clay-800/60 dark:text-clay-200'
                        : 'bg-sand-200 text-sand-700 dark:bg-sand-700 dark:text-sand-300'
                    }`}
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>{settings.discreetMode ? 'Discreet' : 'Explicit'}</span>
                  </button>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs font-600 text-sand-600 hover:text-clay-600 dark:text-sand-400 dark:hover:text-clay-300"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      <span>Read all</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {filteredNotifs.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-sand-400 dark:bg-sand-700 dark:text-sand-300">
                      <Bell className="h-6 w-6" />
                    </span>
                    <p className="mt-3 text-sm font-600 text-sand-800 dark:text-sand-100">No notifications here</p>
                    <p className="mt-1 text-xs text-sand-500 dark:text-sand-400">You are all caught up on your health updates.</p>
                  </div>
                ) : (
                  filteredNotifs.map((n) => {
                    const textToShow = settings.discreetMode ? n.discreetMessage : n.message;
                    return (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all ${
                          !n.read
                            ? 'border-clay-300/80 bg-clay-50/40 dark:border-clay-700/80 dark:bg-clay-950/20'
                            : 'border-sand-200/60 bg-white dark:border-sand-700/60 dark:bg-sand-800/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-clay-500 opacity-90" style={{ opacity: n.read ? 0 : 1 }} />
                            <div>
                              <h4 className="text-sm font-600 text-sand-900 dark:text-sand-100">{n.title}</h4>
                              <p className="mt-1 text-xs text-sand-600 dark:text-sand-300">{textToShow}</p>
                              <p className="mt-2 text-[10px] text-sand-400 dark:text-sand-500">
                                {formatNotificationTime(n.createdAt)} · {n.category}
                              </p>
                            </div>
                          </div>

                          {!n.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(n.id);
                              }}
                              className="text-xs text-clay-600 hover:underline dark:text-clay-300"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer link to Profile settings */}
              <div className="border-t border-sand-200/60 p-4 text-center dark:border-sand-700/60">
                <Link
                  to="/profile"
                  onClick={() => setNotifDrawerOpen(false)}
                  className="text-xs font-600 text-clay-600 hover:underline dark:text-clay-300"
                >
                  Manage notification preferences & privacy →
                </Link>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              variants={backdropTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-sand-900/40 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              variants={drawerTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white dark:bg-sand-800"
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Logo />
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg p-1.5 text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 px-3 py-2">
                {items.map((item) => {
                  const active =
                    location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-500 ${
                        active
                          ? 'bg-clay-100 text-clay-700 dark:bg-clay-800/40 dark:text-clay-100'
                          : 'text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-700/50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-sand-200/60 p-3 dark:border-sand-700/60">
                <button
                  onClick={handleSignOut}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-700/50"
                >
                  Sign out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-sand-200/60 bg-sand-50/95 backdrop-blur-md dark:border-sand-700/60 dark:bg-sand-900/95 md:hidden">
        {mobileItems.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-500 ${
                active ? 'text-clay-600 dark:text-clay-200' : 'text-sand-500 dark:text-sand-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {active && (
                <motion.span
                  layoutId="bottomnav-active"
                  className="absolute -top-px h-0.5 w-8 rounded-full bg-clay-500"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
