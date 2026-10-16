import { createContext, useContext } from 'react';
export const DashboardContext = createContext(null);
export const useDashboardData = () => useContext(DashboardContext);
export function localDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
export function monthlyCounts(patients, doctors, appointments, now = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const count = (items, field) => items.filter(item => {
      const raw = item[field];
      const date = typeof raw === 'string' && raw.length === 10 ? new Date(raw + 'T00:00:00') : new Date(raw);
      return date >= start && date < end;
    }).length;
    return { month: start.toLocaleDateString('en', { month: 'short', year: '2-digit' }), patients: count(patients, 'createdAt'), doctors: count(doctors, 'createdAt'), appointments: count(appointments, 'appointmentDate') };
  });
}
export function dailyCounts(appointments, length, now = new Date()) {
  return Array.from({ length }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - length + 1 + i);
    const key = localDateKey(date);
    return { date: key, day: date.toLocaleDateString('en', { weekday: 'short' }), count: appointments.filter(a => a.appointmentDate?.slice(0, 10) === key).length };
  });
}
