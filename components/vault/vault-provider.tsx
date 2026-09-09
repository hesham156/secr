"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { decryptItem, encryptItem } from "@/lib/crypto/vault-item";
import {
  createVaultItem,
  deleteVaultItem,
  getVaultItems,
  setFavorite,
  updateVaultItem
} from "@/lib/vault/actions";
import type { VaultItemView } from "@/lib/vault/types";
import type { VaultItemInput } from "@/lib/validation/vault";

type VaultStatus = "locked" | "loading" | "ready";

type VaultContextValue = {
  status: VaultStatus;
  items: VaultItemView[];
  isUnlocked: boolean;
  unlock: (vaultKey: CryptoKey) => Promise<void>;
  lock: () => void;
  addItem: (input: VaultItemInput) => Promise<boolean>;
  editItem: (id: string, input: VaultItemInput) => Promise<boolean>;
  removeItem: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<void>;
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [items, setItems] = useState<VaultItemView[]>([]);
  const [status, setStatus] = useState<VaultStatus>("locked");

  const unlock = useCallback(async (key: CryptoKey) => {
    setStatus("loading");
    setVaultKey(key);
    const result = await getVaultItems();
    if (!result.ok) {
      setItems([]);
      setStatus("ready");
      return;
    }
    const decrypted = await Promise.all(result.data.map((stored) => decryptItem(key, stored)));
    setItems(decrypted);
    setStatus("ready");
  }, []);

  const lock = useCallback(() => {
    setVaultKey(null);
    setItems([]);
    setStatus("locked");
  }, []);

  const addItem = useCallback(
    async (input: VaultItemInput) => {
      if (!vaultKey) return false;
      const payload = await encryptItem(vaultKey, input);
      const result = await createVaultItem(payload);
      if (!result.ok) return false;
      const view = await decryptItem(vaultKey, {
        ...payload,
        id: result.data.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setItems((current) => [view, ...current]);
      return true;
    },
    [vaultKey]
  );

  const editItem = useCallback(
    async (id: string, input: VaultItemInput) => {
      if (!vaultKey) return false;
      const payload = await encryptItem(vaultKey, input);
      const result = await updateVaultItem(id, payload);
      if (!result.ok) return false;
      const view = await decryptItem(vaultKey, {
        ...payload,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setItems((current) => current.map((item) => (item.id === id ? { ...view, createdAt: item.createdAt } : item)));
      return true;
    },
    [vaultKey]
  );

  const removeItem = useCallback(async (id: string) => {
    const result = await deleteVaultItem(id);
    if (!result.ok) return false;
    setItems((current) => current.filter((item) => item.id !== id));
    return true;
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const target = items.find((item) => item.id === id);
      if (!target) return;
      const next = !target.favorite;
      setItems((current) => current.map((item) => (item.id === id ? { ...item, favorite: next } : item)));
      const result = await setFavorite(id, next);
      if (!result.ok) {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, favorite: !next } : item)));
      }
    },
    [items]
  );

  const value = useMemo<VaultContextValue>(
    () => ({
      status,
      items,
      isUnlocked: status === "ready",
      unlock,
      lock,
      addItem,
      editItem,
      removeItem,
      toggleFavorite
    }),
    [status, items, unlock, lock, addItem, editItem, removeItem, toggleFavorite]
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault must be used within a VaultProvider.");
  return context;
}
