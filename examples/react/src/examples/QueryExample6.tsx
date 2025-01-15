import {QueryContainer} from '../QueryContainer.tsx';
import {ResultsContainer} from '../ResultsContainer.tsx';
import {QueryError, QueryInfo} from '../types.ts';
import {useQueryState} from '../useQueryState.ts';
import markdown from '../markdown/QueryExample6.md?raw'

const queryExample1: QueryInfo = {
  query: `find { Film[] } as {
   filmId: films.FilmId
   fieldNameThatIsReallyLooooooong: ReviewText
   duration: RentalDuration
 }[]`,
  sdkCode: `client
  .taxiQl("find { Film[] } as {
    filmId: films.FilmId
    fieldNameThatIsReallyLooooooong: ReviewText
    duration: RentalDuration
  }[]")`,
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
    setStreamSubscription,
    stream,
    setStream,
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

  const executeQueryAsPromise = async () => {
    resetState()
    const result = await client
      .taxiQl("find { Film[] } as {\n" +
        "     filmId: films.FilmId\n" +
        "     fieldNameThatIsReallyLooooooong: ReviewText\n" +
        "     duration: RentalDuration\n" +
        "   }[]")
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
      .taxiQl("find { Film[] } as {\n" +
        "     filmId: films.FilmId\n" +
        "     fieldNameThatIsReallyLooooooong: ReviewText\n" +
        "     duration: RentalDuration\n" +
        "   }[]")
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
        .taxiQl("find { Film[] } as {\n" +
          "     filmId: films.FilmId\n" +
          "     fieldNameThatIsReallyLooooooong: ReviewText\n" +
          "     duration: RentalDuration\n" +
          "   }[]")
        .executeAsPromiseBasedEventStream()
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
