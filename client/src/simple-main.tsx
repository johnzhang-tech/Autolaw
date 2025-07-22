import { createRoot } from "react-dom/client";
import "./index.css";

// Simple test component to isolate the error
function SimpleApp() {
  return (
    <div className="p-8">
      <h1>Simple Test App</h1>
      <p>This is a minimal test to isolate the runtime error.</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SimpleApp />);