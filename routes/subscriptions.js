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
        global.db.run(`DELETE FROM subscriptions WHERE userId = ${req.body.id}`, (err) => {
            if (err) {
                console.log(err);
                res.send({
                    success: false,
                    reason: "error",
                });
                return;
            }
        });
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

subscriptions.patch("/:userId", requireApiKey, (req, res) => {
    console.log(req.body);
    const { scoreAnimId, scoreMessage, assistMessage } = req.body;
    const fields = [];
    if (scoreAnimId !== undefined) fields.push({ scoreAnimId });
    if (scoreMessage !== undefined) fields.push({ scoreMessage });
    if (assistMessage !== undefined) fields.push({ assistMessage });
    let sql = `UPDATE subscriptions SET `;
    fields.forEach((field, i) => {
        sql += `${Object.keys(field)[0]} = "${Object.values(field)[0]}"`;
        if (i < fields.length - 1) {
            sql += ",";
        } else {
            sql += ` WHERE userId = ${req.params.userId}`;
        }
    });
    if (global.db) {
        global.db.run(sql, (err) => {
            if (err) res.send({ success: false, reason: "error" });
            else res.send({ success: true });
        });
        return;
    }
    res.send({ success: false, reason: "No se ha inicializado la base de datos" });
});

module.exports = subscriptions;
