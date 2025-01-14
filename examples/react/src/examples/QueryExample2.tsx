import { asArray } from '@orbitalhq/orbital-client';
import { taxonomy } from '../../taxonomy.ts';
import {QueryContainer} from '../QueryContainer.tsx';
import {ResultsContainer} from '../ResultsContainer.tsx';
import {QueryError, QueryInfo} from '../types.ts';
import {useQueryState} from '../useQueryState.ts';
import markdown from '../markdown/QueryExample2.md?raw'

const queryExample1: QueryInfo = {
  query: `given {
  films.FilmId = 5
}
find { film.Film[] }
as {
  reviewScore : films.reviews.FilmReviewScore
  streamingProvider : io.vyne.films.providers.StreamingProviderName
}`,
  sdkCode: `client
  .given(taxonomy.films.FilmId, 5)
  .find(asArray(taxonomy.film.Film))
  .as({
    reviewScore: taxonomy.films.reviews.FilmReviewScore,
    streamingProvider: taxonomy.io.vyne.films.StreamingProvider,
  })`,
  useQuery: true,
  usePromise: true,
  useEventStream: true,
  useEventStreamAsPromise: true,
  readme: markdown
}

export const QueryExample2 = () => {
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
      .given(taxonomy.films.FilmId, 5)
      .find(asArray(taxonomy.film.Film))
      .as({
        reviewScore: taxonomy.films.reviews.FilmReviewScore,
        streamingProvider: taxonomy.io.vyne.films.StreamingProvider,
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
      .given(taxonomy.films.FilmId, 5)
      .find(asArray(taxonomy.film.Film))
      .as({
        reviewScore: taxonomy.films.reviews.FilmReviewScore,
        streamingProvider: taxonomy.io.vyne.films.StreamingProvider,
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
      .given(taxonomy.films.FilmId, 5)
      .find(asArray(taxonomy.film.Film))
      .as({
        reviewScore: taxonomy.films.reviews.FilmReviewScore,
        streamingProvider: taxonomy.io.vyne.films.StreamingProvider,
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
        .given(taxonomy.films.FilmId, 5)
        .find(asArray(taxonomy.film.Film))
        .as({
          reviewScore: taxonomy.films.reviews.FilmReviewScore,
          streamingProvider: taxonomy.io.vyne.films.StreamingProvider,
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
