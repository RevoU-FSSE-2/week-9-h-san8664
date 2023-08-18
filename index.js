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

app.post("/transaction", (request, response) => {
    const {type, amount, user_id} = request.body
    console.log(request.body); 
    mysqlCon.query( `INSERT INTO transaction
    (user_id, type, amount)
    VALUES(${user_id}, '${type}', ${amount});
    `, (err, result, fields) => {
      if (err) {
        console.error(err);
        response.status(500).json(commonResponse(null, "response error"));
        response.end();
        return;
      }
      console.log("user successfully connected", result);
      response.status(200).json(commonResponse(result.insertId, null));
      response.end();
    });
  });


app.listen(3302, () => {
  console.log("running in 3302");
});
