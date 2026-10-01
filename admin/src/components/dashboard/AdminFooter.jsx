import React from 'react';
import { FaHeartbeat } from 'react-icons/fa';

export default function AdminFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full py-5 px-6 md:px-10 border-t border-gray-100 bg-white">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
          <FaHeartbeat className="text-[#0f766e]" size={13} />
          <span>© {year} <span className="text-[#0f766e] font-bold">Smart Health Connect</span>. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-5">
          {['Privacy Policy', 'Security Policy', 'Support'].map((item) => (
            <a
              key={item}
              href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-[11px] text-gray-400 hover:text-[#0f766e] transition-colors font-semibold uppercase tracking-widest"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
