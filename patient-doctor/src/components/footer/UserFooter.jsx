import React from 'react';
import {
  FaHeartbeat, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaArrowRight,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const footerLinks = {
  quickLinks: [
    { name: 'Home', path: '/' },
    { name: 'Find Doctor', path: '/show-doctor' },
    { name: 'Services', path: '/viewservices' },
    { name: 'Blog', path: '/Blog' },
  ],
  services: [
    'Online Consultation', 'Emergency Care',
    'Health Checkup', 'Medicine Delivery', 'Lab Tests',
  ],
};

const UserFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-[#e2f4f2] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-[#0f766e] rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <FaHeartbeat className="text-white text-base" />
              </div>
              <span className="text-lg font-bold text-[#0f172a] tracking-tight">
                Smart<span className="text-[#0f766e]">Health</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering your health journey with world-class expertise and seamless digital care.
            </p>
            <div className="flex gap-2.5">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-xl bg-[#f0fdf9] border border-[#e2f4f2] flex items-center justify-center text-gray-400 hover:text-[#0f766e] hover:border-[#0f766e]/30 transition-all">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-[#0f172a] uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map(l => (
                <li key={l.name}>
                  <Link to={l.path} className="group flex items-center gap-2 text-sm text-gray-500 hover:text-[#0f766e] transition-colors">
                    <FaArrowRight size={9} className="text-[#0f766e] group-hover:translate-x-1 transition-transform" />
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-[#0f172a] uppercase tracking-wider">Our Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((s, i) => (
                <li key={i}>
                  <a href="#" className="group flex items-center gap-2 text-sm text-gray-500 hover:text-[#0f766e] transition-colors">
                    <FaArrowRight size={9} className="text-[#0f766e] group-hover:translate-x-1 transition-transform" />
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-[#0f172a] uppercase tracking-wider">Contact Us</h3>
            <div className="bg-[#f0fdf9] border border-[#e2f4f2] rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[#0f766e] mb-1">
                <FaPhoneAlt size={11} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Emergency</span>
              </div>
              <p className="text-[#0f172a] font-semibold text-sm">+1 (234) 567-8910</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: FaEnvelope, text: 'support@smarthealth.com' },
                { icon: FaMapMarkerAlt, text: 'Medical City, USA' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-lg bg-[#e8f8f6] flex items-center justify-center text-[#0f766e] flex-shrink-0">
                    <Icon size={12} />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#e2f4f2] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {year} <span className="text-[#0f766e] font-semibold">SmartHealth Connect</span>. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
              <a key={t} href="#" className="text-xs text-gray-400 hover:text-[#0f766e] transition-colors uppercase tracking-wide">
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
