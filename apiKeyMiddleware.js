module.exports = (req, res, next) => {
    var path = require("path");
    var fs = require("fs/promises");
    var bcrypt = require("bcrypt");

    function newApiKey() {
        global.apiKey = bcrypt.hashSync(bcrypt.genSaltSync(10), 10);
        fs.writeFile(
            path.join(__dirname, "config.json"),
            JSON.stringify({ apiKey: global.apiKey })
        ).catch((err) => {
            throw err;
        });
    }

    // Si no hay token, se crea uno
    new Promise((resolve, reject) => {
        if (global.apiKey === undefined) {
            fs.readFile(path.join(__dirname, "config.json"))
                .then((data) => {
                    let config = JSON.parse(data);
                    if (config.apiKey !== "") {
                        global.apiKey = config.apiKey;
                        resolve();
                    } else {
                        console.log(
                            "El token de API del archivo config.json está vacío. Generando uno nuevo"
                        );
                        newApiKey();
                        resolve();
                    }
                })
                .catch((err) => {
                    if (err.code === "ENOENT") {
                        console.log(
                            "Se creará el archivo de configuración con un nuevo token de API"
                        );
                        newApiKey();
                        resolve();
                    } else {
                        throw err;
                    }
                });
        } else {
            resolve();
        }
    }).then(() => {
        let reqApiKey = req.headers["x-api-key"];
        if (reqApiKey && reqApiKey === global.apiKey) {
            next();
        } else {
            console.log("Intento de acceso no autorizado");
            res.status(401).json({ message: "No autorizado." });
        }
    });
};
