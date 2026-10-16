import { API_URL, doctorName, uploadUrl } from '../../config/api';
import doctorPlaceholder from '../../assets/doctor-placeholder.svg';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaCalendarAlt, FaCommentAlt, FaUserMd,
  FaHospital, FaHistory,
  FaTimes,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';


export default function ShowDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appt, setAppt] = useState({ date: '', time: '', paymentMethod: 'Cash' });
  const [eligible, setEligible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const specialty = searchParams.get('specialty') || '';
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const patientId = localStorage.getItem('patientId');

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_URL}/api/doctor/all-doctor`, { signal: controller.signal, timeout: 15000 });
        if (!Array.isArray(res.data)) throw new Error('Invalid doctor data');
        setDoctors(res.data);
      } catch (e) { if (!controller.signal.aborted) setError(e.response?.data?.message || 'Unable to load doctors. Please check your connection and retry.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    if (!token || !patientId || !doctors.length) return;
    const controller = new AbortController();
    Promise.allSettled(doctors.map(async d => {
      const r = await axios.get(`${API_URL}/api/appointment/hasAppointment/${patientId}/${d._id}`, { signal: controller.signal, timeout: 10000 });
      return r.data.hasAppointment ? d._id : null;
    })).then(results => {
      if (!controller.signal.aborted) setEligible(results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value));
    });
    return () => controller.abort();
  }, [doctors, token, patientId]);

  const filtered = doctors.filter(d => (!specialty || d.specialty === specialty) && `${doctorName(d)} ${d.specialty || ''} ${d.hospitalAffiliation || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const bookNow = (doc) => { if (!token || !patientId) navigate('/login'); else { setSelectedDoctor(doc); setAppt({ date: '', time: '', paymentMethod: 'Cash' }); setBookingError(''); setSuccess(''); setShowModal(true); } };

  const confirmAppt = async (event) => {
    event.preventDefault();
    if (booking) return;
    if (new Date(`${appt.date}T${appt.time}`) <= new Date()) {
      setBookingError('Please select a future appointment date and time.');
      return;
    }
    setBooking(true);
    setBookingError('');
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const pat = (await axios.get(`${API_URL}/api/patients/${patientId}`, cfg)).data;
      await axios.post(`${API_URL}/api/appointment/book`, {
        doctorId: selectedDoctor._id,
        doctorName: doctorName(selectedDoctor),
        patientId, patientName: `${pat.firstName} ${pat.lastName}`,
        patientEmail: pat.email, appointmentDate: appt.date,
        appointmentTime: appt.time, paymentMethod: appt.paymentMethod,
      }, cfg);
      setShowModal(false);
      setEligible(previous => [...new Set([...previous, selectedDoctor._id])]);
      setSuccess(`Your appointment with ${doctorName(selectedDoctor)} has been booked.`);
    } catch (e) { setBookingError(e.response?.data?.message || 'Booking failed. Please try again.'); }
    finally { setBooking(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f0fdf9] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[#e2f4f2] border-t-[#0f766e] rounded-full animate-spin" />
      <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Loading Specialists…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <span className="inline-block bg-[#e8f8f6] text-[#0f766e] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Medical Directory
            </span>
            <h1 className="text-3xl font-bold text-[#0f172a]">
              Our <span className="text-gradient">Medical Experts</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">Find registered specialists and book your next visit.</p>
          </div>
          <div className="flex w-full md:w-auto flex-col sm:flex-row gap-3">
            <input aria-label="Search doctors" placeholder="Search doctors or hospitals" value={search} onChange={e => setSearch(e.target.value)} className="min-w-0 rounded-xl border border-[#e2f4f2] px-4 py-3 text-sm" />
            <select aria-label="Filter by specialty" value={specialty} onChange={e => setSearchParams(e.target.value ? { specialty: e.target.value } : {})} className="min-w-0 rounded-xl border border-[#e2f4f2] bg-white px-4 py-3 text-sm">
              <option value="">All specialties</option>
              {[...new Set([...doctors.map(d => d.specialty).filter(Boolean), specialty].filter(Boolean))].sort().map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}<button onClick={() => setReload(r => r + 1)} className="ml-4 underline">Retry</button></div>}
        {success && <p role="status" className="mb-6 rounded-xl bg-teal-50 p-5 text-teal-800">{success}</p>}
        {!error && <p className="mb-4 text-sm text-gray-500">{filtered.length} doctors found</p>}
        {!error && filtered.length === 0 && <p className="rounded-2xl border border-[#e2f4f2] p-10 text-center text-gray-500">{doctors.length ? 'No doctors match your search.' : 'No doctors are registered yet.'}</p>}

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!error && filtered.map((doc, i) => (
            <motion.div key={doc._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="group bg-white border border-[#e2f4f2] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#0f766e]/8 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              style={{ boxShadow: '0 2px 16px rgba(15,118,110,0.06)' }}
            >
              {/* Teal header */}
              <div className="h-24 bg-gradient-to-r from-[#0f766e] to-[#14b8a6] relative flex-shrink-0">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '16px 16px' }} />
                <div className="absolute -bottom-10 left-6">
                  <div className="relative">
                    <img src={uploadUrl(doc.profileImage, 'doctors') || doctorPlaceholder}
                      alt={doc.firstName}
                      className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md"
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = doctorPlaceholder; }} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#0f766e] rounded-full border-2 border-white flex items-center justify-center">
                      <FaUserMd size={8} className="text-white" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-14 px-5 pb-5 flex flex-1 flex-col">
              {/* Name + specialty */}
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-[#0f172a] group-hover:text-[#0f766e] transition-colors">
                    {doctorName(doc)}
                  </h3>
                  {doc.licenseNumber?.startsWith('DEMO-') && <p className="mt-1 text-[10px] font-medium text-gray-400">Demo profile · illustrative photo</p>}
                  <span className="inline-block mt-1 bg-[#e8f8f6] text-[#0f766e] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    {doc.specialty}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <div className="bg-[#f8fffe] border border-[#e2f4f2] rounded-xl p-3 flex items-center gap-2">
                    <FaHistory size={11} className="text-[#0f766e]" />
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase">Exp.</p>
                      <p className="text-xs font-semibold text-[#0f172a]">{doc.yearsOfExperience != null ? `${doc.yearsOfExperience} yrs` : 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="bg-[#f8fffe] border border-[#e2f4f2] rounded-xl p-3 flex items-center gap-2">
                    <FaHospital size={11} className="text-[#0f766e]" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 uppercase">Hospital</p>
                      <p className="text-[10px] font-semibold text-[#0f172a] break-words">{doc.hospitalAffiliation || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Buttons — pushed to bottom */}
                <div className="mt-auto min-h-[98px] space-y-2.5">
                  <button onClick={() => bookNow(doc)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-[#0f766e]/20">
                    <FaCalendarAlt size={13} />
                    <span>Book Visit</span>
                  </button>
                  {eligible.includes(doc._id) && (
                    <button onClick={() => navigate(`/patient-chat/${doc._id}`)}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-[#e2f4f2] bg-[#f8fffe] text-[#0f766e] rounded-xl text-sm font-medium hover:border-[#0f766e]/30 transition-all">
                      <FaCommentAlt size={13} />
                      <span>Message Doctor</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Booking Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[1000] p-5">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" />

              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                role="dialog" aria-modal="true" aria-label="Book appointment"
                className="relative bg-white border border-[#e2f4f2] rounded-3xl shadow-2xl shadow-[#0f766e]/12 w-full max-w-md max-h-[90vh] p-7 overflow-y-auto"
              >
                {/* Close */}
                <button aria-label="Close booking" onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#f0fdf9] text-gray-400 hover:text-[#0f766e] flex items-center justify-center transition-colors">
                  <FaTimes size={13} />
                </button>

                {/* Doctor row */}
                <div className="flex items-center gap-4 mb-7 pb-5 border-b border-[#e2f4f2]">
                  <img src={uploadUrl(selectedDoctor?.profileImage, 'doctors') || doctorPlaceholder} alt={selectedDoctor ? doctorName(selectedDoctor) : ''}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#e2f4f2]"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = doctorPlaceholder; }} />
                  <div>
                    <p className="text-[10px] text-[#0f766e] font-semibold uppercase tracking-widest mb-0.5">Scheduling with</p>
                    <h3 className="text-lg font-semibold text-[#0f172a]">{selectedDoctor && doctorName(selectedDoctor)}</h3>
                    <p className="text-xs text-gray-400">{selectedDoctor?.specialty}</p>
                  </div>
                </div>

                <form onSubmit={confirmAppt} className="space-y-5">
                  {bookingError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{bookingError}</p>}
                  {/* Date + Time */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Date', type: 'date', key: 'date' },
                      { label: 'Time', type: 'time', key: 'time' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">{f.label}</label>
                        <input aria-label={f.label} required min={f.key === 'date' ? minDate : undefined} type={f.type} name={f.key} value={appt[f.key]}
                          onChange={e => setAppt(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full border border-[#e2f4f2] bg-[#f8fffe] rounded-xl px-4 py-3 text-sm text-[#0f172a] outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all" />
                      </div>
                    ))}
                  </div>

                  {/* Payment */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['Cash', 'Online'].map(m => (
                        <button type="button" key={m} onClick={() => setAppt(p => ({ ...p, paymentMethod: m }))}
                          className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                            appt.paymentMethod === m
                              ? 'bg-[#0f766e] border-[#0f766e] text-white shadow-sm'
                              : 'bg-[#f8fffe] border-[#e2f4f2] text-gray-600 hover:border-[#0f766e]/30'
                          }`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-3 border border-[#e2f4f2] text-gray-500 rounded-xl text-sm font-medium hover:bg-[#f8fffe] transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={booking}
                      className="flex-[2] py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white rounded-xl text-sm font-semibold shadow-md shadow-[#0f766e]/20 transition-all">
                      {booking ? 'Booking...' : 'Confirm Appointment'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
