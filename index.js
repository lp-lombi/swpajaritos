//
var cors = require("cors");
var express = require("express");
var app = express();

const port = 7999;

app.use(express.json());
app.use(cors());

app.get("/", function (req, res) {
    res.send("Hola mundo");
});

app.listen(port);

console.log(`Servicio web corriendo en http://localhost:${port}/`);
