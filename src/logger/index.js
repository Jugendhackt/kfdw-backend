class Logger {

    /**
     * @param {string} loggerName
     */
    constructor(loggerName) {
        this.loggerName = loggerName;
    }

    log(...message) {
        message.unshift(`${this.loggerName.padStart(10)} --`);
        console.log.apply(this, message);
    }
}

module.exports = Logger;