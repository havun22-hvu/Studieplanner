// Push notification service worker for Studieplanner
// This handles incoming push messages from the server

self.addEventListener('push', function(event) {
  console.log('[Push SW] Push received:', event);

  let data = {
    title: '⏰ Tijd is om!',
    body: 'Je studiesessie is afgelopen',
    icon: '/pwa-192x192.svg',
    badge: '/pwa-192x192.svg',
    vibrate: [200, 100, 200, 100, 200],
    data: {}
  };

  // Try to parse push data
  if (event.data) {
    try {
      const pushData = event.data.json();
      data = {
        ...data,
        ...pushData,
      };
    } catch (e) {
      console.log('[Push SW] Could not parse push data:', e);
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.svg',
    badge: data.badge || '/pwa-192x192.svg',
    vibrate: data.vibrate || [200, 100, 200, 100, 200],
    data: data.data || {},
    requireInteraction: true, // Keep notification visible until user interacts
    tag: 'study-alarm', // Replace previous notifications with same tag
    actions: [
      { action: 'view', title: 'Bekijken' },
      { action: 'dismiss', title: 'Sluiten' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[Push SW] Notification click:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('[Push SW] Notification closed');
});

console.log('[Push SW] Push service worker loaded');
