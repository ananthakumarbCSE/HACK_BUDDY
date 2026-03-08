import { useState, useEffect } from 'react';
import { sessionAPI } from '../services/api';
import SessionCapture from '../components/SessionCapture';
import { Trash2, Check } from 'lucide-react';

interface Session {
  id: number;
  platform_name: string;
  created_at: string;
  updated_at: string;
}

export default function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await sessionAPI.getAll();
      setSessions(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (platform: string) => {
    if (!window.confirm(`Are you sure you want to delete the ${platform} session?`)) return;

    try {
      await sessionAPI.delete(platform);
      setSessions(sessions.filter(s => s.platform_name !== platform));
      setSuccess('Session deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete session');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <h1>Session Management</h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>
        Manage your authenticated sessions to enable automatic hackathon registration without CAPTCHA.
      </p>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c00',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#efe',
          color: '#080',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #0f0'
        }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: '40px' }}>
        <SessionCapture />
      </div>

      <hr style={{ borderColor: '#333', margin: '40px 0' }} />

      <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>Active Sessions</h2>

      {loading ? (
        <p style={{ color: '#888' }}>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p style={{ color: '#888' }}>
          No active sessions. Capture your Unstop session above to get started.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {sessions.map((session) => (
            <div key={session.id} style={{
              background: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#0f0'
                }} />
                <div>
                  <strong>{session.platform_name.toUpperCase()}</strong>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    <Check size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Updated: {new Date(session.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteSession(session.platform_name)}
                style={{
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: '#f0f4f8',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '40px',
        borderLeft: '4px solid #4080ff'
      }}>
        <h3 style={{ marginTop: 0 }}>Why Use Session Capture?</h3>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#333' }}>
          <li>
            <strong>No CAPTCHA:</strong> TinyFish uses existing cookies, bypassing CAPTCHA challenges
          </li>
          <li>
            <strong>Faster Registration:</strong> Instant access to registration forms
          </li>
          <li>
            <strong>Secure:</strong> Cookies are encrypted and stored securely
          </li>
          <li>
            <strong>No Password Storage:</strong> We don't need to store or decrypt passwords
          </li>
        </ul>
      </div>
    </div>
  );
}
