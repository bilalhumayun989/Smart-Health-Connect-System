import React from 'react';
import { FaSearch, FaBell, FaCog } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AdminNavbar() {
  return (
    <nav
      className="sticky top-0 z-30 w-full bg-white border-b border-gray-100 px-6 md:px-10 flex items-center justify-between"
      style={{ height: '4rem', boxShadow: '0 1px 10px rgba(15,118,110,0.05)' }}
    >
      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-64 focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/10 transition-all">
        <FaSearch className="text-gray-300 text-xs flex-shrink-0" />
        <input
          type="text"
          placeholder="Search doctors, patients…"
          className="bg-transparent outline-none text-sm w-full text-gray-600 placeholder-gray-300"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 md:gap-2.5 ml-auto">
        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          className="relative p-2.5 text-gray-400 hover:text-[#0f766e] hover:bg-[#e8f8f6] rounded-xl transition-all"
        >
          <FaBell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-400 rounded-full" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.06, rotate: 45 }} whileTap={{ scale: 0.95 }}
          className="p-2.5 text-gray-400 hover:text-[#0f766e] hover:bg-[#e8f8f6] rounded-xl transition-all"
        >
          <FaCog size={16} />
        </motion.button>

        <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block" />

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-medium text-gray-700 group-hover:text-[#0f766e] transition-colors leading-tight">
              Mathew Anderson
            </p>
            <p className="text-[10px] text-[#0f766e]">Super Admin</p>
          </div>
          <div className="relative">
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="Profile"
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#0f766e]/20 group-hover:ring-[#0f766e]/40 transition-all"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
        </div>
      </div>
    </nav>
  );
}
