import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AppData,
  Assessment,
  Booking,
  Client,
  Challenge,
  CustomProgram,
  GroupClassInterest,
  HelpRequest,
  HomeContent,
  Message,
  AvailSlot,
  Worksheet,
  EMPTY,
  loadData,
  persistData,
  uid,
  today,
  nowTs,
} from "@/utils/storage";

interface AppContextValue {
  data: AppData;
  isLoading: boolean;
  updateData: (fn: (d: AppData) => AppData) => void;
  // auth
  currentClientId: number | null;
  isTrainer: boolean;
  loginTrainer: () => void;
  loginClient: (id: number) => void;
  logout: () => void;
  signUp: (
    f: Omit<
      Client,
      | "id"
      | "entries"
      | "trainerNote"
      | "messages"
      | "challengeLogs"
      | "challengeOptIns"
      | "payments"
    >
  ) => number;
  // client actions
  sendMessage: (
    cId: number,
    msg: Omit<Message, "id" | "timestamp" | "trainerRead" | "dismissed" | "trainerReply">
  ) => void;
  logChallenge: (
    cId: number,
    chId: string,
    amount: number,
    note: string
  ) => void;
  toggleOptIn: (cId: number, chId: string) => void;
  addBooking: (b: Booking) => void;
  submitAssessment: (a: Assessment) => void;
  saveWorksheet: (ws: Worksheet) => void;
  submitHelpRequest: (r: HelpRequest) => void;
  requestProgram: (clientId: number) => void;
  saveProgram: (program: CustomProgram) => void;
  deliverProgram: (programId: string) => void;
  markProgramViewed: (programId: string) => void;
  submitGroupInterest: (interest: GroupClassInterest) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [currentClientId, setCurrentClientId] = useState<number | null>(null);
  const [isTrainer, setIsTrainer] = useState(false);

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      setIsLoading(false);
    });
  }, []);

  const updateData = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => {
      const next = fn(JSON.parse(JSON.stringify(prev)) as AppData);
      persistData(next);
      return next;
    });
  }, []);

  const loginTrainer = useCallback(() => {
    setIsTrainer(true);
    setCurrentClientId(null);
  }, []);

  const loginClient = useCallback((id: number) => {
    setCurrentClientId(id);
    setIsTrainer(false);
    updateData((d) => {
      const c = d.clients.find((c) => c.id === id);
      if (c) c.messages.forEach((m) => (m.trainerRead = true));
      return d;
    });
  }, [updateData]);

  const logout = useCallback(() => {
    setCurrentClientId(null);
    setIsTrainer(false);
  }, []);

  const signUp = useCallback(
    (
      f: Omit<
        Client,
        | "id"
        | "entries"
        | "trainerNote"
        | "messages"
        | "challengeLogs"
        | "challengeOptIns"
        | "payments"
      >
    ): number => {
      let newId = 0;
      setData((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as AppData;
        newId = next.nextId++;
        next.clients.push({
          id: newId,
          entries: [],
          trainerNote: "",
          messages: [],
          challengeLogs: [],
          challengeOptIns: {},
          payments: [],
          ...f,
        });
        persistData(next);
        return next;
      });
      return newId;
    },
    []
  );

  const sendMessage = useCallback(
    (
      cId: number,
      msg: Omit<
        Message,
        "id" | "timestamp" | "trainerRead" | "dismissed" | "trainerReply"
      >
    ) => {
      updateData((d) => {
        const c = d.clients.find((c) => c.id === cId);
        if (c) {
          c.messages.push({
            id: uid(),
            ...msg,
            preferredDate: msg.preferredDate ?? null,
            timestamp: nowTs(),
            trainerRead: false,
            dismissed: false,
            trainerReply: null,
          });
        }
        return d;
      });
    },
    [updateData]
  );

  const logChallenge = useCallback(
    (cId: number, chId: string, amount: number, note: string) => {
      updateData((d) => {
        const c = d.clients.find((c) => c.id === cId);
        if (c) {
          c.challengeLogs.push({
            challengeId: chId,
            amount,
            note,
            date: today(),
            timestamp: nowTs(),
          });
        }
        return d;
      });
    },
    [updateData]
  );

  const toggleOptIn = useCallback(
    (cId: number, chId: string) => {
      updateData((d) => {
        const c = d.clients.find((c) => c.id === cId);
        if (c) {
          c.challengeOptIns[chId] =
            c.challengeOptIns[chId] === false ? true : false;
        }
        return d;
      });
    },
    [updateData]
  );

  const addBooking = useCallback(
    (b: Booking) => {
      updateData((d) => {
        d.bookings.push(b);
        return d;
      });
    },
    [updateData]
  );

  const submitAssessment = useCallback(
    (a: Assessment) => {
      updateData((d) => {
        d.assessments.push(a);
        return d;
      });
    },
    [updateData]
  );

  const saveWorksheet = useCallback(
    (ws: Worksheet) => {
      updateData((d) => {
        const i = d.worksheets.findIndex((w) => w.id === ws.id);
        if (i > -1) d.worksheets[i] = ws;
        else d.worksheets.push(ws);
        return d;
      });
    },
    [updateData]
  );

  const submitHelpRequest = useCallback(
    (r: HelpRequest) => {
      updateData((d) => {
        d.helpRequests.push(r);
        return d;
      });
    },
    [updateData]
  );

  const requestProgram = useCallback(
    (clientId: number) => {
      updateData((d) => {
        if (!d.customPrograms) d.customPrograms = [];
        d.customPrograms.push({
          id: uid(),
          clientId,
          title: "",
          notes: "",
          exercises: [],
          status: "requested",
          requestedAt: nowTs(),
        });
        const client = d.clients.find((c) => c.id === clientId);
        if (client) {
          client.messages.push({
            id: uid(),
            type: "program_request",
            text: "I'd like a custom program built for me.",
            timestamp: nowTs(),
            trainerRead: false,
            dismissed: false,
            trainerReply: null,
          });
        }
        return d;
      });
    },
    [updateData]
  );

  const saveProgram = useCallback(
    (program: CustomProgram) => {
      updateData((d) => {
        if (!d.customPrograms) d.customPrograms = [];
        const i = d.customPrograms.findIndex((p) => p.id === program.id);
        if (i > -1) d.customPrograms[i] = program;
        else d.customPrograms.push(program);
        return d;
      });
    },
    [updateData]
  );

  const deliverProgram = useCallback(
    (programId: string) => {
      updateData((d) => {
        if (!d.customPrograms) d.customPrograms = [];
        const p = d.customPrograms.find((x) => x.id === programId);
        if (p) {
          p.status = "delivered";
          p.deliveredAt = nowTs();
        }
        return d;
      });
    },
    [updateData]
  );

  const markProgramViewed = useCallback(
    (programId: string) => {
      updateData((d) => {
        if (!d.customPrograms) d.customPrograms = [];
        const p = d.customPrograms.find((x) => x.id === programId);
        if (p) {
          p.clientViewedAt = nowTs();
        }
        return d;
      });
    },
    [updateData]
  );

  const submitGroupInterest = useCallback(
    (interest: GroupClassInterest) => {
      updateData((d) => {
        if (!d.groupClassInterests) d.groupClassInterests = [];
        d.groupClassInterests.push(interest);
        return d;
      });
    },
    [updateData]
  );

  return (
    <AppContext.Provider
      value={{
        data,
        isLoading,
        updateData,
        currentClientId,
        isTrainer,
        loginTrainer,
        loginClient,
        logout,
        signUp,
        sendMessage,
        logChallenge,
        toggleOptIn,
        addBooking,
        submitAssessment,
        saveWorksheet,
        submitHelpRequest,
        requestProgram,
        saveProgram,
        deliverProgram,
        markProgramViewed,
        submitGroupInterest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
