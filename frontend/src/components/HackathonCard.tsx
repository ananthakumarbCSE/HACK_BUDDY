import { Calendar, Trophy, MapPin, Globe, ExternalLink } from 'lucide-react';
import type { Team } from '../pages/HackathonSearch';

export interface Hackathon {
  id: number;
  name: string;
  domain?: string;
  type?: string;
  location?: string;
  prize_pool?: string;
  registration_link: string;
  deadline?: string;
}

interface HackathonCardProps {
  hackathon: Hackathon;
  onRegister: (hackathonId: number) => void;
  teams: Team[];
}

export default function HackathonCard({ hackathon, onRegister, teams }: HackathonCardProps) {
  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex justify-between items-start mb-4">
        <h3 style={{ margin: 0 }}>{hackathon.name}</h3>
        {hackathon.domain && (
          <span className="status-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            {hackathon.domain}
          </span>
        )}
      </div>
      
      <div className="flex-col gap-2" style={{ flexGrow: 1, marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        {hackathon.prize_pool && (
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" /> {hackathon.prize_pool}
          </div>
        )}
        {(hackathon.location || hackathon.type) && (
          <div className="flex items-center gap-2 mt-2">
            {hackathon.type?.toLowerCase().includes('online') ? <Globe size={16} /> : <MapPin size={16} />} 
            {hackathon.type} {hackathon.location ? `- ${hackathon.location}` : ''}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Calendar size={16} /> Deadline: Check Website
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-auto pt-4" style={{ borderTop: 'var(--glass-border)' }}>
        <a href={hackathon.registration_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:text-primary-hover transition-colors" style={{ fontSize: '0.9rem' }}>
          View Details <ExternalLink size={14} />
        </a>
        
        {teams.length > 0 ? (
          <button onClick={() => onRegister(hackathon.id)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Auto-Register
          </button>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>Create a team first</span>
        )}
      </div>
    </div>
  );
}
