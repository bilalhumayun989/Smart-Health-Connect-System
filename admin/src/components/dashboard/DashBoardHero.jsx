import React, { useState, useEffect, Suspense } from 'react';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from '@react-three/drei';
import {
  FaUserInjured, FaUserMd, FaCalendarAlt, FaArrowUp,
  FaClock, FaHeartbeat, FaChartLine, FaStethoscope,
} from 'react-icons/fa';

/* ── 3D sphere ── */
function Scene3D() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={1.2} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#0f766e" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#14b8a6" />
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.8}>
        <Sphere args={[1, 64, 64]} scale={1.7}>
          <MeshDistortMaterial color="#0d9488" speed={3} distort={0.35} radius={1} />
        </Sphere>
      </Float>
    </>
  );
}

/* ── Animated Counter ── */
const AnimatedNumber = ({ value, duration = 1800, suffix = '' }) => {
  const [cur, setCur] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  useEffect(() => {
    if (!inView) return;
    const target = parseFloat(value) || 0;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setCur(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else setCur(target);
    };
    requestAnimationFrame(step);
  }, [inView, value, duration]);
  return <span ref={ref}>{Number(cur).toLocaleString()}{suffix}</span>;
};

/* ── Stat Card — no animation ── */
const StatCard = ({ title, value, description, icon: Icon, trend, suffix = '' }) => (
  <div
    className="relative bg-white rounded-2xl border border-[#e2f4f2] cursor-default overflow-hidden group h-[160px] flex flex-col justify-between p-5"
    style={{ boxShadow: '0 4px 20px rgba(15,118,110,0.07)' }}
  >
    <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-[#0f766e] opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />

    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-[#e8f8f6] flex items-center justify-center text-[#0f766e] flex-shrink-0 shadow-sm">
        <Icon size={17} />
      </div>
      <span className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#e8f8f6] text-[#0f766e]">
        <FaArrowUp size={7} />
        {trend}
      </span>
    </div>

    <h2 className="text-3xl font-semibold text-[#0f172a] tracking-tight leading-none">
      <AnimatedNumber value={value} suffix={suffix} />
    </h2>

    <div>
      <p className="text-xs font-medium text-[#0f766e] mb-0.5">{title}</p>
      <p className="text-[11px] text-gray-400 leading-snug line-clamp-1">{description}</p>
    </div>

    <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 rounded-b-2xl bg-gradient-to-r from-[#0f766e] to-[#14b8a6]" />
  </div>
);

export default function DashBoardHero() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [p, d, a] = await Promise.all([
          axios.get('http://192.168.1.8:8000/api/patients/all'),
          axios.get('http://192.168.1.8:8000/api/doctor/all-doctor'),
          axios.get('http://192.168.1.8:8000/api/appointment/all'),
        ]);
        setStats({
          patients: p.data?.length || 0,
          doctors: d.data?.length || 0,
          appointments: a.data?.length || 0,
        });
      } catch (e) {
        console.error('Dashboard data error:', e);
      }
    })();
  }, []);

  const cards = [
    { title: 'Total Patients', value: stats.patients, description: 'Registered across all departments.', icon: FaUserInjured, trend: '+12.5%' },
    { title: 'Active Doctors', value: stats.doctors, description: 'Professionals on the platform.', icon: FaUserMd, trend: '+8.3%' },
    { title: 'Appointments', value: stats.appointments, description: 'Consultations scheduled and managed.', icon: FaCalendarAlt, trend: '+5.1%' },
    { title: 'Avg. Wait Time', value: 14, suffix: ' min', description: 'Average consultation wait time.', icon: FaClock, trend: '-3.2%' },
  ];

  return (
    <div>
      {/* Welcome card — no animation */}
      <div
        className="bg-white rounded-2xl border border-[#e2f4f2] overflow-hidden relative mb-5"
        style={{ boxShadow: '0 4px 24px rgba(15,118,110,0.08)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-full hidden lg:block pointer-events-none opacity-40">
          <Canvas>
            <Suspense fallback={null}><Scene3D /></Suspense>
          </Canvas>
        </div>

        <div className="p-6 md:p-7 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Admin"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#0f766e]/15 shadow"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#14b8a6] rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#0f766e] mb-0.5">Admin Panel</p>
              <h2 className="text-lg font-semibold text-[#0f172a] leading-tight">Welcome Back, Mathew!</h2>
              <p className="text-gray-400 text-xs mt-0.5">Super Admin · Smart Health Connect</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {[
              { icon: FaStethoscope, val: '99.9%', sub: 'Uptime' },
              { icon: FaChartLine, val: '+12.5%', sub: 'Growth' },
              { icon: FaHeartbeat, val: '4.9/5', sub: 'Rating' },
            ].map(({ icon: Icon, val, sub }, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-[#f0fdf9] border border-[#e2f4f2] rounded-xl px-4 py-2.5"
              >
                <Icon size={12} className="text-[#0f766e]" />
                <div>
                  <p className="text-sm font-semibold text-[#0f172a] leading-none">{val}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards — no animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
