import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "mmt_mobile_v1";

export interface Entry {
  lift: string;
  weight: number;
  sets?: number | null;
  reps?: number | null;
  date: string;
  note?: string;
}

export interface Message {
  id: string;
  type: string;
  text: string;
  preferredDate?: string | null;
  timestamp: string;
  trainerRead: boolean;
  dismissed: boolean;
  trainerReply: string | null;
}

export interface ChallengeLog {
  challengeId: string;
  amount: number;
  note?: string;
  date: string;
  timestamp: string;
}

export interface Client {
  id: number;
  name: string;
  goal?: string;
  email?: string;
  username: string;
  clientPassword: string;
  entries: Entry[];
  trainerNote: string;
  messages: Message[];
  challengeLogs: ChallengeLog[];
  challengeOptIns: Record<string, boolean>;
  payments: unknown[];
}

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  goal: number;
  unit: string;
  active: boolean;
}

export interface SessionType {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  type: string;
  active: boolean;
}

export interface AvailSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  clientId: number;
  sessionTypeId: string;
  date: string;
  time: string;
  note?: string;
  status: string;
  bookedAt: string;
}

export interface Assessment {
  id: string;
  clientId: number;
  type: string;
  videoUrl?: string;
  zoomLink?: string;
  zoomDate?: string;
  zoomTime?: string;
  clientNotes?: string;
  trainerNotes?: string;
  worksheetId?: string | null;
  submittedAt: string;
}

export interface ExerciseItem {
  id?: string;
  name: string;
  videoUrl?: string;
  sets?: string;
  reps?: string;
  weight?: string;
  rest?: string;
  coachingCues?: string;
  clientLog?: string;
  clientComment?: string;
}

export interface Worksheet {
  id: string;
  assessmentId?: string;
  clientId?: number;
  title: string;
  notes?: string;
  exercises: ExerciseItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HelpRequest {
  id: string;
  name: string;
  email: string;
  category: "workout" | "lift" | "injury" | "badassery";
  details: string;
  videoUrl?: string;
  submittedAt: string;
  trainerReply?: string;
  repliedAt?: string;
  status: "pending" | "replied";
}

export interface CustomProgram {
  id: string;
  clientId: number;
  title: string;
  notes: string;
  exercises: ExerciseItem[];
  status: "requested" | "draft" | "delivered";
  requestedAt: string;
  createdAt?: string;
  deliveredAt?: string;
  clientViewedAt?: string;
}

export interface HomeContent {
  wordsFromMatt: string;
  monthlyFocus: string;
  monthlyFocusTitle: string;
  tightStuffUrl: string;
  quotes: string[];
}

export type GroupClassType =
  | "weekend_rolling"
  | "youth_14_16"
  | "youth_17_18";

export interface GroupClassInterest {
  id: string;
  classType: GroupClassType;
  name: string;
  email: string;
  phone?: string;
  athleteName?: string;
  sport?: string;
  notes?: string;
  submittedAt: string;
}

export interface AppData {
  clients: Client[];
  challenges: Challenge[];
  sessionTypes: SessionType[];
  availability: AvailSlot[];
  bookings: Booking[];
  assessments: Assessment[];
  worksheets: Worksheet[];
  helpRequests: HelpRequest[];
  customPrograms: CustomProgram[];
  groupClassInterests: GroupClassInterest[];
  nextId: number;
  homeContent: HomeContent;
}

export const DEFAULT_QUOTES = [
  "Your only competition is who you were yesterday.",
  "Pain is temporary. Quitting lasts forever.",
  "The gym doesn't care about your excuses. Neither does Matt.",
  "Strong is a choice you make every single day.",
  "Progress, not perfection.",
];

export const DEFAULT_HOME: HomeContent = {
  wordsFromMatt:
    "Every session counts. Every rep matters. Whether you're here to fix something broken, build something new, or just figure out where to start — you're in the right place. Let's get to work.",
  monthlyFocus:
    "Posterior chain. We're fixing the chain reaction: tight hips, weak glutes, rounded lower back. If you sit all day, this month is specifically for you.",
  monthlyFocusTitle: "March: Posterior Chain",
  tightStuffUrl: "",
  quotes: DEFAULT_QUOTES,
};

export const DEFAULT_SESSION_TYPES: SessionType[] = [
  {
    id: "st_1",
    name: "Single Session",
    description: "One-on-one personal training session, 60 min.",
    duration: 60,
    price: 80,
    type: "single",
    active: true,
  },
  {
    id: "st_3",
    name: "Program Blueprint Session",
    description: "Matt builds a custom program for your goals and location.",
    duration: 90,
    price: 150,
    type: "blueprint",
    active: true,
  },
  {
    id: "st_4",
    name: "Virtual Movement Assessment",
    description:
      "Submit a video or schedule a Zoom. Matt assesses your mechanics.",
    duration: 45,
    price: 100,
    type: "virtual",
    active: true,
  },
  {
    id: "st_5",
    name: "I'm Stuck / Something Hurts / Need a Workout",
    description: "Reach out and Matt will help. Pay what you feel — minimum $1.",
    duration: 30,
    price: 1,
    type: "stuck",
    active: true,
  },
  {
    id: "st_6",
    name: "Team Program Consultation",
    description: "Custom program for any team, any sport, any age. On-site or remote.",
    duration: 60,
    price: 200,
    type: "team",
    active: true,
  },
];

export const EMPTY: AppData = {
  clients: [],
  challenges: [],
  sessionTypes: DEFAULT_SESSION_TYPES,
  availability: [],
  bookings: [],
  assessments: [],
  worksheets: [],
  helpRequests: [],
  customPrograms: [],
  groupClassInterests: [],
  nextId: 1,
  homeContent: DEFAULT_HOME,
};

export const LIFTS = [
  "Squat",
  "Bench Press",
  "Deadlift",
  "Overhead Press",
  "Floor Press",
];

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const STATUS_COLORS: Record<string, string> = {
  upcoming: "#4a9eff",
  attended: "#4caf7d",
  cancelled: "#e84040",
  noshow: "#e8621a",
};
export const STATUS_LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  attended: "Attended",
  cancelled: "Cancelled",
  noshow: "No-Show",
};

export const TRAINER_PASSWORD = "coach123";

export function uid(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function nowTs(): string {
  return new Date().toISOString();
}

export function fmt(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtS(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function fmtTime(t: string): string {
  const [h, m] = t.split(":");
  const hr = +h;
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "pm" : "am"}`;
}

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.homeContent) parsed.homeContent = DEFAULT_HOME;
    if (!parsed.helpRequests) parsed.helpRequests = [];
    if (!parsed.sessionTypes) parsed.sessionTypes = DEFAULT_SESSION_TYPES;
    if (!parsed.customPrograms) parsed.customPrograms = [];
    if (!parsed.groupClassInterests) parsed.groupClassInterests = [];
    return parsed;
  } catch {
    return EMPTY;
  }
}

export async function persistData(d: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}

export function getAvailableSlots(
  availability: AvailSlot[],
  bookings: Booking[],
  days = 21
): { date: string; time: string; slotId: string }[] {
  const slots: { date: string; time: string; slotId: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dow = d.getDay();
    const ds = d.toISOString().split("T")[0];
    (availability || [])
      .filter((a) => a.dayOfWeek === dow)
      .forEach((s) => {
        const taken = (bookings || []).some(
          (b) =>
            b.date === ds &&
            b.time === s.startTime &&
            b.status !== "cancelled"
        );
        if (!taken) slots.push({ date: ds, time: s.startTime, slotId: s.id });
      });
  }
  return slots.sort(
    (a, b) =>
      a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  );
}
