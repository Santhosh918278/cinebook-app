import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import Layout from '../components/Layout';
import { Search, Star, Clock } from 'lucide-react';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await moviesAPI.getAll();
      setMovies(res.data.movies || res.data || []);
    } catch {
      setError('Failed to load movies. Is the backend running?');
      setMovies([
        { movie_id: 1, title: 'Interstellar', genre: 'Sci-Fi', duration: 169, rating: 8.7, poster_url: null, description: 'A team of explorers travel through a wormhole in space.' },
        { movie_id: 2, title: 'The Dark Knight', genre: 'Action', duration: 152, rating: 9.0, poster_url: null, description: 'Batman raises the stakes in his war on crime.' },
        { movie_id: 3, title: 'Inception', genre: 'Sci-Fi', duration: 148, rating: 8.8, poster_url: null, description: 'A thief who steals corporate secrets through dream-sharing technology.' },
        { movie_id: 4, title: 'Parasite', genre: 'Thriller', duration: 132, rating: 8.5, poster_url: null, description: 'Greed and class discrimination threaten a symbiotic relationship.' },
        { movie_id: 5, title: 'Dune', genre: 'Sci-Fi', duration: 155, rating: 8.0, poster_url: null, description: 'A noble family becomes embroiled in a war for a desert planet.' },
        { movie_id: 6, title: 'Oppenheimer', genre: 'Drama', duration: 180, rating: 8.3, poster_url: null, description: 'The story of the creation of the atomic bomb.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return fetchMovies();
    setLoading(true);
    try {
      const res = await moviesAPI.search(search);
      setMovies(res.data.movies || res.data || []);
    } catch {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = search
    ? movies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    : movies;

  return (
    <Layout>
      <div style={{ marginBottom: '48px', textAlign: 'left' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: '0.05em',
          background: 'linear-gradient(135deg, hsl(43 96% 56%), #fde047)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '12px',
        }}>
          Now Showing
        </h1>
        <p style={{ color: 'hsl(240 5% 65%)', fontSize: '1.1rem', fontWeight: 300 }}>
          Book your next cinematic adventure
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '48px', maxWidth: '500px' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '18px',
            width: '18px',
            color: 'hsl(240 5% 65%)',
            zIndex: 2,
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movies..."
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              paddingLeft: '48px',
              paddingRight: '20px',
              paddingTop: '14px',
              paddingBottom: '14px',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </form>

      {error && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderLeft: '4px solid hsl(0 62.8% 30.6%)',
          padding: '16px',
          marginBottom: '32px',
          borderRadius: '8px',
        }}>
          <p style={{ color: 'hsl(0 62.8% 50%)', fontSize: '14px', fontWeight: 500 }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              height: '420px',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }} />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {filtered.map((movie) => (
            <Link
              key={movie.movie_id || movie.id}
              to={`/movies/${movie.movie_id || movie.id}`}
              style={{
                display: 'block',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'hsl(240 10% 8%)',
                border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(225,29,72,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Poster Area */}
              <div style={{
                height: '220px',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, hsl(240 10% 12%), hsl(240 10% 6%))',
              }}>
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    opacity: 0.3,
                  }}>
                    <span style={{ fontSize: '64px' }}>🎬</span>
                  </div>
                )}
                {movie.rating && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(10px)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <Star style={{ height: '14px', width: '14px', color: 'hsl(43 96% 56%)', fill: 'hsl(43 96% 56%)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{movie.rating}</span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div style={{ padding: '20px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: '0.05em',
                  color: 'white',
                  marginBottom: '8px',
                }}>
                  {movie.title}
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <span style={{
                    background: 'rgba(225,29,72,0.15)',
                    color: 'hsl(346 87% 61%)',
                    border: '1px solid rgba(225,29,72,0.3)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}>
                    {movie.genre}
                  </span>
                  {movie.duration && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      color: 'hsl(240 5% 65%)',
                    }}>
                      <Clock style={{ height: '12px', width: '12px' }} />
                      {movie.duration}m
                    </span>
                  )}
                </div>

                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {movie.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
