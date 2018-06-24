(require('dotenv').config());

const DatabaseManager = (require('../src/database')).getInstance();
const os = require('os');

console.time('db connection');
DatabaseManager.establishConnection().then(() => {
    console.timeEnd('db connection');

    try {
        DatabaseManager.getDatabase().beginTransaction();

        // FIXME: The driver does not support prepared statements, yet. Rewrite once it is supported.
        const rawData = require('./rawData-bw.geo');
        DatabaseManager.getDatabase().query('-- TRUNCATE TABLE trash_bins;', err => {
            console.log('Truncated table');
            if (err) throw err;
            const sql = 'INSERT IGNORE INTO trash_bins(trashBinID, latitude, longitude, data) VALUES (null, ?, ?, ?);';

            let successfulRequests = 0;

            // improve performance tremendously by saving how big our array is
            const expectedLength = rawData.elements.length;
            const percentageStep = 100 / expectedLength;
            console.log(`Importing ${expectedLength} trash bins.`);

            // start measuring performance before entering the loop
            console.time('Import');
            for (const entry of rawData.elements) {
                DatabaseManager.queryPromisify(sql, [
                    entry.lat,
                    entry.lon,
                    JSON.stringify(entry.tags)
                ]).then(() => {
                    if (++successfulRequests % 100 === 0 || successfulRequests === expectedLength) {
                        // print out current percentage with 2 decimals
                        const currentPercentage = Math.round(percentageStep * successfulRequests * 100) / 100;
                        process.stdout.write(`${successfulRequests}… (${currentPercentage}%)${os.EOL}`);

                        if (successfulRequests === expectedLength) {
                            process.stdout.write(os.EOL);
                            console.timeEnd('Import');
                            console.log(`Imported ${expectedLength} trash bins.`);
                            DatabaseManager.getDatabase().commit(() => process.exit());
                        }
                    }
                });
            }
        });
    } catch (err) {
        console.error('ERROR');
        console.error(err);
    }
});