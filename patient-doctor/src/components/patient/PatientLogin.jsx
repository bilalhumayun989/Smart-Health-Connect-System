import { API_URL } from '../../config/api';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';


const PatientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/patients/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Login failed'); }
      else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('patientId', data.userId);
        navigate(location.state?.from === '/appointments' ? '/appointments' : '/show-doctor', { replace: true });
      }
    } catch { setError('Server error. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf9] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0f766e]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#14b8a6]/6 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-3xl border border-[#e2f4f2] shadow-xl shadow-[#0f766e]/8 p-8 md:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#0f766e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0f766e]/25">
              <FaHeartbeat className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Patient Login</h2>
            <p className="text-gray-500 text-sm mt-1">Welcome back to Smart Health Connect</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-[#e2f4f2] bg-[#f8fffe] rounded-xl py-3 pl-11 pr-4 text-sm text-[#0f172a] placeholder-gray-300 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-[#e2f4f2] bg-[#f8fffe] rounded-xl py-3 pl-11 pr-4 text-sm text-[#0f172a] placeholder-gray-300 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#0f766e]/20 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Signing in…' : <><span>Login</span><FaArrowRight size={12} /></>}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-7 pt-6 border-t border-[#e2f4f2]">
            New here?{' '}
            <Link to="/patient-signup" className="text-[#0f766e] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientLogin;
