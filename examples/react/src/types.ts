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
  sdkCode: string
  readme: string // specifically, markdown to be rendered
}
