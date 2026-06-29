import { useOnboarding } from "@/context/OnboardingContext";
import { useServerFn } from "@tanstack/react-start";
import { saveQuizAnswers as saveQuizAnswersFn } from "@/lib/profile.functions";


export function PreferenceBanner() {
  const { quizAnswers, openQuizForEdit } = useOnboarding();

  if (!quizAnswers) return null;

  const bhkLabel = quizAnswers.bhk.length ? quizAnswers.bhk.join(", ") : null;
  const typeLabel = quizAnswers.propertyType.length
    ? quizAnswers.propertyType.join(" · ")
    : null;
  const budgetLabel = quizAnswers.budgetSub || quizAnswers.budgetRange || null;

  const chips = [bhkLabel, typeLabel, budgetLabel].filter(Boolean) as string[];
  if (chips.length === 0) return null;

  return (
    <div
      className="flex w-full flex-wrap items-center gap-3 px-6 py-3"
      style={{
        backgroundColor: "rgba(28,30,34,0.9)",
        borderBottom: "1px solid rgba(200,164,93,0.15)",
      }}
    >
      <span
        className="text-[10px] tracking-[0.22em] uppercase"
        style={{ color: "rgba(247,243,234,0.4)" }}
      >
        Your preferences
      </span>
      <span
        className="h-4 w-px"
        style={{ backgroundColor: "rgba(247,243,234,0.1)" }}
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <span
            key={c}
            className="rounded-full px-3 py-1 text-[12px]"
            style={{
              border: "0.5px solid rgba(200,164,93,0.35)",
              backgroundColor: "rgba(200,164,93,0.07)",
              color: "#D8C28A",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="flex-1" />
      <button
        type="button"
        onClick={openQuizForEdit}
        className="text-[12px] transition-colors"
        style={{ color: "rgba(247,243,234,0.5)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#F7F3EA")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(247,243,234,0.5)")
        }
      >
        Edit preferences
      </button>
    </div>
  );
}
