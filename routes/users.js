const express = require("express");
const fs = require("fs");
const users = express.Router();

async function getAllUsers(
    cols = "id, username, role, score, assists, matches, wins"
) {
    return new Promise((resolve, reject) => {
        global.db.all(`SELECT ${cols}, wins FROM users`, (err, rows) => {
            if (err) {
                console.error(err);
                resolve([]);
            }
            resolve(rows);
        });
    });
}

async function getAllUsersStats() {
    return new Promise((resolve, reject) => {
        global.db.all(
            `SELECT id, username, score, assists, matches, wins FROM users WHERE score > 0 OR assists > 0`,
            (err, rows) => {
                if (err) {
                    console.error(err);
                    resolve([]);
                }
                resolve(rows);
            }
        );
    });
}

async function getUser(
    username = null,
    id = null,
    cols = "id, username, role, score, assists, matches, wins"
) {
    if (username) {
        return new Promise((resolve, reject) => {
            global.db.all(
                `SELECT ${cols} FROM users WHERE username = "${username}"`,
                (err, rows) => {
                    if (err) {
                        console.error(err);
                        resolve(null);
                    }
                    resolve(rows[0] ? rows[0] : null);
                }
            );
        });
    } else if (id) {
        return new Promise((resolve, reject) => {
            global.db.all(
                `SELECT ${cols} FROM users WHERE id = ${id}`,
                (err, rows) => {
                    if (err) {
                        console.error(err);
                        resolve(null);
                    }
                    resolve(rows[0] ? rows[0] : null);
                }
            );
        });
    }
}

function calcRating(stats) {
    const baseScore = 1000;
    const scoreWeight = 4; // Peso de cada gol
    const assistWeight = 3; // Peso de cada asistencia
    const matchWeight = -3; // Peso de cada partido jugado (penalización para evitar inflar la puntuación solo por jugar muchos partidos)
    const winWeight = 6; // Peso de cada victoria

    const rating =
        baseScore +
        stats.score * scoreWeight +
        stats.assists * assistWeight +
        stats.matches * matchWeight +
        stats.wins * winWeight;

    return rating;
}

users.get("/all", (req, res) => {
    if (global.db) {
        getAllUsers().then((users) => {
            res.send({ users });
        });
    } else {
        res.status(500).send("No se ha inicializado la base de datos");
    }
});

users.post("/getuser", (req, res) => {
    if (global.db) {
        if (req.body.username) {
            getUser(req.body.username).then((user) => {
                res.send({ user });
                return;
            });
        } else if (req.body.id) {
            getUser(null, req.body.id).then((user) => {
                res.send({ user });
                return;
            });
        } else {
            res.status(400).send({ error: "Debe enviar un username o id" });
        }
    } else {
        res.status(500).send("No se ha inicializado la base de datos");
    }
});

users.get("/stats", (req, res) => {
    if (global.db) {
        getAllUsersStats().then((stats) => {
            stats.forEach((ps) => {
                ps.rating = calcRating(ps);
            });
            res.send({ stats: stats });
        });
    }
});

module.exports = users;
