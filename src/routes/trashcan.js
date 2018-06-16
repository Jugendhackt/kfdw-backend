const router = require('express').Router();
const logger = require('../logger');
const DatabaseHandler = require('../database');
const MainLogger = logger.getInstance('Main');

router.get('', (request, response) => {
    if (request.query.position) {
        const [latitude, longitude] = request.query.position.split(',', 2).map(x => Number.parseFloat(x));

        // see https://stackoverflow.com/a/24372831/8496913

        let sql = 'SELECT trash_bins.*, 111.111 * ' +
        'DEGREES(ACOS(COS(RADIANS(?)) ' +
             '* COS(RADIANS(trash_bins.latitude)) ' +
             '* COS(RADIANS(? - trash_bins.longitude)) ' +
             '+ SIN(RADIANS(?)) ' +
             '* SIN(RADIANS(trash_bins.latitude)))) AS distance_in_km ' +
             'FROM trash_bins ';
             'HAVING distance_in_km <= ? ' +
             'ORDER BY distance_in_km DESC ' +
             'LIMIT 10';
        let parameters = [latitude, longitude, latitude, Number.parseFloat(process.env.DISTANCE_THRESHOLD)];

        DatabaseHandler.getInstance().getDatabase().query(sql, parameters, ());
    }
    response.end('tbd');
});

module.exports = router;