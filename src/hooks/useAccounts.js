import { useState, useEffect, useCallback } from 'react';

export default function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await window.api.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addAccount = async (account) => {
    const result = await window.api.addAccount(account);
    await refresh();
    return result;
  };

  const updateAccount = async (account) => {
    const result = await window.api.updateAccount(account);
    await refresh();
    return result;
  };

  const deleteAccount = async (id) => {
    const result = await window.api.deleteAccount(id);
    await refresh();
    return result;
  };

  return { accounts, loading, refresh, addAccount, updateAccount, deleteAccount };
}
