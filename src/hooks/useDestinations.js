import { useState, useEffect, useCallback } from 'react';

export default function useDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await window.api.getDestinations();
      setDestinations(data);
    } catch (err) {
      console.error('Failed to load destinations:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDestination = async (dest) => {
    const result = await window.api.addDestination(dest);
    await refresh();
    return result;
  };

  const updateDestination = async (dest) => {
    const result = await window.api.updateDestination(dest);
    await refresh();
    return result;
  };

  const deleteDestination = async (id) => {
    const result = await window.api.deleteDestination(id);
    await refresh();
    return result;
  };

  return { destinations, loading, refresh, addDestination, updateDestination, deleteDestination };
}
