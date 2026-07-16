import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Home as HomeIcon,
  Building,
  Building2,
  Layers,
  Map as MapIcon,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useOnboarding, type QuizAnswers } from "@/context/OnboardingContext";
import { getAvailableLocations } from "@/lib/locations";

const BHK_OPTIONS = ["2", "3", "4", "5", "6", "7"];
const MAX_BHK = 2;
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
  "₹ 21 Cr +",
];
// Sub-ranges step in ~2 Cr bands. Properties round to the nearest band:
// e.g. 2.5 Cr → "₹ 1 – 2 Cr" band, 2.6 Cr → "₹ 3 – 4 Cr" band.
const SUB_RANGES: Record<string, string[]> = {
  "₹ 1 – 5 Cr": ["₹ 1 – 2 Cr", "₹ 3 – 4 Cr", "₹ 5 Cr"],
  "₹ 6 – 10 Cr": ["₹ 6 – 7 Cr", "₹ 8 – 9 Cr", "₹ 10 Cr"],
  "₹ 11 – 15 Cr": ["₹ 11 – 12 Cr", "₹ 13 – 14 Cr", "₹ 15 Cr"],
  "₹ 16 – 20 Cr": ["₹ 16 – 17 Cr", "₹ 18 – 19 Cr", "₹ 20 Cr"],
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
  const locations = useMemo(() => getAvailableLocations(), []);
  const [q, setQ] = useState<1 | 2 | 3 | 4>(1);

  const defaultState = initialAnswers?.state ?? locations[0]?.state ?? "";
  const defaultCityList = locations.find((g) => g.state === defaultState)?.cities ?? [];
  const [state, setState] = useState<string>(defaultState);
  const [city, setCity] = useState<string>(
    initialAnswers?.city ?? (defaultCityList.length === 1 ? defaultCityList[0] : ""),
  );
  const cityOptions = useMemo(
    () => locations.find((g) => g.state === state)?.cities ?? [],
    [locations, state],
  );

  const [types, setTypes] = useState<string[]>(initialAnswers?.propertyType ?? []);
  const [bhk, setBhk] = useState<string[]>(
    initialAnswers?.bhk?.map((b) => b.replace(/\s*BHK$/i, "").trim()) ?? [],
  );
  const [budgetRange, setBudgetRange] = useState(initialAnswers?.budgetRange ?? "");
  const [budgetSub, setBudgetSub] = useState(initialAnswers?.budgetSub ?? "");

  const toggleType = (v: string) => {
    setTypes((arr) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]));
  };

  const toggleBhk = (v: string) => {
    setBhk((arr) => {
      if (arr.includes(v)) return arr.filter((x) => x !== v);
      if (arr.length >= MAX_BHK) {
        toast.error(`You can choose up to ${MAX_BHK} BHK options.`);
        return arr;
      }
      return [...arr, v];
    });
  };

  const pickState = (s: string) => {
    setState(s);
    const cities = locations.find((g) => g.state === s)?.cities ?? [];
    setCity(cities.length === 1 ? cities[0] : "");
  };

  const finish = () => {
    const answers: QuizAnswers = {
      state,
      city,
      bhk: bhk.map((b) => `${b} BHK`),
      propertyType: types,
      budgetRange,
      budgetSub,
    };
    completeOnboarding(answers);
  };

  const showBudgetComplete =
    budgetRange === "₹ 21 Cr +" || (budgetRange && budgetSub);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.22em] text-[var(--brand)] uppercase">
          Question {q} of 4
        </p>
        <div className="mt-2 h-px w-full overflow-hidden bg-border">
          <motion.div
            className="h-full bg-[var(--brand)]"
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
              <h3 className="font-display text-[28px] leading-tight text-foreground">
                What kind of residence speaks to you?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">Select all that interest you.</p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(({ label, Icon }, i) => {
                  const selected = types.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleType(label)}
                      className={`relative rounded-[20px] border p-5 text-center transition-all hover:scale-[1.03] ${
                        selected
                          ? "border-[var(--brand)] bg-[var(--brand)]/8"
                          : "border-border bg-muted hover:border-foreground/25"
                      }`}
                      style={{
                        ...(selected ? { backgroundColor: "color-mix(in oklab, var(--brand) 8%, transparent)" } : {}),
                        ...(i === 3 ? { gridColumnStart: 1 } : {}),
                      }}
                    >
                      {selected && <Checkmark />}
                      <Icon className="mx-auto h-8 w-8 text-[var(--brand)]" />
                      <div className="mt-3 text-sm text-foreground">{label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-8">
                <NextBtn disabled={types.length === 0} onClick={() => setQ(2)}>
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
              <h3 className="font-display text-[28px] leading-tight text-foreground">
                How much space do you have in mind?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose up to {MAX_BHK} options.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BHK_OPTIONS.map((n) => {
                  const selected = bhk.includes(n);
                  const disabled = !selected && bhk.length >= MAX_BHK;
                  return (
                    <button
                      key={n}
                      onClick={() => toggleBhk(n)}
                      className={`relative rounded-[20px] border p-5 text-center transition-all hover:scale-[1.03] ${
                        selected
                          ? "border-[var(--brand)] bg-[var(--brand)]/8"
                          : disabled
                            ? "border-border/50 bg-muted opacity-40"
                            : "border-border bg-muted hover:border-foreground/25"
                      }`}
                      style={selected ? { backgroundColor: "color-mix(in oklab, var(--brand) 8%, transparent)" } : {}}
                    >
                      {selected && <Checkmark />}
                      <div className="font-display text-[44px] leading-none text-[var(--brand)]">
                        {n}
                      </div>
                      <div className="mt-2 text-[13px] text-muted-foreground">BHK</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-8">
                <NextBtn disabled={bhk.length === 0} onClick={() => setQ(3)}>
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
              <h3 className="font-display text-[26px] leading-tight text-foreground">
                Every great residence has its moment. What's yours?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
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
                            ? "border-[var(--brand)] bg-[var(--brand)]/8"
                            : "border-border bg-muted hover:border-foreground/25"
                        }`}
                        style={selected ? { backgroundColor: "color-mix(in oklab, var(--brand) 8%, transparent)" } : {}}
                      >
                        {selected && <Checkmark />}
                        <span className="font-display text-[20px] text-foreground">{r}</span>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{ height: selected && subs ? "auto" : 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        {subs && (
                          <div className="px-2 pt-4">
                            <div className="mb-3 border-t border-border pt-3">
                              <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
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
                                        ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]"
                                        : "border-[var(--brand)]/30 bg-transparent text-foreground/80 hover:border-[var(--brand)]/60"
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
    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-ink)]">
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
      className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand-soft)] text-sm font-medium tracking-wide text-[var(--brand-ink)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
