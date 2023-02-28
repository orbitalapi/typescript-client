import axios from 'axios';
import { catchError, from, map, Observable, of, zip } from 'rxjs';
import { nanoid } from 'nanoid';

export interface QueryClient {
  query<T>(query: string, clientQueryId: string): Observable<T>;

  stream<T>(query: string, clientQueryId: string): Observable<T>;
}

export class HttpQueryClient implements QueryClient {
  constructor(private readonly host: string) {
  }

  queryEventStream<T>(query: string, clientQueryId?: string): Observable<T> {
    const clientId = clientQueryId || nanoid();
    const url = `${this.host}/api/taxiql?clientQueryId=${clientId}&query=${encodeURIComponent(query)}`;
    return this.getEventStream(url);
  }

  query<T>(query: string, clientQueryId?: string): Observable<T> {
    const clientId = clientQueryId || nanoid();

    return from(axios.post(`${this.host}/api/taxiql?clientQueryId=${clientId}`, query, {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      }
    })).pipe(
      map(response => response.data),
      catchError(error => {
        return error.response ? of({
          error: error.response.data,
          query
        }) : of({ error: 'UNKNOWN_ERROR' });
      })) as Observable<T>;
  }

  // TODO Implement properly
  stream<T>(query: string, clientQueryId?: string): Observable<T> {
    const clientId = clientQueryId || nanoid();
    const obs1 = from(axios.post(`${this.host}/api/taxiql?clientQueryId=${clientId}`, query, {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      }
    })).pipe(
      map(response => response.data),
      catchError(error => {
        return error.response ? of({
          error: error.response.data,
          query
        }) : of({ error: 'UNKNOWN_ERROR' });
      }));
    const obs2 = from(axios.post(`${this.host}/api/taxiql?clientQueryId=${clientQueryId}`, query, {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      }
    })).pipe(
      map(response => response.data),
      catchError(error => {
        return error.response ? of({
          error: error.response.data,
          query
        }) : of({ error: 'UNKNOWN_ERROR' });
      }));
    return zip(obs1, obs2) as Observable<any>;
  }


  private getEventStream<T>(url: string): Observable<T> {
    return new Observable<T>(observer => {
      console.log(`Initiating event stream at ${url}`);
      const eventSource = new EventSource(url);
      eventSource.onmessage = (event: MessageEvent) => {
        // Check for errors:
        const payload = JSON.parse(event.data) as T;
        observer.next(payload);

      };
      eventSource.onerror = () => {
        // Note: We're now sending errors down as an error message, so
        // assume that all onerror signals are just completion.
        // if (messageReceived && errorAfterMessageIndicatesClosed) {
        console.log('Received error event  - treating this as a close signal');
        observer.complete();
        // } else {
        //   console.log('Received error event' + JSON.stringify(error));
        // observer.error(error);
        // }
      };
      observer.add(() => {
        console.log(`Closing event stream at ${url}`);
        eventSource.close();
      });
    });
  }
}
