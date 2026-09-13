const mysql = require("mysql2")

const db = mysql.createPool({
    host: "bdcf2jbldxwn8vctqzwn-mysql.services.clever-cloud.com",
    user: "ul7duzocij7hq4ci",
    password: "xqwbRLx83uhrmR2J3aQZ",
    database: "bdcf2jbldxwn8vctqzwn",
    port: 3306,
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