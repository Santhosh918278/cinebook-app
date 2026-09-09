const db = require("./db");

const rows = ["A", "B", "C", "D", "E"];
const seatsPerRow = 8;
const values = [];

for (let screenId = 2; screenId <= 7; screenId++) {
  for (const row of rows) {
    for (let num = 1; num <= seatsPerRow; num++) {
      values.push([screenId, row, num, "regular"]);
    }
  }
}

db.query(
  "INSERT INTO seats (screen_id, row_label, seat_number, seat_type) VALUES ?",
  [values],
  (err, result) => {
    if (err) {
      console.error("Error inserting seats:", err.message);
    } else {
      console.log("Successfully inserted " + result.affectedRows + " seats for screens 2-7");
    }
    process.exit();
  }
);
