import { useState, useEffect } from 'react';
import api from '../services/api';
import TeamForm from '../components/TeamForm';
import { UserPlus, Edit2, Trash2, X } from 'lucide-react';

interface TeamMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  gender: string;
  organization: string;
  location: string;
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
  
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState<number | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('Member');

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

  const openAddModal = (teamId: number) => {
    setActiveTeamId(teamId);
    setEditingMemberId(null);
    clearForm();
    setShowMemberModal(true);
  };

  const openEditModal = (teamId: number, member: TeamMember) => {
    setActiveTeamId(teamId);
    setEditingMemberId(member.id);
    setFirstName(member.first_name);
    setLastName(member.last_name);
    setEmail(member.email);
    setMobile(member.mobile || '');
    setGender(member.gender || '');
    setOrganization(member.organization || '');
    setLocation(member.location || '');
    setRole(member.role || 'Member');
    setShowMemberModal(true);
  };

  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setMobile('');
    setGender('');
    setOrganization('');
    setLocation('');
    setRole('Member');
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeamId) return;

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      mobile,
      gender,
      organization,
      location,
      role
    };

    try {
      if (editingMemberId) {
        await api.put(`/teams/members/${editingMemberId}`, payload);
      } else {
        await api.post(`/teams/${activeTeamId}/members`, payload);
      }
      setShowMemberModal(false);
      clearForm();
      fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save member details.');
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/teams/members/${memberId}`);
      fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove member.');
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
                    {/* The leader is natively tracked in backend schemas usually, but we also render members here */}
                    {team.members.map((m: TeamMember) => (
                      <li key={m.id} className="flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.05)', margin: '0.25rem 0', padding: '0.75rem 1rem', borderRadius: '4px' }}>
                        <div>
                          <strong>{m.first_name} {m.last_name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({m.email})</span>
                          <br />
                          <span className="status-badge" style={{ background: 'rgba(255, 255, 255, 0.1)', marginTop: '0.5rem', display: 'inline-block' }}>
                            {m.role}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(team.id, m)} className="btn-outline" style={{ padding: '0.5rem' }} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteMember(m.id)} className="btn-outline" style={{ padding: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 w-full text-center">
                  <button onClick={() => openAddModal(team.id)} className="btn-primary">
                    <UserPlus size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Add Member
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0">{editingMemberId ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button onClick={() => setShowMemberModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMember} className="flex-col gap-4">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>First Name</label>
                  <input type="text" className="input-field mb-0" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input type="text" className="input-field mb-0" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" className="input-field mb-0" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Mobile</label>
                  <input type="tel" className="input-field mb-0" value={mobile} onChange={e => setMobile(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Role</label>
                  <input type="text" className="input-field mb-0" value={role} onChange={e => setRole(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Gender</label>
                  <select className="input-field mb-0" value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>College / Organization</label>
                  <input type="text" className="input-field mb-0" value={organization} onChange={e => setOrganization(e.target.value)} />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Location</label>
                  <input type="text" className="input-field mb-0" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary px-6">{editingMemberId ? 'Save Updates' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
