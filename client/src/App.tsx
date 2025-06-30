function App() {
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
          DocuAI
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          AI-Powered Real Estate Documentation
        </p>
        <button style={{ 
          backgroundColor: '#3B82F6', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: '8px', 
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;
