export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("ServiceWorker registration successful with scope: ", registration.scope)
        })
        .catch((error) => {
          console.error("ServiceWorker registration failed: ", error)
        })
    })
  }
}

// Function to check if app can work offline
export function checkOfflineCapability(): boolean {
  return "serviceWorker" in navigator && "caches" in window
}

// Function to request background sync permission
export async function requestBackgroundSyncPermission(): Promise<boolean> {
  if (!("permissions" in navigator)) {
    return false
  }

  try {
    const status = await navigator.permissions.query({
      name: "background-sync" as PermissionName,
    })
    return status.state === "granted"
  } catch (error) {
    console.error("Background sync permission check failed:", error)
    return false
  }
}

// Function to register a background sync
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register(tag)
    return true
  } catch (error) {
    console.error("Background sync registration failed:", error)
    return false
  }
}

