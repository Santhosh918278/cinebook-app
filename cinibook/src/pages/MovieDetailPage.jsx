import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import Layout from '../components/Layout';
import { Star, Clock, Calendar, ArrowRight } from 'lucide-react';

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await moviesAPI.getById(id);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setMovie(data);
      } catch {
        setMovie({
          id, title: 'Movie Title', genre: 'Genre', duration: 120, rating: 8.5,
          description: 'Could not load movie details. The backend may not be running.',
          release_date: '2024-01-01',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ height: '400px', background: 'hsl(240 10% 8%)', borderRadius: '16px', animation: 'pulse 2s infinite' }} />
      </div>
    </Layout>
  );

  if (!movie) return <Layout><p style={{ color: 'hsl(240 5% 65%)' }}>Movie not found.</p></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
        <Link to="/movies" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '24px',
          textDecoration: 'none',
          fontSize: '14px',
        }}>
          ← Back to Movies
        </Link>

        {/* Hero Card */}
        <div style={{
          background: 'hsl(240 10% 8%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          overflow: 'hidden',
        }}>
          {/* Poster Banner */}
          <div style={{
            height: '300px',
            position: 'relative',
            background: 'linear-gradient(135deg, hsl(240 10% 12%), hsl(240 10% 4%)',
            overflow: 'hidden',
          }}>
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                background: 'linear-gradient(135deg, hsl(240 10% 12%), hsl(346 87% 61% / 0.1))',
              }}>
                <span style={{ fontSize: '100px', opacity: 0.1 }}>🎬</span>
              </div>
            )}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '200px',
              background: 'linear-gradient(to top, hsl(240 10% 8%), transparent)',
            }} />
          </div>

          {/* Content */}
          <div style={{ padding: '32px', marginTop: '-80px', position: 'relative', zIndex: 2 }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '0.05em',
              background: 'linear-gradient(135deg, hsl(43 96% 56%), #fde047)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '16px',
              lineHeight: 1.1,
            }}>
              {movie.title}
            </h1>

            {/* Meta Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <span style={{
                background: 'rgba(225,29,72,0.15)',
                color: 'hsl(346 87% 61%)',
                border: '1px solid rgba(225,29,72,0.3)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}>
                {movie.genre?.toUpperCase()}
              </span>

              {movie.rating && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <Star style={{ height: '14px', width: '14px', color: 'hsl(43 96% 56%)', fill: 'hsl(43 96% 56%)' }} />
                  <span style={{ fontWeight: 700, color: 'white', fontSize: '13px' }}>{movie.rating}</span>
                </div>
              )}

              {movie.duration && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  <Clock style={{ height: '14px', width: '14px', color: 'hsl(346 87% 61%)' }} />
                  {movie.duration} min
                </div>
              )}

              {movie.release_date && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  <Calendar style={{ height: '14px', width: '14px', color: 'hsl(346 87% 61%)' }} />
                  {new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>

            {/* Description */}
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.8,
              marginBottom: '32px',
            }}>
              {movie.description}
            </p>

            {/* CTA Button */}
            <Link
              to={`/movies/${id}/showtimes`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'hsl(346 87% 61%)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '16px',
                textDecoration: 'none',
                transition: 'all 0.3s',
                boxShadow: '0 4px 20px rgba(225,29,72,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(225,29,72,0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(225,29,72,0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Get Tickets
              <ArrowRight style={{ height: '18px', width: '18px' }} />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
