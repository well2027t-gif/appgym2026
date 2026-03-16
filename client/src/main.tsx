import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function injectAnalyticsScript() {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;

  if (!endpoint || !websiteId || typeof document === "undefined") {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = `${endpoint.replace(/\/$/, "")}/umami`;
  script.setAttribute("data-website-id", websiteId);
  document.head.appendChild(script);
}

injectAnalyticsScript();

createRoot(document.getElementById("root")!).render(<App />);
