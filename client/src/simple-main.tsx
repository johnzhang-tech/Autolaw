// Simplified React entry point to bypass Vite plugin issues
import { createRoot } from "react-dom/client";

function SimpleApp() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '1rem' 
        }}>
          DocuAI React App
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          React is now working! The issue was Vite plugin conflicts.
        </p>
        <button 
          style={{ 
            backgroundColor: '#3B82F6', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
          onClick={() => alert('React click handlers work!')}
        >
          Test React
        </button>
        <a 
          href="/test.html"
          style={{ 
            backgroundColor: '#10B981', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          Back to Test
        </a>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<SimpleApp />);
} else {
  console.error("Root element not found");
}