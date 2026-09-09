import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { showsAPI } from '../services/api';
import Layout from '../components/Layout';
import { MapPin, Calendar } from 'lucide-react';

export default function ShowtimesPage() {
  const { movieId } = useParams();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await showsAPI.getByMovie(movieId);
        setShows(res.data.shows || res.data || []);
      } catch {
        setShows([
          { show_id: 1, show_date: '2024-12-20', start_time: '14:00:00', screen_id: 1, price: 12.99 },
          { show_id: 2, show_date: '2024-12-20', start_time: '17:30:00', screen_id: 2, price: 14.99 },
          { show_id: 3, show_date: '2024-12-20', start_time: '21:00:00', screen_id: 3, price: 19.99 },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [movieId]);

  const formatShowDate = (show) => {
    const dateStr = show.show_date;
    if (!dateStr) return 'TBD';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  };

  const formatShowTime = (show) => {
    const timeStr = show.start_time;
    if (!timeStr) return 'TBD';
    if (timeStr.includes('T')) {
      return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hr12 = hr % 12 || 12;
    return `${hr12}:${m} ${ampm}`;
  };

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
        <Link to={`/movies/${movieId}`} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '24px',
          textDecoration: 'none',
          fontSize: '14px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '8px 16px',
          borderRadius: '20px',
        }}>
          ← Back to Movie
        </Link>

        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '3rem',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '0.05em',
            background: 'linear-gradient(135deg, hsl(43 96% 56%), #fde047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
          }}>
            Select Showtime
          </h1>
          <p style={{ color: 'hsl(240 5% 65%)', fontSize: '1.1rem', fontWeight: 300 }}>
            Choose your preferred screening
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: '90px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} />
            ))}
          </div>
        ) : shows.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '40px',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <p style={{ color: 'hsl(240 5% 65%)', fontSize: '16px' }}>No showtimes available for this movie.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {shows.map((show) => (
              <Link
                key={show.show_id || show.id}
                to={`/shows/${show.show_id || show.id}/seats`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'hsl(240 10% 8%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(225,29,72,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(225,29,72,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div>
                    <p style={{
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      color: 'white',
                      fontFamily: "'Bebas Neue', sans-serif",
                      letterSpacing: '0.05em',
                    }}>
                      {formatShowTime(show)}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: 'hsl(346 87% 61%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 500,
                    }}>
                      <Calendar style={{ height: '14px', width: '14px' }} />
                      {formatShowDate(show)}
                    </p>
                  </div>

                  <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'hsl(240 5% 65%)',
                    fontSize: '15px',
                  }}>
                    <MapPin style={{ height: '16px', width: '16px' }} />
                    Screen {show.screen_id || '—'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(43 96% 56%)' }}>
                    ₹{show.price || '—'}
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                    Select Seats →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
