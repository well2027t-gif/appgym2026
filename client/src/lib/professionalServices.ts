import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, hasFirebaseConfig, storage } from "@/lib/firebase";

export type ProfessionalType = "personal" | "nutritionist";
export type LinkStatus = "pending" | "active" | "blocked";
export type ProgressView = "front" | "back" | "side";

export type UserProfileDoc = {
  id: string;
  role: "user" | ProfessionalType;
  displayName: string;
  photoURL?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ProfessionalDoc = {
  id: string;
  userId: string;
  type: ProfessionalType;
  displayName: string;
  bio: string;
  specialties: string[];
  avatarUrl?: string;
  activeClientsCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ClientProfessionalLinkDoc = {
  id: string;
  userId: string;
  professionalId: string;
  type: ProfessionalType;
  status: LinkStatus;
  createdAt?: unknown;
  lastContactAt?: unknown;
};

export type ConversationDoc = {
  id: string;
  userId: string;
  professionalId: string;
  type: ProfessionalType;
  lastMessage?: string;
  lastMessageAt?: unknown;
  unreadForUser?: number;
  unreadForProfessional?: number;
  createdAt?: unknown;
};

export type MessageDoc = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  attachments?: string[];
  createdAt?: unknown;
  read?: boolean;
};

export type ProgressPhotoDoc = {
  id: string;
  userId: string;
  professionalId?: string;
  view: ProgressView;
  url: string;
  takenAt?: string;
  note?: string;
  createdAt?: unknown;
};

export type WorkoutPlanDoc = {
  id: string;
  userId: string;
  professionalId: string;
  title: string;
  description?: string;
  weeks?: number;
  daysPerWeek?: number;
  structure?: unknown;
  active?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type MealPlanDoc = {
  id: string;
  userId: string;
  professionalId: string;
  title: string;
  description?: string;
  caloriesTarget?: number;
  macros?: { protein?: number; carbs?: number; fats?: number };
  meals?: unknown[];
  active?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const demoProfessionals: ProfessionalDoc[] = [
  {
    id: "demo-personal",
    userId: "demo-personal",
    type: "personal",
    displayName: "Coach Rafael",
    bio: "Especialista em hipertrofia e recomposição corporal.",
    specialties: ["Hipertrofia", "Força"],
    avatarUrl:
      "https://images.unsplash.com/photo-1758875568932-0eefd3e60090?auto=format&fit=crop&w=300&q=80",
    activeClientsCount: 24,
  },
  {
    id: "demo-nutri",
    userId: "demo-nutri",
    type: "nutritionist",
    displayName: "Dra. Carol",
    bio: "Nutrição esportiva com foco em performance e emagrecimento.",
    specialties: ["Nutrição esportiva", "Emagrecimento"],
    avatarUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
    activeClientsCount: 31,
  },
];

function assertDb() {
  if (!db) throw new Error("Firebase não configurado.");
  return db;
}

export async function upsertUserProfile(data: {
  userId: string;
  role: "user" | ProfessionalType;
  displayName: string;
  photoURL?: string;
}) {
  if (!hasFirebaseConfig || !db) return;
  await setDoc(
    doc(assertDb(), "users", data.userId),
    {
      role: data.role,
      displayName: data.displayName,
      photoURL: data.photoURL ?? "",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function listProfessionals(type?: ProfessionalType): Promise<ProfessionalDoc[]> {
  if (!hasFirebaseConfig || !db) {
    return type ? demoProfessionals.filter(item => item.type === type) : demoProfessionals;
  }
  const constraints = type ? [where("type", "==", type)] : [];
  const q = query(collection(assertDb(), "professionals"), ...constraints, limit(50));
  const snap = await getDocs(q);
  return snap.docs.map(item => ({ id: item.id, ...(item.data() as Omit<ProfessionalDoc, "id">) }));
}

export async function ensureClientProfessionalLink(data: {
  userId: string;
  professionalId: string;
  type: ProfessionalType;
}) {
  if (!hasFirebaseConfig || !db) return;
  const q = query(
    collection(assertDb(), "clientProfessionalLinks"),
    where("userId", "==", data.userId),
    where("professionalId", "==", data.professionalId),
    limit(1),
  );
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;
  const created = await addDoc(collection(assertDb(), "clientProfessionalLinks"), {
    ...data,
    status: "active",
    createdAt: serverTimestamp(),
    lastContactAt: serverTimestamp(),
  });
  return created.id;
}

export async function getOrCreateConversation(data: {
  userId: string;
  professionalId: string;
  type: ProfessionalType;
}) {
  if (!hasFirebaseConfig || !db) return `demo-${data.professionalId}-${data.userId}`;
  const q = query(
    collection(assertDb(), "conversations"),
    where("userId", "==", data.userId),
    where("professionalId", "==", data.professionalId),
    limit(1),
  );
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  await ensureClientProfessionalLink(data);
  const created = await addDoc(collection(assertDb(), "conversations"), {
    ...data,
    lastMessage: "",
    unreadForUser: 0,
    unreadForProfessional: 0,
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
  });
  return created.id;
}

export async function getConversationById(id: string): Promise<ConversationDoc | null> {
  if (!hasFirebaseConfig || !db) return null;
  const snap = await getDoc(doc(assertDb(), "conversations", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<ConversationDoc, "id">) };
}

export function subscribeConversationMessages(
  conversationId: string,
  onData: (items: MessageDoc[]) => void,
): Unsubscribe {
  if (!hasFirebaseConfig || !db) {
    onData([]);
    return () => {};
  }
  const q = query(
    collection(assertDb(), "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, snap => {
    const items = snap.docs.map(item => ({ id: item.id, ...(item.data() as Omit<MessageDoc, "id">) }));
    onData(items);
  });
}

export async function sendConversationMessage(params: {
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
}) {
  if (!hasFirebaseConfig || !db) return;
  const message = params.text.trim();
  if (!message) return;

  await addDoc(collection(assertDb(), "conversations", params.conversationId, "messages"), {
    senderId: params.senderId,
    receiverId: params.receiverId,
    text: message,
    attachments: [],
    createdAt: serverTimestamp(),
    read: false,
  });

  await updateDoc(doc(assertDb(), "conversations", params.conversationId), {
    lastMessage: message,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function listLinksByProfessional(professionalId: string): Promise<ClientProfessionalLinkDoc[]> {
  if (!hasFirebaseConfig || !db) return [];
  const q = query(
    collection(assertDb(), "clientProfessionalLinks"),
    where("professionalId", "==", professionalId),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.docs.map(item => ({ id: item.id, ...(item.data() as Omit<ClientProfessionalLinkDoc, "id">) }));
}

export async function listProgressPhotosByUser(userId: string): Promise<ProgressPhotoDoc[]> {
  if (!hasFirebaseConfig || !db) return [];
  const q = query(collection(assertDb(), "progressPhotos"), where("userId", "==", userId), limit(200));
  const snap = await getDocs(q);
  return snap.docs.map(item => ({ id: item.id, ...(item.data() as Omit<ProgressPhotoDoc, "id">) }));
}

export async function uploadProgressPhoto(params: {
  userId: string;
  file: File;
  view: ProgressView;
  professionalId?: string;
  note?: string;
}) {
  if (!hasFirebaseConfig || !db || !storage) return null;
  const photoRef = ref(storage, `progress-photos/${params.userId}/${Date.now()}-${params.file.name}`);
  await uploadBytes(photoRef, params.file);
  const url = await getDownloadURL(photoRef);
  const created = await addDoc(collection(assertDb(), "progressPhotos"), {
    userId: params.userId,
    professionalId: params.professionalId ?? null,
    view: params.view,
    url,
    note: params.note ?? "",
    takenAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
  return { id: created.id, url };
}

export async function saveWorkoutPlan(input: Omit<WorkoutPlanDoc, "id" | "createdAt" | "updatedAt">) {
  if (!hasFirebaseConfig || !db) return null;
  const created = await addDoc(collection(assertDb(), "workoutPlans"), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function listWorkoutPlans(userId: string, professionalId: string): Promise<WorkoutPlanDoc[]> {
  if (!hasFirebaseConfig || !db) return [];
  const q = query(
    collection(assertDb(), "workoutPlans"),
    where("userId", "==", userId),
    where("professionalId", "==", professionalId),
    limit(50),
  );
  const snap = await getDocs(q);
  return snap.docs.map(item => ({ id: item.id, ...(item.data() as Omit<WorkoutPlanDoc, "id">) }));
}

export async function saveMealPlan(input: Omit<MealPlanDoc, "id" | "createdAt" | "updatedAt">) {
  if (!hasFirebaseConfig || !db) return null;
  const created = await addDoc(collection(assertDb(), "mealPlans"), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function listMealPlans(userId: string, professionalId: string): Promise<MealPlanDoc[]> {
  if (!hasFirebaseConfig || !db) return [];
  const q = query(
    collection(assertDb(), "mealPlans"),
    where("userId", "==", userId),
    where("professionalId", "==", professionalId),
    limit(50),
  );
  const snap = await getDocs(q);
  return snap.docs.map(item => ({ id: item.id, ...(item.data() as Omit<MealPlanDoc, "id">) }));
}

