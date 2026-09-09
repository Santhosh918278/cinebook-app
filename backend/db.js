const mysql = require("mysql2")

const db = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Santhosh@8247",
    database:"movie_reservation_system",
    waitForConnections:true,
    connectionLimit:10,
    queueLimit:0
})

// Actually test the connection instead of just logging
db.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection failed:", err.message)
        console.error("Make sure MySQL is running and the database exists.")
    } else {
        console.log("mysql connected successfully")
        connection.release()
    }
})

module.exports = db