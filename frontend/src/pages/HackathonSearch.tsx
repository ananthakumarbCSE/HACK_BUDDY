import { useState, useEffect } from 'react';
import api from '../services/api';
import HackathonCard from '../components/HackathonCard';
import type { Hackathon } from '../components/HackathonCard';
import { Search } from 'lucide-react';

export interface Team {
  id: number;
  name: string;
}

export default function HackathonSearch() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [url, setUrl] = useState('https://devpost.com/hackathons');
  const [goal, setGoal] = useState('Find AI hackathons with open registration. Extract name, domain, typed, location, prize pool, deadline, and registration link.');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [hRes, tRes] = await Promise.all([
        api.get('/hackathons/'),
        api.get('/teams/')
      ]);
      setHackathons(hRes.data);
      setTeams(tRes.data);
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
      const res = await api.post('/hackathons/search', { url, goal });
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
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 className="flex items-center gap-2 mb-4"><Search /> AI Web Agent Search</h2>
        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Use TinyFish to scrape hackathon platforms.</p>
        
        <form onSubmit={handleSearch} className="flex-col gap-4">
          <div className="input-group">
            <label>Platform URL</label>
            <input type="url" className="input-field" value={url} onChange={e => setUrl(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Extraction Goal</label>
            <textarea className="input-field" rows={3} value={goal} onChange={e => setGoal(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'fit-content' }} disabled={loading}>
            {loading ? 'Agent Scanning...' : 'Start Search'}
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
