import { API_URL } from '../../config/api';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import countryCodes from './countryCodes';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaUser, FaEnvelope, FaPhone, FaLock, FaUpload, FaArrowRight } from 'react-icons/fa';


const PatientSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    countryCode: '+92', password: '', profileImage: null,
  });
  const [pwError, setPwError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgName, setImgName] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (name === 'password') setPwError(value.length > 0 && value.length < 8 ? 'Min 8 characters' : '');
  };

  const handleImg = (e) => {
    const f = e.target.files[0];
    if (f) { setFormData(p => ({ ...p, profileImage: f })); setImgName(f.name); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pwError) return;
    setFormError(''); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (k === 'profileImage' && v) fd.append(k, v); else if (k !== 'profileImage') fd.append(k, v); });
      const res = await fetch(`${API_URL}/api/patients/register`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) setFormError(data.message || 'Registration failed');
      else navigate('/login');
    } catch { setFormError('Server error. Please try again.'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full border border-[#e2f4f2] bg-[#f8fffe] rounded-xl py-3 pl-11 pr-4 text-sm text-[#0f172a] placeholder-gray-300 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all";

  return (
    <div className="min-h-screen bg-[#f0fdf9] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0f766e]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#14b8a6]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-white rounded-3xl border border-[#e2f4f2] shadow-xl shadow-[#0f766e]/8 p-8 md:p-10">

          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-[#0f766e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0f766e]/25">
              <FaHeartbeat className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Create Account</h2>
            <p className="text-gray-500 text-sm mt-1">Join Smart Health Connect as a Patient</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              {[{ name: 'firstName', placeholder: 'First name' }, { name: 'lastName', placeholder: 'Last name' }].map(f => (
                <div key={f.name}>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input name={f.name} value={formData[f.name]} onChange={handleChange} required placeholder={f.placeholder} className={inputCls} />
                  </div>
                </div>
              ))}
            </div>

            {/* Email */}
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email address" className={inputCls} />
            </div>

            {/* Phone */}
            <div className="flex gap-2">
              <select name="countryCode" value={formData.countryCode} onChange={handleChange}
                className="border border-[#e2f4f2] bg-[#f8fffe] rounded-xl px-3 py-3 text-sm text-[#0f172a] outline-none focus:border-[#0f766e] appearance-none">
                {countryCodes.map(c => (
                  <option key={c.code} value={c.dial_code} className="bg-white">{c.dial_code}</option>
                ))}
              </select>
              <div className="relative flex-1">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone number" className={inputCls} />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Password (min 8 chars)"
                  className={`${inputCls} ${pwError ? 'border-red-300' : ''}`} />
              </div>
              {pwError && <p className="text-red-400 text-xs mt-1">{pwError}</p>}
            </div>

            {/* Image upload */}
            <label className="flex items-center gap-3 border border-dashed border-[#0f766e]/30 bg-[#f0fdf9] hover:border-[#0f766e] rounded-xl p-4 cursor-pointer transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-[#e8f8f6] flex items-center justify-center group-hover:bg-[#0f766e] transition-colors">
                <FaUpload size={13} className="text-[#0f766e] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{imgName || 'Upload profile photo'}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">JPG, PNG up to 5MB</p>
              </div>
              <input type="file" accept="image/*" onChange={handleImg} className="hidden" />
            </label>

            {formError && (
              <p className="text-red-400 text-sm text-center bg-red-50 border border-red-200 py-2.5 rounded-xl">{formError}</p>
            )}

            <button type="submit" disabled={loading || !!pwError}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#0f766e]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? 'Creating account…' : <><span>Sign Up</span><FaArrowRight size={12} /></>}
            </button>

            <p className="text-center text-gray-500 text-sm pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0f766e] font-semibold hover:underline">Log in</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientSignup;
