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
        <fieldset className={classes.taxiCode}>
          <legend>SDK Code</legend>
          <div className={classes.taxiCodeContent}>{props.queryInfo.sdkCode}</div>
        </fieldset>
        <fieldset className={classes.taxiCode}>
          <legend>Generates the following TaxiQL</legend>
          <div className={classes.taxiCodeContent}>{props.queryInfo.query}</div>
        </fieldset>
        <div className={classes.buttonContainer}>
          {props.executeQuery && <ExecuteQuery label="Execute query" onClick={() => props.executeQuery?.()}/>}
          {props.executeQueryAsPromise &&
            <ExecuteQuery label="Execute query as Promise" onClick={() => props.executeQueryAsPromise?.()}/>}
          {props.streamQuery &&
            <ExecuteQuery label="Execute query as Event Stream" onClick={() => props.streamQuery?.()}/>}
          {props.streamQueryAsPromise && <ExecuteQuery label="Execute query as Promise based Event Stream"
                                                                    onClick={() => props.streamQueryAsPromise?.()}/>}
        </div>
        <Markdown className={classes.readme}>{props.queryInfo.readme}</Markdown>
      </div>
    </div>
  )
}
