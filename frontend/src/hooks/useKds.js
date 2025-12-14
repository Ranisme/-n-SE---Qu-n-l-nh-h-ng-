import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTickets, updateItemStatus } from '../api/kds.api';

export const useKdsTickets = (station) =>
  useQuery({
    queryKey: ['kds', station],
    queryFn: () => listTickets(station),
    refetchInterval: 5000,
  });

export const useKdsStream = (station) => {
  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    const source = new EventSource(`/api/kds/stream?station=${station || ''}`);
    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (!station || parsed.station === station) {
          setTickets(parsed.tickets || []);
        }
      } catch (e) {
        // ignore parse errors
      }
    };
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  }, [station]);
  return tickets;
};

export const useUpdateKdsStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, status }) => updateItemStatus(itemId, status),
    onSuccess: (_data, variables) => qc.invalidateQueries(['kds', variables.station]),
  });
};
