import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { dailyCounts, monthlyCounts, useDashboardData } from './dashboardData';
export default function GraphCount() {
  const { patients, doctors, appointments } = useDashboardData();
  const months = monthlyCounts(patients, doctors, appointments);
  const days = dailyCounts(appointments, 28);
  const max = Math.max(...days.map(d => d.count), 1);
  return <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
    <section className="min-w-0 rounded-2xl border border-[#e2f4f2] bg-white p-4 sm:p-6">
      <h2 className="font-semibold text-slate-900">Monthly Activity</h2><p className="mt-1 text-xs text-slate-500">New registrations and scheduled appointments over the last six months.</p>
      <div className="mt-6 h-64 min-w-0"><ResponsiveContainer width="100%" height="100%"><AreaChart data={months} margin={{ top: 10, right: 8, left: -25, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />{[{ key: 'patients', color: '#0f766e' }, { key: 'doctors', color: '#14b8a6' }, { key: 'appointments', color: '#6366f1' }].map(({ key, color }) => <Area key={key} type="monotone" dataKey={key} name={key[0].toUpperCase() + key.slice(1)} stroke={color} fill={color} fillOpacity={0.1} />)}</AreaChart></ResponsiveContainer></div>
    </section>
    <section className="min-w-0 rounded-2xl border border-[#e2f4f2] bg-white p-4 sm:p-6">
      <h2 className="font-semibold text-slate-900">Appointment Activity</h2><p className="mt-1 text-xs text-slate-500">Appointments scheduled in the last 28 days.</p><p className="my-5 text-3xl font-bold text-teal-700">{days.reduce((total, day) => total + day.count, 0)}</p>
      <div className="grid grid-cols-7 gap-2">{days.map(day => <div key={day.date} title={day.date + ': ' + day.count + ' appointments'} className="flex aspect-square items-center justify-center rounded-lg text-xs font-semibold" style={{ backgroundColor: day.count ? 'rgba(15,118,110,' + (0.15 + day.count / max * 0.85) + ')' : '#f0fdf9', color: day.count / max > 0.5 ? '#fff' : '#0f766e' }}>{day.count}</div>)}</div><p className="mt-4 text-xs text-slate-400">{days[0].date} to {days[days.length - 1].date}</p>
    </section>
  </div>;
}
