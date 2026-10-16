import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { dailyCounts, useDashboardData } from './dashboardData';
export default function ShowCount() {
  const { appointments } = useDashboardData();
  const days = dailyCounts(appointments, 7);
  const upcoming = appointments.filter(a => new Date(a.appointmentDate + 'T' + a.appointmentTime) >= new Date()).sort((a, b) => (a.appointmentDate + 'T' + a.appointmentTime).localeCompare(b.appointmentDate + 'T' + b.appointmentTime));
  return <div className="grid min-w-0 gap-6 lg:grid-cols-2">
    <section className="min-w-0 rounded-2xl border border-[#e2f4f2] bg-white p-4 sm:p-6"><h2 className="font-semibold">Last Seven Days</h2><p className="mt-1 text-xs text-slate-500">Appointments by scheduled date.</p><div className="mt-5 h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={days} margin={{ left: -25 }}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload.date || ''} /><Bar dataKey="count" name="Appointments" fill="#0f766e" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></section>
    <section className="min-w-0 rounded-2xl border border-[#e2f4f2] bg-white p-4 sm:p-6"><h2 className="font-semibold">Upcoming Appointments</h2><p className="mt-1 text-xs text-slate-500">{upcoming.length} future appointments scheduled.</p><div className="mt-5 divide-y divide-teal-50">{upcoming.slice(0, 5).map(a => <div key={a._id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><div className="min-w-0"><p className="break-words font-medium">{a.patientName}</p><p className="break-words text-xs text-slate-500">{a.doctorName}</p></div><p className="text-xs text-teal-700">{a.appointmentDate?.slice(0, 10)} ? {a.appointmentTime}</p></div>)}{!upcoming.length && <p className="py-8 text-sm text-slate-500">No upcoming appointments.</p>}</div></section>
  </div>;
}
