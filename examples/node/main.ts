import { asArray, buildClient, consoleLogger, HttpQueryClient } from '@orbitalhq/orbital-client';
import { taxonomy } from './taxonomy';
import {EventSource} from 'eventsource'; // Nodejs doesn't have native EventSource implementation
global.EventSource = EventSource;

const client = buildClient<{}, typeof taxonomy>(
  taxonomy,
  new HttpQueryClient('http://localhost:9022'),
  {
    logger: consoleLogger,
  },
);


console.log('Just find')
client
  .find(asArray(taxonomy.film.Film))
  .execute()
  .subscribe(results => console.log(results))


console.log('\n\nGiven, with find and projection:\n');
client
  .given(taxonomy.films.FilmId, 5)
  .find(asArray(taxonomy.film.Film))
  .as({
    reviewScore: taxonomy.films.reviews.FilmReviewScore,
    streamingProvider: taxonomy.io.vyne.films.StreamingProvider,
  })
  .execute()
  .subscribe(results => console.log(results));

/*console.log('\n\nCriteria builder:\n');
client
  .given(taxonomy.films.FilmId, 5)
  .and(taxonomy.film.Title, (cb) => cb.eq('ACADEMY DINOSAUR'))
  .find(asArray(taxonomy.film.Film))
  .execute()
  .subscribe(results => console.log(results));*/

console.log('\n\Find with projected results discovered by API calls:\n');
client
  .find(asArray(taxonomy.film.Film))
  .as({
    name: taxonomy.film.Title,
    id: taxonomy.films.FilmId,
    description: taxonomy.film.Description,
    platformName: taxonomy.io.vyne.films.providers.StreamingProviderName,
    price: taxonomy.io.vyne.films.providers.PricerPerMonth,
    rating: taxonomy.films.reviews.FilmReviewScore,
    review: taxonomy.films.reviews.ReviewText,
  })
  .execute()
  .subscribe(results => console.log(results));

console.log('\n\nJust stream');
client
  .stream(taxonomy.demo.netflix.NewFilmReleaseAnnouncement)
  .executeAsEventStream()
  .subscribe(results => console.log(results))

console.log('\n\nStream with projected results discovered by API calls:\n');
client
  .stream(taxonomy.demo.netflix.NewFilmReleaseAnnouncement)
  .as({
    announcement: taxonomy.demo.netflix.NewFilmReleaseAnnouncement,
    name: taxonomy.film.Title,
    id : taxonomy.films.FilmId,
    description: taxonomy.film.Description,
    platformName: taxonomy.io.vyne.films.providers.StreamingProviderName,
    price: taxonomy.io.vyne.films.providers.PricerPerMonth,
    rating: taxonomy.films.reviews.FilmReviewScore,
    review: taxonomy.films.reviews.ReviewText,
  })
  .executeAsEventStream()
  .subscribe(results => console.log(results))

console.log('\n\nTaxiQL generation:\n');
console.log(
  client
    .given(taxonomy.films.FilmId, 5)
    .find(asArray(taxonomy.film.Film))
    .as({
      reviewScore: taxonomy.films.reviews.FilmReviewScore,
      streamingProvider: taxonomy.io.vyne.films.StreamingProvider,
    })
    .toTaxiQl(),
);

