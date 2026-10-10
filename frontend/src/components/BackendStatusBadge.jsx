import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BackendStatusBadge() {
  const [status, setStatus] = useState({
    connected: false,
    dbType: 'checking...',
    service: ''
  });

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        if (data.status === 'healthy') {
          setStatus({
            connected: true,
            dbType: data.database === 'mongodb' ? 'MongoDB Atlas/Local' : 'Persistent Store',
            service: data.service
          });
        } else {
          setStatus({ connected: false, dbType: 'Offline', service: '' });
        }
      } catch (err) {
        setStatus({ connected: false, dbType: 'Offline', service: '' });
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
        status.connected
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
          : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
      }`}
      title={status.connected ? `Backend API: http://localhost:5000 (Database: ${status.dbType})` : 'Backend disconnected'}
    >
      <span className={`w-2 h-2 rounded-full ${status.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
      <Database className="w-3 h-3" />
      <span>{status.connected ? `API Live (${status.dbType})` : 'API Disconnected'}</span>
    </div>
  );
}
