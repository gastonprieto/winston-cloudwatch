const debug = require("debug")("winston-cloudwatch-transport");
const CloudWatchlogs = require('aws-sdk/clients/cloudwatchlogs');
const errorToJSON = require("error-to-json");
const isEmpty = require("lodash/isEmpty");
const compact = require("lodash/compact");
const util = require("util");

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

    formatMessage({ level, message, meta }){ 
        return compact([`[${ level }]`, message, this._meta(meta)]).join(" - ");
    }

    _meta(meta) {
        if (isEmpty(meta)) return; 
        if (meta instanceof Error) {
            meta = errorToJSON(meta);
        }
        return util.inspect(meta);
     }

    _timestamp() { return new Date().toISOString(); }
}

module.exports = CloudWatchTransport;