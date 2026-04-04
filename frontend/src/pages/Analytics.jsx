import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PredictionResult from '../components/PredictionResult';

export default function Analytics() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // state passed from UploadPredict or fallback to sessionStorage
  const [sessionData] = useState(() => {
    try {
      const stored = sessionStorage.getItem('lastPrediction');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const predictionResult = location.state?.result || sessionData?.result;
  const predictionFile   = location.state?.filename || sessionData?.filename;

  return (
    <div style={{ flex: 1, padding: '32px 24px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
      <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto',
        animation: mounted ? 'fade-in-up 0.5s ease both' : 'none' }}>
            
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Session Analysis
          </h2>
          
          {!predictionResult ? (
            <div style={{ 
              marginTop: '40px', padding: '40px', textAlign: 'center', 
              background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border)' 
            }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No active prediction result to display.</p>
              <button className="btn-primary" onClick={() => navigate('/upload')}>
                Go to Upload
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '24px' }}>
               <PredictionResult result={predictionResult} filename={predictionFile} />
               
               {/* Add charts placeholders or real recharts later here */}
               <div style={{
                 marginTop: '24px', padding: '32px', borderRadius: '16px',
                 background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
               }}>
                 <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="var(--purple-main)" strokeWidth="1.5" style={{ opacity: 0.5, marginBottom: '12px' }}>
                   <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                   <path d="M18 9l-5.5 5.5-3-3L5 16" strokeLinecap="round" strokeLinejoin="round"/>
                   <path d="M18 9v6M18 9h-6" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
                 <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>Advanced charts coming soon</p>
                 <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Velocity trackers and fatigue curves will appear here.</p>
               </div>
            </div>
          )}
      </div>
    </div>
  );
}
