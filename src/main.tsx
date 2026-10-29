import { createRoot } from "react-dom/client";
import "./styles/base.css";
import App from "./App.tsx";
import { startPageAnalytics } from './measure';

startPageAnalytics('landing_viewed');

createRoot(document.getElementById("root")!).render(<App />);
