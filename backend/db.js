require("dotenv").config()
const mysql = require("mysql2")

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

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
