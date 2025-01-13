export type QueryError = {
  error: string,
  message: string,
  path: string,
  requestId: string,
  status: number,
  timestamp: number
}

export type QueryInfo = {
  query: string
  useQuery: boolean
  usePromise: boolean
  useEventStream: boolean
  useEventStreamAsPromise: boolean
  readme?: string // specifically, markdown to be rendered
}
