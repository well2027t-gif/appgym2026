// GymTracker — App Routes
// Design: Dark Athletic Premium | Space Grotesk + Inter | Green Neon #00FF87

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import WorkoutPage from "./pages/WorkoutPage";
import ProgressPage from "./pages/ProgressPage";
import DashboardPage from "./pages/DashboardPage";
import ProgramBuilderPage from "./pages/ProgramBuilderPage";
import ProfilePage from "./pages/ProfilePage";
import { initializeWeeklyReset } from "@/lib/workoutData";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/workout/:dayId"} component={WorkoutPage} />
      <Route path={"/builder"} component={ProgramBuilderPage} />
      <Route path={"/progress"} component={ProgressPage} />
      <Route path={"/dashboard"} component={DashboardPage} />
      <Route path={"/profile"} component={ProfilePage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize weekly reset on app load
    initializeWeeklyReset();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#1A1D27",
                border: "1px solid rgba(0,255,135,0.2)",
                color: "#fff",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
