import React from 'react';

export default function SeatMap({ seats, selectedSeats, onToggleSeat }) {
  if (!seats || seats.length === 0) {
    return <p style={{ color: 'hsl(240 5% 65%)', textAlign: 'center', padding: '32px' }}>No seats available.</p>;
  }

  // Group seats by row — handle all possible field names from the backend
  const rows = {};
  seats.forEach((seat) => {
    const row = seat.row_label || seat.row || seat.seat_row || 'A';
    if (!rows[row]) rows[row] = [];
    rows[row].push({ ...seat, _row: row });
  });

  // Sort seats within each row by seat number
  Object.keys(rows).forEach((row) => {
    rows[row].sort((a, b) => (a.seat_number || a.number || 0) - (b.seat_number || b.number || 0));
  });

  const sortedRows = Object.keys(rows).sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Seat Grid */}
      {sortedRows.map((row) => (
        <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Row label */}
          <span style={{
            width: '24px',
            fontSize: '13px',
            color: 'hsl(240 5% 65%)',
            fontWeight: 600,
            textAlign: 'center',
          }}>
            {row}
          </span>

          {/* Seats in this row */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {rows[row].map((seat) => {
              const seatId = seat.seat_id || seat.id || `${row}-${seat.seat_number || seat.number}`;
              const seatNum = seat.seat_number || seat.number;
              const isBooked = seat.is_booked || seat.status === 'booked';
              const isSelected = selectedSeats.includes(seatId);

              let bg = 'hsl(240 10% 16%)';
              let border = '1px solid rgba(255,255,255,0.1)';
              let color = 'white';
              let cursor = 'pointer';
              let shadow = 'none';

              if (isBooked) {
                bg = 'hsl(240 10% 10%)';
                border = '1px solid rgba(255,255,255,0.03)';
                color = 'rgba(255,255,255,0.2)';
                cursor = 'not-allowed';
              } else if (isSelected) {
                bg = 'hsl(346 87% 61%)';
                border = '1px solid hsl(346 87% 70%)';
                color = 'white';
                shadow = '0 0 12px rgba(225,29,72,0.4)';
              }

              return (
                <button
                  key={seatId}
                  disabled={isBooked}
                  onClick={() => !isBooked && onToggleSeat(seatId)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px 8px 4px 4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: bg,
                    border: border,
                    color: color,
                    cursor: cursor,
                    boxShadow: shadow,
                    transition: 'all 0.2s',
                  }}
                  title={`${row}${seatNum}`}
                >
                  {seatNum}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '20px', fontSize: '13px', color: 'hsl(240 5% 65%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '6px 6px 3px 3px', background: 'hsl(240 10% 16%)', border: '1px solid rgba(255,255,255,0.1)' }} />
          Available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '6px 6px 3px 3px', background: 'hsl(346 87% 61%)', border: '1px solid hsl(346 87% 70%)' }} />
          Selected
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '6px 6px 3px 3px', background: 'hsl(240 10% 10%)', border: '1px solid rgba(255,255,255,0.03)' }} />
          Booked
        </div>
      </div>
    </div>
  );
}
