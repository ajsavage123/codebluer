import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // DEV BYPASS: skip all auth + onboarding checks
  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  // DEV BYPASS: skip all auth + onboarding checks
  return <>{children}</>;
}

function AppRoutes() {
  // DEV BYPASS: always render main app, /auth goes directly to Index too
  return (
    <Routes>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  // We show the main app only after splash is gone to ensure a stunning first impression
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />

          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

          <div className={showSplash ? "hidden" : "block animate-fade-in duration-1000"}>
            <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
              <AppRoutes />
            </BrowserRouter>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
