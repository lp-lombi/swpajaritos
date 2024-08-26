var cors = require("cors");
var express = require("express");
var sqlite3 = require("sqlite3");
var path = require("path");
var apiKeyMiddleware = require("./apiKeyMiddleware");

var app = express();

global.db = new sqlite3.Database(path.join(__dirname, "database.db"));

app.use(express.json());
app.use(cors());
app.use(apiKeyMiddleware);

var users = require("./routes/users");
app.use("/users", users);

const port = 3000;
app.listen(port);
console.log(`Servicio web corriendo en http://localhost:${port}/`);