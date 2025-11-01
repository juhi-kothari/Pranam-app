import React, { useState } from 'react';

const TestAPI = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testQuestions = async () => {
    setLoading(true);
    setResult('Testing questions API...');
    
    try {
      const response = await fetch('http://localhost:5000/api/forms/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          category: 'General',
          question: 'This is a test question from the test component.'
        }),
      });

      const data = await response.json();
      setResult(`Questions API Result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Questions API Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testChat = async () => {
    setLoading(true);
    setResult('Testing chat API...');
    
    try {
      const response = await fetch('http://localhost:5000/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: 'Test Chat',
          message: 'This is a test message from the test component.'
        }),
      });

      const data = await response.json();
      setResult(`Chat API Result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Chat API Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackend = async () => {
    setLoading(true);
    setResult('Testing backend health...');
    
    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      setResult(`Backend Health: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Backend Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'white', 
      border: '2px solid #BCC571', 
      padding: '20px', 
      borderRadius: '10px',
      zIndex: 9999,
      maxWidth: '400px',
      maxHeight: '500px',
      overflow: 'auto'
    }}>
      <h3>API Test Component</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testBackend} 
          disabled={loading}
          style={{ 
            margin: '5px', 
            padding: '10px', 
            backgroundColor: '#BCC571', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Backend
        </button>
        
        <button 
          onClick={testQuestions} 
          disabled={loading}
          style={{ 
            margin: '5px', 
            padding: '10px', 
            backgroundColor: '#BCC571', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Questions
        </button>
        
        <button 
          onClick={testChat} 
          disabled={loading}
          style={{ 
            margin: '5px', 
            padding: '10px', 
            backgroundColor: '#BCC571', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Chat
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '5px', 
        fontSize: '12px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        {loading ? 'Loading...' : result || 'Click a button to test the APIs'}
      </div>
    </div>
  );
};

export default TestAPI;
