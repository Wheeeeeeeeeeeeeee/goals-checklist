/* Goals service worker - web push handling */
const FUNCTION_URL = 'https://ifvzdzyyrrlchsecqdop.supabase.co/functions/v1/send-due-reminders';
const ANON_KEY = 'sb_publishable_i4X_ezNlqGg1IkXESbw5JQ_vDyP4A7f';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { /* keep defaults */ }
  const title = data.title || 'Goals';
  const body = data.body || 'You have a quest due!';
  const jobs = [
    self.registration.showNotification(title, {
      body: body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: 'quest-reminder-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      data: { url: data.url || './' }
    })
  ];
  if (data.receipt) {
    jobs.push(
      fetch(data.receipt, { method: 'POST', headers: { 'Authorization': 'Bearer ' + ANON_KEY } }).catch(() => {})
    );
  }
  event.waitUntil(Promise.all(jobs));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const rel = (event.notification.data && event.notification.data.url) || './';
  const target = new URL(rel, self.registration.scope).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.indexOf(self.registration.scope) === 0 && 'focus' in c) return c.focus();
      }
      return clients.openWindow(target);
    })
  );
});
