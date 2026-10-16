export const documentLabels = {
  degreeCertificate: 'Degree Certificate',
  licenseDocument: 'License Document',
  idProof: 'ID Proof',
};

export function validateDoctorStep(step, data, documents = {}, profileImage = null) {
  const errors = {};
  const missing = field => !String(data[field] ?? '').trim();
  if (step === 1) {
    if (missing('firstName')) errors.firstName = 'Enter your first name.';
    if (missing('lastName')) errors.lastName = 'Enter your last name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Enter a valid email address.';
    if (!/\d/.test(data.phone)) errors.phone = 'Enter your phone number.';
    if (data.password.length < 8) errors.password = 'Use at least 8 characters.';
  } else if (step === 2) {
    if (missing('specialty')) errors.specialty = 'Select your specialty.';
    if (missing('licenseNumber')) errors.licenseNumber = 'Enter your license number.';
    const years = Number(data.yearsOfExperience);
    if (missing('yearsOfExperience') || !Number.isInteger(years) || years < 0) errors.yearsOfExperience = 'Enter a whole number of years (0 or more).';
  } else if (step === 3) {
    if (missing('bio')) errors.bio = 'Enter your professional bio.';
    for (const [field, label] of Object.entries(documentLabels)) {
      if (!documents[field]) errors[field] = `Upload your ${label.toLowerCase()}.`;
    }
    if (profileImage?.size > 2 * 1024 * 1024) errors.profileImage = 'Choose a profile photo smaller than 2 MB.';
  }
  return errors;
}
