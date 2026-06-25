import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Pencil, Mail, Phone, Briefcase, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useOnboarding } from "@/context/OnboardingContext";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account — PIKORUA" },
      {
        name: "description",
        content: "Manage your Pikorua profile and saved property preferences.",
      },
    ],
  }),
  component: AccountPage,
});

const PROFESSION_LABEL: Record<string, string> = {
  job: "Salaried professional",
  business: "Business owner",
  investor: "Investor",
  other: "Other",
};

function AccountPage() {
  const { userProfile, quizAnswers, signOut, openQuizForEdit, hydrated } =
    useOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !userProfile) {
      navigate({ to: "/" });
    }
  }, [hydrated, userProfile, navigate]);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-lux-black">
        <SiteHeader />
        <div className="flex h-[60vh] items-center justify-center text-ivory/60">
          Loading your account…
        </div>
      </div>
    );
  }

  const initials = (userProfile.name || "P")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-lux-black">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-[120px] pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[11px] tracking-[0.28em] text-champagne uppercase">
            Your Account
          </p>
          <h1 className="mt-3 font-display text-4xl text-ivory">
            Welcome back, {userProfile.name?.split(" ")[0] || "guest"}.
          </h1>
          <p className="mt-2 text-sm text-ivory/55">
            Your profile and preferences are saved — no need to sign in again on this
            device.
          </p>
        </motion.div>

        {/* Profile card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 rounded-3xl border border-[var(--glass-border)] bg-[#14161A]/80 p-8 backdrop-blur-xl"
        >
          <div className="flex items-start gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-champagne to-muted-gold font-display text-xl text-lux-black">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl text-ivory">{userProfile.name}</h2>
              <p className="text-xs tracking-luxury text-champagne">
                {PROFESSION_LABEL[userProfile.profession] ?? userProfile.profession}
                {userProfile.businessName ? ` · ${userProfile.businessName}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Detail icon={Mail} label="Email" value={userProfile.email} />
            <Detail icon={Phone} label="Phone" value={userProfile.phone} />
            <Detail
              icon={Briefcase}
              label="Profession"
              value={PROFESSION_LABEL[userProfile.profession] ?? userProfile.profession}
            />
            {userProfile.businessName && (
              <Detail icon={Sparkles} label="Business" value={userProfile.businessName} />
            )}
          </div>
        </motion.section>

        {/* Preferences card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 rounded-3xl border border-[var(--glass-border)] bg-[#14161A]/80 p-8 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-champagne uppercase">
                Saved preferences
              </p>
              <h3 className="mt-2 font-display text-xl text-ivory">
                Your property profile
              </h3>
            </div>
            <button
              onClick={openQuizForEdit}
              className="inline-flex items-center gap-2 rounded-full gold-border px-4 py-2 text-[11px] tracking-luxury text-ivory hover:bg-champagne/10"
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
          </div>

          {quizAnswers ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Pref label="Configuration" values={quizAnswers.bhk} />
              <Pref label="Residence type" values={quizAnswers.propertyType} />
              <Pref
                label="Budget"
                values={[quizAnswers.budgetSub || quizAnswers.budgetRange].filter(Boolean)}
              />
            </div>
          ) : (
            <p className="mt-6 text-sm text-ivory/55">
              You haven't set preferences yet.{" "}
              <button
                onClick={openQuizForEdit}
                className="text-champagne underline-offset-4 hover:underline"
              >
                Take the quiz
              </button>
              .
            </p>
          )}
        </motion.section>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-gradient-to-r from-champagne to-muted-gold px-6 py-3 text-[11px] tracking-luxury text-lux-black"
          >
            Browse residences
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-[11px] tracking-luxury text-ivory/80 hover:border-red-400/40 hover:text-red-300"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </main>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#1C1E22] p-4">
      <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-ivory/40 uppercase">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-2 text-sm text-ivory">{value || "—"}</div>
    </div>
  );
}

function Pref({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.22em] text-ivory/40 uppercase">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.length === 0 ? (
          <span className="text-sm text-ivory/40">—</span>
        ) : (
          values.map((v) => (
            <span
              key={v}
              className="rounded-full border border-champagne/30 bg-champagne/5 px-3 py-1 text-xs text-champagne"
            >
              {v}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
