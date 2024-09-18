const express = require("express");
const rooms = express.Router();

const requireApiKey = require("../apiKeyMiddleware");

global.roomsList = [];

var ivl = setInterval(() => {
    global.roomsList.forEach((r) => {
        if (r.ttl-- <= 0) {
            global.roomsList.splice(global.roomsList.indexOf(r), 1);
        }
    });
}, 1000);

rooms.get("/all", requireApiKey, (req, res) => {
    res.json({ rooms: global.roomsList });
});

rooms.post("/add", requireApiKey, (req, res) => {
    console.log(req.body);
    if (req.body.name && req.body.link) {
        let room = global.roomsList.find((r) => r.link === req.body.link);
        if (room) {
            global.roomsList.splice(global.roomsList.indexOf(room), 1);
        }

        global.roomsList.push({
            name: req.body.name,
            link: req.body.link,
            players: req.body.players || 0,
            maxPlayers: req.body.maxPlayers || 0,
            ttl: 20,
        });
    }
    res.send({ success: true, message: "Room added" });
});

module.exports = rooms;
