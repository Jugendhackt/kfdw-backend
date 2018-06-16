class Logger {

    /**
     * @param {string} loggerName
     */
    constructor(loggerName) {
        this.loggerName = loggerName;
    }

    doLog(logLevel = 'log', ...message) {
        message.unshift(`${this.loggerName.padStart(8)} --`);

        // FIXME: This logs an array but it is not useful most of the time.
        console[logLevel].apply(this, message);
    }

    warn(...message) {
        message.unshift('WARN');
        this.doLog('warn', message);
    }

    log(...message) {
        this.doLog('log', message);
    }
}

module.exports = Logger;