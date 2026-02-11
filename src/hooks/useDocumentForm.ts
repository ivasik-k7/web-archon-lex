// shared/useDocumentForm.ts
// Factory that creates a typed document-data hook.
// Usage:  export const useSaleAgreementData = createDocumentHook(DEFAULT_DATA)

import { useDocumentStore } from "../context/DocumentStoreContext";

export interface DocumentDataHook<T> {
  data: T;
  setData: (data: T) => void;
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
  reset: () => void;
}

export function createDocumentHook<T>(defaultData: T) {
  return function useDocumentData(docId?: string) {
    const id = docId || "active-document";

    const { data, setData, reset } = useDocumentStore(id, defaultData);

    return {
      data: data ?? defaultData,
      setData,
      reset,
    };
  };
}
