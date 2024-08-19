//
var cors = require("cors");
var express = require("express");
var sqlite3 = require("sqlite3");
var path = require("path");
var fs = require("fs");

var app = express();
global.db = new sqlite3.Database(path.join(__dirname, "database.db"));

app.use(express.json());
app.use(cors());

app.get("/", function (req, res) {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(rows);
    });
    res.send("Hola mundo");
});

// routes

var users = require("./routes/users");

app.use("/users", users);

//

const port = 7999;
app.listen(port);
console.log(`Servicio web corriendo en http://localhost:${port}/`);
