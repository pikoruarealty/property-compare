import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getSessionProfile,
  saveQuizAnswers as saveQuizAnswersFn,
  signOutProfile,
} from "@/lib/profile.functions";

export type OnboardingPhase =
  | "idle"
  | "auth"
  | "welcome"
  | "site-preview"
  | "quiz"
  | "complete";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  profession: "job" | "business" | "investor" | "other";
  businessName?: string;
  uid: string;
}

export interface QuizAnswers {
  bhk: string[];
  propertyType: string[];
  budgetRange: string;
  budgetSub: string;
}

interface OnboardingContextValue {
  phase: OnboardingPhase;
  setPhase: (p: OnboardingPhase) => void;
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile) => void;
  quizAnswers: QuizAnswers | null;
  setQuizAnswers: (a: QuizAnswers | null) => void;
  completeOnboarding: (answers: QuizAnswers | null) => void;
  quizEditMode: boolean;
  openQuizForEdit: () => void;
  signOut: () => Promise<void>;
  hydrated: boolean;
}

const Ctx = createContext<OnboardingContextValue | null>(null);

const STORAGE_DONE = "pikorua:onboarding-complete";
const STORAGE_PROFILE = "pikorua:user-profile";
const STORAGE_QUIZ = "pikorua:quiz-answers";

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<OnboardingPhase>("idle");
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [quizAnswers, setQuizAnswersState] = useState<QuizAnswers | null>(null);
  const [quizEditMode, setQuizEditMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const getSessionProfileFn = useServerFn(getSessionProfile);
  const saveQuizFn = useServerFn(saveQuizAnswersFn);
  const signOutFn = useServerFn(signOutProfile);

  // Fast local hydrate for instant UI; then reconcile with server.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    // 1. Optimistic local cache.
    try {
      const profileRaw = window.localStorage.getItem(STORAGE_PROFILE);
      const quizRaw = window.localStorage.getItem(STORAGE_QUIZ);
      const done = window.localStorage.getItem(STORAGE_DONE);
      if (profileRaw) setUserProfileState(JSON.parse(profileRaw));
      if (quizRaw) setQuizAnswersState(JSON.parse(quizRaw));
      if (done === "true") setPhase("complete");
    } catch {
      // ignore
    }

    // 2. Server is source of truth.
    (async () => {
      try {
        const server = await getSessionProfileFn();
        if (cancelled) return;
        if (server) {
          const profile: UserProfile = {
            name: server.name ?? "",
            email: server.email ?? "",
            phone: server.phone,
            profession: (server.profession as UserProfile["profession"]) ?? "other",
            businessName: server.businessName ?? undefined,
            uid: server.id,
          };
          setUserProfileState(profile);
          window.localStorage.setItem(STORAGE_PROFILE, JSON.stringify(profile));
          if (server.quizAnswers) {
            setQuizAnswersState(server.quizAnswers as QuizAnswers);
            window.localStorage.setItem(
              STORAGE_QUIZ,
              JSON.stringify(server.quizAnswers),
            );
          }
          window.localStorage.setItem(STORAGE_DONE, "true");
          setPhase("complete");
        } else {
          // No server session → clear stale local data so onboarding can run.
          window.localStorage.removeItem(STORAGE_DONE);
          window.localStorage.removeItem(STORAGE_PROFILE);
          window.localStorage.removeItem(STORAGE_QUIZ);
          setUserProfileState(null);
          setQuizAnswersState(null);
          setPhase("idle");
        }
      } catch {
        // network fail → keep local cache
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getSessionProfileFn]);

  const setUserProfile = useCallback((p: UserProfile) => {
    setUserProfileState(p);
    try {
      window.localStorage.setItem(STORAGE_PROFILE, JSON.stringify(p));
    } catch {
      // ignore
    }
  }, []);

  const setQuizAnswers = useCallback((a: QuizAnswers | null) => {
    setQuizAnswersState(a);
    try {
      if (a) window.localStorage.setItem(STORAGE_QUIZ, JSON.stringify(a));
    } catch {
      // ignore
    }
  }, []);

  const completeOnboarding = useCallback(
    (answers: QuizAnswers | null) => {
      setQuizAnswersState(answers);
      try {
        if (answers) window.localStorage.setItem(STORAGE_QUIZ, JSON.stringify(answers));
        window.localStorage.setItem(STORAGE_DONE, "true");
      } catch {
        // ignore
      }
      setQuizEditMode(false);
      setPhase("complete");
      if (answers) {
        saveQuizFn({ data: { answers } }).catch(() => {
          // best effort; local cache still holds it
        });
      }
    },
    [saveQuizFn],
  );

  const openQuizForEdit = useCallback(() => {
    setQuizEditMode(true);
    setPhase("quiz");
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutFn();
    } catch {
      // ignore
    }
    try {
      window.localStorage.removeItem(STORAGE_DONE);
      window.localStorage.removeItem(STORAGE_PROFILE);
      window.localStorage.removeItem(STORAGE_QUIZ);
    } catch {
      // ignore
    }
    setUserProfileState(null);
    setQuizAnswersState(null);
    setQuizEditMode(false);
    setPhase("idle");
  }, [signOutFn]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      phase,
      setPhase,
      userProfile,
      setUserProfile,
      quizAnswers,
      setQuizAnswers,
      completeOnboarding,
      quizEditMode,
      openQuizForEdit,
      signOut,
      hydrated,
    }),
    [
      phase,
      userProfile,
      quizAnswers,
      setUserProfile,
      setQuizAnswers,
      completeOnboarding,
      quizEditMode,
      openQuizForEdit,
      signOut,
      hydrated,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOnboarding must be used within OnboardingProvider");
  return v;
}
