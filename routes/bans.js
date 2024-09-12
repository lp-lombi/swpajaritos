const express = require("express");
const bans = express.Router();

const requireApiKey = require("../apiKeyMiddleware");

bans.get("/all", requireApiKey, (req, res) => {
    if (global.db) {
        global.db.all(`SELECT * FROM bans`, (err, rows) => {
            if (err) {
                console.log(err);
                return;
            } else {
                res.send(rows);
            }
        });
    } else {
        res.status(500).send("No se ha inicializado la base de datos");
    }
});

bans.post("/new", requireApiKey, (req, res) => {
    if (global.db) {
        if (
            (req.body.name || req.body.name === "") &&
            (req.body.ip || req.body.ip === "") &&
            (req.body.auth || req.body.auth === "")
        ) {
            global.db.run(
                `INSERT INTO bans (name, ip, auth) VALUES ("${req.body.name}", "${req.body.ip}", "${req.body.auth}")`,
                (err) => {
                    if (err) {
                        console.log(err);
                        res.send({ success: false, reason: "error" });
                        return;
                    } else {
                        res.send({ success: true });
                    }
                }
            );
        } else {
            res.status(400).send({
                success: false,
                error: "need name, ip and auth",
            });
        }
    } else {
        res.status(500).send("No se ha inicializado la base de datos");
    }
});

module.exports = bans;
