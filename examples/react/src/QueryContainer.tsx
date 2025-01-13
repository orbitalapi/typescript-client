import {ComponentProps} from 'react';
import Markdown from 'react-markdown';
import {ExecuteQuery} from './ExecuteQuery.tsx';
import {QueryInfo} from './types.ts';
import classes from './QueryContainer.module.css';

type QueriesContainerProps = {
  queryInfo: QueryInfo
  executeQuery?: () => void
  executeQueryAsPromise?: () => void
  streamQuery?: () => void
  streamQueryAsPromise?: () => void
} & ComponentProps<"div">;
export const QueryContainer = ({...props}: QueriesContainerProps) => {
  return (
    <div className={classes.queriesContainer}>
      <div className={classes.query}>
        <div className={classes.taxiCode}>{props.queryInfo.query}</div>
        <div className={classes.buttonContainer}>
          {props.queryInfo.useQuery && <ExecuteQuery label="Execute query" onClick={() => props.executeQuery?.()}/>}
          {props.queryInfo.usePromise && <ExecuteQuery label="Execute query as Promise" onClick={() => props.executeQueryAsPromise?.()}/>}
          {props.queryInfo.useEventStream && <ExecuteQuery label="Execute query as Event Stream" onClick={() => props.streamQuery?.()}/>}
          {props.queryInfo.useEventStreamAsPromise && <ExecuteQuery label="Execute query as Promise based Event Stream" onClick={() => props.streamQueryAsPromise?.()}/>}
        </div>
        <Markdown className={classes.readme}>{props.queryInfo.readme}</Markdown>
      </div>
    </div>
  )
}
