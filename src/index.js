import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import recursiveReadSync from 'recursive-readdir-sync';

function HandlePersistedQuery({ queryMap, errorHandler, req, res, next }) {
    return function handlePersistedQuery() {
        // if a query is present, this is not a persisted query
        if (req.body.query) {
            return next();
        }

        // look up query in map object
        const query = queryMap[req.body.id];

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
export function loadQuery(queryMap, errorHandler) {
    return function addBody(req, res, next) {
        // since the req is passed as a reference, it's ok to pass it
        // here before bodyParser mutates it
        const handlePersistedQuery = HandlePersistedQuery({
            queryMap,
            errorHandler,
            req,
            res,
            next,
        });
        return req.body
            ? handlePersistedQuery()
            : bodyParser.json()(req, res, handlePersistedQuery);
    };
}

// takes a absolute path to a directory containing queries
// example: `createMapFromDir(path.resolve(__dirname, './queries'));`
export function createMapFromDir(dir) {
    const filePaths = recursiveReadSync(dir);

    return filePaths.reduce((acc, filePath) => {
        const contents = fs.readFileSync(filePath, 'utf8');
        const name = path.parse(filePath).name;

        return {
            ...acc,
            [`${name}`]: contents,
        };
    }, {});
}

export default loadQuery;
