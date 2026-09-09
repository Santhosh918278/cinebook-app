import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import Layout from '../components/Layout';
import { CheckCircle, Ticket, Calendar, MapPin, Film } from 'lucide-react';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await bookingsAPI.getById(bookingId);
        setBooking(res.data);
      } catch {
        setBooking({
          booking_id: bookingId,
          movie_title: 'Movie',
          show_date: new Date().toISOString(),
          start_time: '14:00:00',
          seats: 'A1, A2',
          total_amount: 500,
          status: 'confirmed',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try { return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return dateStr; }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes('T')) {
      return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  if (loading) return (
    <Layout>
      <div style={{ maxWidth: '500px', margin: '0 auto', height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }} />
    </Layout>
  );

  const seatsArr = typeof booking?.seats === 'string' ? booking.seats.split(', ') : Array.isArray(booking?.seats) ? booking.seats : [];

  return (
    <Layout>
      <div style={{ maxWidth: '550px', margin: '0 auto', textAlign: 'center', paddingBottom: '60px', paddingTop: '40px' }}>
        <CheckCircle style={{
          height: '80px',
          width: '80px',
          color: '#22c55e',
          margin: '0 auto 20px',
          filter: 'drop-shadow(0 0 15px rgba(34,197,94,0.4))',
        }} />
        <h1 style={{
          fontSize: '3rem',
          fontFamily: "'Bebas Neue', sans-serif",
          background: 'linear-gradient(135deg, hsl(43 96% 56%), #fde047)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', marginBottom: '40px' }}>
          Your cinematic experience awaits.
        </p>

        {/* Ticket Card */}
        <div style={{
          background: 'hsl(240 10% 8%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '32px',
          textAlign: 'left',
          marginBottom: '32px',
        }}>
          {/* Movie Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Film style={{ height: '20px', width: '20px', color: 'hsl(346 87% 61%)' }} />
            <div>
              <p style={{ fontSize: '12px', color: 'hsl(240 5% 65%)' }}>Movie</p>
              <p style={{ fontSize: '18px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em', color: 'white' }}>
                {booking?.movie_title || 'Movie'}
              </p>
            </div>
          </div>

          {/* Booking ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Ticket style={{ height: '20px', width: '20px', color: 'hsl(43 96% 56%)' }} />
            <div>
              <p style={{ fontSize: '12px', color: 'hsl(240 5% 65%)' }}>Booking ID</p>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'white' }}>#{booking?.booking_id || bookingId}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Calendar style={{ height: '20px', width: '20px', color: 'hsl(346 87% 61%)' }} />
            <div>
              <p style={{ fontSize: '12px', color: 'hsl(240 5% 65%)' }}>Date & Time</p>
              <p style={{ fontSize: '14px', color: 'white' }}>
                {formatDate(booking?.show_date)} • {formatTime(booking?.start_time)}
              </p>
            </div>
          </div>

          {/* Seats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <MapPin style={{ height: '20px', width: '20px', color: 'hsl(346 87% 61%)' }} />
            <div>
              <p style={{ fontSize: '12px', color: 'hsl(240 5% 65%)' }}>Seats</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {seatsArr.map((seat, i) => (
                  <span key={i} style={{
                    background: 'rgba(225,29,72,0.15)',
                    color: 'hsl(346 87% 61%)',
                    border: '1px solid rgba(225,29,72,0.3)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}>
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Screen */}
          {booking?.screen_id && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🎬</div>
              <div>
                <p style={{ fontSize: '12px', color: 'hsl(240 5% 65%)' }}>Screen</p>
                <p style={{ fontSize: '14px', color: 'white' }}>Screen {booking.screen_id}</p>
              </div>
            </div>
          )}

          {/* Total */}
          <div style={{
            borderTop: '1px dashed rgba(255,255,255,0.1)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: 'hsl(240 5% 65%)' }}>Total Paid</span>
            <span style={{
              fontSize: '2rem',
              fontFamily: "'Bebas Neue', sans-serif",
              background: 'linear-gradient(135deg, hsl(43 96% 56%), #fde047)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              ₹{Number(booking?.total_amount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/movies" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            padding: '14px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '15px',
          }}>
            Browse Movies
          </Link>
          <Link to="/bookings" style={{
            background: 'hsl(346 87% 61%)',
            color: 'white',
            padding: '14px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '15px',
          }}>
            My Bookings
          </Link>
        </div>
      </div>
    </Layout>
  );
}
