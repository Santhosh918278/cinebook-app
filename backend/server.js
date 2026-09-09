// Catch silent crashes
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const db = require("./db");
const express = require("express");
const cors = require("cors");
const movieRoutes = require("./routes/movieRoutes")
const shows = require("./routes/shows")
const booking = require("./routes/booking");
const auth = require("./routes/auth")
const app = express();
const payments=require("./routes/payments")


app.use(cors());

app.use(express.json());
app.use("/payments",payments);
app.use("/movies",movieRoutes);
app.use("/shows",shows);
app.use("/bookings",booking);
app.use("/auth",auth);
app.get("/",(req,res)=>{
    res.send("movie recomendation system backend running");
})
const port = 5000;
app.listen(port,()=>{
     console.log(`server running on port ${port}`);
})
