const router = require('express').Router();
const DatabaseHandler = require('../database').getInstance();
const ServerLogger = require('../logger').getInstance('Server');

router.get('', (request, response) => {
    if (request.query.position) {
        ServerLogger.log('Preparing and doing heavy calculation stuff…');
        console.time('Haversine formula execution time');
        const [latitude, longitude] = request.query.position.split(',', 2).map(x => Number.parseFloat(x));

        // see https://stackoverflow.com/a/24372831/8496913

        let sql = 'SELECT trash_bins.*, ROUND((111.111 * ' +
        'DEGREES(ACOS(COS(RADIANS(?)) ' +
             '* COS(RADIANS(trash_bins.latitude)) ' +
             '* COS(RADIANS(? - trash_bins.longitude)) ' +
             '+ SIN(RADIANS(?)) ' +
             '* SIN(RADIANS(trash_bins.latitude))))) * 1000, 3) AS distance_in_m ' +
             'FROM trash_bins ' +
             'HAVING distance_in_m <= ? ' +
             'ORDER BY distance_in_m ASC '+
             'LIMIT 500';
        let parameters = [latitude, longitude, latitude, Number.parseFloat(process.env.DISTANCE_THRESHOLD)];
        DatabaseHandler.getDatabase().query(sql, parameters, (error, results) => {
            console.timeEnd('Haversine formula execution time');
            if (error) throw error;
            response.json(results);
            ServerLogger.log(`Sent ${results.length} results.`);
        });
    } else {
        response.status(400).json('You need to provide your current position.');
    }
});

module.exports = router;