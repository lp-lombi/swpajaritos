var cors = require("cors");
var express = require("express");
var sqlite3 = require("sqlite3");
var path = require("path");
var discordBot = require(path.join(__dirname, "./discord/main.js"));

var app = express();

global.db = new sqlite3.Database(path.join(__dirname, "database.db"));

app.use(express.json());
app.use(cors());

var users = require("./routes/users");
var subscriptions = require("./routes/subscriptions");
var bans = require("./routes/bans");
var rooms = require("./routes/rooms");
app.use("/users", users);
app.use("/subscriptions", subscriptions);
app.use("/bans", bans);
app.use("/rooms", rooms);

const port = 3000;
app.listen(port);
console.log(`Servicio web corriendo en http://localhost:${port}/`);

/* discordBot.client.once("ready", () => {
    discordBot.chat("Cristo está vivo en Discord!");
});
 */
