import { FaUserInjured, FaUserMd, FaCalendarAlt } from 'react-icons/fa';
import { useDashboardData } from './dashboardData';
export default function DashBoardHero() {
  const { patients, doctors, appointments } = useDashboardData();
  const cards = [
    { title: 'Registered Patients', value: patients.length, icon: FaUserInjured },
    { title: 'Registered Doctors', value: doctors.length, icon: FaUserMd },
    { title: 'Total Appointments', value: appointments.length, icon: FaCalendarAlt },
  ];
  return <section className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Admin Panel</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Healthcare Overview</h1><p className="mt-2 text-sm text-slate-500">Current records across your healthcare network.</p></div>
    <div className="grid gap-5 sm:grid-cols-3">{cards.map(({ title, value, icon: Icon }) => <div key={title} className="flex min-w-0 items-center gap-4 rounded-2xl border border-[#e2f4f2] bg-white p-5 shadow-sm"><div className="shrink-0 rounded-xl bg-teal-50 p-3 text-teal-700"><Icon size={22} /></div><div className="min-w-0"><p className="text-3xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{title}</p></div></div>)}</div>
  </section>;
}
