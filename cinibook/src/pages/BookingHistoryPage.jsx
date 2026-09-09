import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingsAPI } from '../services/api';
import Layout from '../components/Layout';
import { Ticket, Calendar, Clock, MapPin, LogIn } from 'lucide-react';

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await bookingsAPI.getByUser(user.user_id || user.id);
        const data = res.data.bookings || res.data || [];
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setError('Failed to load bookings. Please try again later.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const statusStyle = (status) => {
    if (status === 'confirmed') return { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' };
    if (status === 'completed') return { background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' };
    if (status === 'cancelled') return { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' };
    return { background: 'rgba(255,255,255,0.05)', color: 'hsl(240 5% 65%)', border: '1px solid rgba(255,255,255,0.1)' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return dateStr; }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    if (timeStr.includes('T')) {
      return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '3rem',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '0.05em',
            background: 'linear-gradient(135deg, hsl(43 96% 56%), #fde047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>
            My Bookings
          </h1>
          <p style={{ color: 'hsl(240 5% 65%)', fontSize: '1.1rem', fontWeight: 300 }}>
            Your booking history
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} />
            ))}
          </div>
        ) : !user ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '60px 40px',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <LogIn style={{ height: '48px', width: '48px', color: 'hsl(346 87% 61%)', margin: '0 auto 16px' }} />
            <p style={{ color: 'white', fontSize: '18px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em', marginBottom: '8px' }}>Please Sign In</p>
            <p style={{ color: 'hsl(240 5% 55%)', fontSize: '14px', marginBottom: '24px' }}>Log in to view your booking history</p>
            <Link to="/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'hsl(346 87% 61%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: '0 4px 20px rgba(225,29,72,0.3)',
            }}>
              <LogIn style={{ height: '16px', width: '16px' }} />
              Sign In
            </Link>
          </div>
        ) : error ? (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            borderLeft: '4px solid hsl(0 62.8% 50%)',
            padding: '16px 20px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            <p style={{ color: 'hsl(0 62.8% 60%)', fontSize: '14px', fontWeight: 500 }}>{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '60px 40px',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <Ticket style={{ height: '48px', width: '48px', color: 'hsl(240 5% 35%)', margin: '0 auto 16px' }} />
            <p style={{ color: 'hsl(240 5% 65%)', fontSize: '16px' }}>No bookings yet.</p>
            <p style={{ color: 'hsl(240 5% 45%)', fontSize: '14px', marginTop: '4px' }}>Book a movie to see your tickets here!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map((b) => (
              <div
                key={b.booking_id || b.id}
                style={{
                  background: 'hsl(240 10% 8%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(225,29,72,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Left side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(225,29,72,0.1)',
                    border: '1px solid rgba(225,29,72,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Ticket style={{ height: '24px', width: '24px', color: 'hsl(346 87% 61%)' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.3rem',
                      fontFamily: "'Bebas Neue', sans-serif",
                      letterSpacing: '0.05em',
                      color: 'white',
                      marginBottom: '8px',
                    }}>
                      {b.movie_title || 'Movie'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'hsl(240 5% 55%)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ height: '13px', width: '13px' }} />
                        {formatDate(b.show_date || b.show_time)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ height: '13px', width: '13px' }} />
                        {formatTime(b.start_time || b.show_time)}
                      </span>
                      {b.seats && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin style={{ height: '13px', width: '13px' }} />
                          Seats: {typeof b.seats === 'string' ? b.seats : Array.isArray(b.seats) ? b.seats.join(', ') : b.seats}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'hsl(43 96% 56%)',
                    marginBottom: '8px',
                  }}>
                    ₹{Number(b.total_amount || b.total_price || 0).toFixed(2)}
                  </p>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    ...statusStyle(b.status),
                  }}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
