import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

export interface QuizAnswersDTO {
  bhk: string[];
  propertyType: string[];
  budgetRange: string;
  budgetSub: string;
}

export interface ProfileDTO {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  profession: string | null;
  businessName: string | null;
  quizAnswers: QuizAnswersDTO | null;
}

const PENDING = "pikorua-pending";
const SESSION = "pikorua-session";

const pendingConfig = () => ({
  password: process.env.SESSION_SECRET!,
  name: PENDING,
  maxAge: 60 * 10,
});
const sessionConfig = () => ({
  password: process.env.SESSION_SECRET!,
  name: SESSION,
  maxAge: 60 * 60 * 24 * 60, // 60 days
});

function toDTO(row: {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  profession: string | null;
  business_name: string | null;
  quiz_answers: unknown;
}): ProfileDTO {
  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
    email: row.email,
    profession: row.profession,
    businessName: row.business_name,
    quizAnswers: (row.quiz_answers as QuizAnswersDTO | null) ?? null,
  };
}

export const upsertProfileAfterOtp = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      name: string;
      email: string;
      profession: string;
      businessName?: string;
    }) => {
      if (!data?.name?.trim() || !data?.email?.trim() || !data?.profession?.trim()) {
        throw new Error("Missing fields");
      }
      return {
        name: data.name.trim(),
        email: data.email.trim(),
        profession: data.profession.trim(),
        businessName: data.businessName?.trim() || null,
      };
    },
  )
  .handler(async ({ data }) => {
    const pending = await useSession<{ phone: string; verifiedAt: number }>(pendingConfig());
    const phone = pending.data?.phone;
    if (!phone) throw new Error("Phone not verified. Please verify OTP first.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          phone,
          name: data.name,
          email: data.email,
          profession: data.profession,
          business_name: data.businessName,
        },
        { onConflict: "phone" },
      )
      .select("id, phone, name, email, profession, business_name, quiz_answers")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed to save profile");

    const session = await useSession<{ profileId: string; phone: string }>(sessionConfig());
    await session.update({ profileId: row.id, phone: row.phone });
    await pending.clear();

    return toDTO(row);
  });

export const getSessionProfile = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ profileId: string; phone: string }>(sessionConfig());
  const profileId = session.data?.profileId;
  if (!profileId) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row, error } = await supabaseAdmin
    .from("profiles")
    .select("id, phone, name, email, profession, business_name, quiz_answers")
    .eq("id", profileId)
    .maybeSingle();
  if (error || !row) return null;
  return toDTO(row);
});

export const saveQuizAnswers = createServerFn({ method: "POST" })
  .inputValidator((data: { answers: unknown }) => {
    if (!data || typeof data !== "object") throw new Error("Invalid input");
    return { answers: data.answers };
  })
  .handler(async ({ data }) => {
    const session = await useSession<{ profileId: string; phone: string }>(sessionConfig());
    const profileId = session.data?.profileId;
    if (!profileId) throw new Error("Not signed in");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ quiz_answers: data.answers as never })
      .eq("id", profileId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const signOutProfile = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<{ profileId: string; phone: string }>(sessionConfig());
  await session.clear();
  return { ok: true };
});
