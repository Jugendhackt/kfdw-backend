// read sensitive credentials from `.env`
(require('dotenv').config());

const express = require('express');
const bodyParser = require('body-parser');

const DatabaseManager = require('./database').getInstance();
const logger = require('./logger');
const MainLogger = logger.getInstance('Main');
const ServerLogger = logger.getInstance('Server');

const TrashRouteHandler = require('./routes/trash');
const TrashcanRouteHandler = require('./routes/trashcan');
const ScoreRouteHandler = require('./routes/score');

MainLogger.log(`${require('../package').name} started at ${new Date().toLocaleTimeString()}`);

// establish database connection
DatabaseManager.establishConnection();

// init webserver
const app = express();

/**
 * @type Map<string,int>
 */
const ipAddressesToCount = new Map;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((request, response, next) => {
    // allow CORS
    response
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');

    let counter = (ipAddressesToCount.get(request.ip) || 0);
    ipAddressesToCount.set(request.ip, ++counter);

    // log the request
    ServerLogger.log(
        `New ${request.method} request on ${request.originalUrl} from ip ${request.ip} at ${new Date().toLocaleTimeString()} (${ipAddressesToCount.get(request.ip)} time(s))`
    );
    next();
});

app.use('/trashcans', TrashcanRouteHandler);
app.use('/trash', TrashRouteHandler);
app.use('/score', ScoreRouteHandler);

const runningInstance = app.listen(8080, () => {
    ServerLogger.log(`Server is listening on port ${runningInstance.address().port}`);
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    process.exit(1);
});