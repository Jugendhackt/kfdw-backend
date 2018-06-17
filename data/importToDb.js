(require('dotenv').config());

const DatabaseManager = (require('../src/database')).getInstance();
const os = require('os');

console.time('db connection');
DatabaseManager.establishConnection().then(() => {
    console.timeEnd('db connection');

    try {
        DatabaseManager.getDatabase().beginTransaction();

        // FIXME: The driver does not support prepared statements, yet. Rewrite once it is supported.
        const rawData = require('./rawData-frankfurt.geo');
        DatabaseManager.getDatabase().query('-- TRUNCATE TABLE trash_bins;', err => {
            console.log('Truncated table');
            if (err) throw err;
            const sql = 'INSERT IGNORE INTO trash_bins(trashBinID, latitude, longitude, data) VALUES (null, ?, ?, ?);';

            successfulRequests = 0;

            console.time('import');
            for (const entry of rawData.elements) {
                DatabaseManager.queryPromisify(sql, [
                    entry.lat,
                    entry.lon,
                    JSON.stringify(entry.tags)
                ]).then(() => {
                    if (++successfulRequests === rawData.elements.length) {
                        process.stdout.write(os.EOL);
                        console.timeEnd('import');
                        DatabaseManager.getDatabase().commit(() => process.exit());
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