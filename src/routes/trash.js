const router = require('express').Router();
const DatabaseHandler = require('../database').getInstance();
const ServerLogger = require('../logger').getInstance('Server');
const dataParser = require('dataurl');
const uuid = require('uuid/v1');
const FileSystem = require('fs');

router.get('', (request, response) => {
    if (request.query.position) {
        ServerLogger.log('Doing heavy calculation stuff…')
        console.time('Haversine formula execution time');
        const [latitude, longitude] = request.query.position.split(',', 2).map(x => Number.parseFloat(x));
        let sql = 'SELECT trash.*, ROUND((111.111 * ' +
            'DEGREES(ACOS(COS(RADIANS(?)) ' +
            '* COS(RADIANS(trash.latitude)) ' +
            '* COS(RADIANS(? - trash.longitude)) ' +
            '+ SIN(RADIANS(?)) ' +
            '* SIN(RADIANS(trash.latitude))))) * 1000, 3) AS distance_in_m ' +
            'FROM trash ' +
            'HAVING distance_in_m <= ? ' +
            'ORDER BY distance_in_m ASC ';
            // 'LIMIT 15;';
        let parameters = [latitude, longitude, latitude, Number.parseFloat(process.env.DISTANCE_THRESHOLD)];
        DatabaseHandler.getDatabase().query(sql, parameters, (error, results) => {
            console.timeEnd('Haversine formula execution time');
            if (error) throw error;
            response.json(results);
        });
    } else {
        response.status(401).json('You need to provide your current position.');
    }
});

router.post('', (request, response) => {
    const neededFields = ['latitude', 'longitude', 'comment', 'flag'];
    for (const neededField of neededFields) {
        if (!request.body[neededField]) {
            response.status(401).json(`You need to provide the following field: ${neededField}`);
            return;

        // transform field to matching format
        } else if (['latitude', 'longitude'].includes(neededField)) {
            request.body[neededField] = Number.parseFloat(neededField);
        } else if (['flag'].includes(neededField)) {
            request.body[neededField] = Number.parseInt(neededField);
        }
    }

    // validate image
    if (!request.body.image) {
        response.status(401).json('You need to provide an image');
        return;
    }

    const RealFile = dataParser.parse(request.body.image);

    const { mimetype, charset, data } = RealFile;
    /** @type {string} mimetype */
    if (!mimetype.startsWith('image/')) {
        response.status(401).json('You need to provide an image');
        return;
    }

    // notify client we don't longer need to waste their time
    response.status(201).end();

    const fileHash = uuid();
    const filePath = `uploadedData/${fileHash}.${mimetype.substring('image/'.length)}`;

    FileSystem.writeFileSync(fileName, data);

    let sql = 'INSERT INTO trash(trashID, imagePath, latitude, longitude, comment, flag) ' +
              'VALUES(null, ?, ?, ?, ?, ?)';

    let parameters = [
        filePath,
        request.body.imagePath,
        request.body.latitude,
        request.body.longitude,
        request.body.comment,
        request.body.flag
    ];

    DatabaseHandler.getDatabase().query(sql, parameters, (error) => {
        if (error) throw error;
    });

});

module.exports = router;