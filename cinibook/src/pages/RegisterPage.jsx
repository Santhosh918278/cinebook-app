import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Film, Mail, Lock, User } from 'lucide-react';

const iconStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  height: '16px',
  width: '16px',
  color: 'hsl(240 5% 65%)',
  zIndex: 2,
  pointerEvents: 'none',
};

const inputStyle = {
  width: '100%',
  background: 'hsl(240 10% 12%)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  paddingLeft: '42px',
  paddingRight: '16px',
  paddingTop: '14px',
  paddingBottom: '14px',
  color: 'white',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', Icon: User, placeholder: 'John Doe' },
    { name: 'email', label: 'Email', type: 'email', Icon: Mail, placeholder: 'you@example.com' },
    { name: 'password', label: 'Password', type: 'password', Icon: Lock, placeholder: '••••••••' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', Icon: Lock, placeholder: '••••••••' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'hsl(240 10% 4%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Film style={{ height: '48px', width: '48px', color: 'hsl(346 87% 61%)', margin: '0 auto 16px' }} />
          <h1 style={{
            fontSize: '2.5rem',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '0.05em',
            background: 'linear-gradient(135deg, hsl(43 96% 56%), #fde047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>
            Create Account
          </h1>
          <p style={{ color: 'hsl(240 5% 65%)', fontSize: '15px' }}>Join CineBook today</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: 'hsl(240 10% 8%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '32px',
        }}>
          {error && (
            <div style={{
              background: 'rgba(225,29,72,0.1)',
              border: '1px solid rgba(225,29,72,0.3)',
              color: 'hsl(346 87% 61%)',
              fontSize: '14px',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          {fields.map(({ name, label, type, Icon, placeholder }) => (
            <div key={name} style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', color: 'hsl(240 5% 65%)', display: 'block', marginBottom: '8px' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <Icon style={iconStyle} />
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder={placeholder}
                  required
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'hsl(346 87% 61%)',
              color: 'white',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: '20px',
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'hsl(240 5% 65%)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'hsl(43 96% 56%)', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
