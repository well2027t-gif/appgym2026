import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth, type AppRole } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRoles?: AppRole[];
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation(redirectTo);
      return;
    }
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      setLocation(redirectTo);
    }
  }, [loading, user, requiredRoles, redirectTo, setLocation]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-sm text-[#64748B]">Carregando...</div>;
  }

  if (!user) return null;
  if (requiredRoles && !requiredRoles.includes(user.role)) return null;
  return <>{children}</>;
}

