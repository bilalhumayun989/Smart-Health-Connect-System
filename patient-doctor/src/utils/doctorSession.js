export const DOCTOR_SESSION_EVENT = 'doctor-session-changed';

export function clearDoctorSession(expectedToken = localStorage.getItem('doctorToken')) {
  if (localStorage.getItem('doctorToken') !== expectedToken) return false;
  localStorage.removeItem('doctorToken');
  localStorage.removeItem('doctor-id');
  window.dispatchEvent(new Event(DOCTOR_SESSION_EVENT));
  return true;
}
