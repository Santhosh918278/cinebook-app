const express = require("express");
const db = require("../db");
const r = express.Router();

r.get("/",(req,res)=>{
    const id=req.query.movie_id

    if(id){
        db.query(
            "select * from shows where movie_id=?",
            [id],
            (e,d)=>{
                if(e) return res.status(500).json(e)
                res.json(d)
            }
        )
    }else{
        db.query(
            "select * from shows",
            (e,d)=>{
                if(e) return res.status(500).json(e)
                res.json(d)
            }
        )
    }
})
r.get("/show/:id",(req,res)=>{
    const id = req.params.id;
    db.query("SELECT * FROM shows WHERE show_id=?",[id],(e,d)=>{
        if(e) return res.status(500).json(e);
        res.json(d);
    })
})

r.post("/",(req,res)=>{
    const {
        
        movie_id,
        screen_id,
        show_date,
        start_time,
        end_time,
        price

     } = req.body;
     db.query("INSERT INTO shows(movie_id,screen_id,show_date,start_time,end_time,price) VALUES(?,?,?,?,?,?)",[movie_id,screen_id,show_date,start_time,end_time,price],(e,d)=>{
        if(e) return res.status(500).json(e);
        res.json(d);
     });
})
r.get("/:show_id/seats",(req,res)=>{
    const id=req.params.show_id

    db.query(
        `SELECT 
            s.seat_id,
            s.row_label,
            s.seat_number,
            s.seat_type,
            CASE 
                WHEN b.booking_id IS NULL THEN 'available'
                ELSE 'booked'
            END AS status
        FROM shows sh
        JOIN seats s ON s.screen_id = sh.screen_id
        LEFT JOIN booking_seats bs ON s.seat_id = bs.seat_id
        LEFT JOIN bookings b 
            ON bs.booking_id = b.booking_id
            AND b.show_id = ?
            AND b.status = 'confirmed'
        WHERE sh.show_id = ?
        ORDER BY s.row_label, s.seat_number`,
        [id,id],
        (e,d)=>{
            if(e) return res.status(500).json(e)
            res.json(d)
        }
    )
})



module.exports = r