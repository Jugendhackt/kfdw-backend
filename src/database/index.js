const mysql = require('mysql');
const DatabaseLogger = new (require('../logger'))('Database')

class DatabaseManager {

    constructor() {
        this.host = process.env.MYSQL_HOST;
        this.user = process.env.MYSQL_USER;
        this.password = process.env.MYSQL_PASSWORD;

        if (this.host === void 0 || this.user === void 0 || this.password === void 0) {
            DatabaseLogger.warn('One or more values are undefined, please check that they are defined in the .env file');
        }
    }

    /**
     * @returns Promise
     */
    async establishConnection() {
        return await (new Promise((resolve, reject) => {
            mysql.createConnection({
                host: this.host,
                user: this.user,
                password: this.password
            }).connect(err => {
                if (err) {
                    DatabaseLogger.log(`Failed to establish connection ${err}.`);
                    reject(err);
                    return;
                }
                DatabaseLogger.log(`Successfully established connection to database at ${new Date().toString()}.`);
                resolve();
            });
        }));
    }

}

module.exports = DatabaseManager;