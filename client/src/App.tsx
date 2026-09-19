import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import SiteLayout from "./components/SiteLayout";
import Home from "./pages/Home";
import DataSources from "./pages/DataSources";
import Advertise from "./pages/Advertise";
import AllPharmacies from "./pages/AllPharmacies";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <SiteLayout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/tum-eczaneler" component={AllPharmacies} />
          <Route path="/blog" component={Blog} />
          <Route path="/veri-kaynaklari" component={DataSources} />
          <Route path="/reklam-ver" component={Advertise} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </SiteLayout>
    </WouterRouter>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
