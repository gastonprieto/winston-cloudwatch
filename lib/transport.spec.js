jest.mock("aws-sdk/clients/cloudwatchlogs")

const Transport = require("./transport");
const CloudWatchLogs = require("aws-sdk/clients/cloudwatchlogs");
const async = require("async");

let transport = null;
let putLogEventsSpy = jest.fn((params, callback) => { callback(); });

beforeEach(() => {
    CloudWatchLogs.mockClear();
    putLogEventsSpy.mockClear();
    CloudWatchLogs.mockImplementation(() => ({
        putLogEvents: putLogEventsSpy
    }));
    transport = new Transport({});
});

test("logging a simple line", (done) => {
    transport.log("info", "A new message", {}, () => {
        expect(putLogEventsSpy.mock.calls.length).toBe(1);
        done();
    });
});

test("logging multiple lines", (done) => {
    const _log = (i) => (callback) => 
        transport.log("info", `A new message ${i}`, {}, callback);

    async.parallel([ _log(1), _log(2), _log(3)], () => {
        expect(putLogEventsSpy.mock.calls.length).toBe(3);
        done();
    });
});