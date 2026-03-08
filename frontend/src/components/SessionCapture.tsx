import { useState } from 'react';
import { AlertCircle, Copy, Check } from 'lucide-react';
import { sessionAPI } from '../services/api';

export default function SessionCapture() {
  const [cookieString, setCookieString] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const validateCookieFormat = (cookies: string): boolean => {
    const cookiePairs = cookies.split(';').map(c => c.trim()).filter(c => c);
    return cookiePairs.length > 0 && cookiePairs.some(pair => pair.includes('='));
  };

  const handleSaveCookies = async () => {
    if (!cookieString.trim()) {
      setStatus('error');
      setMessage('Please paste your cookies in the field above');
      return;
    }

    if (!validateCookieFormat(cookieString)) {
      setStatus('error');
      setMessage('Cookie format looks incorrect. Use: name=value; name2=value2');
      return;
    }

    setStatus('loading');

    try {
      await sessionAPI.save({
        platform_name: 'unstop',
        cookies_json: cookieString,
        expires_at: undefined
      });

      setStatus('success');
      setMessage('✓ Session saved! TinyFish will use these cookies for registration.');
      setCookieString('');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Failed to save session');
    }
  };

  const copyInstructions = () => {
    const instructions = `Steps to extract Unstop cookies:

1. Open https://unstop.com in a new tab
2. Log in with your account
3. Open Chrome DevTools (F12 or right-click → Inspect)
4. Go to Application tab
5. Left panel: Cookies → unstop.com
6. Select all cookies and copy
7. Paste in the textarea on this page

Format: connect.sid=abc; token=xyz; session=def`;

    navigator.clipboard.writeText(instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        background: '#1a3a5a',
        border: '2px solid #4080ff',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <AlertCircle size={28} style={{ color: '#4080ff' }} />
          <h3 style={{ margin: 0, fontSize: '18px' }}>Save Your Unstop Session</h3>
        </div>

        <p style={{ color: '#aaa', marginBottom: '20px', lineHeight: '1.6' }}>
          Save your Unstop login session to enable automatic registration without CAPTCHA.
        </p>

        <div style={{
          background: '#0d1b2a',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '3px solid #4080ff'
        }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#4080ff', fontWeight: 'bold', textTransform: 'uppercase' }}>
            How to get your cookies:
          </p>
          <ol style={{ margin: '0', paddingLeft: '20px', color: '#bbb', fontSize: '13px', lineHeight: '2' }}>
            <li>Open <a href="https://unstop.com" target="_blank" rel="noopener noreferrer" style={{ color: '#4080ff' }}>unstop.com</a> in another tab</li>
            <li>Log into your account</li>
            <li>Press <kbd style={{ background: '#1a2e3f', padding: '2px 6px', borderRadius: '2px' }}>F12</kbd> to open DevTools</li>
            <li>Click <strong>Application</strong> tab</li>
            <li>Left sidebar: <strong>Cookies</strong> → <strong>unstop.com</strong></li>
            <li>Select all cookies and copy them</li>
            <li>Paste below</li>
          </ol>
        </div>

        {status === 'success' && (
          <div style={{
            background: '#0d3d1a',
            border: '1px solid #0f0',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            color: '#0f0',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        {status === 'error' && (
          <div style={{
            background: '#3d0d0d',
            border: '1px solid #ff4444',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            color: '#ff8888',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Paste Your Unstop Cookies
          </label>
          <textarea
            value={cookieString}
            onChange={(e) => setCookieString(e.target.value)}
            placeholder="Example: connect.sid=abc123; token=xyz789; session=def456"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #4080ff',
              background: '#0d1b2a',
              color: 'white',
              fontSize: '13px',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSaveCookies}
            disabled={status === 'loading' || !cookieString.trim()}
            style={{
              flex: 1,
              background: '#4080ff',
              color: 'white',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: (status === 'loading' || !cookieString.trim()) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: (status === 'loading' || !cookieString.trim()) ? 0.6 : 1
            }}
          >
            {status === 'loading' ? 'Saving...' : 'Save Session'}
          </button>
          <button
            onClick={copyInstructions}
            style={{
              background: '#2a4a7a',
              color: 'white',
              border: '1px solid #4080ff',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy Steps</>}
          </button>
        </div>

        <p style={{
          fontSize: '11px',
          color: '#666',
          marginTop: '16px',
          marginBottom: 0
        }}>
          ✓ Cookies are encrypted before storage. Same-Origin Policy prevents reading external cookies, so manual input is the correct approach.
        </p>
      </div>
    </div>
  );
}
