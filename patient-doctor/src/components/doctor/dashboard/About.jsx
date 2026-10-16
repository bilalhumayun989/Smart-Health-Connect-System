import { doctorName, uploadUrl } from '../../../config/api';
import placeholder from '../../../assets/doctor-placeholder.svg';
import { useDoctorSession } from './doctorSessionContext';
export default function About() {
  const doctor = useDoctorSession();
  return (
    <section className="mx-auto max-w-3xl space-y-6 pb-6 text-slate-900">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <div className="rounded-2xl border border-[#e2f4f2] bg-white shadow-sm p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <img
            className="h-24 w-24 rounded-2xl object-cover"
            src={uploadUrl(doctor.profileImage, "doctors") || placeholder}
            alt={doctorName(doctor)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholder;
            }}
          />
          <div>
            <h2 className="text-2xl font-bold">{doctorName(doctor)}</h2>
            <p className="mt-2 text-teal-700">{doctor.specialty}</p>
          </div>
        </div>
        <p className="mt-6 whitespace-pre-wrap break-words text-gray-600">
          {doctor.bio || "No biography provided."}
        </p>
        <dl className="mt-6 space-y-4">
          {Object.entries({
            Email: doctor.email,
            Phone: doctor.phone,
            Hospital: doctor.hospitalAffiliation,
            License: doctor.licenseNumber,
            Experience:
              doctor.yearsOfExperience != null
                ? doctor.yearsOfExperience + " years"
                : null,
          }).map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 border-t border-[#e2f4f2] pt-4 sm:grid-cols-[120px_1fr]"
            >
              <dt className="text-sm text-gray-500">{label}</dt>
              <dd className="min-w-0 break-words text-sm">
                {value || "Not provided"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
