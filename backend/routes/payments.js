const r = require("express").Router()
const db = require("../db")

r.post("/", (req, res) => {

    const { booking_id, amount, payment_gateway, transaction_id } = req.body

    if (!booking_id || !amount) {
        return res.status(400).json({ error: "missing fields" })
    }

    db.query(
        "select * from bookings where booking_id=?",
        [booking_id],
        (e, d) => {

            if (e) return res.status(500).json(e)

            if (d.length === 0) {
                return res.status(400).json({ error: "invalid booking" })
            }

            const b = d[0]

            if (b.status !== "pending") {
                return res.status(400).json({ error: "booking already processed" })
            }

            db.query(
                `insert into payments
(booking_id,payment_status,payment_gateway,transaction_id,amount)
values(?, 'success', ?, ?, ?)`,
                [booking_id, payment_gateway || null, transaction_id || null, amount],
                (e) => {

                    if (e) return res.status(500).json(e)

                    db.query(
                        "update bookings set status='confirmed' where booking_id=?",
                        [booking_id],
                        (e) => {

                            if (e) return res.status(500).json(e)

                            res.json({
                                message: "payment successful",
                                booking_id
                            })

                        })

                })

        })

})

module.exports = r