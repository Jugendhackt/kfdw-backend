const mysql = require('mysql');

class DatabaseManager {

    constructor() {
        this.host = process.env.MYSQL_HOST;
        this.user = process.env.MYSQL_USER;
        this.password = process.env.MYSQL_PASSWORD;
    }

    /**
     * @returns Promise
     */
    async establishConnection() {
        return await new Promise((resolve, reject) => {
            mysql.createConnection({
                host: this.host,
                user: this.user,
                password: this.password
            }).connect(err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

}

module.exports = DatabaseManager;