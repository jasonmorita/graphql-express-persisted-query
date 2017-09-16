'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.loadQuery = loadQuery;
exports.createMapFromDir = createMapFromDir;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _recursiveReaddirSync = require('recursive-readdir-sync');

var _recursiveReaddirSync2 = _interopRequireDefault(_recursiveReaddirSync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function HandlePersistedQuery(_ref) {
    var queryMap = _ref.queryMap,
        errorHandler = _ref.errorHandler,
        req = _ref.req,
        res = _ref.res,
        next = _ref.next;

    return function handlePersistedQuery() {
        // if a query is present, this is not a persisted query
        if (req.body.query) {
            return next();
        }

        // look up query in map object
        var query = queryMap[req.body.id];

        if (!query) {
            if (errorHandler) {
                return errorHandler(req, res);
            }

            return res.status(400).send('Query not found in map.');
        }

        // assign the query to the req object to pass on to express-graphql
        req.body.query = query; // eslint-disable-line

        return next();
    };
}

// queryMap: Object with keys of IDs and values of queries
// errorHandler: Optional function that gets called with (req, res) if a query is not found in map
function loadQuery(queryMap, errorHandler) {
    return function addBody(req, res, next) {
        // since the req is passed as a reference, it's ok to pass it
        // here before bodyParser mutates it
        var handlePersistedQuery = HandlePersistedQuery({
            queryMap: queryMap,
            errorHandler: errorHandler,
            req: req,
            res: res,
            next: next
        });
        return req.body ? handlePersistedQuery() : _bodyParser2.default.json()(req, res, handlePersistedQuery);
    };
}

// takes a absolute path to a directory containing queries
// example: `createMapFromDir(path.resolve(__dirname, './queries'));`
function createMapFromDir(dir) {
    var filePaths = (0, _recursiveReaddirSync2.default)(dir);

    return filePaths.reduce(function (acc, filePath) {
        var contents = _fs2.default.readFileSync(filePath, 'utf8');
        var name = _path2.default.parse(filePath).name;

        return _extends({}, acc, _defineProperty({}, '' + name, contents));
    }, {});
}

exports.default = loadQuery;