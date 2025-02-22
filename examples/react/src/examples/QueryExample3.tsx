import { asArray } from '@orbitalhq/orbital-client';
import { taxonomy } from '../../taxonomy.ts';
import {QueryContainer} from '../QueryContainer.tsx';
import {ResultsContainer} from '../ResultsContainer.tsx';
import {QueryError, QueryInfo} from '../types.ts';
import {useQueryState} from '../useQueryState.ts';
import markdown from '../markdown/QueryExample3.md?raw'

const queryExample1: QueryInfo = {
  query: `find { Film[] } as {
  name: film.Title
  id : films.FilmId
  description: film.Description
  // Where can I watch this?
  platformName: io.vyne.films.providers.StreamingProviderName
  price: io.vyne.films.providers.PricerPerMonth
  // Grab some reviews
  rating: films.reviews.FilmReviewScore
  review: films.reviews.ReviewText    
}[]`,
  sdkCode: `client
  .find(asArray(taxonomy.film.Film))
  .as({
    name: taxonomy.film.Title,
    id: taxonomy.films.FilmId,
    description: taxonomy.film.Description,
    platformName: taxonomy.io.vyne.films.providers.StreamingProviderName,
    price: taxonomy.io.vyne.films.providers.PricerPerMonth,
    rating: taxonomy.films.reviews.FilmReviewScore,
    review: taxonomy.films.reviews.ReviewText,
  })`,
  readme: markdown
}

export const QueryExample3 = () => {
  const {
    client,
    items,
    setItems,
    loading,
    setLoading,
    error,
    setError,
    streamSubscription,
    setStreamSubscription,
    stream,
    setStream,
    resetState,
    closeStream,
  } = useQueryState();

  const executeQuery = () => {
    resetState()
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
      .subscribe((result) => {
        setLoading(false)
        if ('error' in result) {
          setError((result.error as QueryError).message)
        } else {
          setItems(result)
        }
      });
  }

  const executeQueryAsPromise = async () => {
    resetState()
    const result = await client
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
      .executeAsPromise()
    setLoading(false)
    if ('error' in result) {
      setError((result.error as QueryError).message)
    } else {
      setItems(result)
    }
  }

  const streamQuery = () => {
    resetState()
    setStreamSubscription(client
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
      .executeAsEventStream()
      .subscribe({
        next: (result) => {
          if ('error' in result) {
            setError((result.error as QueryError).message)
          } else {
            setItems((prevItems) => [result, ...prevItems]);
          }
        },
        error: (error) => {
          setError(error)
          setLoading(false)
        },
        complete: () => setLoading(false),
      }))
    }

  const streamQueryAsPromise = async () => {
    resetState()
    try {
      const stream = await client
        .find(asArray(taxonomy.film.Film))
        .as({
          name: taxonomy.film.Title,
          id: taxonomy.films.FilmId,
          description: taxonomy.film.Description,
          platformName: taxonomy.io.vyne.films.providers.StreamingProviderName,
          price: taxonomy.io.vyne.films.providers.PricerPerMonth,
          rating: taxonomy.films.reviews.FilmReviewScore,
          review: taxonomy.films.reviews.ReviewText,
        }).executeAsPromiseBasedEventStream()
      setStream({close: stream.close})
      for await (const result of stream) {
        setItems((prevItems) => [result, ...prevItems]);
      }
      setLoading(false)
    } catch (error) {
      setError((error as Error).message);
    } finally {
      console.log('stream closed')
    }
  }

  return (
    <>
      <QueryContainer
        queryInfo={queryExample1}
        executeQuery={executeQuery}
        executeQueryAsPromise={executeQueryAsPromise}
        streamQuery={streamQuery}
        streamQueryAsPromise={streamQueryAsPromise}
      />
      <ResultsContainer
        items={items}
        loading={loading}
        error={error}
        streamSubscription={streamSubscription}
        stream={stream}
        closeStream={closeStream}
      />
    </>
  )
};
