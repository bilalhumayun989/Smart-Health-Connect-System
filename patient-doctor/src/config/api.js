const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredApiUrl) {
  throw new Error('VITE_API_URL is required. Set it in the patient frontend environment.');
}

export const API_URL = configuredApiUrl.replace(/\/+$/, '');
export const ADMIN_URL = (import.meta.env.VITE_ADMIN_URL?.trim() || 'https://healthcare.broshtech.com/').replace(/\/+$/, '');

export const doctorName = (doctor) => {
  const name = [doctor.firstName, doctor.lastName].filter(Boolean).join(' ').replace(/^Dr\.?\s+/i, '');
  return name ? `Dr. ${name}` : 'Doctor';
};

export const uploadUrl = (value, folder = '') => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const file = value.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${API_URL}/${file.startsWith('uploads/') ? file : `uploads/${folder ? `${folder}/` : ''}${file}`}`;
};
