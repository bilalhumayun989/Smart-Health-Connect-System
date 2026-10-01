import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaUserMd, FaHospital, FaEnvelope, FaPhone,
  FaIdCard, FaGraduationCap, FaSearch, FaStethoscope,
} from 'react-icons/fa';
import docMale from '../../assets/doc-male.jpg';
import docFemale from '../../assets/doc-female.avif';

const API_URL = import.meta.env.VITE_API_URL;

/* index 0,2 → male  |  index 1 → female */
const getAvatar = (index) => (index === 1 ? docFemale : docMale);

export default function ShowDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/doctor/all-doctor`)
      .then(r => setDoctors(r.data))
      .catch(e => console.error(e));
  }, []);

  /* only 1, filtered by search */
  const filtered = doctors
    .filter(d => `${d.firstName} ${d.lastName} ${d.specialty}`.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 1);

  return (
    <div className="flex flex-col gap-8">

      {/* Header — no animation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0f766e] mb-1">Management</p>
          <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Doctor Directory</h2>
          <p className="text-gray-400 text-sm mt-1">Manage and verify medical professionals in your network.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#e2f4f2] rounded-xl px-4 py-2.5 w-60 focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/10 transition-all">
            <FaSearch className="text-gray-300 text-sm flex-shrink-0" />
            <input
              type="text"
              placeholder="Search doctors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-300 w-full"
            />
          </div>
          <div className="flex items-center gap-2.5 bg-[#e8f8f6] border border-[#0f766e]/15 rounded-xl px-4 py-2.5">
            <FaUserMd className="text-[#0f766e]" size={14} />
            <span className="text-sm font-black text-[#0f766e]">{doctors.length} Doctors</span>
          </div>
        </div>
      </div>

      {/* Cards Grid — max 3 cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((doc, i) => (
          <div
            key={doc._id}
            className="group bg-white rounded-2xl border border-[#e2f4f2] overflow-hidden hover:shadow-xl hover:shadow-[#0f766e]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            style={{ boxShadow: '0 2px 16px rgba(15,118,110,0.06)' }}
          >
            {/* Full-width doctor image */}
            <div className="h-56 overflow-hidden relative flex-shrink-0">
              <img
                src={getAvatar(i)}
                alt={`Dr. ${doc.firstName} ${doc.lastName}`}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              {/* teal gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 via-transparent to-transparent" />
              {/* specialty badge top-left */}
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#0f766e] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                {doc.specialty}
              </span>
              {/* verified badge top-right */}
              <span className="absolute top-3 right-3 bg-[#0f766e] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                <FaGraduationCap size={8} /> Verified
              </span>
              {/* name on image bottom */}
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-black text-base leading-tight">
                  Dr. {doc.firstName} {doc.lastName}
                </h3>
              </div>
            </div>

            {/* Info */}
            <div className="px-5 py-5 flex-1 flex flex-col gap-3">
              <div className="space-y-2.5">
                {[
                  { icon: FaHospital, value: doc.hospitalAffiliation || 'General Hospital' },
                  { icon: FaStethoscope, value: `${doc.yearsOfExperience} yrs experience` },
                  { icon: FaEnvelope, value: doc.email },
                  { icon: FaPhone, value: doc.phone },
                  { icon: FaIdCard, value: doc.licenseNumber },
                ].map(({ icon: Icon, value }, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#e8f8f6] flex items-center justify-center flex-shrink-0">
                      <Icon size={11} className="text-[#0f766e]" />
                    </span>
                    <span className="text-xs font-semibold text-gray-600 truncate">{value}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-[#e2f4f2]">
                <button className="w-full py-2.5 bg-[#e8f8f6] hover:bg-[#0f766e] text-[#0f766e] hover:text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border border-[#e2f4f2] rounded-2xl p-16 text-center">
          <FaUserMd className="mx-auto text-[#b2e0da] mb-4" size={40} />
          <p className="text-gray-400 font-bold text-sm">No doctors found.</p>
        </div>
      )}
    </div>
  );
}
