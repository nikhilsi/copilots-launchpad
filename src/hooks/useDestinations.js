import { useState, useEffect, useCallback } from 'react';

export default function useDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await window.api.getDestinations();
    setDestinations(data);
    setLoading(false);
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
    try {
      const result = await window.api.deleteDestination(id);
      await refresh();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return { destinations, loading, refresh, addDestination, updateDestination, deleteDestination };
}
