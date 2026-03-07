import { useState } from 'react';
import api from '../services/api';
import { Users } from 'lucide-react';

export default function TeamForm({ onTeamCreated }: { onTeamCreated: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/teams/', { name });
      setName('');
      onTeamCreated();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 className="flex items-center gap-2 mb-4"><Users className="text-primary" /> Create New Team</h3>
      <form onSubmit={handleSubmit} className="flex gap-4 items-end">
        <div className="input-group" style={{ flexGrow: 1, marginBottom: 0 }}>
          <label>Team Name</label>
          <input 
            type="text" 
            className="input-field" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="e.g. Code Ninjas" 
            required 
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Team'}
        </button>
      </form>
      {error && <p style={{ color: 'var(--danger)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</p>}
    </div>
  );
}
