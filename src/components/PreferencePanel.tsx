import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { useOnboarding, type QuizAnswers } from "@/context/OnboardingContext";
import { saveQuizAnswers as saveQuizAnswersFn } from "@/lib/profile.functions";

const PROPERTY_TYPES = ["Bungalow", "Apartment", "Penthouse", "Duplex", "Plots"];
const BHK_OPTIONS = ["2 BHK", "3 BHK", "4 BHK", "5 BHK", "6 BHK", "7 BHK"];
const BUDGETS = [
  "₹ 1 – 5 Cr",
  "₹ 6 – 10 Cr",
  "₹ 11 – 15 Cr",
  "₹ 16 – 20 Cr",
  "₹ 20 Cr +",
];

export function PreferencePanel() {
  const { quizAnswers, setQuizAnswers } = useOnboarding();
  const saveQuiz = useServerFn(saveQuizAnswersFn);

  const current: QuizAnswers = quizAnswers ?? {
    bhk: [],
    propertyType: [],
    budgetRange: "",
    budgetSub: "",
  };

  const persist = (next: QuizAnswers) => {
    setQuizAnswers(next);
    try {
      window.localStorage.setItem("pikorua:quiz-answers", JSON.stringify(next));
    } catch {
      // ignore
    }
    saveQuiz({ data: { answers: next } }).catch(() => {});
  };

  const toggle = (key: "propertyType" | "bhk", value: string) => {
    const arr = current[key];
    const next = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    persist({ ...current, [key]: next });
  };

  const setBudget = (b: string) => {
    persist({
      ...current,
      budgetRange: current.budgetRange === b ? "" : b,
      budgetSub: "",
    });
  };

  const clearAll = () => {
    setQuizAnswers(null);
    try {
      window.localStorage.removeItem("pikorua:quiz-answers");
    } catch {
      // ignore
    }
    saveQuiz({ data: { answers: null } }).catch(() => {});
  };

  const totalSelected =
    current.propertyType.length +
    current.bhk.length +
    (current.budgetRange ? 1 : 0);

  return (
    <aside
      className="rounded-[20px] border p-5"
      style={{
        borderColor: "rgba(200,164,93,0.18)",
        backgroundColor: "rgba(28,30,34,0.55)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-champagne/70">
            Your preferences
          </p>
          <h3 className="mt-1 font-display text-[20px] text-ivory">Refine</h3>
        </div>
        {totalSelected > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] tracking-[0.18em] uppercase text-champagne/60 hover:text-champagne transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <Group title="Property type">
        {PROPERTY_TYPES.map((t) => (
          <CheckRow
            key={t}
            label={t}
            checked={current.propertyType.includes(t)}
            onChange={() => toggle("propertyType", t)}
          />
        ))}
      </Group>

      <Group title="Configuration">
        {BHK_OPTIONS.map((b) => (
          <CheckRow
            key={b}
            label={b}
            checked={current.bhk.includes(b)}
            onChange={() => toggle("bhk", b)}
          />
        ))}
      </Group>

      <Group title="Budget">
        {BUDGETS.map((b) => (
          <CheckRow
            key={b}
            label={b}
            checked={current.budgetRange === b}
            onChange={() => setBudget(b)}
          />
        ))}
      </Group>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-champagne/12 pt-4">
      <p className="text-[10px] tracking-[0.22em] uppercase text-champagne/60">
        {title}
      </p>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-champagne/5">
      <span
        className="flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors"
        style={{
          borderColor: checked ? "#C8A45D" : "rgba(247,243,234,0.25)",
          backgroundColor: checked ? "#C8A45D" : "transparent",
        }}
      >
        {checked && <Check className="h-3 w-3 text-[#121416]" strokeWidth={3} />}
      </span>
      <span
        className="text-[13px]"
        style={{ color: checked ? "#F7F3EA" : "rgba(247,243,234,0.7)" }}
      >
        {label}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
    </label>
  );
}
