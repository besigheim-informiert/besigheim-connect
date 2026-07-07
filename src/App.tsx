import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Vereine from "./pages/Vereine";
import VereinDetail from "./pages/VereinDetail";
import Veranstaltungen from "./pages/Veranstaltungen";
import Mitmachen from "./pages/Mitmachen";
import Barrierefreiheit from "./pages/Barrierefreiheit";
import NetzwerkQuartier from "./pages/NetzwerkQuartier";
import UeberUns from "./pages/UeberUns";
import Kontakt from "./pages/Kontakt";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vereine" element={<Vereine />} />
          <Route path="/vereine/:id" element={<VereinDetail />} />
          <Route path="/veranstaltungen" element={<Veranstaltungen />} />
          <Route path="/mitmachen" element={<Mitmachen />} />
          <Route path="/barrierefrei" element={<Barrierefreiheit />} />
          <Route path="/netzwerk-quartier" element={<NetzwerkQuartier />} />
          <Route path="/ueber-uns" element={<UeberUns />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
