import useSWR, { type SWRConfiguration, type SWRResponse } from "swr"
import useSWRInfinite, { type SWRInfiniteConfiguration, type SWRInfiniteResponse } from "swr/infinite"
import axios from "@/lib/axios"

// Default fetcher using axios
const defaultFetcher = async (url: string) => {
  const response = await axios.get(url)
  return response.data
}

export function useData<Data = any, Error = any>(
  key: string | null,
  config?: SWRConfiguration<Data, Error> & { fetcher?: (url: string) => Promise<Data> },
): SWRResponse<Data, Error> {
  const { fetcher = defaultFetcher, ...restConfig } = config || {}

  return useSWR<Data, Error>(key, fetcher, {
    revalidateOnFocus: false,
    ...restConfig,
  })
}

export function useInfiniteData<Data = any, Error = any>(
  getKey: (pageIndex: number, previousPageData: Data | null) => string | null,
  config?: SWRInfiniteConfiguration<Data, Error> & { fetcher?: (url: string) => Promise<Data> },
): SWRInfiniteResponse<Data, Error> {
  const { fetcher = defaultFetcher, ...restConfig } = config || {}

  return useSWRInfinite<Data, Error>(getKey, fetcher, {
    revalidateOnFocus: false,
    ...restConfig,
  })
}

// Helper to prefetch data
export async function prefetchData(url: string): Promise<void> {
  try {
    const data = await defaultFetcher(url)
    // Add to SWR cache
    const cacheKey = url
    const cacheValue = data

    // @ts-ignore - accessing internal SWR cache
    if (window.__SWR_CACHE__) {
      // @ts-ignore
      window.__SWR_CACHE__.set(cacheKey, { data: cacheValue, error: undefined, isValidating: false })
    }
  } catch (error) {
    console.error("Failed to prefetch:", url, error)
  }
}

