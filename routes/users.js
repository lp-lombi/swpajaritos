const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const users = express.Router();

async function getAllUsers(cols = "id, username, role") {
    return new Promise((resolve, reject) => {
        global.db.all(`SELECT ${cols} FROM users`, (err, rows) => {
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
    return new Promise((resolve, reject) => {
        if (username) {
            global.db.all(
                `SELECT ${cols} FROM users WHERE username = "${username}"`,
                (err, rows) => {
                    if (err) {
                        console.error(err);
                        resolve(null);
                    }
                    let p = rows[0];
                    if (p) {
                        p.rating = calcRating({
                            score: p.score,
                            assists: p.assists,
                            matches: p.matches,
                            wins: p.wins,
                        });
                        resolve(p);
                    } else {
                        resolve(null);
                    }
                }
            );
        } else if (id) {
            global.db.all(
                `SELECT ${cols} FROM users WHERE id = ${id}`,
                (err, rows) => {
                    if (err) {
                        console.error(err);
                        resolve(null);
                    }
                    let p = rows[0];
                    if (p) {
                        p.rating = calcRating({
                            score: p.score,
                            assists: p.assists,
                            matches: p.matches,
                            wins: p.wins,
                        });
                        resolve(p);
                    } else {
                        resolve(null);
                    }
                }
            );
        }
    });
}

async function validateLogin(username, password) {
    return new Promise((resolve, reject) => {
        global.db.all(
            `SELECT username, password, role FROM users WHERE username = "${username}"`,
            (err, rows) => {
                if (err) {
                    console.error(err);
                    resolve({ validated: false, reason: "error" });
                }
                if (rows[0]) {
                    bcrypt
                        .compare(password, rows[0].password)
                        .then((validated) => {
                            if (validated) {
                                resolve({
                                    validated,
                                    username,
                                    role: rows[0].role,
                                });
                            } else {
                                resolve({
                                    validated,
                                    reason: "password",
                                });
                            }
                        });
                } else {
                    resolve({
                        validated: false,
                        reason: "user",
                    });
                }
            }
        );
    });
}

async function setDBStats(
    id,
    score = null,
    assists = null,
    matches = null,
    wins = null
) {
    return new Promise((resolve, reject) => {
        try {
            let query = "UPDATE users SET ";
            if (score !== null) query += `score = ${score},`;
            if (assists !== null) query += `assists = ${assists},`;
            if (matches !== null) query += `matches = ${matches},`;
            if (wins !== null) query += `wins = ${wins},`;
            if (query[query.length - 1] === ",") query = query.slice(0, -1);
            query += " WHERE id = " + id;

            global.db.run(query, (err) => {
                if (err) {
                    console.log(err);
                    reject(
                        "Error al actualizar los datos en la base de datos."
                    );
                }
                resolve(
                    "Datos actualizados correctamente en la base de datos."
                );
            });
        } catch (e) {
            console.log(e);
            reject("Error al actualizar los datos en la base de datos.");
        }
    });
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

// AUTH

users.post("/auth/login", (req, res) => {
    if (global.db) {
        if (req.body.username && req.body.password) {
            validateLogin(req.body.username, req.body.password).then((obj) => {
                res.json(obj);
            });
        } else {
            res.status(400).send({
                error: "Debe enviar un username y password",
            });
        }
    } else {
        res.status(500).send("No se ha inicializado la base de datos");
    }
});

// STATS

users.get("/stats/all", (req, res) => {
    if (global.db) {
        getAllUsersStats().then((stats) => {
            stats.forEach((ps) => {
                ps.rating = calcRating(ps);
            });
            res.send({ stats: stats });
        });
    }
});

users.post("/stats/sum", (req, res) => {
    if (global.db) {
        if (
            req.body.score ||
            req.body.assists ||
            req.body.matches ||
            req.body.wins
        ) {
            getUser(null, req.body.id).then((user) => {
                if (user) {
                    if (req.body.score) {
                        setDBStats(req.body.id, user.score + req.body.score);
                    }
                    if (req.body.assists) {
                        setDBStats(
                            req.body.id,
                            null,
                            user.assists + req.body.assists
                        );
                    }
                    if (req.body.matches) {
                        setDBStats(
                            req.body.id,
                            null,
                            null,
                            user.matches + req.body.matches
                        );
                    }
                    if (req.body.wins) {
                        setDBStats(
                            req.body.id,
                            null,
                            null,
                            null,
                            user.wins + req.body.wins
                        );
                    }
                    res.send("OK");
                }
            });
        } else {
            res.status(400).send({
                error: "Debe enviar score, assists, matches ó wins",
            });
        }
    }
});

module.exports = users;
