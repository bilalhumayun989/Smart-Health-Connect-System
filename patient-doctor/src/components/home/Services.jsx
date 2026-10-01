import React from 'react';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaCalendarCheck, FaUserMd, FaClinicMedical } from 'react-icons/fa';
import herobanner from '../../assets/Hero_Banner.png';
import doctor2 from '../../assets/doctor2.jpg';

const services = [
  { icon: FaHeartbeat, title: 'Preventive Care', desc: 'Next-gen diagnostics and regular health tracking to detect issues early.' },
  { icon: FaCalendarCheck, title: 'Smart Scheduling', desc: 'Frictionless 24/7 booking system synchronized with your lifestyle.' },
  { icon: FaUserMd, title: 'Vetted Experts', desc: 'Connect with board-certified physicians and global specialists.' },
  { icon: FaClinicMedical, title: 'Digital Ecosystem', desc: 'State-of-the-art virtual care for precise remote diagnosis.' },
];

const Services = () => (
  <section className="bg-white py-20 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-[#0f766e]/4 rounded-full blur-[120px] pointer-events-none" />

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="flex flex-col lg:flex-row items-center gap-16">

        {/* Left — services */}
        <div className="lg:w-1/2 space-y-10 order-2 lg:order-1">
          <div>
            <span className="inline-block bg-[#e8f8f6] text-[#0f766e] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Service Architecture
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] leading-tight">
              Modern Healthcare <br />
              <span className="text-gradient">Infrastructure</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {services.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white border border-[#e2f4f2] rounded-2xl p-6 hover:shadow-lg hover:shadow-[#0f766e]/8 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#e8f8f6] flex items-center justify-center text-[#0f766e] mb-4 group-hover:bg-[#0f766e] group-hover:text-white transition-all duration-300">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-semibold text-[#0f172a] mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Quote card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-[#0f766e] rounded-2xl p-6 flex items-center gap-5 shadow-lg shadow-[#0f766e]/20"
          >
            <img src={doctor2} alt="CMO" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 ring-2 ring-white/20" />
            <div>
              <p className="text-white/90 text-sm leading-relaxed italic mb-2">
                "Precision medicine is the frontier of longevity. We map your future health."
              </p>
              <p className="text-[#99f6e4] text-[10px] font-semibold uppercase tracking-wider">
                Dr. Sarah Johnson · Chief Medical Officer
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right — image */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="lg:w-1/2 order-1 lg:order-2"
        >
          <div className="relative rounded-3xl overflow-hidden border border-[#e2f4f2] shadow-2xl shadow-[#0f766e]/10">
            <img src={herobanner} alt="Clinical Excellence" className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f766e]/30 via-transparent to-transparent" />
            <div className="absolute bottom-6 right-6 bg-[#0f766e] rounded-2xl px-5 py-3 shadow-xl">
              <p className="text-2xl font-bold text-white text-center">10K+</p>
              <p className="text-[9px] font-semibold text-white/70 uppercase tracking-wider text-center">Global Patients</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default Services;
