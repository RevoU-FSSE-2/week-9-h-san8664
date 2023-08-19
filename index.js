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
  if (err) throw err;

  console.log("mysql successfully connected");
});

app.use(bodyParser.json());

app.get("/user", (request, response) => {
  mysqlCon.query("select * from user", (err, result, fields) => {
    if (err) {
      console.error(err);
      response.status(500).json(commonResponse(null, "response error"));
      response.end();
      return;
    }
    console.log("user successfully connected", result);
    response.status(200).json(commonResponse(result, null));
    response.end();
  });
});

app.get("/user/:id", (request, response) => {
  const id = request.params.id;
  mysqlCon.query(
    `
    SELECT u.id, u.name, u.address,(
        (SELECT sum(t.amount) - 
           (SELECT sum(t.amount)
        FROM transaction t
        WHERE t.type = "expense")
        FROM transaction t
        WHERE t.type = "income") 
    ) as balance, (
    (select sum(t.amount)
    from transaction t 
    where t.type = "expense") 
    ) as expense
    from user as u, transaction as t 
    WHERE u.id = ${id}
    GROUP by u.id
    `,
    (err, result, fields) => {
      if (err) {
        console.error(err);
        response.status(500).json(commonResponse(null, "response error"));
        response.end();
        return;
      }
      console.log("user successfully connected", result);
      response.status(200).json(commonResponse(result, null));
      response.end();
    }
  );
});

app.post("/transaction", (request, response) => {
  const { type, amount, user_id } = request.body;
  console.log(request.body);
  mysqlCon.query(
    `INSERT INTO transaction
    (user_id, type, amount)
    VALUES(${user_id}, '${type}', ${amount});
    `,
    (err, result, fields) => {
      if (err) {
        console.error(err);
        response.status(500).json(commonResponse(null, "response error"));
        response.end();
        return;
      }
      console.log("user successfully connected", result);
      response.status(200).json(commonResponse(result.insertId, null));
      response.end();
    }
  );
});

app.put("/transactions/:id", (request, response) => {
  const id = +request.params.id;
  const { type, amount, user_id } = request.body;
  const sql =
    "UPDATE tb_transaction SET type = ?, amount = ?, user_id = ? WHERE id = ?";
  db.query(sql, [type, amount, user_id, id], (err, result) => {
    if (err) {
      console.error("Error updating transaction:", err);
      response.status(500).send("Error updating transaction");
      return;
    }
    res.json({ id });
  });
});

app.delete("/transactions/:id", (request, response) => {
  const id = +req.params.id;
  const sql = "DELETE FROM tb_transaction WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting transaction:", err);
      res.status(500).send("Error deleting transaction");
      return;
    }
    res.json({ id: id });
  });
});

app.listen(3302, () => {
  console.log("running in 3302");
});
