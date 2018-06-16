(require('dotenv').config());

const DatabaseManager = new (require('../src/database'));
const os = require('os');

console.time('db connection');
DatabaseManager.establishConnection().then(() => {
    console.timeEnd('db connection');

    try {
        DatabaseManager.getDatabase().beginTransaction();

        // FIXME: The driver does not support prepared statements, yet. Rewrite once it is supported.
        console.time('import');
        const rawData = require('./rawData.geo');
        DatabaseManager.getDatabase().query('TRUNCATE TABLE trash_bins;', err => {
            console.log('Truncated table');
            if (err) throw err;
            const sql = 'INSERT INTO trash_bins(trashBinID, latitude, longitude, data) VALUES (null, ?, ?, ?);';

            successfulRequests = 0;

            for (const entry of rawData.elements) {
                DatabaseManager.queryPromisify(sql, [
                    entry.lat,
                    entry.lon,
                    JSON.stringify(entry.tags)
                ]).then(() => {
                    if (++successfulRequests === rawData.elements.length) {
                        process.stdout.write(os.EOL);
                        console.timeEnd('import');
                        DatabaseManager.getDatabase().commit();
                        process.exit();
                    }
                    if (successfulRequests % 5 === 0) {
                        process.stdout.write('.');
                    }
                });
            }
        });
    } catch (err) {
        console.error('ERROR');
        console.error(err);
    }
});