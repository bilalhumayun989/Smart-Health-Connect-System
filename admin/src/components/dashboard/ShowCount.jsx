import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
} from "chart.js";
import { FaArrowUp } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/* ── Custom dot area chart (Financial Activity style) ── */
const DotAreaChart = ({ data }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const max = Math.max(...data, 1);
  const height = 120;
  const width = 280;
  const padX = 20;
  const padY = 14;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  const pts = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * usableW,
    y: padY + usableH - (v / max) * usableH,
    v,
  }));

  const pathD = pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${d} C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

  const peak = pts.reduce((a, b) => (b.v > a.v ? b : a));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 130 }}>
      <defs>
        <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
        </linearGradient>
        {/* hatching pattern */}
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#0f766e" strokeWidth="1" strokeOpacity="0.18" />
        </pattern>
      </defs>
      {/* hatched fill */}
      <path d={areaD} fill="url(#hatch)" />
      {/* gradient fill */}
      <path d={areaD} fill="url(#actGrad)" />
      {/* line */}
      <path d={pathD} fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* dots */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#0f766e" strokeWidth="2" />
          <circle cx={p.x} cy={p.y} r="1.5" fill="#0f766e" />
        </g>
      ))}
      {/* peak tooltip */}
      <g>
        <rect x={peak.x - 22} y={peak.y - 28} width={44} height={20} rx={6} fill="#0f766e" />
        <text x={peak.x} y={peak.y - 14} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600">
          {peak.v}
        </text>
      </g>
      {/* day labels */}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={height} textAnchor="middle" fill="#94a3b8" fontSize="9">
          {days[i]}
        </text>
      ))}
    </svg>
  );
};

export default function ShowCount() {
  const [stats, setStats] = useState({
    totalAppointments: 0, totalPatients: 0, totalDoctors: 0,
    weeklyAppointments: [0, 0, 0, 0, 0, 0, 0],
  });

  useEffect(() => {
    (async () => {
      try {
        const [pR, dR, aR] = await Promise.all([
          axios.get("http://192.168.1.8:8000/api/patients/all"),
          axios.get("http://192.168.1.8:8000/api/doctor/all-doctor"),
          axios.get("http://192.168.1.8:8000/api/appointment/all"),
        ]);
        const patients = pR.data || [], doctors = dR.data || [], appointments = aR.data || [];
        const byDay = [0, 0, 0, 0, 0, 0, 0];
        appointments.forEach(a => { if (a.createdAt) byDay[new Date(a.createdAt).getDay()] += 1; });
        setStats({
          totalPatients: patients.length, totalDoctors: doctors.length,
          totalAppointments: appointments.length,
          weeklyAppointments: byDay,
        });
      } catch (e) { console.error(e); }
    })();
  }, []);

  /* ── Line (patient growth) ── */
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Patients',
      data: [3, 5, 7, 9, 12, 14, stats.totalPatients || 14],
      borderColor: '#0f766e',
      backgroundColor: 'rgba(15,118,110,0.08)',
      fill: true, tension: 0.45,
      pointBackgroundColor: '#0f766e',
      pointRadius: 4, pointHoverRadius: 6, borderWidth: 2,
    }],
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } },
      y: { beginAtZero: true, grid: { color: "#f8fafc" }, ticks: { color: "#94a3b8", font: { size: 10 } } },
    },
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-6">

      {/* ── 2 Charts row (Revenue Goal moved to GraphCount right column) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">        {/* ── Card 2: Weekly Appointments (Dot Area / Financial Activity style) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.52 }}
          className="bg-white rounded-2xl border border-[#e2f4f2] p-6 flex flex-col gap-4"
          style={{ boxShadow: '0 4px 24px rgba(15,118,110,0.08)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#0f766e] mb-0.5">Schedule</p>
              <h5 className="text-sm font-semibold text-[#0f172a]">Weekly Appointments</h5>
              <p className="text-xs text-gray-400 mt-0.5">By day of week</p>
            </div>
            <span className="text-[10px] text-gray-400 bg-[#f8fffe] border border-[#e2f4f2] rounded-full px-2 py-0.5">Sun–Sat</span>
          </div>

          {/* Big number */}
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold text-[#0f172a]">
              {stats.weeklyAppointments.reduce((a, b) => a + b, 0)}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#0f766e] bg-[#e8f8f6] rounded-full px-2 py-0.5 mb-1 font-medium">
              <FaArrowUp size={8} /> vs last week
            </span>
          </div>

          {/* Custom dot area chart */}
          <div className="flex-1">
            <DotAreaChart data={stats.weeklyAppointments} />
          </div>

          {/* Day breakdown mini pills */}
          <div className="flex gap-1 flex-wrap">
            {['S','M','T','W','T','F','S'].map((d, i) => {
              const v = stats.weeklyAppointments[i];
              const max = Math.max(...stats.weeklyAppointments, 1);
              const isMax = v === max && max > 0;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-md text-center text-[9px] font-medium py-0.5"
                    style={{
                      backgroundColor: isMax ? '#0f766e' : v > 0 ? '#e8f8f6' : '#f8fafc',
                      color: isMax ? '#fff' : v > 0 ? '#0f766e' : '#cbd5e1',
                    }}
                  >
                    {v}
                  </div>
                  <span className="text-[9px] text-gray-400">{d}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Card 3: Patient Growth (Line) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.59 }}
          className="bg-white rounded-2xl border border-[#e2f4f2] p-6 flex flex-col gap-4"
          style={{ boxShadow: '0 4px 24px rgba(15,118,110,0.08)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#0f766e] mb-0.5">Growth</p>
              <h5 className="text-sm font-semibold text-[#0f172a]">Patient Growth</h5>
              <p className="text-xs text-gray-400 mt-0.5">Jan – Jul trend</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-[#0f766e] bg-[#e8f8f6] px-2 py-0.5 rounded-full font-medium">
              <FaArrowUp size={7} /> +12.5%
            </span>
          </div>

          {/* Big number */}
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold text-[#0f172a]">{stats.totalPatients}</span>
            <span className="text-xs text-gray-400 mb-1">total patients</span>
          </div>

          {/* Line chart */}
          <div className="h-[170px]">
            <Line data={lineData} options={lineOptions} />
          </div>

          {/* Month comparison */}
          <div className="flex items-center justify-between text-[10px]">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul'].map((m, i) => {
              const vals = [3, 5, 7, 9, 12, 14, stats.totalPatients || 14];
              const isLast = i === vals.length - 1;
              return (
                <div key={m} className={`text-center ${isLast ? 'text-[#0f766e] font-semibold' : 'text-gray-400'}`}>
                  <div>{m}</div>
                  <div className={`w-1 h-1 rounded-full mx-auto mt-0.5 ${isLast ? 'bg-[#0f766e]' : 'bg-gray-200'}`} />
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
