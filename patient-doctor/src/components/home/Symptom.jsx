import React from 'react';
import Marquee from 'react-fast-marquee';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowRight, FaThermometerHalf, FaHeartbeat,
  FaTint, FaBrain, FaEye, FaAllergies,
  FaHeadSideCough, FaTooth, FaRunning,
} from 'react-icons/fa';
import { MdBloodtype, MdOutlineAir, MdPsychology } from 'react-icons/md';

const symptoms = [
  { icon: FaThermometerHalf, name: 'Fever',        color: '#0f766e', bg: '#e8f8f6' },
  { icon: FaHeartbeat,       name: 'Heart Pain',   color: '#0d9488', bg: '#d4f0ec' },
  { icon: MdBloodtype,       name: 'Hypertension', color: '#0f766e', bg: '#e8f8f6' },
  { icon: MdOutlineAir,      name: 'Respiratory',  color: '#0d9488', bg: '#d4f0ec' },
  { icon: FaTint,            name: 'Digestive',    color: '#0f766e', bg: '#e8f8f6' },
  { icon: MdPsychology,      name: 'Anxiety',      color: '#0d9488', bg: '#d4f0ec' },
  { icon: FaBrain,           name: 'Neurological', color: '#0f766e', bg: '#e8f8f6' },
  { icon: FaRunning,         name: 'Joint Pain',   color: '#0d9488', bg: '#d4f0ec' },
  { icon: FaEye,             name: 'Eye Care',     color: '#0f766e', bg: '#e8f8f6' },
  { icon: FaAllergies,       name: 'Allergies',    color: '#0d9488', bg: '#d4f0ec' },
];

const Symptom = () => {
  const navigate = useNavigate();
  const go = () => navigate(localStorage.getItem('token') ? '/show-doctor' : '/patient-login');

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #0f766e 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-[#e8f8f6] text-[#0f766e] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Health Diagnostics
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3">
            Common Symptoms We <span className="text-gradient">Specialize In</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Identify your concern and connect with board-certified experts trained in personalized care.
          </p>
        </motion.div>

        {/* Marquee */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <Marquee speed={36} gradient={false} pauseOnHover>
            {symptoms.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -4 }}
                className="mx-3 bg-white border border-[#e2f4f2] rounded-2xl px-5 py-5 min-w-[140px] shadow-sm hover:shadow-md hover:shadow-[#0f766e]/8 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center gap-3">
                  {/* Icon circle */}
                  <div
                    className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: s.bg, color: s.color }}
                  >
                    <s.icon size={22} />
                  </div>
                  <span className="text-sm font-medium text-[#0f172a] text-center">{s.name}</span>
                </div>
              </motion.div>
            ))}
          </Marquee>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={go}
            className="group inline-flex items-center gap-3 px-8 py-3.5 bg-[#e8f8f6] border border-[#0f766e]/20 hover:bg-[#0f766e] text-[#0f766e] hover:text-white rounded-2xl font-semibold text-sm transition-all duration-200"
          >
            View Specialist Directory
            <div className="w-7 h-7 rounded-lg bg-[#0f766e] group-hover:bg-white flex items-center justify-center transition-all">
              <FaArrowRight size={11} className="text-white group-hover:text-[#0f766e]" />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Symptom;
