import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import OnlineCoaching from "./pages/OnlineCoaching";
import MeetPrep from "./pages/MeetPrep";
import FormCheck from "./pages/FormCheck";
import StudioRental from "./pages/StudioRental";
import TrainerMentorship from "./pages/TrainerMentorship";
import Teams from "./pages/Teams";
import Store from "./pages/Store";
import Help from "./pages/Help";
import Login from "./pages/Login";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ClientPortal from "./pages/ClientPortal";
import TrainerPortal from "./pages/TrainerPortal";
function Router() {
  // make sure to consider if you need authentication for certain routes
  const { page } = useApp();

  switch (page) {
    case 'home': return <Home />;
    case 'online-coaching': return <OnlineCoaching />;
    case 'meet-prep': return <MeetPrep />;
    case 'form-check': return <FormCheck />;
    case 'studio-rental': return <StudioRental />;
    case 'trainer-mentorship': return <TrainerMentorship />;
    case 'teams': return <Teams />;
    case 'store': return <Store />;
    case 'help': return <Help />;
    case 'login': return <Login />;
    case 'privacy-policy': return <PrivacyPolicy />;
    case 'client-portal': return <ClientPortal />;
    case 'trainer-portal': return <TrainerPortal />;
    default: return <Home />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
