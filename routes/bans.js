const express = require("express");
const bans = express.Router();

const requireApiKey = require("../apiKeyMiddleware");

bans.get("/", requireApiKey, (req, res) => {
    if (global.db) {
        let sql = `SELECT * FROM bans`;
        const queryList = [];

        if (req.query.byId && !isNaN(req.query.byId)) {
            queryList.push(`byId = ${req.query.byId}`);
        }
        if (req.query.isPermanent) {
            queryList.push(`isPermanent = ${req.query.isPermanent}`);
        }

        if (queryList.length > 0) {
            sql += ` WHERE ${queryList.join(" AND ")}`;
        }

        global.db.all(sql, (err, rows) => {
            if (err) {
                console.log(err);
                res.status(500).send("Error al obtener los datos de la base de datos");
            } else {
                res.send(rows);
            }
        });
    } else {
        res.status(500).send("No se ha inicializado la base de datos");
    }
});

bans.post("/", requireApiKey, (req, res) => {
    if (global.db) {
        var { byId, userId, name, ip, auth, isPermanent } = req.body;

        byId = byId || null;
        userId = userId || null;
        name = name || "";
        ip = ip || null;
        auth = auth || null;
        isPermanent = isPermanent || false;

        if (ip) {
            global.db.run(
                `INSERT INTO bans (byId, userId, name, ip, auth, isPermanent) VALUES (${byId}, ${userId}, "${name}", "${ip}", "${auth}", ${isPermanent})`,
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
                error: "Falta una IP para crear el ban",
            });
        }
    } else {
        res.status(500).send("No se ha inicializado la base de datos");
    }
});

bans.delete("/:id", requireApiKey, (req, res) => {
    if (global.db) {
        if (req.params.id || !isNaN(req.params.id)) {
            let id = parseInt(req.params.id);
            global.db.run(`DELETE FROM bans WHERE id = ${id}`, (err) => {
                if (err) {
                    console.log(err);
                    res.send({ success: false, reason: "error" });
                    return;
                } else {
                    res.send({ success: true });
                }
            });
        } else {
            res.status(400).send({
                success: false,
                error: "ID inválida",
            });
        }
    } else {
        res.status(500).send("No se ha inicializado la base de datos");
    }
});

module.exports = bans;
