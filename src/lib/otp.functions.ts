import { createServerFn } from "@tanstack/react-start";

export const sendOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { phone: string }) => {
    if (!data || typeof data.phone !== "string" || data.phone.length < 6) {
      throw new Error("Invalid phone number");
    }
    return { phone: data.phone.replace(/[^0-9]/g, "") };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.TWO_FACTOR_API_KEY;
    if (!apiKey) throw new Error("TWO_FACTOR_API_KEY missing");
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${data.phone}/AUTOGEN`;
    const res = await fetch(url);
    const json: { Status?: string; Details?: string } = await res.json();
    if (json.Status !== "Success" || !json.Details) {
      throw new Error("Failed to send OTP");
    }
    return { sessionId: json.Details };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; otp: string }) => {
    if (!data || typeof data.sessionId !== "string" || typeof data.otp !== "string") {
      throw new Error("Invalid input");
    }
    return { sessionId: data.sessionId, otp: data.otp.replace(/[^0-9]/g, "") };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.TWO_FACTOR_API_KEY;
    if (!apiKey) throw new Error("TWO_FACTOR_API_KEY missing");
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${data.sessionId}/${data.otp}`;
    const res = await fetch(url);
    const json: { Status?: string; Details?: string } = await res.json();
    if (json.Status !== "Success") {
      throw new Error("OTP mismatch");
    }
    return { verified: true };
  });
