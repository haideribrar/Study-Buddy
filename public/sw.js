self.addEventListener('push', function(event) {
  let data = { title: 'Study Buddy 📚', body: 'Time to focus!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Study Buddy 📚', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/apple-touch-icon.png',
    badge: '/favicon.png',
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
