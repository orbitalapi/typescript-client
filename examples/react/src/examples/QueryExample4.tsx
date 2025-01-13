import { taxonomy } from '../../taxonomy.ts';
import {QueryContainer} from '../QueryContainer.tsx';
import {ResultsContainer} from '../ResultsContainer.tsx';
import {QueryError, QueryInfo} from '../types.ts';
import {useQueryState} from '../useQueryState.ts';
import markdown from '../markdown/QueryExample4.md?raw'

const queryExample1: QueryInfo = {
  query: `stream { demo.netflix.NewFilmReleaseAnnouncement }`,
  useQuery: false,
  usePromise: false,
  useEventStream: true,
  useEventStreamAsPromise: true,
  readme: markdown
}

export const QueryExample4 = () => {
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


  const streamQuery = () => {
    resetState()
    setStreamSubscription(client
      .stream(taxonomy.demo.netflix.NewFilmReleaseAnnouncement)
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
        .stream(taxonomy.demo.netflix.NewFilmReleaseAnnouncement)
        .executeAsPromiseBasedEventStream()
      setStream({ close: stream.close })
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
