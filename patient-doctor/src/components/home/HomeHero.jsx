import React from 'react';
import { motion } from 'framer-motion';
import heroimg from '../../assets/Header-image.png';
import { FaCalendarAlt, FaUserMd, FaShieldAlt, FaClock, FaHeartbeat, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HomeHero = () => {
  const navigate = useNavigate();

  const goBook = () => navigate(localStorage.getItem('token') ? '/show-doctor' : '/patient-login');

  return (
    <section className="relative min-h-screen flex items-start pt-20 pb-16 overflow-hidden bg-white">
      {/* Soft teal blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#0f766e]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[#14b8a6]/6 rounded-full blur-[100px] pointer-events-none" />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #0f766e 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* Left */}
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#e8f8f6] border border-[#0f766e]/15 rounded-full"
            >
              <span className="w-2 h-2 rounded-full bg-[#0f766e] animate-pulse" />
              <span className="text-xs font-semibold text-[#0f766e] uppercase tracking-widest">Next-Gen Healthcare</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-[#0f172a] leading-[1.1] tracking-tight"
            >
              Your Health Journey <br />
              <span className="text-gradient">Redefined</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-500 text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Connect with world-class specialists and experience seamless digital healthcare — all in one platform.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3"
            >
              <button onClick={goBook}
                className="group flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#0f766e] hover:bg-[#0d9488] text-white rounded-2xl font-semibold text-base shadow-lg shadow-[#0f766e]/25 hover:-translate-y-0.5 transition-all">
                <FaCalendarAlt size={14} />
                Book Appointment
                <FaArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/Blog')}
                className="flex items-center justify-center gap-2 px-7 py-3.5 border border-[#e2f4f2] bg-white text-gray-600 hover:border-[#0f766e] hover:text-[#0f766e] rounded-2xl font-semibold text-base transition-all">
                Learn More
              </button>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4 border-t border-[#e2f4f2]"
            >
              {[
                { icon: FaShieldAlt, label: 'Secure & Private' },
                { icon: FaClock, label: '24/7 Access' },
                { icon: FaUserMd, label: 'Top Specialists' },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[#f0fdf9] border border-[#e2f4f2] rounded-full text-xs font-medium text-[#0f766e]">
                  <Icon size={11} />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10">
              <img src={heroimg} alt="Medical Care" className="w-full h-auto object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
