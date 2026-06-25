import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Home as HomeIcon,
  Building,
  Building2,
  Layers,
  Map as MapIcon,
} from "lucide-react";
import { useOnboarding, type QuizAnswers } from "@/context/OnboardingContext";

const BHK_OPTIONS = ["2", "3", "4", "5", "6", "7"];
const PROPERTY_TYPES: Array<{ label: string; Icon: typeof HomeIcon }> = [
  { label: "Bungalow", Icon: HomeIcon },
  { label: "Apartment", Icon: Building },
  { label: "Penthouse", Icon: Building2 },
  { label: "Duplex", Icon: Layers },
  { label: "Plots", Icon: MapIcon },
];
const BUDGET_RANGES = [
  "₹ 1 – 5 Cr",
  "₹ 6 – 10 Cr",
  "₹ 11 – 15 Cr",
  "₹ 16 – 20 Cr",
  "₹ 20 Cr +",
];
const SUB_RANGES: Record<string, string[]> = {
  "₹ 1 – 5 Cr": ["₹ 1 – 2 Cr", "₹ 2 – 3 Cr", "₹ 3 – 4 Cr", "₹ 4 – 5 Cr"],
  "₹ 6 – 10 Cr": ["₹ 6 – 7 Cr", "₹ 7 – 8 Cr", "₹ 8 – 9 Cr", "₹ 9 – 10 Cr"],
  "₹ 11 – 15 Cr": ["₹ 11 – 12 Cr", "₹ 12 – 13 Cr", "₹ 13 – 14 Cr", "₹ 14 – 15 Cr"],
  "₹ 16 – 20 Cr": ["₹ 16 – 17 Cr", "₹ 17 – 18 Cr", "₹ 18 – 19 Cr", "₹ 19 – 20 Cr"],
};

const transition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const };

export function PropertyQuiz({
  initialAnswers,
  editMode = false,
}: {
  initialAnswers?: QuizAnswers;
  editMode?: boolean;
} = {}) {
  const { completeOnboarding } = useOnboarding();
  const [q, setQ] = useState<1 | 2 | 3>(1);
  const [bhk, setBhk] = useState<string[]>(
    initialAnswers?.bhk?.map((b) => b.replace(/\s*BHK$/i, "").trim()) ?? [],
  );
  const [types, setTypes] = useState<string[]>(initialAnswers?.propertyType ?? []);
  const [budgetRange, setBudgetRange] = useState(initialAnswers?.budgetRange ?? "");
  const [budgetSub, setBudgetSub] = useState(initialAnswers?.budgetSub ?? "");

  const toggle = (arr: string[], set: (a: string[]) => void, v: string) => {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const finish = () => {
    const answers: QuizAnswers = {
      bhk: bhk.map((b) => `${b} BHK`),
      propertyType: types,
      budgetRange,
      budgetSub,
    };
    completeOnboarding(answers);
  };


  const showBudgetComplete =
    budgetRange === "₹ 20 Cr +" || (budgetRange && budgetSub);

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.22em] text-[#C8A45D] uppercase">
          Question {q} of 3
        </p>
        <div className="mt-2 h-px w-full overflow-hidden bg-white/10">
          <motion.div
            className="h-full bg-[#C8A45D]"
            initial={false}
            animate={{ width: `${(q / 3) * 100}%` }}
            transition={transition}
          />
        </div>
      </div>


      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {q === 1 && (
            <motion.div
              key="q1"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={transition}
              className="flex flex-1 flex-col"
            >
              <h3 className="font-display text-[28px] leading-tight text-[#F7F3EA]">
                How much space do you have in mind?
              </h3>
              <p className="mt-2 text-sm text-[#F7F3EA]/55">You can select more than one.</p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BHK_OPTIONS.map((n) => {
                  const selected = bhk.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggle(bhk, setBhk, n)}
                      className={`relative rounded-[20px] border p-5 text-center transition-all hover:scale-[1.03] ${
                        selected
                          ? "border-[#C8A45D] bg-[#C8A45D]/8"
                          : "border-white/10 bg-[#1C1E22] hover:border-white/25"
                      }`}
                      style={selected ? { backgroundColor: "rgba(200,164,93,0.08)" } : {}}
                    >
                      {selected && <Checkmark />}
                      <div className="font-display text-[44px] leading-none text-[#C8A45D]">
                        {n}
                      </div>
                      <div className="mt-2 text-[13px] text-[#F7F3EA]/70">BHK</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-8">
                <NextBtn disabled={bhk.length === 0} onClick={() => setQ(2)}>
                  Next question →
                </NextBtn>
              </div>
            </motion.div>
          )}

          {q === 2 && (
            <motion.div
              key="q2"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={transition}
              className="flex flex-1 flex-col"
            >
              <h3 className="font-display text-[28px] leading-tight text-[#F7F3EA]">
                What kind of residence speaks to you?
              </h3>
              <p className="mt-2 text-sm text-[#F7F3EA]/55">Select all that interest you.</p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(({ label, Icon }, i) => {
                  const selected = types.includes(label);
                  const isSecondRow = i >= 3;
                  return (
                    <button
                      key={label}
                      onClick={() => toggle(types, setTypes, label)}
                      className={`relative rounded-[20px] border p-5 text-center transition-all hover:scale-[1.03] ${
                        selected
                          ? "border-[#C8A45D] bg-[#C8A45D]/8"
                          : "border-white/10 bg-[#1C1E22] hover:border-white/25"
                      } ${isSecondRow && i === 3 ? "col-start-1 sm:col-start-1" : ""}`}
                      style={{
                        ...(selected ? { backgroundColor: "rgba(200,164,93,0.08)" } : {}),
                        ...(i === 3 ? { gridColumnStart: 1 } : {}),
                      }}
                    >
                      {selected && <Checkmark />}
                      <Icon className="mx-auto h-8 w-8 text-[#C8A45D]" />
                      <div className="mt-3 text-sm text-[#F7F3EA]">{label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-8">
                <NextBtn disabled={types.length === 0} onClick={() => setQ(3)}>
                  Next question →
                </NextBtn>
              </div>
            </motion.div>
          )}

          {q === 3 && (
            <motion.div
              key="q3"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={transition}
              className="flex flex-1 flex-col"
            >
              <h3 className="font-display text-[26px] leading-tight text-[#F7F3EA]">
                Every great residence has its moment. What's yours?
              </h3>
              <p className="mt-2 text-sm text-[#F7F3EA]/55">
                Choose a range that feels right — we'll refine it in a moment.
              </p>

              <div className="mt-6 space-y-2">
                {BUDGET_RANGES.map((r) => {
                  const selected = budgetRange === r;
                  const subs = SUB_RANGES[r];
                  return (
                    <div key={r}>
                      <button
                        onClick={() => {
                          setBudgetRange(r);
                          setBudgetSub("");
                        }}
                        className={`relative flex h-16 w-full items-center justify-center rounded-[20px] border transition-all ${
                          selected
                            ? "border-[#C8A45D] bg-[#C8A45D]/8"
                            : "border-white/10 bg-[#1C1E22] hover:border-white/25"
                        }`}
                        style={selected ? { backgroundColor: "rgba(200,164,93,0.08)" } : {}}
                      >
                        {selected && <Checkmark />}
                        <span className="font-display text-[20px] text-[#F7F3EA]">{r}</span>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{ height: selected && subs ? "auto" : 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        {subs && (
                          <div className="px-2 pt-4">
                            <div className="mb-3 border-t border-white/5 pt-3">
                              <p className="text-[11px] tracking-[0.22em] text-[#F7F3EA]/40 uppercase">
                                Narrow it down:
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {subs.map((s) => {
                                const subSelected = budgetSub === s;
                                return (
                                  <button
                                    key={s}
                                    onClick={() => setBudgetSub(s)}
                                    className={`rounded-full border px-4 py-2 text-sm transition-all ${
                                      subSelected
                                        ? "border-[#C8A45D] bg-[#C8A45D]/10 text-[#C8A45D]"
                                        : "border-[#C8A45D]/30 bg-transparent text-[#F7F3EA]/80 hover:border-[#C8A45D]/60"
                                    }`}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto pt-8">
                {showBudgetComplete && (
                  <NextBtn onClick={finish}>{editMode ? "Save preferences →" : "Complete →"}</NextBtn>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Checkmark() {
  return (
    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#C8A45D] text-[#121416]">
      <Check className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

function NextBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#C8A45D] to-[#A8884C] text-sm font-medium tracking-wide text-[#121416] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
