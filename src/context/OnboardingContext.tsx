import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const done = window.localStorage.getItem(STORAGE_DONE);
      const profileRaw = window.localStorage.getItem(STORAGE_PROFILE);
      const quizRaw = window.localStorage.getItem(STORAGE_QUIZ);
      if (profileRaw) setUserProfileState(JSON.parse(profileRaw));
      if (quizRaw) setQuizAnswersState(JSON.parse(quizRaw));
      if (done === "true") setPhase("complete");
    } catch {
      // ignore
    }
  }, []);

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

  const completeOnboarding = useCallback((answers: QuizAnswers | null) => {
    setQuizAnswersState(answers);
    try {
      if (answers) window.localStorage.setItem(STORAGE_QUIZ, JSON.stringify(answers));
      window.localStorage.setItem(STORAGE_DONE, "true");
    } catch {
      // ignore
    }
    setQuizEditMode(false);
    setPhase("complete");
  }, []);

  const openQuizForEdit = useCallback(() => {
    setQuizEditMode(true);
    setPhase("quiz");
  }, []);

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
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOnboarding must be used within OnboardingProvider");
  return v;
}
