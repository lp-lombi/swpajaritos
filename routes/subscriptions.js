const express = require("express");
const subscriptions = express.Router();

const requireApiKey = require("../apiKeyMiddleware");

subscriptions.get("/all", requireApiKey, (req, res) => {
    if (global.db) {
        global.db.all(`SELECT * FROM subscriptions`, (err, rows) => {
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

subscriptions.post("/new", requireApiKey, (req, res) => {
    if (global.db) {
        global.db.run(
            `DELETE FROM subscriptions WHERE userId = ${req.body.id}`,
            (err) => {
                if (err) {
                    console.log(err);
                    res.send({
                        success: false,
                        reason: "error",
                    });
                    return;
                }
            }
        );
        global.db.run(
            `INSERT INTO subscriptions (userId, tier, startDate) VALUES (${req.body.id}, ${req.body.tier}, "${req.body.startDate}")`,
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
        res.status(500).send("No se ha inicializado la base de datos");
    }
});

module.exports = subscriptions;
