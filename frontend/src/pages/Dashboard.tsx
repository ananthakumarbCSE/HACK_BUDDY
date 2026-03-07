import { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Hackathon } from '../components/HackathonCard';

interface Registration {
  id: number;
  hackathon_id: number;
  status: string;
  created_at: string;
  hackathon?: Hackathon;
}

export default function Dashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/hackathons/registered');
      // Fetch hackathon details for each registration (in a real app, the backend should join this)
      const regs = res.data;
      
      const hacksRes = await api.get('/hackathons/');
      const hacksMap = hacksRes.data.reduce((acc: Record<string, Hackathon>, h: Hackathon) => {
        acc[h.id] = h;
        return acc;
      }, {} as Record<string, Hackathon>);
      
      const enriched = regs.map((r: Registration) => ({ ...r, hackathon: hacksMap[r.hackathon_id] }));
      setRegistrations(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'REGISTERED': return <CheckCircle size={16} className="text-success" />;
      case 'FAILED': return <AlertTriangle size={16} className="text-danger" />;
      default: return <Clock size={16} className="text-warning" style={{ color: '#fbbf24' }} />;
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-8">Your Hackathons Dashboard</h2>
      
      {loading ? (
        <p>Loading your timeline...</p>
      ) : registrations.length === 0 ? (
        <div className="glass-panel text-center p-8">
          <p className="mb-4" style={{ color: 'var(--text-muted)' }}>You haven't registered for any hackathons yet.</p>
          <a href="/search" className="btn-primary">Find Hackathons</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {registrations.map((reg: Registration) => (
            <div key={reg.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex justify-between items-start mb-4">
                <h4>{reg.hackathon?.name || `Hackathon #${reg.hackathon_id}`}</h4>
                <span className={`status-badge ${reg.status.toLowerCase()}`}>
                  {getStatusIcon(reg.status)} {reg.status}
                </span>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <div className="flex justify-between mb-2">
                  <span>Registration Date:</span>
                  <span>{new Date(reg.created_at).toLocaleDateString()}</span>
                </div>
                {reg.hackathon?.deadline && (
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span>{new Date(reg.hackathon.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
