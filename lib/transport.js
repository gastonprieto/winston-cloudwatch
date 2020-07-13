const debug = require("debug")("winston-cloudwatch-transport");
const CloudWatchlogs = require('aws-sdk/clients/cloudwatchlogs');
const errorToJSON = require("error-to-json").default;
const isEmpty = require("lodash/isEmpty");
const compact = require("lodash/compact");
const util = require("util");
const { Subject } = require("rxjs");


class CloudWatchTransport {

    constructor({ credentials, logGroupName, logStreamName }) {
        this._cloudWatch = new CloudWatchlogs(credentials);
        this._logGroupName = logGroupName;
        this._logStreamName = logStreamName;
        this._observable = new Subject();
        this._observable.subscribe(it => this._log(it));
    }


    log(level, message, meta, callback) {
        const item = { level, message, meta, callback };
        this._observable.next(item);
    }

    _log(item) {
        debug("Logging a new line %s", item.message);
        this._cloudWatch.putLogEvents({
            logEvents: [ {
                  message: this.formatMessage(item),
                  timestamp: new Date().getTime() 
                }],
              logGroupName: this.logGroupName(item), 
              logStreamName: this.logStreamName(item),             
        }, item.callback);
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
        if (meta instanceof Error) {
            meta = errorToJSON(meta);
        }
        if (isEmpty(meta)) return; 
        return util.inspect(meta);
     }

    _timestamp() { return new Date().toISOString(); }
}

module.exports = CloudWatchTransport;