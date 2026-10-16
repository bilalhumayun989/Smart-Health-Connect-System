import { API_URL } from '../../config/api';
import React, { useEffect, useState } from 'react';
import {
  FaCalendarCheck, FaClock, FaUserMd, FaUserCircle,
  FaCreditCard, FaEye, FaTrash, FaSearch, FaCalendarAlt,
} from 'react-icons/fa';


const statusBadge = (method) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#e8f8f6] text-[#0f766e]">
    <FaCreditCard size={8} />
    {method}
  </span>
);

export default function ShowAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/appointment/all`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => { setAppointments(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = appointments.filter(a =>
    `${a.doctorName} ${a.patientName} ${a.patientEmail}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center p-24">
      <div className="w-10 h-10 border-4 border-[#0f766e]/20 border-t-[#0f766e] rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-white border border-[#e2f4f2] rounded-2xl p-12 text-center">
      <p className="text-red-400 font-bold mb-4 text-sm">{error}</p>
      <button onClick={() => window.location.reload()}
        className="px-6 py-2.5 bg-[#0f766e] text-white rounded-xl text-xs font-black uppercase tracking-widest">
        Retry
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">

      {/* Header — no animation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0f766e] mb-1">Scheduling</p>
          <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Appointments</h2>
          <p className="text-gray-400 text-sm mt-1">Manage and schedule clinical consultations efficiently.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#e2f4f2] rounded-xl px-4 py-2.5 w-60 focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/10 transition-all">
            <FaSearch className="text-gray-300 text-sm flex-shrink-0" />
            <input
              type="text"
              placeholder="Search appointments…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-300 w-full"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#e8f8f6] border border-[#0f766e]/15 rounded-xl px-4 py-2.5">
            <FaCalendarAlt className="text-[#0f766e]" size={13} />
            <span className="text-sm font-black text-[#0f766e]">{appointments.length} Total</span>
          </div>
          <button className="px-5 py-2.5 bg-[#0f766e] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#0d9488] transition-colors shadow-sm shadow-[#0f766e]/20">
            + New
          </button>
        </div>
      </div>

      {/* Table — no row animations */}
      <div
        className="bg-white rounded-2xl border border-[#e2f4f2] overflow-hidden"
        style={{ boxShadow: '0 2px 20px rgba(15,118,110,0.07)' }}
      >
        {/* Table header bar */}
        <div className="px-6 py-4 bg-[#f8fffe] border-b border-[#e2f4f2] flex items-center gap-3">
          <FaCalendarCheck className="text-[#0f766e]" size={14} />
          <span className="text-xs font-black text-[#0f172a] uppercase tracking-wider">
            All Appointments ({filtered.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#f0faf9]">
                {['Doctor', 'Schedule', 'Patient', 'Payment', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8fffe]">
              {filtered.map((app) => (
                <tr
                  key={app._id}
                  className="hover:bg-[#f8fffe] transition-colors"
                >
                  {/* Doctor */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#e8f8f6] text-[#0f766e] flex items-center justify-center flex-shrink-0">
                        <FaUserMd size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0f172a] leading-tight">{app.doctorName}</p>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Doctor</p>
                      </div>
                    </div>
                  </td>

                  {/* Schedule */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]">
                        <FaCalendarCheck size={10} className="text-[#0f766e]" />
                        {app.appointmentDate}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
                        <FaClock size={10} />
                        {app.appointmentTime}
                      </div>
                    </div>
                  </td>

                  {/* Patient */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#d4f0ec] flex items-center justify-center flex-shrink-0">
                        <FaUserCircle size={14} className="text-[#0d9488]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0f172a]">{app.patientName}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{app.patientEmail}</p>
                      </div>
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="px-6 py-4">
                    {statusBadge(app.paymentMethod)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <button className="p-2 text-gray-400 hover:text-[#0f766e] hover:bg-[#e8f8f6] rounded-lg transition-all">
                        <FaEye size={13} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-16 text-center">
            <FaCalendarAlt className="mx-auto text-[#b2e0da] mb-3" size={36} />
            <p className="text-gray-400 font-bold text-sm">No appointments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
