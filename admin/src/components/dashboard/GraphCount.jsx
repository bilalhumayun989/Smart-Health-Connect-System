import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip as CTooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Filler,
} from 'chart.js';
import { motion } from 'framer-motion';
import {
  FaUsers, FaUserMd, FaCalendarCheck,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';

ChartJS.register(ArcElement, CTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const PALETTE = {
  patients:     { main: '#0f766e', light: '#e8f8f6', label: 'Patients',     icon: FaUsers },
  doctors:      { main: '#0d9488', light: '#d4f0ec', label: 'Doctors',      icon: FaUserMd },
  appointments: { main: '#14b8a6', light: '#ccede9', label: 'Appointments', icon: FaCalendarCheck },
};

/* Monthly trend data */
const monthlyData = [
  { month: 'Jan', patients: 18, doctors: 3, appointments: 22 },
  { month: 'Feb', patients: 22, doctors: 4, appointments: 28 },
  { month: 'Mar', patients: 19, doctors: 4, appointments: 25 },
  { month: 'Apr', patients: 27, doctors: 5, appointments: 34 },
  { month: 'May', patients: 31, doctors: 5, appointments: 38 },
  { month: 'Jun', patients: 26, doctors: 6, appointments: 30 },
  { month: 'Jul', patients: 35, doctors: 6, appointments: 42 },
];

/* ── Heatmap helpers ── */
const HEATMAP_COLS = 28; // 4 weeks × 7 days
const HEATMAP_ROWS = 5;  // 5 rows (weeks)

// Seeded pseudo-random — stable across renders, no flicker
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function buildHeatmapGrid(appointments) {
  const rand = seededRand(42);
  const grid = Array.from({ length: HEATMAP_ROWS }, () =>
    Array.from({ length: HEATMAP_COLS }, () => 0)
  );
  for (let col = 0; col < HEATMAP_COLS; col++) {
    const dayIdx = col % 7;
    const base = appointments[dayIdx] || 0;
    // Mix real data with random noise so grid always looks populated
    const noise = Math.floor(rand() * 9); // 0–8
    const count = base > 0 ? base + Math.floor(rand() * 5) : noise;
    for (let row = 0; row < HEATMAP_ROWS; row++) {
      const rowVariance = Math.floor(rand() * 4); // 0–3 per cell
      grid[row][col] = Math.max(0, count - row + rowVariance);
    }
  }
  return grid;
}

// Day letters — show S at start of each week column
const DAY_LETTERS = ['S','M','T','W','T','F','S'];

function getHeatColor(val, max) {
  if (max === 0 || val === 0) return { bg: '#f0fdf9', border: '#e2f4f2' };
  const ratio = val / max;
  if (ratio >= 0.80) return { bg: '#0f766e', border: '#0d6560' };
  if (ratio >= 0.60) return { bg: '#14b8a6', border: '#0d9488' };
  if (ratio >= 0.38) return { bg: '#5eead4', border: '#2dd4bf' };
  if (ratio >= 0.18) return { bg: '#99f6e4', border: '#5eead4' };
  return { bg: '#ccfbf1', border: '#99f6e4' };
}

/* ── Mini Calendar (compact, fixed size, no stretch) ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function MiniCalendar() {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const daysInPrev = new Date(current.year, current.month, 0).getDate();

  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, type: 'prev' });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: 'cur' });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, type: 'next' });

  const isToday = (cell) =>
    cell.type === 'cur' &&
    cell.day === today.getDate() &&
    current.month === today.getMonth() &&
    current.year === today.getFullYear();

  const prevMonth = () => setCurrent(c => ({
    month: c.month === 0 ? 11 : c.month - 1,
    year: c.month === 0 ? c.year - 1 : c.year,
  }));
  const nextMonth = () => setCurrent(c => ({
    month: c.month === 11 ? 0 : c.month + 1,
    year: c.month === 11 ? c.year + 1 : c.year,
  }));

  const eventDays = [3, 7, 12, 15, 19, 24, 28];

  return (
    /* key: self-start prevents this column from stretching to match sibling height */
    <div
      className="bg-white rounded-2xl border border-[#e2f4f2] p-4 self-start"
      style={{ width: 272, boxShadow: '0 4px 24px rgba(15,118,110,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#0f766e] mb-0.5">Schedule</p>
          <p className="text-sm font-semibold text-[#0f172a]">
            {MONTHS[current.month]} {current.year}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth}
            className="w-7 h-7 rounded-lg border border-[#e2f4f2] flex items-center justify-center text-[#0f766e] hover:bg-[#e8f8f6] transition-colors">
            <FaChevronLeft size={9} />
          </button>
          <button onClick={nextMonth}
            className="w-7 h-7 rounded-lg border border-[#e2f4f2] flex items-center justify-center text-[#0f766e] hover:bg-[#e8f8f6] transition-colors">
            <FaChevronRight size={9} />
          </button>
        </div>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[9px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Date cells — fixed w-8 h-8, centred in each column slot */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const td = isToday(cell);
          const hasEvent = cell.type === 'cur' && eventDays.includes(cell.day);
          return (
            <div key={i} className="flex items-center justify-center py-0.5">
              <div
                className={`
                  relative w-7 h-7 flex items-center justify-center rounded-lg
                  text-[11px] font-medium cursor-pointer select-none transition-all
                  ${cell.type !== 'cur'
                    ? 'text-gray-300'
                    : td
                      ? 'bg-[#0f766e] text-white shadow'
                      : 'text-[#0f172a] hover:bg-[#e8f8f6] hover:text-[#0f766e]'}
                `}
              >
                {cell.day}
                {hasEvent && (
                  <span
                    className={`absolute bottom-0.5 w-1 h-1 rounded-full ${td ? 'bg-white/60' : 'bg-[#14b8a6]'}`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#f0faf9]">
        <span className="w-2 h-2 rounded-full bg-[#0f766e] flex-shrink-0" />
        <span className="text-[10px] text-gray-400">Today</span>
        <span className="w-2 h-2 rounded-full bg-[#14b8a6] flex-shrink-0 ml-2" />
        <span className="text-[10px] text-gray-400">Has appointment</span>
      </div>
    </div>
  );
}

/* ── Revenue Goal Card ── */
function RevenueGoalCard({ revenue = 0 }) {
  const pct = Math.min(Math.round((revenue / 100000) * 100), 100);
  const doughnutData = {
    labels: ['Earned', 'Remaining'],
    datasets: [{
      data: [revenue, Math.max(10, 100000 - revenue)],
      backgroundColor: ['#0f766e', '#f0fdf9'],
      borderWidth: 0, hoverOffset: 8, borderRadius: 16,
    }],
  };
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ₹${Number(ctx.parsed).toLocaleString()}` } },
    },
  };

  return (
    <div
      className="bg-white rounded-2xl border border-[#e2f4f2] p-4 flex flex-col gap-3"
      style={{ boxShadow: '0 4px 24px rgba(15,118,110,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#0f766e] mb-0.5">Finance</p>
          <p className="text-sm font-semibold text-[#0f172a]">Revenue Goal</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Monthly target tracker</p>
        </div>
        <span className="bg-[#e8f8f6] text-[#0f766e] px-2 py-0.5 rounded-full text-[10px] font-semibold">{pct}%</span>
      </div>

      {/* Donut */}
      <div className="relative h-[130px] flex items-center justify-center">
        <Doughnut data={doughnutData} options={doughnutOptions} />
        <div className="absolute flex flex-col items-center pointer-events-none">
          <span className="text-xl font-semibold text-[#0f172a]">{pct}%</span>
          <span className="text-[9px] text-gray-400">of ₹1L goal</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-[9px] text-gray-400 mb-1">
          <span>Progress</span><span>{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#f0fdf9] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #0f766e, #14b8a6)' }}
          />
        </div>
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-between bg-[#f8fffe] rounded-xl px-3 py-2.5">
        <div className="text-center">
          <p className="text-xs font-semibold text-[#0f766e]">₹{revenue.toLocaleString()}</p>
          <p className="text-[9px] text-gray-400">Earned</p>
        </div>
        <div className="w-px h-7 bg-[#e2f4f2]" />
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400">₹{Math.max(0, 100000 - revenue).toLocaleString()}</p>
          <p className="text-[9px] text-gray-400">Remaining</p>
        </div>
      </div>
    </div>
  );
}

/* ── Area tooltip ── */
const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#e2f4f2] p-3 text-xs">
      <p className="text-gray-400 mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function GraphCount() {
  const [counts, setCounts] = useState({ patients: 0, doctors: 0, appointments: 0 });
  const [weekly, setWeekly] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [p, d, a] = await Promise.all([
          axios.get('http://192.168.1.8:8000/api/patients/all'),
          axios.get('http://192.168.1.8:8000/api/doctor/all-doctor'),
          axios.get('http://192.168.1.8:8000/api/appointment/all'),
        ]);
        const appointments = a.data || [];
        const byDay = [0, 0, 0, 0, 0, 0, 0];
        appointments.forEach(ap => { if (ap.createdAt) byDay[new Date(ap.createdAt).getDay()] += 1; });
        setCounts({
          patients: p.data?.length || 0,
          doctors: d.data?.length || 0,
          appointments: appointments.length,
        });
        setWeekly(byDay);
        setRevenue(appointments.length * 500);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const heatGrid = buildHeatmapGrid(weekly);
  const heatMax = Math.max(...weekly, 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.28 }}
      className="w-full mb-7"
    >
      {/* ── Two-column layout: Overview left, Calendar right (self-start prevents stretch) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_272px] gap-6 items-start">

        {/* ── LEFT: System Overview ── */}
        <div className="bg-white rounded-2xl border border-[#e2f4f2] overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(15,118,110,0.08)' }}>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pt-6 pb-4 border-b border-[#f0faf9]">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#0f766e] mb-0.5">Analytics</p>
              <h4 className="text-base font-semibold text-[#0f172a]">System Overview</h4>
              <p className="text-xs text-gray-400 mt-0.5">Live counts + monthly trend</p>
            </div>
          </div>

          {/* ── KPI cards strip ── */}
          <div className="grid grid-cols-3 divide-x divide-[#f0faf9] border-b border-[#f0faf9]">
            {Object.values(PALETTE).map(({ main, light, label, icon: Icon }, i) => {
              const val = i === 0 ? counts.patients : i === 1 ? counts.doctors : counts.appointments;
              return (
                <div key={label} className="flex items-center gap-3 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: light, color: main }}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-xl font-semibold leading-none" style={{ color: main }}>{val}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Heatmap activity grid ── */}
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#0f172a]">Appointment Activity</p>
              <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
                <span>Less</span>
                {['#ccfbf1','#99f6e4','#5eead4','#14b8a6','#0f766e'].map((bg, i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-[3px] inline-block" style={{ backgroundColor: bg }} />
                ))}
                <span>More</span>
              </div>
            </div>

            {/* Day letters across 28 cols — show every 7th label */}
            <div className="flex gap-[3px] mb-1">
              {Array.from({ length: HEATMAP_COLS }, (_, ci) => (
                <div
                  key={ci}
                  className="text-center text-[8px] text-gray-400 font-medium"
                  style={{ flex: '0 0 calc((100% - 27 * 3px) / 28)' }}
                >
                  {ci % 7 === 0 ? DAY_LETTERS[ci % 7] : ''}
                </div>
              ))}
            </div>

            {/* Grid rows — 5 rows × 28 small boxes */}
            <div className="flex flex-col gap-[3px]">
              {heatGrid.map((row, ri) => (
                <motion.div
                  key={ri}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + ri * 0.05 }}
                  className="flex gap-[3px]"
                >
                  {row.map((val, ci) => {
                    const { bg, border } = getHeatColor(val, heatMax);
                    const dayName = days[ci % 7];
                    return (
                      <div
                        key={ci}
                        title={`${dayName} (day ${ci + 1}): ${val}`}
                        className="rounded-[3px] transition-transform hover:scale-125 cursor-pointer relative group"
                        style={{
                          flex: '0 0 calc((100% - 27 * 3px) / 28)',
                          aspectRatio: '1 / 1',
                          backgroundColor: bg,
                          border: `1px solid ${border}`,
                        }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[8px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                          {dayName}: {val}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </div>

            {/* Week markers below */}
            <div className="flex mt-2 gap-[3px]">
              {Array.from({ length: 4 }, (_, wi) => (
                <div
                  key={wi}
                  className="text-[8px] text-gray-300 font-medium"
                  style={{ flex: '0 0 calc((100% - 27 * 3px) / 28 * 7 + 6 * 3px)', textAlign: 'center' }}
                >
                  W{wi + 1}
                </div>
              ))}
            </div>
          </div>

          {/* ── Area chart ── */}
          <div className="px-6 pb-6 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#0f172a]">Monthly Trend</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                {Object.values(PALETTE).map(({ main, label }) => (
                  <span key={label} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: main }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    {Object.values(PALETTE).map(({ main, label }) => (
                      <linearGradient key={label} id={`ag-${label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={main} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={main} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip content={<AreaTooltip />} />
                  {Object.values(PALETTE).map(({ main, label }) => (
                    <Area key={label} type="monotone" dataKey={label.toLowerCase()}
                      name={label} stroke={main} strokeWidth={2}
                      fill={`url(#ag-${label})`}
                      dot={{ r: 3, fill: main, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: main }} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── RIGHT column: Calendar + Revenue Goal stacked ── */}
        <div className="flex flex-col gap-4 self-start" style={{ width: 272 }}>

          {/* ── Mini Calendar ── */}
          <MiniCalendar />

          {/* ── Revenue Goal card ── */}
          <RevenueGoalCard revenue={revenue} />

        </div>
      </div>
    </motion.div>
  );
}
