import React, { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react'

interface DocumentStore {
    getData: (docId: string) => any
    setData: (docId: string, data: any) => void
    reset: (docId: string) => void
    subscribe: (docId: string, callback: () => void) => () => void
}

const DocumentStoreContext = createContext<DocumentStore | null>(null)

export function DocumentStoreProvider({ children }: { children: React.ReactNode }) {
    // Store data per document ID
    const storesRef = useRef<Map<string, any>>(new Map())
    const subscribersRef = useRef<Map<string, Set<() => void>>>(new Map())

    const getData = useCallback((docId: string) => {
        return storesRef.current.get(docId)
    }, [])

    const setData = useCallback((docId: string, data: any) => {
        storesRef.current.set(docId, data)

        // Notify subscribers
        const subs = subscribersRef.current.get(docId)
        if (subs) {
            subs.forEach(callback => callback())
        }
    }, [])

    const reset = useCallback((docId: string, defaultData: any) => {
        storesRef.current.set(docId, defaultData)

        // Notify subscribers
        const subs = subscribersRef.current.get(docId)
        if (subs) {
            subs.forEach(callback => callback())
        }
    }, [])

    const subscribe = useCallback((docId: string, callback: () => void) => {
        if (!subscribersRef.current.has(docId)) {
            subscribersRef.current.set(docId, new Set())
        }
        subscribersRef.current.get(docId)!.add(callback)

        return () => {
            const subs = subscribersRef.current.get(docId)
            if (subs) {
                subs.delete(callback)
                if (subs.size === 0) {
                    subscribersRef.current.delete(docId)
                }
            }
        }
    }, [])

    return (
        <DocumentStoreContext.Provider value={{ getData, setData, reset, subscribe }}>
            {children}
        </DocumentStoreContext.Provider>
    )
}

export function useDocumentStore(docId: string, defaultData?: any) {
    const context = useContext(DocumentStoreContext)
    if (!context) {
        throw new Error('useDocumentStore must be used within DocumentStoreProvider')
    }

    const [data, setDataState] = useState(() => {
        const existing = context.getData(docId)
        if (existing) return existing
        if (defaultData) {
            context.setData(docId, defaultData)
            return defaultData
        }
        return null
    })

    // Subscribe to changes
    useEffect(() => {
        return context.subscribe(docId, () => {
            const newData = context.getData(docId)
            setDataState(newData)
        })
    }, [docId, context])

    const setData = useCallback((newData: any) => {
        context.setData(docId, newData)
    }, [docId, context])

    const reset = useCallback(() => {
        if (defaultData) {
            context.reset(docId, defaultData)
        }
    }, [docId, defaultData, context])

    return { data, setData, reset }
}