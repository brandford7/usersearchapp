/**
 * Format phone number
 */
export function formatPhone(phone) {
  if (!phone) return "None";
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Format date of birth
 */
export function formatDOB(dob) {
  if (!dob || dob.length !== 8) return dob || "None";
  return `${dob.slice(0, 4)}-${dob.slice(4, 6)}-${dob.slice(6, 8)}`;
}

/**
 * Check if search params are valid
 */
export function hasValidSearchParams(params) {
  const { page, limit, ...searchFields } = params;
  return Object.values(searchFields).some(
    (value) => value !== "" && value !== null && value !== undefined,
  );
}
