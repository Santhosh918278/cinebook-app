import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { seatsAPI, bookingsAPI, showsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import SeatMap from '../components/SeatMap';

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const fetchSeats = async () => {
    try {
      const [seatsRes, showRes] = await Promise.all([
        seatsAPI.getByShow(showId),
        showsAPI.getById(showId),
      ]);
      setSeats(seatsRes.data.seats || seatsRes.data || []);
      const showData = Array.isArray(showRes.data) ? showRes.data[0] : showRes.data;
      setShow(showData);
    } catch {
      const demoSeats = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      rows.forEach((row) => {
        for (let i = 1; i <= 10; i++) {
          demoSeats.push({
            seat_id: `${row}-${i}`,
            row_label: row,
            seat_number: i,
            status: Math.random() < 0.2 ? 'booked' : 'available',
          });
        }
      });
      setSeats(demoSeats);
      setShow({ show_id: showId, price: 250, movie_title: 'Movie' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [showId]);

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const handleBook = async () => {
    if (!user) return navigate('/login');
    if (selectedSeats.length === 0) return;
    setBooking(true);
    try {
      const res = await bookingsAPI.create({
        show_id: Number(showId),
        seats: selectedSeats.map(s => Number(s)),
        user_id: Number(user.user_id || user.id),
      });
      navigate(`/bookings/${res.data.id || res.data.booking_id}/confirmation`);
    } catch (err) {
      console.error('Booking error:', err.response?.data || err);
      const msg = err.response?.data?.error || 'Booking failed. Please try again.';
      alert(msg);
      // Refresh seat map and clear selection so user sees updated availability
      setSelectedSeats([]);
      await fetchSeats();
    } finally {
      setBooking(false);
    }
  };

  const price = show?.price || 0;
  const totalPrice = selectedSeats.length * price;

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '120px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '3rem',
            fontFamily: "'Bebas Neue', sans-serif",
            background: 'linear-gradient(135deg, hsl(43 96% 56%), #fde047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
          }}>
            Select Your Seats
          </h1>
          {show && (
            <p style={{ fontSize: '1.1rem', color: 'hsl(240 5% 65%)' }}>
              {show.movie_title && <span style={{ color: 'white', fontWeight: 500 }}>{show.movie_title} • </span>}
              <span style={{ color: 'hsl(346 87% 61%)', fontWeight: 600 }}>₹{price} per seat</span>
            </p>
          )}
        </div>

        {loading ? (
          <div style={{ height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px' }} />
        ) : (
          <>
            {/* Screen indicator */}
            <div style={{ marginBottom: '48px', padding: '0 60px', textAlign: 'center' }}>
              <div style={{
                height: '4px',
                width: '100%',
                background: 'linear-gradient(90deg, transparent, hsl(346 87% 61% / 0.6), transparent)',
                borderRadius: '4px',
                boxShadow: '0 4px 30px rgba(225,29,72,0.5)',
              }} />
              <p style={{
                color: 'hsl(346 87% 61%)',
                letterSpacing: '0.5em',
                fontSize: '12px',
                marginTop: '12px',
                fontWeight: 600,
                opacity: 0.7,
              }}>
                SCREEN
              </p>
            </div>

            {/* Seat Map */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '32px',
              marginBottom: '32px',
            }}>
              <SeatMap seats={seats} selectedSeats={selectedSeats} onToggleSeat={toggleSeat} />
            </div>

            {/* Floating Bottom Bar */}
            {selectedSeats.length > 0 && (
              <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px',
                zIndex: 40,
              }}>
                <div style={{
                  maxWidth: '800px',
                  margin: '0 auto',
                  background: 'rgba(14,14,20,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(225,29,72,0.2)',
                  borderRadius: '16px',
                  padding: '20px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
                }}>
                  <div>
                    <p style={{
                      fontSize: '13px',
                      color: 'hsl(240 5% 65%)',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 500,
                    }}>
                      {selectedSeats.length} seat(s) selected
                    </p>
                    <p style={{
                      fontSize: '2rem',
                      fontFamily: "'Bebas Neue', sans-serif",
                      background: 'linear-gradient(135deg, hsl(43 96% 56%), #fde047)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      ₹{totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={booking}
                    style={{
                      background: 'hsl(346 87% 61%)',
                      color: 'white',
                      padding: '14px 32px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: booking ? 'not-allowed' : 'pointer',
                      opacity: booking ? 0.6 : 1,
                      boxShadow: '0 4px 20px rgba(225,29,72,0.3)',
                      minWidth: '180px',
                    }}
                  >
                    {booking ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
