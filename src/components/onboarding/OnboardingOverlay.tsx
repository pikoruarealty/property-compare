import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";
import { AuthFlow } from "./AuthFlow";
import { WelcomeCard } from "./WelcomeCard";
import { PropertyQuiz } from "./PropertyQuiz";

export function OnboardingOverlay() {
  const { phase, setPhase } = useOnboarding();

  // Scroll trigger: when user scrolls past the hero (idle -> auth)
  useEffect(() => {
    if (phase !== "idle") return;
    const onScroll = () => {
      if (window.scrollY > 200) {
        setPhase("auth");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase, setPhase]);

  // Lock body scroll while overlay is active
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
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-stretch justify-center overflow-y-auto sm:items-center"
          style={{ backgroundColor: "#121416" }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full max-w-[520px] flex-col p-6 sm:my-10 sm:rounded-3xl sm:border sm:border-white/5 sm:bg-[#15171A] sm:p-10"
            style={{ minHeight: "min(100dvh, 640px)" }}
          >
            {phase === "auth" && <AuthFlow />}
            {phase === "welcome" && <WelcomeCard />}
            {phase === "quiz" && <PropertyQuiz />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
