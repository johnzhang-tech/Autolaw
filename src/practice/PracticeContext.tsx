import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type Practice = 'PI' | 'WC';
export const PRACTICE_STORAGE_KEY = 'al-practice';

interface Value { practice: Practice; setPractice: (p: Practice) => void }

/*
 * Outside a provider, consumers get PI and a no-op setter. That keeps a section
 * renderable on its own in a test or a preview without crashing the page.
 */
const Ctx = createContext<Value>({ practice: 'PI', setPractice: () => {} });

const isPractice = (v: unknown): v is Practice => v === 'PI' || v === 'WC';

/* Storage may be absent or throw in private modes; a missing preference is not an error. */
function readStored(): Practice | null {
  try {
    const v = window.sessionStorage.getItem(PRACTICE_STORAGE_KEY);
    return isPractice(v) ? v : null;
  } catch {
    return null;
  }
}

function writeStored(p: Practice) {
  try {
    window.sessionStorage.setItem(PRACTICE_STORAGE_KEY, p);
  } catch {
    /* The choice still lives in React state for this page view. */
  }
}

/**
 * The visitor's practice, chosen once in Solutions and read by the closing section.
 * Session storage, not local: a choice should not outlive the visit.
 */
export function PracticeProvider({ children, initial = 'PI' }: { children: ReactNode; initial?: Practice }) {
  const [practice, set] = useState<Practice>(() => readStored() ?? initial);
  const setPractice = useCallback((p: Practice) => {
    set(p);
    writeStored(p);
  }, []);
  const value = useMemo(() => ({ practice, setPractice }), [practice, setPractice]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePractice(): Value {
  return useContext(Ctx);
}
