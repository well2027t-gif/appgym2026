// GymTracker — App Routes
// Design: Dark Athletic Premium | Space Grotesk + Inter | Green Neon #00FF87

import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import WorkoutPage from "./pages/WorkoutPage";
import ProgressPage from "./pages/ProgressPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import TreinoPage from "./pages/TreinoPage";
import AchievementsPage from "./pages/AchievementsPage";
import ProfessionalsPage from "./pages/ProfessionalsPage";
import ConversationPage from "./pages/ConversationPage";
import PersonalDashboardPage from "./pages/PersonalDashboardPage";
import NutritionistDashboardPage from "./pages/NutritionistDashboardPage";
import PersonalClientDetailPage from "./pages/PersonalClientDetailPage";
import NutritionistClientDetailPage from "./pages/NutritionistClientDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeWeeklyReset } from "@/lib/workoutData";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/workout/:dayId"} component={WorkoutPage} />
      <Route path={"/treino"} component={TreinoPage} />
      <Route path={"/builder"} component={TreinoPage} />
      <Route path={"/progress"} component={ProgressPage} />
      <Route path={"/conquistas"} component={AchievementsPage} />
      <Route path={"/dashboard"} component={DashboardPage} />
      <Route path={"/profile"} component={ProfilePage} />
      <Route path={"/profissionais"} component={ProfessionalsPage} />
      <Route path={"/conversa/:conversationId"} component={ConversationPage} />
      <Route path={"/painel/personal"}>
        <ProtectedRoute requiredRoles={["personal"]}>
          <PersonalDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/painel/personal/clientes/:userId"}>
        <ProtectedRoute requiredRoles={["personal"]}>
          <PersonalClientDetailPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/painel/nutricionista"}>
        <ProtectedRoute requiredRoles={["nutritionist"]}>
          <NutritionistDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/painel/nutricionista/clientes/:userId"}>
        <ProtectedRoute requiredRoles={["nutritionist"]}>
          <NutritionistClientDetailPage />
        </ProtectedRoute>
      </Route>
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
        <AuthProvider>
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
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
