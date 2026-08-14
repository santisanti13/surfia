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
import BlogIndex from "./pages/blog/BlogIndex";
import BlogPost from "./pages/blog/BlogPost";
import AdminAemet from "./pages/AdminAemet";
import OAuthConsent from "./pages/OAuthConsent";
import RegionHub from "./pages/regions/RegionHub";
import RegionPage from "./pages/regions/RegionPage";
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
            <Route path="/surf" element={<RegionHub />} />
            <Route path="/surf/:region" element={<RegionPage />} />
            <Route path="/trust" element={<Trust />} />
            <Route path="/blog/como-leer-previsiones-surf" element={<ComoLeerPrevisionesSurf />} />
            <Route path="/admin/aemet" element={<AdminAemet />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
