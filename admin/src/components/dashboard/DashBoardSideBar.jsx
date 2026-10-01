import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt,
  FaUserMd,
  FaUserInjured,
  FaCalendarCheck,
  FaBlog,
  FaShieldAlt,
  FaLock,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHeartbeat,
} from 'react-icons/fa';

const navItems = [
  { to: '/', icon: FaTachometerAlt, label: 'Dashboard' },
  { to: '/doctor', icon: FaUserMd, label: 'Doctors' },
  { to: '/patient', icon: FaUserInjured, label: 'Patients' },
  { to: '/appointments', icon: FaCalendarCheck, label: 'Appointments' },
  { to: '/show-blog', icon: FaBlog, label: 'Blogs' },
  { to: '/privacy-policy', icon: FaShieldAlt, label: 'Privacy Policy' },
  { to: '/security-policy', icon: FaLock, label: 'Security Policy' },
];

export default function DashBoardSideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen((p) => !p);

  return (
    <>
      {/* Mobile Toggle */}
      {isMobile && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleSidebar}
          className="fixed z-50 top-4 left-4 p-3 bg-[#0f766e] text-white rounded-2xl shadow-xl lg:hidden"
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {(isOpen || !isMobile) && (
          <motion.aside
            initial={isMobile ? { x: -280 } : false}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed lg:sticky top-0 left-0 z-40 h-screen w-64 flex flex-col sidebar-glass overflow-hidden"
          >
            {/* ── Logo ── */}
            <div className="px-5 pt-7 pb-5">
              <div className="flex items-center gap-3 px-1">
                <div className="w-10 h-10 rounded-2xl bg-[#0f766e] flex items-center justify-center shadow-lg flex-shrink-0">
                  <FaHeartbeat className="text-white text-base" />
                </div>
                <div>
                  <h1 className="text-[#0f766e] font-extrabold text-sm leading-tight tracking-tight">Smart Health</h1>
                  <p className="text-[#0d9488] text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">
                    Connect Admin
                  </p>
                </div>
              </div>
              {/* Divider */}
              <div className="mt-5 h-px bg-gradient-to-r from-transparent via-[#0f766e]/20 to-transparent" />
            </div>

            {/* ── Section label ── */}
            <p className="px-6 text-[9px] font-black uppercase tracking-[0.28em] text-[#0f766e]/40 mb-1.5">
              Navigation
            </p>

            {/* ── Nav Items ── */}
            <nav className="flex-1 px-3 space-y-0.5 sidebar-no-scrollbar overflow-y-auto">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 relative ${
                      isActive
                        ? 'bg-[#0f766e] text-white nav-active-glow'
                        : 'text-[#3d7a74] hover:text-[#0f766e] hover:bg-[#0f766e]/10'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Icon box */}
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#0f766e]/10 text-[#0f766e] group-hover:bg-[#0f766e]/15'
                        }`}
                      >
                        <Icon size={13} />
                      </span>
                      <span className="text-sm font-semibold tracking-wide">{label}</span>

                      {/* Active dot */}
                      {isActive && (
                        <motion.span
                          layoutId="active-dot"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              {/* Divider */}
              <div className="my-3 h-px bg-gradient-to-r from-transparent via-[#0f766e]/15 to-transparent" />

              {/* Logout */}
              <NavLink
                to="/logout"
                onClick={() => isMobile && setIsOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'text-[#3d7a74] hover:text-red-500 hover:bg-red-50'
                  }`
                }
              >
                <span className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-all duration-200">
                  <FaSignOutAlt size={13} className="text-red-400 group-hover:text-red-500" />
                </span>
                <span className="text-sm font-semibold tracking-wide">Logout</span>
              </NavLink>
            </nav>

            {/* ── User Card ── */}
            <div className="mx-3 mb-4 mt-3 p-3.5 rounded-2xl bg-white border border-[#b2e0da] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Admin"
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#0f766e]/20"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0f172a] font-bold text-xs truncate">Mathew Anderson</p>
                  <p className="text-[#0f766e] text-[10px] font-semibold">Super Admin</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
