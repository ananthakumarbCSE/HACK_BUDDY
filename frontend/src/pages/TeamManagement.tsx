import { useState, useEffect } from 'react';
import api from '../services/api';
import TeamForm from '../components/TeamForm';
import { UserPlus } from 'lucide-react';

interface TeamMember {
  id: number;
  user_id: number;
  role: string;
}

interface Team {
  id: number;
  name: string;
  leader_id: number;
  members: TeamMember[];
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams/');
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent, teamId: number) => {
    e.preventDefault();
    try {
      await api.post(`/teams/${teamId}/members`, { email: newMemberEmail, role: 'Member' });
      setNewMemberEmail('');
      setSelectedTeamId(null);
      fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add member');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-8">Team Management</h2>
      <TeamForm onTeamCreated={fetchTeams} />

      <div className="mt-8">
        <h3 className="mb-4">Your Teams</h3>
        {loading ? (
          <p>Loading teams...</p>
        ) : teams.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You don't belong to any teams yet.</p>
        ) : (
          <div className="space-y-6 flex-col gap-4">
            {teams.map(team => (
              <div key={team.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h4 className="text-xl">{team.name}</h4>
                  <span className="text-sm text-gray-400">Team ID: {team.id}</span>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-sm uppercase tracking-wider text-muted mb-2" style={{ color: 'var(--text-muted)' }}>Members</h5>
                  <ul className="list-none pl-0">
                    {team.members.map((m: TeamMember, idx: number) => (
                      <li key={idx} className="flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.05)', margin: '0.25rem 0', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                        <span>User ID: {m.user_id}</span>
                        <span className="status-badge" style={{ background: m.role === 'Leader' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)' }}>
                          {m.role}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Always assume current user is leader for this exercise unless full auth is verified on logic */}
                <form onSubmit={(e) => handleAddMember(e, team.id)} className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700 w-full">
                  <input 
                    type="email" 
                    placeholder="Member Email" 
                    className="input-field mb-0" 
                    style={{ flexGrow: 1 }}
                    value={selectedTeamId === team.id ? newMemberEmail : ''}
                    onChange={(e) => {
                      setSelectedTeamId(team.id);
                      setNewMemberEmail(e.target.value);
                    }}
                    required={selectedTeamId === team.id}
                  />
                  <button type="submit" className="btn-outline">
                    <UserPlus size={16} /> Add Member
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
