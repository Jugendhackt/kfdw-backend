(require('dotenv').config());

const DatabaseManager = (require('../src/database')).getInstance({verbose: false});
const Area = require('./models/Area');
const fetch = require('node-fetch');
const os = require('os');

const areaToAreaID = new Map([
    // city boundry of Frankfurt (Main)
    ['Frankfurt', 62400],
    // state of Baden-Württemberg
    ['Baden-Württemberg', 62611],
    // state of Berlin
    ['Berlin', 62422],
    // state of Hamburg
    ['Hamburg', 62782],
    // state of Hessen
    ['Hessen', 62650]

    // the hole country. EXPERIMENTAL
    // ['germany', 51477]
]);

let selectedArea = null;
let selectedAreaName = null;

const argv = process.argv.map(x => x.toLowerCase());

for (const area of areaToAreaID.keys()) {
    if (argv.includes(`area=${area.toLowerCase()}`)) {
        selectedArea = new Area(areaToAreaID.get(area));
        selectedAreaName = area;
        break;
    }
}

if (selectedArea === null) {
    // use first entry in map as the default
    selectedArea = new Area(areaToAreaID.values().next().value);
    selectedAreaName = areaToAreaID.keys().next().value;
    console.log(`You did not provide any valid area name, choosing ${selectedAreaName} as the default.`);
    console.log(`(Valid values are ${Array.from(areaToAreaID.keys()).join(', ')}.)`);
}

console.log(`Importing ${selectedAreaName}…`);

console.time('db connection');

// 1. connect with database
DatabaseManager.establishConnection().then(() => {
    console.timeEnd('db connection');
    // 2. start transacation
    return DatabaseManager.beginTransactionPromisify();
}).then(() => {
    console.log(`Requesting data from overpass…`);
    console.time('request live data');
    // 3. fetch the data to import
    return fetch(selectedArea.url);
}).then(response => {
    console.timeEnd('request live data');
    // 4. validate the response
    if (response.ok) {
        return response.json();
    }

    throw new Error(`Response was not successful`);
}).then(async rawData => {
    // 5. import the data

    // FIXME: The driver does not support prepared statements, yet. Rewrite once it is supported.
    const sql = 'INSERT IGNORE INTO trash_bins(trashBinID, latitude, longitude, data) VALUES (null, ?, ?, ?);';

    let successfulRequests = 0;

    // improve performance tremendously by saving how big our array is
    const expectedLength = rawData.elements.length;
    const percentageStep = 100 / expectedLength;
    console.log(`Importing ${expectedLength} trash bins.`);

    // start measuring performance before entering the loop
    console.time('Import');
    for (const entry of rawData.elements) {
        await DatabaseManager.queryPromisify(sql, [
            entry.lat,
            entry.lon,
            JSON.stringify(entry.tags)
        ])
        if (++successfulRequests % 250 === 0 || successfulRequests === expectedLength) {
            // print out current percentage with 2 decimals
            const currentPercentage = Math.round(percentageStep * successfulRequests * 1e2) / 1e2;
            process.stdout.write(`${successfulRequests}… (${currentPercentage}%)${os.EOL}`);

            if (successfulRequests === expectedLength) {
                process.stdout.write(os.EOL);
                console.timeEnd('Import');
                console.log(`Imported ${expectedLength} trash bins.`);
                return DatabaseManager.commitPromisify();
            }
        }
    }
}).then(() => {
    // 6. exit the process
    process.exit();
}).catch(console.log);
