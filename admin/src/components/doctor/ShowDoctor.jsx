import { API_URL, doctorName, uploadUrl } from '../../config/api';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaUserMd, FaHospital, FaEnvelope, FaPhone,
  FaIdCard, FaGraduationCap, FaSearch, FaStethoscope,
} from 'react-icons/fa';
import docMale from '../../assets/doctor-placeholder.svg';



export default function ShowDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    axios.get(`${API_URL}/api/doctor/all-doctor`, { signal: controller.signal, timeout: 15000 })
      .then(r => {
        if (!Array.isArray(r.data)) throw new Error('Invalid doctor data');
        setDoctors(r.data);
      })
      .catch(e => { if (!controller.signal.aborted) setError(e.response?.data?.message || 'Unable to load doctors. Check the server connection and retry.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  /* Search the complete directory. */
  const filtered = doctors
    .filter(d => `${d.firstName || ''} ${d.lastName || ''} ${d.specialty || ''} ${d.hospitalAffiliation || ''}`.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="flex flex-col gap-8">

      {/* Header — no animation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0f766e] mb-1">Management</p>
          <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Doctor Directory</h2>
          <p className="text-gray-400 text-sm mt-1">Manage and verify medical professionals in your network.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 bg-white border border-[#e2f4f2] rounded-xl px-4 py-2.5 w-60 focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/10 transition-all">
            <FaSearch className="text-gray-300 text-sm flex-shrink-0" />
            <input
              type="text"
              aria-label="Search doctor directory"
              placeholder="Search doctors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-300 w-full"
            />
          </div>
          <div className="flex items-center gap-2.5 bg-[#e8f8f6] border border-[#0f766e]/15 rounded-xl px-4 py-2.5">
            <FaUserMd className="text-[#0f766e]" size={14} />
            <span className="text-sm font-black text-[#0f766e]">{loading || error ? '—' : doctors.length} Doctors</span>
          </div>
        </div>
      </div>

      {/* Cards Grid — max 3 cards */}
      {loading && <p role="status" className="p-10 text-center text-gray-500">Loading doctors...</p>}
      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}<button className="ml-4 underline" onClick={() => setReload(r => r + 1)}>Retry</button></div>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {!loading && !error && filtered.map((doc) => (
          <div
            key={doc._id}
            className="group bg-white rounded-2xl border border-[#e2f4f2] overflow-hidden hover:shadow-xl hover:shadow-[#0f766e]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            style={{ boxShadow: '0 2px 16px rgba(15,118,110,0.06)' }}
          >
            {/* Full-width doctor image */}
            <div className="h-56 overflow-hidden relative flex-shrink-0">
              <img
                src={uploadUrl(doc.profileImage, 'doctors') || docMale}
                alt={doctorName(doc)}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = docMale; }}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              {/* teal gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 via-transparent to-transparent" />
              {/* specialty badge top-left */}
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#0f766e] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                {doc.specialty || 'Specialty not provided'}
              </span>
              {/* verified badge top-right */}
              <span className="absolute top-3 right-3 bg-[#0f766e] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                <FaGraduationCap size={8} /> {doc.licenseNumber?.startsWith('DEMO-') ? 'Demo profile' : 'Registered'}
              </span>
              {/* name on image bottom */}
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-black text-base leading-tight">
                  {doctorName(doc)}
                </h3>
              </div>
            </div>

            {/* Info */}
            <div className="px-5 py-5 flex-1 flex flex-col gap-3">
              <div className="space-y-2.5">
                {[
                  { icon: FaHospital, value: doc.hospitalAffiliation || 'Hospital not provided' },
                  { icon: FaStethoscope, value: doc.yearsOfExperience != null ? `${doc.yearsOfExperience} yrs experience` : 'Experience not provided' },
                  { icon: FaEnvelope, value: doc.email },
                  { icon: FaPhone, value: doc.phone },
                  { icon: FaIdCard, value: doc.licenseNumber },
                ].map(({ icon: Icon, value }, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#e8f8f6] flex items-center justify-center flex-shrink-0">
                      <Icon size={11} className="text-[#0f766e]" />
                    </span>
                    <span className="min-w-0 break-words text-xs font-semibold text-gray-600">{value || 'Not provided'}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-[#e2f4f2]">
                <button onClick={() => setSelectedDoctor(doc)} className="w-full py-2.5 bg-[#e8f8f6] hover:bg-[#0f766e] text-[#0f766e] hover:text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border border-[#e2f4f2] rounded-2xl p-16 text-center">
          <FaUserMd className="mx-auto text-[#b2e0da] mb-4" size={40} />
          <p className="text-gray-400 font-bold text-sm">No doctors found.</p>
        </div>
      )}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setSelectedDoctor(null)}>
          <section role="dialog" aria-modal="true" aria-label="Doctor profile" className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold">{doctorName(selectedDoctor)}</h3>
              <button autoFocus onClick={() => setSelectedDoctor(null)} aria-label="Close profile">Close</button>
            </div>
            <p className="mt-2 text-teal-700">{selectedDoctor.specialty || 'Specialty not provided'}</p>
            <p className="mt-5 whitespace-pre-wrap break-words text-gray-600">{selectedDoctor.bio || 'No biography provided.'}</p>
            <dl className="mt-5 space-y-3 text-sm">
              {Object.entries({ Email: selectedDoctor.email, Phone: selectedDoctor.phone, Hospital: selectedDoctor.hospitalAffiliation, License: selectedDoctor.licenseNumber, Experience: selectedDoctor.yearsOfExperience != null ? `${selectedDoctor.yearsOfExperience} years` : null }).map(([label, value]) => <div key={label} className="grid grid-cols-[90px_1fr] gap-3"><dt className="font-semibold">{label}</dt><dd className="min-w-0 break-words">{value || 'Not provided'}</dd></div>)}
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}
