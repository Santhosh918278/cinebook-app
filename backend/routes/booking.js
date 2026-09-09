const r = require("express").Router()
const db = require("../db")

// Get bookings for a user
r.get("/user/:userId", (req, res) => {
    const userId = req.params.userId;
    db.query(
        `SELECT 
            b.booking_id,
            b.total_amount,
            b.status,
            b.created_at,
            m.title AS movie_title,
            m.poster_url,
            s.show_date,
            s.start_time,
            s.screen_id,
            GROUP_CONCAT(CONCAT(se.row_label, se.seat_number) ORDER BY se.row_label, se.seat_number SEPARATOR ', ') AS seats
        FROM bookings b
        JOIN shows s ON b.show_id = s.show_id
        JOIN movies m ON s.movie_id = m.movie_id
        LEFT JOIN booking_seats bs ON b.booking_id = bs.booking_id
        LEFT JOIN seats se ON bs.seat_id = se.seat_id
        WHERE b.user_id = ?
        GROUP BY b.booking_id
        ORDER BY b.created_at DESC`,
        [userId],
        (e, d) => {
            if (e) return res.status(500).json({ error: e.message });
            res.json(d);
        }
    );
});

// Get single booking by id
r.get("/:id", (req, res) => {
    const id = req.params.id;
    db.query(
        `SELECT 
            b.booking_id,
            b.total_amount,
            b.status,
            b.created_at,
            m.title AS movie_title,
            m.poster_url,
            s.show_date,
            s.start_time,
            s.screen_id,
            GROUP_CONCAT(CONCAT(se.row_label, se.seat_number) ORDER BY se.row_label, se.seat_number SEPARATOR ', ') AS seats
        FROM bookings b
        JOIN shows s ON b.show_id = s.show_id
        JOIN movies m ON s.movie_id = m.movie_id
        LEFT JOIN booking_seats bs ON b.booking_id = bs.booking_id
        LEFT JOIN seats se ON bs.seat_id = se.seat_id
        WHERE b.booking_id = ?
        GROUP BY b.booking_id`,
        [id],
        (e, d) => {
            if (e) return res.status(500).json({ error: e.message });
            if (d.length === 0) return res.status(404).json({ error: "booking not found" });
            res.json(d[0]);
        }
    );
});

// Create a booking
r.post("/", async (req, res) => {

    const { user_id, show_id, seats } = req.body

    if (!user_id || !show_id || !seats || seats.length === 0) {
        return res.status(400).json({ error: "missing fields" })
    }

    const c = await db.promise().getConnection()

    try {

        await c.beginTransaction()

        const [show] = await c.query(
            "select screen_id,price from shows where show_id=?",
            [show_id]
        )

        if (show.length === 0) {
            await c.rollback()
            c.release()
            return res.status(400).json({ error: "invalid show" })
        }

        const screen_id = show[0].screen_id
        const price = show[0].price

        const [validSeats] = await c.query(
            `select seat_id 
             from seats
             where screen_id=? 
             and seat_id in (?)`,
            [screen_id, seats]
        )

        if (validSeats.length !== seats.length) {
            await c.rollback()
            c.release()
            return res.status(400).json({ error: "invalid seat selection" })
        }

        const [rows] = await c.query(
            `select bs.seat_id
             from booking_seats bs
             join bookings b
             on bs.booking_id=b.booking_id
             where b.show_id=? 
             and (
                 b.status='confirmed' 
                 or (b.status='pending' and b.created_at > date_sub(now(), interval 5 minute))
             )
             and bs.seat_id in (?) 
             for update`,
            [show_id, seats]
        )

        if (rows.length > 0) {
            await c.rollback()
            c.release()
            return res.status(400).json({ error: "seat already booked" })
        }

        const total = price * seats.length

        const [b] = await c.query(
            `insert into bookings
            (user_id,show_id,total_amount,status)
            values(?,?,?,'confirmed')`,
            [user_id, show_id, total]
        )

        const booking_id = b.insertId

        const seatValues = seats.map(s => [booking_id, s])
        await c.query(
            `insert into booking_seats (booking_id, seat_id) values ?`,
            [seatValues]
        )

        await c.commit()
        c.release()

        res.json({
            message: "booking created",
            booking_id
        })

    } catch (e) {

        console.error('BOOKING ERROR:', e)
        await c.rollback()
        c.release()
        res.status(500).json({ error: e.message || 'internal server error', code: e.code })

    }

})

module.exports = r