import {QueryContainer} from '../QueryContainer.tsx';
import {ResultsContainer} from '../ResultsContainer.tsx';
import {QueryError, QueryInfo} from '../types.ts';
import {useQueryState} from '../useQueryState.ts';
import markdown from '../markdown/QueryExample6.md?raw'

const queryExample1: QueryInfo = {
  query: `// This is manually input taxiql (view QueryExample6.tsx)
find { Film[] } as {
   filmId: films.FilmId
   fieldNameThatIsReallyLooooooong: ReviewText
   duration: RentalDuration
 }[]`,
  useQuery: true,
  usePromise: false,
  useEventStream: false,
  useEventStreamAsPromise: false,
  readme: markdown
}

export const QueryExample6 = () => {
  const {
    client,
    items,
    setItems,
    loading,
    setLoading,
    error,
    setError,
    streamSubscription,
    stream,
    resetState,
    closeStream,
  } = useQueryState();

  const executeQuery = () => {
    resetState()
    client
      .taxiQl("find { Film[] } as {\n" +
        "     filmId: films.FilmId\n" +
        "     fieldNameThatIsReallyLooooooong: ReviewText\n" +
        "     duration: RentalDuration\n" +
        "   }[]")
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


  return (
    <>
      <QueryContainer
        queryInfo={queryExample1}
        executeQuery={executeQuery}
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
