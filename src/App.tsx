import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import StaffDashboard from "./pages/StaffDashboard";
import StudentProfile from "./pages/StudentProfile";
import OwnerDashboard from "./pages/OwnerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import BatchContestTracker from "./pages/BatchContestTracker";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login/:role" element={<Login />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/contest-tracker" element={<BatchContestTracker />} />
            <Route path="/staff/analytics" element={<Analytics />} />
            <Route path="/staff/student/:id" element={<StudentDashboard />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/student/dashboard/:id" element={<StudentDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
