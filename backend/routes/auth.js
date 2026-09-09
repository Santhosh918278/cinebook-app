const r = require("express").Router()
const db = require("../db")
const bcrypt = require("bcrypt")

r.post("/register", async (req, res) => {

    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ error: "missing fields" })
    }

    db.query(
        "select user_id from users where email=?",
        [email],
        async (e, d) => {

            if (e) return res.status(500).json(e)

            if (d.length > 0) {
                return res.status(400).json({ error: "email already exists" })
            }

            const hash = await bcrypt.hash(password, 10)

            db.query(
                "insert into users(name,email,password_hash) values(?,?,?)",
                [name, email, hash],
                (e, r2) => {

                    if (e) return res.status(500).json(e)

                    res.json({
                        message: "user registered",
                        user_id: r2.insertId
                    })
                }
            )
        }
    )
})

r.post("/login", async (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: "missing fields" })
    }

    db.query(
        "select * from users where email=?",
        [email],
        async (e, d) => {

            if (e) return res.status(500).json(e)

            if (d.length === 0) {
                return res.status(400).json({ error: "invalid email" })
            }

            const u = d[0]

            const ok = await bcrypt.compare(password, u.password_hash)

            if (!ok) {
                return res.status(400).json({ error: "invalid password" })
            }

            res.json({
                message: "login success",
                user_id: u.user_id,
                name: u.name,
                email: u.email
            })
        }
    )
})

module.exports = r