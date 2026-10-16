import { API_URL } from '../../config/api';
import React, { useState, useEffect } from 'react';
import {
  FaUserMd, FaCalendarAlt, FaBlog, FaChevronDown,
  FaHeartbeat, FaBars, FaTimes,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import UserProfileMenu from './UserProfileMenu';
import { DOCTOR_SESSION_EVENT } from '../../utils/doctorSession';


const UserNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [isDoctor, setIsDoctor] = useState(!!(localStorage.getItem('doctorToken') && localStorage.getItem('doctor-id')));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const refreshDoctor = () => setIsDoctor(!!(localStorage.getItem('doctorToken') && localStorage.getItem('doctor-id')));
    window.addEventListener('storage', refreshDoctor);
    window.addEventListener(DOCTOR_SESSION_EVENT, refreshDoctor);
    return () => {
      window.removeEventListener('storage', refreshDoctor);
      window.removeEventListener(DOCTOR_SESSION_EVENT, refreshDoctor);
    };
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/api/doctor/all-doctor`)
      .then(r => { if (Array.isArray(r.data)) setSpecialties([...new Set(r.data.map(d => d.specialty).filter(Boolean))].sort()); })
      .catch(() => {});
  }, []);

  const gotoDoctor = (specialty = null) => {
    navigate(specialty ? `/show-doctor?specialty=${encodeURIComponent(specialty)}` : '/show-doctor');
    setMenuOpen(false); setDropdownOpen(false);
  };

  const gotoAppointments = () => {
    setMenuOpen(false); setDropdownOpen(false);
    if (localStorage.getItem('token') && localStorage.getItem('patientId')) {
      navigate('/appointments');
    } else if (localStorage.getItem('doctorToken') && localStorage.getItem('doctor-id')) {
      navigate('/dashboard/appointment');
    } else {
      navigate('/login', { state: { from: '/appointments' } });
    }
  };

  const navLinks = [
    { name: 'Find Doctor', dropdown: true, icon: FaUserMd },
    { name: 'Appointment', path: '/appointments', icon: FaCalendarAlt, action: gotoAppointments },
    { name: 'Blog', icon: FaBlog, path: '/Blog' },
    { name: 'Join as Doctor', path: '/doctor-login' },
  ];

  const visibleLinks = navLinks.filter(link => !(link.name === 'Join as Doctor' && isDoctor));

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-lg border-b border-[#e2f4f2] shadow-sm py-3'
        : 'bg-white/90 backdrop-blur-md border-b border-[#e2f4f2] py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMenuOpen(false)}>
          <div className="w-9 h-9 bg-[#0f766e] rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <FaHeartbeat className="text-white text-base" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0f172a]">
            Smart<span className="text-[#0f766e]">Health</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 ml-auto">
          {visibleLinks.map(link => (
            <div key={link.name} className="relative">
              {link.dropdown ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(p => !p)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === '/show-doctor'
                        ? 'text-[#0f766e] bg-[#e8f8f6]'
                        : 'text-gray-600 hover:text-[#0f766e] hover:bg-[#e8f8f6]'
                    }`}
                  >
                    <link.icon size={13} />
                    {link.name}
                    <FaChevronDown size={9} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-2 w-52 bg-white border border-[#e2f4f2] rounded-2xl shadow-xl py-2 overflow-hidden"
                      >
                        <button onClick={() => gotoDoctor()} className="block w-full text-left px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50">All doctors</button>
                        {specialties.map((s, i) => (
                          <button key={i} onClick={() => gotoDoctor(s)}
                            className="block w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:text-[#0f766e] hover:bg-[#e8f8f6] transition-colors">
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button
                  onClick={() => link.action ? link.action() : navigate(link.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'text-[#0f766e] bg-[#e8f8f6]'
                      : 'text-gray-600 hover:text-[#0f766e] hover:bg-[#e8f8f6]'
                  }`}
                >
                  {link.icon && <link.icon size={13} />}
                  {link.name}
                </button>
              )}
            </div>
          ))}

        </div>

        <div className="flex shrink-0 items-center gap-3">
          <UserProfileMenu />
        {/* Mobile toggle */}
        <button aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(p => !p)}
          className="lg:hidden w-9 h-9 rounded-xl bg-[#e8f8f6] text-[#0f766e] flex items-center justify-center transition-all">
          {menuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-[#e2f4f2] overflow-hidden"
          >
            <div className="px-6 py-5 space-y-2">
              {visibleLinks.map(link => (
                <div key={link.name}>
                  {link.dropdown ? (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1">{link.name}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => gotoDoctor()} className="rounded-xl bg-teal-50 px-3 py-2.5 text-left text-sm text-teal-700">All doctors</button>
                        {specialties.map((s, i) => (
                          <button key={i} onClick={() => gotoDoctor(s)}
                            className="bg-[#f0fdf9] border border-[#e2f4f2] px-3 py-2.5 rounded-xl text-sm text-[#0f766e] text-left font-medium">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => link.action ? link.action() : navigate(link.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f0fdf9] text-gray-700 font-medium text-sm">
                      {link.icon && <link.icon size={13} className="text-[#0f766e]" />}
                      {link.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default UserNavbar;
