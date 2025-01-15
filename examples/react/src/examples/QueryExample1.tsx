import { asArray } from '@orbitalhq/orbital-client';
import { taxonomy } from '../../taxonomy.ts';
import {QueryContainer} from '../QueryContainer.tsx';
import {ResultsContainer} from '../ResultsContainer.tsx';
import {QueryError, QueryInfo} from '../types.ts';
import {useQueryState} from '../useQueryState.ts';
import markdown from '../markdown/QueryExample1.md?raw'

const queryExample1: QueryInfo = {
  query: `find { film.Film[] }`,
  sdkCode: `client
  .find(asArray(taxonomy.film.Film))`,
  readme: markdown
}

export const QueryExample1 = () => {
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
      .execute()
      .subscribe((result) => {
        setLoading(false)
        if ('error' in result) {
          setError((result.error as QueryError).message)
        } else {
          setItems(result)
        }
      })
  }

  const executeQueryAsPromise = async () => {
    resetState()
    const results = await client
      .find(asArray(taxonomy.film.Film))
      .executeAsPromise()
    setLoading(false)
    if ('error' in results) {
      setError((results.error as QueryError).message)
    } else {
      setItems(results)
    }
  }

  const streamQuery = () => {
    resetState()
    setStreamSubscription(client
      .find(asArray(taxonomy.film.Film))
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
        .find(taxonomy.film.Film)
        .executeAsPromiseBasedEventStream()
      setStream({ close: stream.close })
      for await (const result of stream) {
        setItems((prevItems) => [result, ...prevItems]);
      }
      setLoading(false)
    } catch (error) {
      setError((error as QueryError).message);
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
