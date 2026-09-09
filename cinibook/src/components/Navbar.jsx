import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Film, User, LogOut, LayoutDashboard, History } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(14,14,20,0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 16px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Film style={{ height: '28px', width: '28px', color: 'hsl(346 87% 61%)' }} />
          <span style={{
            fontSize: '1.5rem',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '0.1em',
            background: 'linear-gradient(135deg, hsl(43 96% 56%), #fde047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CineBook
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/movies" style={{ fontSize: '14px', color: 'hsl(240 5% 65%)', textDecoration: 'none' }}>
            Movies
          </Link>

          {user ? (
            <>
              <Link to="/bookings" style={{
                fontSize: '14px',
                color: 'hsl(240 5% 65%)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <History style={{ height: '16px', width: '16px' }} />
                My Bookings
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{
                  fontSize: '14px',
                  color: 'hsl(240 5% 65%)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <LayoutDashboard style={{ height: '16px', width: '16px' }} />
                  Admin
                </Link>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                <span style={{ fontSize: '14px', color: 'hsl(43 96% 56%)' }}>{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    color: 'hsl(240 5% 65%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut style={{ height: '16px', width: '16px' }} />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              background: 'hsl(346 87% 61%)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500,
            }}>
              <User style={{ height: '16px', width: '16px' }} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
