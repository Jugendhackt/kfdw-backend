(require('dotenv').config());
const argparse = require('argparse');
var parser = new argparse.ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'KFDW Importer'
})

parser.addArgument(
  [ '-t', '--truncate' ],
  {
    help: 'Truncate table before importing'
  }
);


let truncateTable = false

const args = parser.parseArgs()

if(args.truncate != null && args.truncate == 'true') {
  truncateTable = true
}

const DatabaseManager = (require('../src/database')).getInstance();
const os = require('os');

console.time('db connection');
DatabaseManager.establishConnection().then(() => {
    console.timeEnd('db connection');

    try {
        DatabaseManager.getDatabase().beginTransaction();

        // FIXME: The driver does not support prepared statements, yet. Rewrite once it is supported.
        const rawData = require('./rawData-final.geo');
        let prefix = '';
        if(truncateTable) {
          prefix = '-- '
        }
        DatabaseManager.getDatabase().query(`${prefix}TRUNCATE TABLE trash_bins;`, err => {
            if(truncateTable) {
              console.log('Truncated table')
            } else {
              console.log('Skipped table truncating')
            }
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
