import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaSignInAlt, FaSignOutAlt, FaUser, FaUserMd } from 'react-icons/fa';
import axios from 'axios';
import { API_URL, uploadUrl } from '../../config/api';
import { profileName } from '../../utils/profileName';
import { clearDoctorSession, DOCTOR_SESSION_EVENT } from '../../utils/doctorSession';

function readSession() {
  const patientToken = localStorage.getItem('token');
  const patientId = localStorage.getItem('patientId');
  if (patientToken && patientId) return { token: patientToken, id: patientId, role: 'patient' };
  const doctorToken = localStorage.getItem('doctorToken');
  const doctorId = localStorage.getItem('doctor-id');
  return doctorToken && doctorId ? { token: doctorToken, id: doctorId, role: 'doctor' } : null;
}

export default function UserProfileMenu() {
  const [session, setSession] = useState(readSession);
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const signOutRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = session?.token;
  const id = session?.id;
  const role = session?.role;

  useEffect(() => {
    setSession(readSession());
    setOpen(false);
    const refresh = () => { setSession(readSession()); setOpen(false); };
    window.addEventListener('storage', refresh);
    window.addEventListener(DOCTOR_SESSION_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(DOCTOR_SESSION_EVENT, refresh);
    };
  }, [pathname]);

  useEffect(() => {
    setProfile(null);
    setImageFailed(false);
    if (!token || !id) return;
    const controller = new AbortController();
    const route = role === 'doctor' ? '/api/doctor/me' : `/api/patients/${encodeURIComponent(id)}`;
    axios.get(`${API_URL}${route}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      timeout: 15000,
    }).then(response => {
      if (!controller.signal.aborted) setProfile(response.data);
    }).catch(error => {
      if (!controller.signal.aborted && role === 'doctor' && [401, 404].includes(error.response?.status)) {
        clearDoctorSession(token);
      }
    });
    return () => controller.abort();
  }, [token, id, role]);

  useEffect(() => {
    if (!open) return;
    signOutRef.current?.focus();
    const dismiss = event => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = event => {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const signOut = () => {
    ['token', 'patientId', 'doctorToken', 'doctor-id'].forEach(key => localStorage.removeItem(key));
    setSession(null);
    setProfile(null);
    setOpen(false);
    navigate('/login', { replace: true });
  };

  if (!session) return (
    <button onClick={() => navigate('/login')} className="flex items-center gap-2 rounded-xl bg-[#0f766e] px-3 sm:px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0d9488]">
      <FaSignInAlt size={12} /> Sign In
    </button>
  );

  const name = profileName(profile);
  const words = name === 'Your account' ? [] : name.split(/\s+/);
  const initials = [words[0], words.length > 1 ? words[words.length - 1] : null].filter(Boolean).map(value => value.charAt(0)).join('').toUpperCase();
  const photo = uploadUrl(profile?.profileImage, role === 'doctor' ? 'doctors' : '');

  return (
    <div ref={containerRef} className="relative shrink-0" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={triggerRef} aria-label="Open account options" aria-expanded={open} aria-controls="account-options" title={name} onClick={() => setOpen(value => !value)} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#e8f8f6] text-sm font-bold text-[#0f766e] ring-2 ring-[#0f766e]/20 transition-shadow hover:ring-[#0f766e]/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0f766e]">
        {photo && !imageFailed ? <img src={photo} alt={name} onError={() => setImageFailed(true)} className="h-full w-full object-cover" /> : initials || <FaUser aria-hidden="true" size={17} />}
      </button>
      {open && (
        <div id="account-options" className="absolute right-0 top-full z-20 mt-3 w-60 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-[#e2f4f2] bg-white shadow-xl">
          <div className="border-b border-[#e2f4f2] px-4 py-3">
            <p className="break-words text-sm font-semibold text-slate-900">{name}</p>
            {profile?.email && <p className="mt-1 break-all text-xs text-gray-500">{profile.email}</p>}
          </div>
          {role === 'doctor' ? (
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#0f766e] transition-colors hover:bg-teal-50 focus-visible:bg-teal-50 focus-visible:outline-none"
            >
              <FaUserMd aria-hidden="true" size={14} /> Go to Doctor Panel
            </Link>
          ) : (
            <button ref={signOutRef} onClick={signOut} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none">
              <FaSignOutAlt aria-hidden="true" size={14} /> Sign Out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
