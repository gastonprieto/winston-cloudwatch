const debug = require("debug")("winston-cloudwatch-transport");
const CloudWatchlogs = require('aws-sdk/clients/cloudwatchlogs');


class CloudWatchTransport {

    constructor({ credentials, logGroupName, logStreamName }) {
        this._cloudWatch = new CloudWatchlogs(credentials);
        this._logGroupName = logGroupName;
        this._logStreamName = logStreamName;
    }

    log(level, message, meta, callback) {
        const item = { level, message, meta };
        debug("Logging a new line %s", message);
        this._cloudWatch.putLogEvents({
            logEvents: [
                {
                  message: this.formatMessage(item),
                  timestamp: new Date().getTime() 
                },
              ],
              logGroupName: this.logGroupName(item), 
              logStreamName: this.logStreamName(item),             
        }, callback);
    }

    logGroupName() {
        return this._logGroupName;
    }

    logStreamName() {
        return this._logStreamName;
    }

    formatMessage({ level, message, meta }){ return message; }
}

module.exports = CloudWatchTransport;