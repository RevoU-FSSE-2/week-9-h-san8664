const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const app = express();

dotenv.config();
const commonResponse = function (data, error) {
  if (error) {
    return {
      error: error,
    };
  }

  return {
    id: data,
  };
};

const mysqlCon = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
});

mysqlCon.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    throw err;
  }

  console.log("MySQL successfully connected");
});

app.use(bodyParser.json());

app.get("/user", (request, response) => {
  mysqlCon.query("SELECT * FROM user", (err, result, fields) => {
    if (err) {
      console.error("Error fetching users:", err);
      response.status(500).json(commonResponse(null, "response error"));
      return;
    }
    console.log("Users successfully fetched:", result);
    response.status(200).json(commonResponse(result, null));
  });
});

app.get("/user/:id", (request, response) => {
  const id = request.params.id;
  mysqlCon.query(
    `SELECT u.id, u.name, u.address, 
    (SELECT SUM(t.amount) - 
     (SELECT SUM(t.amount)
      FROM transaction t
      WHERE t.type = "expense")
     FROM transaction t
     WHERE t.type = "income") as balance, 
    (SELECT SUM(t.amount)
     FROM transaction t 
     WHERE t.type = "expense") as expense
    FROM user AS u, transaction AS t 
    WHERE u.id = ${id}
    GROUP BY u.id`,
    (err, result, fields) => {
      if (err) {
        console.error("Error fetching user:", err);
        response.status(500).json(commonResponse(null, "response error"));
        return;
      }
      console.log("User successfully fetched:", result);
      response.status(200).json(commonResponse(result, null));
    }
  );
});

app.post("/transaction", (request, response) => {
  const { type, amount, user_id } = request.body;
  mysqlCon.query(
    `INSERT INTO transaction (user_id, type, amount)
     VALUES(${user_id}, '${type}', ${amount})`,
    (err, result, fields) => {
      if (err) {
        console.error("Error adding transaction:", err);
        response.status(500).json(commonResponse(null, "response error"));
        return;
      }
      console.log("Transaction added successfully:", result);
      response.status(200).json(commonResponse(result.insertId, null));
    }
  );
});

app.put("/transactions/:id", (request, response) => {
  const id = +request.params.id;
  const { type, amount, user_id } = request.body;
  const sql =
    "UPDATE transaction SET type = ?, amount = ?, user_id = ? WHERE id = ?";
  mysqlCon.query(sql, [type, amount, user_id, id], (err, result) => {
    if (err) {
      console.error("Error updating transaction:", err);
      response.status(500).send("Error updating transaction");
      return;
    }
    response.json({ id });
  });
});

app.delete("/transactions/:id", (request, response) => {
  const id = +request.params.id;
  const sql = "DELETE FROM transaction WHERE id = ?";
  mysqlCon.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting transaction:", err);
      response.status(500).send("Error deleting transaction");
      return;
    }
    response.json({ id: id });
  });
});

const PORT = process.env.PORT || 3302;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
