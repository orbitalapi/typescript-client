# Orbital TypeScript client

A library to execute TaxiQL queries against the Orbital query server.

## Getting started

Install the dependency with

```bash
npm install @orbitalhq/orbital-client
```

and create a file called `orbital.config.json` to the same folder that contains `package.json` with the following
content:

```json
{
  "schemaServerUrl": "<SCHEMA_SERVER_URL>"
}
```

where you replace `<SCHEMA_SERVER_URL>` with the URL of the schema server
like `http://schema-server.orbital.example.com`.

Finally, run

```bash
npm run orbital:taxonomy:generate
```

This will generate a taxonomy file called `taxonomy.ts` next to `package.json`. This file should be committed to version
control and be updated (by re-running `npm run orbital:taxonomy:generate`) whenever the schema changes.

Once the taxonomy file is generated, you can initialize the client:

```typescript
import { asArray, buildClient, consoleLogger, HttpQueryClient } from 'orbital-client';
import { taxonomy } from './taxonomy';

const client = buildClient<{}, typeof taxonomy>(
  taxonomy,
  new HttpQueryClient('http://localhost:9022'),
  {
    logger: consoleLogger,
  },
);
```

and start executing queries

```typescript
client
  .given(taxonomy.people.FirstName, 'John')
  .find(asArray(taxonomy.people.Person))
  .execute()
  .subscribe((result) => console.log(result[0].firstName));
```

which sends the following TaxiQL query to be executed on the Orbital server:

```
given {
        people.FirstName = "John"
}
find { people.Person[] }
```

You can also access this query by calling `.toTaxiQL()` on the query builder.

```typescript
const query = client
  .given(taxonomy.people.FirstName, 'John')
  .find(asArray(taxonomy.people.Person))
  .toTaxiQl();
console.log(query);
```
