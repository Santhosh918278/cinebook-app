const express = require("express")
const r = express.Router()
const db = require("../db")

r.get("/",(req,res)=>{
    db.query("select * from movies",(e,d)=>{
        if(e) return res.status(500).json(e)
        res.json(d)
    })
})

r.get("/:id",(req,res)=>{
    const id = req.params.id

    db.query(
        "select * from movies where movie_id=?",
        [id],
        (e,d)=>{
            if(e) return res.status(500).json(e)
            res.json(d)
        }
    )
})

r.post("/",(req,res)=>{
    const {
        title,
        description,
        duration,
        genre,
        language,
        release_date,
        poster_url,
        status
    } = req.body

    db.query(
        "insert into movies(title,description,duration,genre,language,release_date,poster_url,status) values(?,?,?,?,?,?,?,?)",
        [title,description,duration,genre,language,release_date,poster_url,status],
        (e,d)=>{
            if(e) return res.status(500).json(e)
            res.json({msg:"movie added",id:d.insertId})
        }
    )
})

module.exports = r