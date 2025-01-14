import axios from 'axios';
import { nanoid } from 'nanoid';
import { catchError, from, map, Observable, of } from 'rxjs';

export interface QueryClient {
  query<T>(query: string, clientQueryId?: string): Observable<T>;
  queryAsPromise<T>(query: string, clientQueryId?: string): Promise<T>;
  //stream<T>(query: string, clientQueryId: string): Observable<T>;
  // TODO: rename queryAsEventStream
  queryEventStream<T>(query: string, clientQueryId: string): Observable<T>;
  // TODO: rename queryAsPromiseBasedEventStream
  queryEventStreamAsPromise<T>(
    query: string,
    clientQueryId: string,
  ): Promise<{
    [Symbol.asyncIterator](): AsyncGenerator<Awaited<T>, void, unknown>;
    close: () => void;
  }>;
}

export class HttpQueryClient implements QueryClient {
  constructor(private readonly host: string) {}

  query<T>(query: string, clientQueryId?: string): Observable<T> {
    const clientId = clientQueryId || nanoid();

    const request = axios.post(
      `${this.host}/api/taxiql?clientQueryId=${clientId}`,
      query,
      {
        headers: {
          'Content-Type': 'text/plain',
          Accept: 'application/json',
        },
      },
    );

    return from(request).pipe(
      map((response) => response.data),
      catchError((error) => {
        return error.response
          ? of({
              error: error.response.data ? error.response.data : error.response,
              query,
            })
          : of({ error: 'UNKNOWN_ERROR' });
      }),
    ) as Observable<T>;
  }

  queryAsPromise<T>(query: string, clientQueryId?: string): Promise<T> {
    const clientId = clientQueryId || nanoid();

    const request = axios.post(
      `${this.host}/api/taxiql?clientQueryId=${clientId}`,
      query,
      {
        headers: {
          'Content-Type': 'text/plain',
          Accept: 'application/json',
        },
      },
    );

    return request
      .then((response) => response.data as T)
      .catch((error) => {
        if (error.response) {
          return Promise.resolve({
            error: error.response.data ? error.response.data : error.response,
            query,
          });
        }
        return Promise.resolve({ error: 'UNKNOWN_ERROR' } as any);
      });
  }

  queryEventStream<T>(query: string, clientQueryId?: string): Observable<T> {
    const clientId = clientQueryId || nanoid();
    const url = `${
      this.host
    }/api/taxiql?clientQueryId=${clientId}&query=${encodeURIComponent(query)}`;
    return this.getEventStream(url);
  }

  private getEventStream<T>(url: string): Observable<T> {
    return new Observable<T>((observer) => {
      console.log(`Initiating event stream at ${url}`);
      const eventSource = new EventSource(url);
      let isOpen = false;
      eventSource.onopen = () => {
        isOpen = true;
      };
      eventSource.onmessage = (event: MessageEvent) => {
        // Check for errors:
        const payload = JSON.parse(event.data) as T;
        observer.next(payload);
      };
      eventSource.onerror = () => {
        // if (messageReceived && errorAfterMessageIndicatesClosed) {
        // TODO: how do we actually handle error handling here (other than a connection error, which is already a hack)??
        if (!isOpen) {
          observer.error('A connection error occurred');
        } else {
          // Note: We're now sending errors down as an error message, so
          // assume that all onerror signals are just completion.
          console.log(
            'Received error event  - treating this as a close signal',
          );
          observer.complete();
        }
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

  queryEventStreamAsPromise<T>(
    query: string,
    clientQueryId?: string,
  ): EventSourceResponse<T> {
    const clientId = clientQueryId || nanoid();
    const url = `${
      this.host
    }/api/taxiql?clientQueryId=${clientId}&query=${encodeURIComponent(query)}`;
    return this.getEventStreamAsPromise(url);
  }

  private getEventStreamAsPromise<T>(url: string): EventSourceResponse<T> {
    let isClosed: boolean | null = null;
    let isErrored = false;
    const eventQueue: T[] = [];
    let resolveEventAvailable: (value: T | null) => void;
    let rejectEventError: (reason?: any) => void;
    let eventAvailableSignal = new Promise<T | null>((res, rej) => {
      resolveEventAvailable = res;
      rejectEventError = rej;
    });
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      isClosed = false;
    };

    eventSource.onmessage = (event: MessageEvent) => {
      if (isClosed || isErrored) return;
      try {
        const parsedData = JSON.parse(event.data) as T;
        eventQueue.push(parsedData);
        resolveEventAvailable(parsedData);
        eventAvailableSignal = new Promise<T | null>((res, rej) => {
          resolveEventAvailable = res;
          rejectEventError = rej;
        });
      } catch (error) {
        console.error('Failed to parse message', error);
        rejectEventError(error);
      }
    };

    eventSource.onerror = (event: Event) => {
      isErrored = true;
      if (isClosed === null) {
        console.error('EventSource encountered an error:', event);
        rejectEventError(new Error('A connection error occurred'));
      } else {
        // Note: We're now sending errors down as an error message, so
        // assume that all onerror signals are just completion.
        console.log('Received error event - treating this as a close signal');
      }
      close(); // Clean up resources on error.
    };

    const close = () => {
      if (!isClosed || isErrored) {
        isClosed = true;
        eventSource.close();
        resolveEventAvailable(null); // Signal completion to pending consumers.
      }
    };

    const asyncIterator = async function* () {
      while (!isClosed && !isErrored) {
        while (eventQueue.length > 0) {
          yield eventQueue.shift()!;
        }
        try {
          const nextValue = await eventAvailableSignal;
          if (nextValue === null) break;
        } catch (error) {
          console.error('Error during event iteration:', error);
          throw error;
        }
      }
    };

    return Promise.resolve({
      [Symbol.asyncIterator]: asyncIterator,
      close,
    });
  }
}

export type EventSourceResponse<T> = Promise<{
  [Symbol.asyncIterator](): AsyncGenerator<Awaited<T>, void, unknown>;
  close: () => void;
}>;
