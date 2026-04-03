import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UploadPredict from './pages/UploadPredict';

function Placeholder({ title }) {
  return (
    <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Coming soon…</p>
    </main>
  );
}

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/"         element={<Placeholder title="Dashboard" />} />
          <Route path="/upload"   element={<UploadPredict />} />
          <Route path="/analytics" element={<Placeholder title="Analytics" />} />
          <Route path="/targets"  element={<Placeholder title="Targets" />} />
          <Route path="/chatbot"  element={<Placeholder title="AI Chatbot" />} />
        </Routes>
      </Layout>
    </Router>
  );
}
