export function digitsOnlyPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function isValidIndianMobile(phone: string) {
  return /^[6-9]\d{9}$/.test(digitsOnlyPhone(phone));
}

export function mobilePhoneError(phone: string) {
  const digits = digitsOnlyPhone(phone);
  if (!digits) return "Enter your mobile number.";
  if (digits.length !== 10) return "Mobile number must be exactly 10 digits.";
  if (!/^[6-9]/.test(digits)) return "Enter a valid 10-digit mobile number starting with 6–9.";
  return null;
}
