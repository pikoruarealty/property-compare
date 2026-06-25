import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";
import { AuthFlow } from "./AuthFlow";
import { WelcomeCard } from "./WelcomeCard";
import { PropertyQuiz } from "./PropertyQuiz";

export function OnboardingOverlay() {
  const { phase, setPhase, quizAnswers, quizEditMode } = useOnboarding();

  // Trigger 1: idle -> auth on first scroll
  useEffect(() => {
    if (phase !== "idle") return;
    const onScroll = () => {
      if (window.scrollY > 200) setPhase("auth");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase, setPhase]);

  // Trigger 2: site-preview -> quiz on next scroll (one-time)
  useEffect(() => {
    if (phase !== "site-preview") return;
    const baseline = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - baseline) > 40) {
        setPhase("quiz");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase, setPhase]);

  // Lock body scroll while overlay card is visible
  useEffect(() => {
    const active = phase === "auth" || phase === "welcome" || phase === "quiz";
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const active = phase === "auth" || phase === "welcome" || phase === "quiz";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-stretch justify-center overflow-y-auto sm:items-center"
          style={{
            backgroundColor: "rgba(10, 10, 12, 0.18)",
            backdropFilter: "blur(2px)",
          }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full max-w-[520px] flex-col p-6 sm:my-10 sm:p-10"
            style={{
              minHeight: "min(100dvh, 640px)",
              borderRadius: 24,
              border: "1px solid rgba(200,164,93,0.2)",
              backgroundColor: "#1C1E22",
            }}
          >
            {phase === "auth" && <AuthFlow />}
            {phase === "welcome" && <WelcomeCard />}
            {phase === "quiz" && (
              <PropertyQuiz
                initialAnswers={quizEditMode ? quizAnswers ?? undefined : undefined}
                editMode={quizEditMode}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
