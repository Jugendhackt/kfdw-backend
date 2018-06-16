// read sensitive credentials from `.env`
(require('dotenv').config());

const express = require('express');
const bodyParser = require('body-parser');

const DatabaseManager = require('./database').getInstance();
const logger = require('./logger');
const MainLogger = logger.getInstance('Main');
const ServerLogger = logger.getInstance('Server');

const TrashcanRouteHandler = require('./routes/trashcan');

MainLogger.log(`${require('../package').name} started at ${new Date().toLocaleTimeString()}`);

// establish database connection
DatabaseManager.establishConnection();

// init webserver
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((request, response, next) => {
    // allow CORS
    response
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');

    // log the request
    ServerLogger.log(`New request on ${request.path} from ip ${request.ip} at ${new Date().toLocaleTimeString()}`);
    next();
});

app.use('/trashcans', TrashcanRouteHandler);

const runningInstance = app.listen(8080, () => {
    ServerLogger.log(`Server is listening on port ${runningInstance.address().port}`);
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    process.exit(1);
});