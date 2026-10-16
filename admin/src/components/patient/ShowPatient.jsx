import { API_URL, uploadUrl } from '../../config/api';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserInjured, FaEnvelope, FaPhone, FaSearch, FaCheckCircle, FaUserCircle } from 'react-icons/fa';


/* Three clean placeholder avatars using UI Avatars */
const avatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e8f8f6&color=0f766e&bold=true&size=128`;

export default function ShowPatient() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    axios.get(`${API_URL}/api/patients/all`, { signal: controller.signal, timeout: 15000 })
      .then(r => {
        if (!Array.isArray(r.data)) throw new Error('Invalid patient data');
        setPatients(r.data);
      })
      .catch(e => { if (!controller.signal.aborted) setError(e.response?.data?.message || 'Unable to load patients. Please retry.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0f766e] mb-1">Records</p>
          <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Patient Records</h2>
          <p className="text-gray-400 text-sm mt-1">Complete overview of all registered patients.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 bg-white border border-[#e2f4f2] rounded-xl px-4 py-2.5 w-60 focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/10 transition-all">
            <FaSearch className="text-gray-300 text-sm flex-shrink-0" />
            <input
              type="text"
              placeholder="Search patients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-300 w-full"
            />
          </div>
          <div className="flex items-center gap-2.5 bg-[#e8f8f6] border border-[#0f766e]/15 rounded-xl px-4 py-2.5">
            <FaUserInjured className="text-[#0f766e]" size={14} />
            <span className="text-sm font-black text-[#0f766e]">{loading || error ? '—' : patients.length} Patients</span>
          </div>
        </div>
      </div>

      {/* Grid — max 3 columns, proper avatar cards */}
      {loading && <p role="status" className="p-10 text-center text-gray-500">Loading patients...</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">{error}<button className="ml-4 underline" onClick={() => setReload(r => r + 1)}>Retry</button></p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {!loading && !error && filtered.map((patient) => (
          <div
            key={patient._id}
            className="bg-white rounded-2xl border border-[#e2f4f2] overflow-hidden hover:shadow-lg hover:shadow-[#0f766e]/10 hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: '0 2px 16px rgba(15,118,110,0.06)' }}
          >
            {/* Teal header strip with avatar */}
            <div className="h-16 bg-gradient-to-r from-[#0f766e] to-[#14b8a6] relative">
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '14px 14px' }}
              />
            </div>

            {/* Avatar — overlaps header */}
            <div className="relative flex flex-col items-center -mt-10 px-5 pb-5">
              <img
                src={uploadUrl(patient.profileImage) || avatarUrl(`${patient.firstName} ${patient.lastName}`)}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = avatarUrl(`${patient.firstName} ${patient.lastName}`); }}
                alt={patient.firstName}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-[#e8f8f6]"
              />

              <div className="mt-3 text-center">
                <h5 className="text-base font-black text-[#0f172a] leading-tight">
                  {patient.firstName} {patient.lastName}
                </h5>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <FaCheckCircle size={9} className="text-[#0f766e]" />
                  <span className="text-[10px] font-bold text-[#0f766e] uppercase tracking-wider">Registered Patient</span>
                </div>
              </div>

              {/* Info rows */}
              <div className="w-full mt-4 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#e8f8f6] flex items-center justify-center flex-shrink-0">
                    <FaEnvelope size={10} className="text-[#0f766e]" />
                  </span>
                  <span className="min-w-0 break-words text-xs font-semibold text-gray-600">{patient.email || 'Email not provided'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#e8f8f6] flex items-center justify-center flex-shrink-0">
                    <FaPhone size={10} className="text-[#0f766e]" />
                  </span>
                  <span className="text-xs font-semibold text-gray-600">
                    {patient.countryCode && `(${patient.countryCode}) `}{patient.phone}
                  </span>
                </div>
              </div>

              <details className="w-full mt-4 rounded-xl bg-[#e8f8f6] px-4 py-3 text-sm text-[#0f766e]">
                <summary className="cursor-pointer font-semibold">View Details</summary>
                <p className="mt-3 break-all text-xs">Record ID: {patient._id}</p>
                <p className="mt-2 text-xs">Registered: {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Not provided'}</p>
              </details>
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border border-[#e2f4f2] rounded-2xl p-16 text-center">
          <FaUserInjured className="mx-auto text-[#b2e0da] mb-4" size={40} />
          <p className="text-gray-400 font-bold text-sm">No patients found.</p>
        </div>
      )}
    </div>
  );
}
