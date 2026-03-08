import { useState, useEffect } from 'react';
import api, { credentialsAPI } from '../services/api';
import HackathonCard from '../components/HackathonCard';
import type { Hackathon } from '../components/HackathonCard';
import { Search, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Team {
  id: number;
  name: string;
}

export default function HackathonSearch() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [query, setQuery] = useState('AI hackathons with prize pool above $3000');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [hRes, tRes, cRes] = await Promise.all([
        api.get('/hackathons/'),
        api.get('/teams/'),
        credentialsAPI.getAll()
      ]);
      setHackathons(hRes.data);
      setTeams(tRes.data);
      setHasCredentials(cRes.data && cRes.data.length > 0);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/hackathons/search', { query });
      if (res.data.length > 0) {
        setHackathons(prev => {
          const newHacks = [...prev];
          res.data.forEach((h: Hackathon) => {
            if (!newHacks.find(existing => existing.registration_link === h.registration_link)) {
              newHacks.push(h);
            }
          });
          return newHacks;
        });
      }
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Error searching hackathons.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (hackathonId: number) => {
    if (!hasCredentials) {
      alert('Please add your Unstop credentials first before registering.');
      return;
    }
    
    if (teams.length === 0) return alert('No teams available');
    const teamId = teams[0].id; // For simplicity, select the first team.
    
    try {
      await api.post('/hackathons/register', {
        team_id: teamId,
        hackathon_id: hackathonId
      });
      alert('Registration job started! Check dashboard for status.');
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Error registering');
    }
  };

  return (
    <div className="animate-fade-in">
      {!hasCredentials && (
        <div style={{
          background: '#1a2e4a',
          border: '1px solid #4080ff',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} style={{ color: '#4080ff', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>No Unstop Credentials Found</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' }}>
              Add your Unstop login credentials to enable automatic registration.
            </p>
          </div>
          <Link to="/credentials" style={{
            background: '#4080ff',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            textDecoration: 'none',
            whiteSpace: 'nowrap'
          }}>
            Add Credentials
          </Link>
        </div>
      )}
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 className="flex items-center gap-2 mb-4"><Search /> AI Web Agent Search</h2>
        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Use TinyFish to autonomously scan multiple hackathon platforms for the latest opportunities.</p>
        
        <form onSubmit={handleSearch} className="flex-col gap-4">
          <div className="input-group mb-4">
            <label>Describe Your Ideal Hackathon</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. AI hackathons with prize pool > $3000 that are offline" 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'fit-content' }} disabled={loading}>
            {loading ? 'Agent Scanning (This may take a minute)...' : 'Start Agent Search'}
          </button>
        </form>
      </div>

      <h3 className="mb-6">Discovered Hackathons</h3>
      {fetching ? (
        <p>Loading...</p>
      ) : hackathons.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hackathons found yet. Try searching!</p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {hackathons.map((h: Hackathon) => (
            <HackathonCard key={h.id} hackathon={h} onRegister={handleRegister} teams={teams} />
          ))}
        </div>
      )}
    </div>
  );
}
