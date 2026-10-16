import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaCommentAlt, FaUserMd } from 'react-icons/fa';
import { API_URL } from '../../config/api';

export default function PatientAppointments() {
  const token = localStorage.getItem('token');
  const patientId = localStorage.getItem('patientId');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!token || !patientId) return;
    const controller = new AbortController();
    setLoading(true); setError('');
    axios.get(`${API_URL}/api/appointment/patient/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      timeout: 15000,
    }).then(response => {
      if (!Array.isArray(response.data)) throw new Error('Invalid appointment data');
      setAppointments(response.data);
    }).catch(e => {
      if (controller.signal.aborted) return;
      if (e.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('patientId');
        setExpired(true);
      } else setError(e.response?.data?.message || 'Unable to load your appointments. Please retry.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, patientId, reload]);

  if (!token || !patientId || expired) return <Navigate to="/login" state={{ from: '/appointments' }} replace />;

  return (
    <main className="min-h-screen bg-white px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Your care</p><h1 className="mt-2 text-3xl font-bold text-slate-900">My Appointments</h1><p className="mt-2 text-sm text-gray-500">Review your booked visits and message your doctors.</p></div>
          <Link to="/show-doctor" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-600"><FaCalendarAlt /> Book a visit</Link>
        </div>
        {loading ? <p role="status" className="p-12 text-center text-gray-500">Loading appointments...</p> : error ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}<button className="ml-4 underline" onClick={() => setReload(value => value + 1)}>Retry</button></div>
        ) : !appointments.length ? (
          <div className="rounded-2xl border border-[#e2f4f2] bg-teal-50/50 p-8 text-center"><FaCalendarAlt className="mx-auto mb-4 text-teal-600" size={30} /><h2 className="text-lg font-semibold text-slate-900">No appointments yet</h2><p className="mt-2 text-sm text-gray-500">Choose a doctor to book your first visit.</p><Link to="/show-doctor" className="mt-5 inline-block font-semibold text-teal-700 underline">Find a doctor</Link></div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{appointments.length} booked {appointments.length === 1 ? 'visit' : 'visits'}</p>
            {appointments.map(appointment => {
              const scheduled = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
              const isPast = !Number.isNaN(scheduled.getTime()) && scheduled < new Date();
              return <article key={appointment._id} className="flex flex-col justify-between gap-5 rounded-2xl border border-[#e2f4f2] bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                <div className="min-w-0 space-y-3">
                  <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><FaUserMd size={20} /></div><h2 className="break-words text-lg font-semibold text-slate-900">{appointment.doctorName || 'Doctor'}</h2></div>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600"><p className="flex items-center gap-2"><FaCalendarAlt className="text-teal-700" />{appointment.appointmentDate || 'Date not provided'}</p><p className="flex items-center gap-2"><FaClock className="text-teal-700" />{appointment.appointmentTime || 'Time not provided'}</p></div>
                  <p className="text-xs text-gray-500">Payment method: {appointment.paymentMethod || 'Not provided'}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${isPast ? 'bg-gray-100 text-gray-600' : 'bg-teal-50 text-teal-700'}`}>{isPast ? 'Past visit' : 'Scheduled'}</span>
                  {appointment.doctorId && <Link to={`/patient-chat/${appointment.doctorId}`} className="inline-flex items-center gap-2 rounded-xl border border-teal-100 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"><FaCommentAlt /> Message doctor</Link>}
                </div>
              </article>;
            })}
          </div>
        )}
      </div>
    </main>
  );
}
