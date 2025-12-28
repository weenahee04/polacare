import prisma from '../config/prisma';
import twilio from 'twilio';

const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const createOTP = async (phoneNumber: string): Promise<string> => {
  // Invalidate previous unused OTPs
  await prisma.oTP.updateMany({
    where: {
      phoneNumber,
      isUsed: false,
      expiresAt: { gt: new Date() }
    },
    data: { isUsed: true }
  });

  const code = generateOTP(parseInt(process.env.OTP_LENGTH || '6'));
  const expiresIn = parseInt(process.env.OTP_EXPIRES_IN || '300'); // 5 minutes
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  await prisma.oTP.create({
    data: {
      phoneNumber,
      code,
      expiresAt
    }
  });

  // Send OTP via SMS (Twilio)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await client.messages.create({
        body: `Your POLACARE verification code is: ${code}. Valid for ${expiresIn / 60} minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber.startsWith('+') ? phoneNumber : `+66${phoneNumber.replace(/^0/, '')}`
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
      // Continue even if SMS fails (for development)
    }
  } else {
    // Development mode: log OTP to console
    console.log(`[DEV] OTP for ${phoneNumber}: ${code}`);
  }

  return code;
};

export const verifyOTP = async (
  phoneNumber: string,
  code: string
): Promise<boolean> => {
  const otp = await prisma.oTP.findFirst({
    where: {
      phoneNumber,
      code,
      isUsed: false,
      expiresAt: { gt: new Date() }
    }
  });

  if (!otp) {
    return false;
  }

  // Mark as used
  await prisma.oTP.update({
    where: { id: otp.id },
    data: { isUsed: true }
  });

  return true;
};

// Clean up expired OTPs (run periodically)
export const cleanupExpiredOTPs = async (): Promise<void> => {
  await prisma.oTP.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
};
