import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { clearDoctorSession, DOCTOR_SESSION_EVENT } from '../../../utils/doctorSession';
import { DoctorSessionContext } from './doctorSessionContext';

export default function DoctorSession({ children }) {
  const { pathname } = useLocation();
  const [token, setToken] = useState(() => localStorage.getItem('doctorToken'));
  const [sessionMessage, setSessionMessage] = useState('');
  const [validation, setValidation] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const refresh = () => setToken(localStorage.getItem('doctorToken'));
    window.addEventListener('storage', refresh);
    window.addEventListener(DOCTOR_SESSION_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(DOCTOR_SESSION_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setValidation(null);
    axios.get(`${API_URL}/api/doctor/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      timeout: 15000,
    }).then(response => {
      if (controller.signal.aborted || localStorage.getItem('doctorToken') !== token) return;
      if (!response.data?._id) throw new Error('Invalid doctor profile');
      // The verified token determines identity; a cached ID can be out of date.
      localStorage.setItem('doctor-id', response.data._id);
      setValidation({ token, pathname, doctor: response.data });
    }).catch(error => {
      if (controller.signal.aborted || localStorage.getItem('doctorToken') !== token) return;
      if ([401, 404].includes(error.response?.status)) {
        setSessionMessage(error.response?.data?.message || 'Your doctor session is no longer valid. Please sign in again.');
        clearDoctorSession(token);
        setToken(null);
      } else {
        setValidation({ token, pathname, error: error.response?.data?.message || 'Unable to check your session. Please try again.' });
      }
    });
    return () => controller.abort();
  }, [token, pathname, reload]);

  if (!token) return <Navigate to="/doctor-login" state={{ sessionMessage }} replace />;
  if (!validation || validation.token !== token || validation.pathname !== pathname) {
    return <p role="status" className="flex min-h-screen items-center justify-center bg-[#f8fffe] p-6 text-sm text-gray-500">Checking your doctor session...</p>;
  }
  if (validation.error) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fffe] p-6">
      <div role="alert" className="max-w-md rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-700">
        <p>{validation.error}</p>
        <button className="mt-4 rounded-xl bg-teal-700 px-5 py-2 text-white" onClick={() => setReload(value => value + 1)}>Retry</button>
      </div>
    </div>
  );
  return <DoctorSessionContext.Provider value={validation.doctor}>{children}</DoctorSessionContext.Provider>;
}
