import { API_URL } from '../../../config/api';
import React, { useState } from "react";
import countryCodes from "./countryCodes";
import { documentLabels, validateDoctorStep } from '../../../utils/doctorSignup';
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserMd, FaHospital, FaIdCard, FaUpload,
  FaPhone, FaLock, FaEnvelope, FaUser, FaStethoscope, FaArrowRight
} from 'react-icons/fa';


const inputCls = "w-full border border-[#e2f4f2] bg-[#f8fffe] rounded-xl py-3 pl-11 pr-4 text-sm text-[#0f172a] placeholder-gray-300 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all";
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block";

const Field = ({ label, icon: Icon, type = "text", name, value, onChange, error, required, placeholder, className = "" }) => (
  <div>
    {label && <label htmlFor={name} className={labelCls}>{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />}
      <input
        id={name} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined}
        type={type} name={name} value={value} onChange={onChange}
        required={required} placeholder={placeholder}
        className={`${inputCls} ${error ? 'border-red-300' : ''} ${className}`}
      />
    </div>
    {error && <p id={`${name}-error`} className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const DoctorSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "", firstName: "", lastName: "", phone: "",
    password: "", specialty: "", licenseNumber: "",
    yearsOfExperience: "", hospitalAffiliation: "", bio: ""
  });
  const [selectCountry, setSelectCountry] = useState("+92");
  const [documents, setDocuments] = useState({});
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const specialties = ["Cardiology", "Dermatology", "Endocrinology", "Pediatrics", "Neurology", "General Medicine", "Surgery", "Other"];
  const requiredDocs = ["degreeCertificate", "licenseDocument", "idProof"];
  const docLabels = documentLabels;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleDocumentUpload = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({ ...prev, [docType]: file }));
      setErrors(prev => ({ ...prev, [docType]: '' }));
    }
  };

  const handleProfileImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setErrors(prev => ({ ...prev, profileImage: file.size > 2 * 1024 * 1024 ? 'Choose a profile photo smaller than 2 MB.' : '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) return;
    if (step < 3) { nextStep(); return; }
    for (const currentStep of [1, 2, 3]) {
      const nextErrors = validateDoctorStep(currentStep, formData, documents, profileImage);
      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors); setStep(currentStep); return;
      }
    }
    setErrors({}); setFormError('');
    setLoading(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => { if (key !== 'phone') form.append(key, key === 'password' ? value : value.trim()); });
      Object.entries(documents).forEach(([key, file]) => { if (file) form.append(key, file); });
      form.append("phone", selectCountry + formData.phone.trim());
      if (profileImage) form.append("profileImage", profileImage);

      const res = await fetch(`${API_URL}/api/doctor/register`, { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) navigate('/doctor-login');
      else {
        setFormError(data.message || 'Registration failed. Please try again.');
        const fieldErrors = data.errors || {};
        setErrors(fieldErrors);
        const firstStepFields = ['firstName', 'lastName', 'email', 'phone', 'password'];
        const secondStepFields = ['specialty', 'licenseNumber', 'yearsOfExperience'];
        if (firstStepFields.some(field => fieldErrors[field])) setStep(1);
        else if (secondStepFields.some(field => fieldErrors[field])) setStep(2);
      }
    } catch {
      setFormError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const nextErrors = validateDoctorStep(step, formData, documents, profileImage);
    setErrors(nextErrors); setFormError('');
    if (!Object.keys(nextErrors).length) setStep(current => Math.min(current + 1, 3));
  };

  return (
    <div className="min-h-screen bg-[#f0fdf9] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft teal blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0f766e]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#14b8a6]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-white rounded-3xl border border-[#e2f4f2] shadow-xl shadow-[#0f766e]/8 p-8 md:p-10">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-[#0f766e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0f766e]/25">
              <FaUserMd className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Join as a Doctor</h2>
            <p className="text-gray-500 text-sm mt-1">Create your Smart Health Connect account</p>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= i ? 'bg-[#0f766e]' : 'bg-[#e2f4f2]'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Step {step} of 3</p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            {formError && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
            <AnimatePresence mode="wait">

              {/* Step 1 — Personal Info */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First Name" name="firstName" icon={FaUser} value={formData.firstName} onChange={handleChange} required error={errors.firstName} placeholder="John" />
                    <Field label="Last Name" name="lastName" icon={FaUser} value={formData.lastName} onChange={handleChange} required error={errors.lastName} placeholder="Doe" />
                  </div>
                  <Field label="Email Address" name="email" type="email" icon={FaEnvelope} value={formData.email} onChange={handleChange} required error={errors.email} placeholder="john@hospital.com" />
                  <div>
                    <label htmlFor="phone" className={labelCls}>Phone Number</label>
                    <div className="flex gap-2">
                      <select aria-label="Country calling code" value={selectCountry} onChange={e => setSelectCountry(e.target.value)}
                        className="border border-[#e2f4f2] bg-[#f8fffe] rounded-xl px-3 py-3 text-sm text-[#0f172a] outline-none focus:border-[#0f766e] appearance-none">
                        {countryCodes.map(c => <option key={c.code} value={c.dial_code} className="bg-white">{c.dial_code}</option>)}
                      </select>
                      <div className="relative flex-1">
                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input id="phone" aria-invalid={!!errors.phone} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="300 1234567" className={inputCls} />
                      </div>
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>
                  <Field label="Password" name="password" type="password" icon={FaLock} value={formData.password} onChange={handleChange} required error={errors.password} placeholder="Min 8 characters" />
                </motion.div>
              )}

              {/* Step 2 — Professional Info */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label htmlFor="specialty" className={labelCls}>Medical Specialty</label>
                    <div className="relative">
                      <FaStethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <select id="specialty" name="specialty" value={formData.specialty} onChange={handleChange} required
                        className={`${inputCls} appearance-none ${errors.specialty ? 'border-red-300' : ''}`}>
                        <option value="">Select Specialty</option>
                        {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {errors.specialty && <p className="text-red-400 text-xs mt-1">{errors.specialty}</p>}
                  </div>
                  <Field label="License Number" name="licenseNumber" icon={FaIdCard} value={formData.licenseNumber} onChange={handleChange} required error={errors.licenseNumber} placeholder="MD-123456" />
                  <Field label="Years of Experience" name="yearsOfExperience" type="number" icon={FaStethoscope} value={formData.yearsOfExperience} onChange={handleChange} required error={errors.yearsOfExperience} placeholder="5" />
                  <Field label="Hospital Affiliation" name="hospitalAffiliation" icon={FaHospital} value={formData.hospitalAffiliation} onChange={handleChange} placeholder="City General Hospital" />
                </motion.div>
              )}

              {/* Step 3 — Bio & Documents */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label htmlFor="bio" className={labelCls}>Professional Bio (required)</label>
                    <textarea id="bio" aria-invalid={!!errors.bio} name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Tell us about your medical background..."
                      className="w-full border border-[#e2f4f2] bg-[#f8fffe] rounded-xl p-4 text-sm text-[#0f172a] placeholder-gray-300 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all resize-none" />
                    {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio}</p>}
                  </div>

                  {/* Profile image */}
                  <div>
                    <label className={labelCls}>Profile Photo</label>
                    <label className="flex items-center gap-3 border border-dashed border-[#0f766e]/30 bg-[#f0fdf9] hover:border-[#0f766e] rounded-xl p-4 cursor-pointer transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-[#e8f8f6] flex items-center justify-center group-hover:bg-[#0f766e] transition-colors">
                        <FaUpload size={13} className="text-[#0f766e] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{profileImage ? profileImage.name : 'Upload profile photo'}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">JPG, PNG up to 2MB</p>
                      </div>
                      <input aria-label="Profile Photo" type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
                    </label>
                    {errors.profileImage && <p className="mt-1 text-xs text-red-500">{errors.profileImage}</p>}
                  </div>

                  {/* Documents */}
                  <div>
                    <p className={labelCls}>Verification Documents (all required)</p>
                    <div className="space-y-2">
                      {requiredDocs.map(doc => (
                        <div key={doc}>
                        <label className="flex items-center justify-between gap-3 border border-[#e2f4f2] bg-[#f8fffe] hover:border-[#0f766e]/40 rounded-xl p-3 cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                            <FaIdCard className="text-gray-400 group-hover:text-[#0f766e] transition-colors text-sm" />
                            <span className="text-sm text-gray-600">{docLabels[doc]}</span>
                          </div>
                          <span className={`text-xs font-semibold ${documents[doc] ? 'text-[#0f766e]' : 'text-gray-400'}`}>
                            {documents[doc] ? '✓ Uploaded' : 'Upload'}
                          </span>
                          <input aria-label={docLabels[doc]} aria-invalid={!!errors[doc]} type="file" onChange={e => handleDocumentUpload(e, doc)} className="hidden" />
                        </label>
                        {documents[doc] && <p className="mt-1 break-all text-xs text-teal-700">{documents[doc].name}</p>}
                        {errors[doc] && <p className="mt-1 text-xs text-red-500">{errors[doc]}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 rounded-xl border border-[#e2f4f2] text-gray-500 font-semibold text-sm hover:bg-[#f0fdf9] transition-all">
                  Back
                </button>
              )}
              {step < 3 ? (
                <button type="submit"
                  className="flex-[2] flex items-center justify-center gap-2 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#0f766e]/20">
                  Next Step <FaArrowRight size={11} />
                </button>
              ) : (
                <button type="submit" disabled={loading}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 bg-[#0f766e] hover:bg-[#0d9488] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#0f766e]/20 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Complete Registration</span><FaArrowRight size={11} /></>
                  }
                </button>
              )}
            </div>

            <div className="mt-2 pt-6 border-t border-[#e2f4f2] text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <Link to="/doctor-login" className="text-[#0f766e] font-semibold hover:underline">Sign In</Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorSignup;
