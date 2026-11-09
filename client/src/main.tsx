import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAnalyticsTracking } from "./lib/analyticsTracker";
import { applyAdSenseScripts, getAdSenseConfigClient } from "./lib/adsenseService";

// Initialize analytics heartbeat and AdSense scripts
initAnalyticsTracking();
applyAdSenseScripts(getAdSenseConfigClient());

createRoot(document.getElementById("root")!).render(<App />);

