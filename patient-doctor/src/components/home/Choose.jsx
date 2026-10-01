import React from 'react';
import { motion } from 'framer-motion';
import chooseImg from '../../assets/medical2.jpeg';
import { FaShieldAlt, FaClock, FaUserMd, FaMobileAlt, FaChartLine } from 'react-icons/fa';

const features = [
  { icon: FaShieldAlt, title: 'Trusted Care', desc: 'Board-certified physicians with proven expertise.' },
  { icon: FaClock, title: 'Quick Access', desc: 'Same-day appointments for urgent health concerns.' },
  { icon: FaUserMd, title: 'Personalized', desc: 'Treatment plans tailored to your unique needs.' },
  { icon: FaMobileAlt, title: 'Digital First', desc: 'Easy online booking and digital health records.' },
  { icon: FaChartLine, title: 'Proven Results', desc: 'Evidence-based treatments with measurable outcomes.' },
];

const Choose = () => (
  <section className="bg-white py-20">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row items-center gap-14">

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="lg:w-1/2"
        >
          <img src={chooseImg} alt="Quality Healthcare"
            className="rounded-3xl w-full h-80 object-cover border border-[#e2f4f2] shadow-lg shadow-[#0f766e]/8" />
        </motion.div>

        {/* Content */}
        <div className="lg:w-1/2 space-y-8">
          <div>
            <span className="inline-block bg-[#e8f8f6] text-[#0f766e] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Why Choose Us
            </span>
            <h2 className="text-3xl font-bold text-[#0f172a]">
              Why Choose Our <span className="text-gradient">Health Services</span>
            </h2>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              We're committed to exceptional healthcare that puts your well-being first.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-[#e2f4f2] rounded-2xl p-5 hover:shadow-md hover:shadow-[#0f766e]/8 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e8f8f6] flex items-center justify-center text-[#0f766e] flex-shrink-0">
                    <Icon size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0f172a] mb-0.5">{title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Choose;
