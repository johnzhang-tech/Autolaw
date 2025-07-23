import { useState } from "react";

export default function AgentsTest() {
  const [tab, setTab] = useState(1);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tab Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setTab(1)}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: tab === 1 ? 'blue' : 'gray',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Tab 1 {tab === 1 ? '(ACTIVE)' : ''}
        </button>
        <button 
          onClick={() => setTab(2)}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: tab === 2 ? 'blue' : 'gray',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Tab 2 {tab === 2 ? '(ACTIVE)' : ''}
        </button>
        <button 
          onClick={() => setTab(3)}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: tab === 3 ? 'blue' : 'gray',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Tab 3 {tab === 3 ? '(ACTIVE)' : ''}
        </button>
      </div>

      <div style={{ border: '2px solid black', padding: '20px', minHeight: '400px' }}>
        {tab === 1 && <div style={{ backgroundColor: 'red', padding: '20px', color: 'white' }}>TAB 1 CONTENT</div>}
        {tab === 2 && <div style={{ backgroundColor: 'green', padding: '20px', color: 'white' }}>TAB 2 CONTENT</div>}
        {tab === 3 && <div style={{ backgroundColor: 'blue', padding: '20px', color: 'white' }}>TAB 3 CONTENT</div>}
      </div>

      <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>
        Current tab: {tab}
      </div>
    </div>
  );
}