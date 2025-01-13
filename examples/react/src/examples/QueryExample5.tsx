import { taxonomy } from '../../taxonomy.ts';
import {QueryContainer} from '../QueryContainer.tsx';
import {ResultsContainer} from '../ResultsContainer.tsx';
import {QueryError, QueryInfo} from '../types.ts';
import {useQueryState} from '../useQueryState.ts';
import markdown from '../markdown/QueryExample5.md?raw'

const queryExample1: QueryInfo = {
  query: `stream { NewFilmReleaseAnnouncement } as {
  announcement: NewFilmReleaseAnnouncement
  name: Title
  id : FilmId
  description: Description
  platformName: StreamingProviderName
  price: PricerPerMonth
  rating: FilmReviewScore
  review: ReviewText
}[]`,
  useQuery: false,
  usePromise: false,
  useEventStream: true,
  useEventStreamAsPromise: true,
  readme: markdown
}

export const QueryExample5 = () => {
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
      .as({
        announcement: taxonomy.demo.netflix.NewFilmReleaseAnnouncement,
        name: taxonomy.film.types.Title,
        id : taxonomy.films.FilmId,
        description: taxonomy.film.types.Description,
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
        .stream(taxonomy.demo.netflix.NewFilmReleaseAnnouncement)
        .as({
          announcement: taxonomy.demo.netflix.NewFilmReleaseAnnouncement,
          name: taxonomy.film.types.Title,
          id : taxonomy.films.FilmId,
          description: taxonomy.film.types.Description,
          platformName: taxonomy.io.vyne.films.providers.StreamingProviderName,
          price: taxonomy.io.vyne.films.providers.PricerPerMonth,
          rating: taxonomy.films.reviews.FilmReviewScore,
          review: taxonomy.films.reviews.ReviewText,
        })
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
