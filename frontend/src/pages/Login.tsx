import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        const res = await api.post('/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        localStorage.setItem('token', res.data.access_token);
        navigate('/dashboard');
      } else {
        await api.post('/auth/register', {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          mobile,
          gender,
          organization,
          location
        });
        // Auto login after register
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        const res = await api.post('/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        localStorage.setItem('token', res.data.access_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <div className="flex-col items-center justify-center text-center mb-8">
          <Terminal className="text-primary mb-4 mx-auto" size={48} />
          <h2>Welcome to HackBuddy</h2>
          <p className="text-muted" style={{ color: 'var(--text-muted)' }}>AI-Powered Hackathon Auto-Registration</p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
              <div className="input-group">
                <label>First Name</label>
                <input type="text" className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Mobile</label>
                <input type="tel" className="input-field" value={mobile} onChange={e => setMobile(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Gender</label>
                <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>Organization / College</label>
                <input type="text" className="input-field" value={organization} onChange={e => setOrganization(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Location</label>
                <input type="text" className="input-field" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
            </div>
          )}
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn-primary mt-4" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
