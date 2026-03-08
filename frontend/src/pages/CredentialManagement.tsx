import { useState, useEffect } from 'react';
import { credentialsAPI } from '../services/api';
import '../App.css';

interface Credential {
  id: number;
  platform_name: string;
  email: string;
  created_at: string;
}

export default function CredentialManagement() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    platform_name: 'unstop',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const response = await credentialsAPI.getAll();
      setCredentials(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load credentials');
    }
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await credentialsAPI.create({
        platform_name: formData.platform_name,
        email: formData.email,
        password: formData.password,
      });
      
      setSuccess('Credentials saved successfully!');
      setFormData({ platform_name: 'unstop', email: '', password: '', confirmPassword: '' });
      setShowForm(false);
      loadCredentials();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCredential = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) return;

    try {
      await credentialsAPI.delete(id);
      setSuccess('Credential deleted');
      loadCredentials();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete credential');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1>Platform Credentials</h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>
        Manage your credentials for hackathon platforms. These credentials are encrypted and used only for automation.
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

      {credentials.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Saved Credentials</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {credentials.map((cred) => (
              <div key={cred.id} style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{cred.platform_name.toUpperCase()}</strong>
                  <p style={{ margin: '8px 0 0 0', color: '#666' }}>{cred.email}</p>
                  <small style={{ color: '#999' }}>Added: {new Date(cred.created_at).toLocaleDateString()}</small>
                </div>
                <button
                  onClick={() => handleDeleteCredential(cred.id)}
                  style={{
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: '#4080ff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Add Platform Credentials
        </button>
      ) : (
        <form onSubmit={handleAddCredential} style={{
          background: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h3>Add New Credentials</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Platform
            </label>
            <select
              value={formData.platform_name}
              onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
            >
              <option value="unstop">Unstop</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="your@unstop.com"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Your Unstop password"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Confirm password"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#4080ff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Saving...' : 'Save Credentials'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: '#ccc',
                color: '#333',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
