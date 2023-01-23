import axios from 'axios';
import { catchError, from, map, Observable, of, zip } from 'rxjs';

export interface QueryClient {
  query<T>(query: string, clientQueryId: string): Observable<T>;

  stream<T>(query: string, clientQueryId: string): Observable<T>;
}

export class HttpQueryClient implements QueryClient {
  constructor(private readonly host: string) {
  }

  query<T>(query: string, clientQueryId: string): Observable<T> {
    return from(axios.post(`${this.host}/api/taxiql?resultMode=RAW&clientQueryId=${clientQueryId}`, query, {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json',
      },
    })).pipe(
      map(response => response.data),
      catchError(error => {
        return error.response ? of({
          error: error.response.data,
          query,
        }) : of({ error: 'UNKNOWN_ERROR' });
      })) as Observable<T>;
  }

  // TODO Implement properly
  stream<T>(query: string, clientQueryId: string): Observable<T> {
    const obs1 = from(axios.post(`${this.host}/api/taxiql?resultMode=RAW&clientQueryId=${clientQueryId}`, query, {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json',
      },
    })).pipe(
      map(response => response.data),
      catchError(error => {
        return error.response ? of({
          error: error.response.data,
          query,
        }) : of({ error: 'UNKNOWN_ERROR' });
      }));
    const obs2 = from(axios.post(`${this.host}/api/taxiql?resultMode=RAW&clientQueryId=${clientQueryId}`, query, {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json',
      },
    })).pipe(
      map(response => response.data),
      catchError(error => {
        return error.response ? of({
          error: error.response.data,
          query,
        }) : of({ error: 'UNKNOWN_ERROR' });
      }));
    return zip(obs1, obs2) as Observable<any>;
  }
}
