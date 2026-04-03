import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
           <h1 className="text-4xl font-extrabold text-blue-600 mb-2">EvoFit</h1>
           <p className="text-slate-600 font-medium">Frontend React Environment Ready</p>
        </div>
      </div>
    </Router>
  );
}

export default App;
