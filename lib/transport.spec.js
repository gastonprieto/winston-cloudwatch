jest.mock("aws-sdk/clients/cloudwatchlogs")

const async = require("async");
const util = require("util");
const CloudWatchLogs = require("aws-sdk/clients/cloudwatchlogs");
const Transport = require("./transport");
const errorToJSON = require("error-to-json").default;
const theoretically = require("jest-theories").default;

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

describe("Log line", () => {

    test("a simple line", done => {
        transport.log("info", "A new message", {}, () => {
            expect(putLogEventsSpy.mock.calls.length).toBe(1);
            done();
        });
    });
    
    test("multiple lines", done => {
        const _log = i => callback => transport.log("info", `A new message ${i}`, {}, callback);
    
        async.parallel([ _log(1), _log(2), _log(3)], () => {
            expect(putLogEventsSpy.mock.calls.length).toBe(3);
            done();
        });
    });

});

describe("Formatting lines:", () => {
    const error = new Error("Boom :(");
    const stringifiedError = util.inspect(errorToJSON(error));

    const theories = [
        { input: { description: "message log", level: "info", message: "example message" }, expected: '[info] - example message' },
        { input: { description: "message log with empty meta", level: "info", message: "example message", meta: {} }, expected: '[info] - example message' },
        { input: { description: "message log with meta", level: "info", message: "example message", meta: { foo: "bar" } }, expected: '[info] - example message - { foo: \'bar\' }' },
        { input: { description: "message log with error", level: "info", message: "example message", meta: error }, expected: `[info] - example message - ${ stringifiedError }` }
    ];

    theoretically('{input.description} is correctly formatted', theories, theory => {
        expect(transport.formatMessage(theory.input)).toBe(theory.expected);
    });
})