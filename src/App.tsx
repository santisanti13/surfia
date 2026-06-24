import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Spots from "./pages/Spots";
import Auth from "./pages/Auth";
import Alerts from "./pages/Alerts";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Trust from "./pages/Trust";
import ComoLeerPrevisionesSurf from "./pages/blog/ComoLeerPrevisionesSurf";
import AdminAemet from "./pages/AdminAemet";
import AlertCheckerProvider from "./components/AlertCheckerProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AlertCheckerProvider />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/spots" element={<Spots />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/trust" element={<Trust />} />
            <Route path="/blog/como-leer-previsiones-surf" element={<ComoLeerPrevisionesSurf />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
