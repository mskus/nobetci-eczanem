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
import NearestHospitals from "./pages/NearestHospitals";
import TurkeyHealthStats from "./pages/TurkeyHealthStats";
import HealthPortalTools from "./pages/HealthPortalTools";
import EarthquakeTracker from "./pages/EarthquakeTracker";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <SiteLayout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/deprem" component={EarthquakeTracker} />
          <Route path="/deprem-takibi" component={EarthquakeTracker} />
          <Route path="/en-yakin-hastane" component={NearestHospitals} />
          <Route path="/saglik-araclari" component={HealthPortalTools} />
          <Route path="/sgk-katki-payi-hesaplayici" component={HealthPortalTools} />
          <Route path="/hava-kalitesi-polen" component={HealthPortalTools} />
          <Route path="/titck-ilac-geri-cekme" component={HealthPortalTools} />
          <Route path="/ilac-etkilesim" component={HealthPortalTools} />
          <Route path="/kan-bagisi" component={HealthPortalTools} />
          <Route path="/ilk-yardim" component={HealthPortalTools} />
          <Route path="/turkiyede-saglik" component={TurkeyHealthStats} />
          <Route path="/tum-eczaneler" component={AllPharmacies} />
          <Route path="/blog" component={Blog} />
          <Route path="/veri-kaynaklari" component={DataSources} />
          <Route path="/reklam-ver" component={Advertise} />
          <Route path="/iletisim" component={Advertise} />
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
