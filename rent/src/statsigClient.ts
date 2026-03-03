import { StatsigClient } from '@statsig/js-client'
import { StatsigSessionReplayPlugin } from '@statsig/session-replay'
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics'

let singleton: null | StatsigClient = null
let initPromise: null | Promise<StatsigClient> = null

export const statsigClient = async (): Promise<null | StatsigClient> => {
  if (singleton) {
    return singleton
  }
  if (initPromise) {
    return initPromise
  }

  const statsigKey: string =
    (window as typeof window & { import: any })?.import?.meta?.env
      ?.VITE_STATSIG_KEY || process.env.VITE_STATSIG_KEY

  if (!statsigKey) {
    return null
  }

  initPromise = (async () => {
    const client = new StatsigClient(
      statsigKey,
      {},
      {
        plugins: [
          new StatsigSessionReplayPlugin(),
          new StatsigAutoCapturePlugin()
        ]
      }
    )
    await client.initializeAsync()
    singleton = client
    return client
  })()

  return initPromise
}
