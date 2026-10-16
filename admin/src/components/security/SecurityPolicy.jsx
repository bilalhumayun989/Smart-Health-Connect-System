import { API_URL } from '../../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaLock, FaSave, FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaKey } from 'react-icons/fa';

export default function SecurityPolicy() {
  const [policy, setPolicy] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/security-policy`)
      .then(r => setPolicy(r.data?.policy || ''))
      .catch(e => console.error(e));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!policy.trim()) return setStatus({ type: 'error', message: 'Security policy cannot be empty.' });
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/security-policy`, { policy });
      setStatus({ type: 'success', message: 'Security policy updated and secured.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    } catch {
      setStatus({ type: 'error', message: 'Update failed. Server unreachable.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0f766e] mb-1">Security</p>
          <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Security Policy</h2>
          <p className="text-gray-400 text-sm mt-1">Configure operational security and encryption policies.</p>
        </div>

        <div className="flex items-center gap-3">
          {[
            { icon: FaLock, label: 'Encryption', val: 'AES-256' },
            { icon: FaKey, label: 'Auth', val: 'JWT' },
          ].map(({ icon: Icon, label, val }, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#e8f8f6] border border-[#0f766e]/15 rounded-xl px-4 py-2.5">
              <Icon className="text-[#0f766e]" size={13} />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">{label}</p>
                <p className="text-xs font-black text-[#0f766e] leading-tight">{val}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Editor Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15 }}
        className="bg-white rounded-2xl border border-[#e2f4f2] overflow-hidden"
        style={{ boxShadow: '0 2px 20px rgba(15,118,110,0.07)' }}
      >
        {/* Card header */}
        <div className="px-7 py-4 bg-[#f8fffe] border-b border-[#e2f4f2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0f766e] flex items-center justify-center">
              <FaShieldAlt size={12} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-[#0f172a]">Security Directive</p>
              <p className="text-[10px] text-gray-400 font-semibold">Edit and commit operational security protocols</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0f766e] bg-[#e8f8f6] px-3 py-1 rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0f766e] animate-pulse" />
            Protected
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-6">
          <textarea
            rows={16}
            value={policy}
            onChange={e => setPolicy(e.target.value)}
            placeholder="Define high-level security directives and operational protocols…"
            className="w-full bg-[#f8fffe] border border-[#e2f4f2] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 rounded-2xl p-6 outline-none text-sm text-[#0f172a] leading-relaxed resize-none transition-all font-medium placeholder-gray-300"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2.5 px-8 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm shadow-[#0f766e]/20 disabled:opacity-60"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><FaSave size={13} /> Commit Changes</>
              }
            </button>

            {status.message && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-xs font-bold ${
                  status.type === 'success'
                    ? 'bg-[#e8f8f6] border-[#0f766e]/20 text-[#0f766e]'
                    : 'bg-red-50 border-red-200 text-red-500'
                }`}
              >
                {status.type === 'success' ? <FaCheckCircle size={13} /> : <FaExclamationTriangle size={13} />}
                {status.message}
              </motion.div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
