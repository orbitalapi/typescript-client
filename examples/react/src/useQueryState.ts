import { useState } from 'react';
import {buildClient, consoleLogger, HttpQueryClient, type Subscription} from '@orbitalhq/orbital-client';
import {taxonomy} from '../taxonomy.ts';

export const useQueryState = () => {
  const [items, setItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamSubscription, setStreamSubscription] = useState<Subscription | null>(null);
  const [stream, setStream] = useState<{ close: () => void } | null>(null);

  const resetState = () => {
    setLoading(true);
    setError(null);
    setItems([]);
    if (streamSubscription) streamSubscription.unsubscribe();
    setStreamSubscription(null);
    stream?.close();
    setStream(null);
  };

  const closeStream = () => {
    streamSubscription?.unsubscribe();
    stream?.close();
    setLoading(false);
    setStreamSubscription(null);
    setStream(null);
  };

  const client = buildClient<{}, typeof taxonomy>(
    taxonomy,
    new HttpQueryClient('http://localhost:5173/api'), // This is the Vite proxy
    {
      logger: consoleLogger,
    },
  );

  return {
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
  };
};
