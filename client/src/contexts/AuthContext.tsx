import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, hasFirebaseConfig, type AuthUser } from "@/lib/firebase";

export type AppRole = "user" | "personal" | "nutritionist";

type AppUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  role: AppRole;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (params: {
    email: string;
    password: string;
    displayName: string;
    role: AppRole;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadUserRole(firebaseUser: AuthUser): Promise<AppRole> {
  if (!db) return "user";
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as { role?: AppRole };
    if (data.role === "personal" || data.role === "nutritionist") {
      return data.role;
    }
  }
  return "user";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !hasFirebaseConfig) {
      setUser(null);
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async current => {
      if (!current) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const role = await loadUserRole(current);
        setUser({
          uid: current.uid,
          displayName: current.displayName,
          email: current.email,
          role,
        });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function signIn(email: string, password: string) {
    if (!auth) throw new Error("Firebase não configurado. Defina VITE_FIREBASE_*.");
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut() {
    if (!auth) return;
    await firebaseSignOut(auth);
  }

  async function signUp({
    email,
    password,
    displayName,
    role,
  }: {
    email: string;
    password: string;
    displayName: string;
    role: AppRole;
  }) {
    if (!auth || !db) {
      throw new Error("Firebase não configurado. Defina VITE_FIREBASE_*.");
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    const base = {
      displayName,
      email,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), base, { merge: true });
    if (role === "personal" || role === "nutritionist") {
      await setDoc(
        doc(db, "professionals", cred.user.uid),
        {
          userId: cred.user.uid,
          type: role,
          bio: "",
          specialties: [],
          activeClientsCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

