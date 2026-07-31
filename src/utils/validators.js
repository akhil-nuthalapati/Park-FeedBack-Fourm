export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isRequired(value) {
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

export function isValidRating(value) {
  const num = Number(value);
  return Number.isInteger(num) && num >= 1 && num <= 5;
}

export function minLength(value, min) {
  return String(value || '').trim().length >= min;
}

export function maxLength(value, max) {
  return String(value || '').trim().length <= max;
}

export function validateFeedback(formData) {
  const errors = {};
  if (!formData.park_id) errors.park_id = 'Please select a park.';
  if (!isValidRating(formData.overall_rating)) errors.overall_rating = 'Overall rating is required (1-5).';
  ['cleanliness', 'safety', 'facilities'].forEach((field) => {
    if (formData[field] && !isValidRating(formData[field])) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} rating must be 1-5.`;
    }
  });
  if (formData.suggestion && !maxLength(formData.suggestion, 1000)) {
    errors.suggestion = 'Suggestion must be under 1000 characters.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateMaintenance(formData) {
  const errors = {};
  if (!formData.park_id) errors.park_id = 'Please select a park.';
  if (!formData.issue_type) errors.issue_type = 'Please select an issue category.';
  if (!isRequired(formData.description)) errors.description = 'Description is required.';
  if (formData.description && !minLength(formData.description, 10)) {
    errors.description = 'Description must be at least 10 characters.';
  }
  if (formData.description && !maxLength(formData.description, 2000)) {
    errors.description = 'Description must be under 2000 characters.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateLogin(formData) {
  const errors = {};
  if (!isRequired(formData.email)) errors.email = 'Email is required.';
  else if (!isValidEmail(formData.email)) errors.email = 'Invalid email format.';
  if (!isRequired(formData.password)) errors.password = 'Password is required.';
  else if (!minLength(formData.password, 6)) errors.password = 'Password must be at least 6 characters.';
  return { isValid: Object.keys(errors).length === 0, errors };
}
