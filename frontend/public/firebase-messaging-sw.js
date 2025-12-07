/*
 * Placeholder service worker to avoid 404s when Firebase messaging is not used.
 * Replace this file with a real implementation if you integrate Firebase Cloud Messaging.
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
