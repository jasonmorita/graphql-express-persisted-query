# graphql-express-persisted-query
Express middleware to handle persisted (stored) GraphQL queries by ID

# Purpose
As GraphQL needs mature and scale, saving queries to the server (or elsewhere) and referring to those by unique IDs can be useful. Stored queries decrease query size which could boost performance for clients on slow networks. Stored queries can be used to enforce security by allowing only whitelisted query execution in addition to providing a system of versioning.

# Prior art
* https://github.com/apollographql/persistgraphql

# Usage
This package exports an Express middleware (`loadQuery`) that accepts an object of keys of unique query IDs and values of stringified queries. When a query is made against your GraphQL server, this middleware:
* Inspects the query to see if there is a `query` in the request body and calls `next()` if a query is found.
* If a query is not found, we check for an `id` in the request body and attempt to look up the query by ID in the query map provided.
* If found, the `query` is added to `req.body.query` and `next()` is called.
* If a query is not found, the optional `errorHandler` is called or a `400` is returned.

This package also exports a function which can parse a directory for queries and generates a map that can be passed to `loadQuery`.

# Example
```javascript
//routes.js
import { loadQuery, createMapFromDir } from 'graphql-express-persisted-query';
import error400 from './app/errors/400';
import graphqlServer from './app/graphql';

const queryMap = createMapFromDir(path.resolve(__dirname, './queries'));
const queryErrorHandler = (req, res) => error400(req, res);

app.use(
    '/graphql',
    loadQuery(queryMap, queryErrorHandler),
    graphql
);
```
