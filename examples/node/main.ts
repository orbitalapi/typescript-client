import { asArray, buildClient, consoleLogger, HttpQueryClient } from 'orbital-client';
import { taxonomy } from './taxonomy';

const client = buildClient<{}, typeof taxonomy>(
  taxonomy,
  new HttpQueryClient('http://localhost:9022'),
  {
    logger: consoleLogger,
  },
);


/**
 * namespace animals {
 *   type Name inherits String
 * }
 * namespace people {
 *  type FirstName inherits String
 *  type LastName inherits String
 * }
 */

console.log('\n\nJust find');
client
  .find(taxonomy.people.Person)
  .execute()
  .subscribe((result) => console.log(result.firstName));

console.log('\n\nJust find with an array');
client
  .find(asArray(taxonomy.people.Person))
  .execute()
  .subscribe((result) => console.log(result[0].firstName));

console.log('\n\nGiven and find');
client
  .given(taxonomy.people.FirstName, 'John')
  .find(taxonomy.people.Person)
  .execute()
  .subscribe((result) => console.log(result.firstName));

console.log('\n\nGiven, find and as');
client
  .given(taxonomy.people.FirstName, 'John')
  .find(taxonomy.people.Person)
  .as({
    firstName: taxonomy.people.FirstName,
    personAge: taxonomy.people.LastName,
  }).execute()
  .subscribe((result) => console.log(result.firstName));

console.log('\n\nJust stream');
client
  .stream(taxonomy.people.Person)
  .execute()
  .subscribe((result) => console.log(result.firstName));

console.log('\n\nGiven and stream');
client
  .given(taxonomy.people.FirstName, 'John')
  .stream(taxonomy.people.Person)
  .execute()
  .subscribe((result) => console.log(result.firstName));

console.log('\n\nGiven, stream and as');
client
  .given(taxonomy.people.FirstName, 'John')
  .stream(asArray(taxonomy.people.Person))
  .as({
    firstName: taxonomy.people.FirstName,
    personAge: taxonomy.people.Age,
    address: taxonomy.people.Age,
  }).execute()
  .subscribe((result) => console.log(result.address));

console.log('\n\nCriteria builder');
client
  .given(taxonomy.people.FirstName, 'John')
  .and(taxonomy.people.LastName, (cb) => cb.eq('Doe'))
  .find(asArray(taxonomy.people.Person))
  .execute()
  .subscribe((result) => console.log(result[0].firstName));


console.log('\n\nTaxiQL generation');
console.log(
  client
    .given(taxonomy.people.FirstName, 'John')
    .find(asArray(taxonomy.people.Person))
    .toTaxiQl(),
);

