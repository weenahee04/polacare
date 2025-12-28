export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Thai phone number validation
  // Format: 0X-XXX-XXXX or +66X-XXX-XXXX
  const thaiPhoneRegex = /^(0[689]\d{8}|66[689]\d{8}|\+66[689]\d{8})$/;

  return thaiPhoneRegex.test(cleaned);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Convert to international format
  if (cleaned.startsWith('0')) {
    return `+66${cleaned.substring(1)}`;
  }

  if (cleaned.startsWith('66')) {
    return `+${cleaned}`;
  }

  if (!cleaned.startsWith('+')) {
    return `+66${cleaned}`;
  }

  return phoneNumber;
};

