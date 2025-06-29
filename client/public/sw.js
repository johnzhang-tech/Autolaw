// Service Worker for DocuAI PWA
const CACHE_NAME = 'docuai-cache-v1';
const STATIC_CACHE_NAME = 'docuai-static-v1';
const DYNAMIC_CACHE_NAME = 'docuai-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/offline.html' // We'll create this fallback page
];

// API routes to cache
const API_CACHE_ROUTES = [
  '/api/auth/user',
  '/api/analytics/dashboard',
  '/api/transactions',
  '/api/chat/sessions'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (request.url.includes('/api/')) {
    // API requests - Network First strategy
    event.respondWith(networkFirstStrategy(request));
  } else if (request.destination === 'document') {
    // HTML documents - Network First with offline fallback
    event.respondWith(htmlStrategy(request));
  } else {
    // Static assets - Cache First strategy
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Network First Strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature is not available offline' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      }
    );
  }
}

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Asset not available offline', error);
    
    // Return a fallback for images
    if (request.destination === 'image') {
      return new Response(
        `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#f3f4f6"/>
          <text x="100" y="100" text-anchor="middle" dy=".3em" fill="#6b7280">
            Image not available offline
          </text>
        </svg>`,
        {
          headers: { 'Content-Type': 'image/svg+xml' }
        }
      );
    }
    
    throw error;
  }
}

// HTML Strategy (for page navigation)
async function htmlStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Page not available, serving offline fallback', error);
    
    // Try to get the main app shell from cache
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Last resort - basic offline message
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DocuAI - Offline</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0; 
            background: #f9fafb;
          }
          .offline-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .offline-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 1rem;
            background: #3B82F6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📱</div>
          <h1>DocuAI</h1>
          <p>You're currently offline. Please check your internet connection and try again.</p>
          <button onclick="window.location.reload()" style="
            background: #3B82F6; 
            color: white; 
            border: none; 
            padding: 0.75rem 1.5rem; 
            border-radius: 6px; 
            cursor: pointer;
            font-size: 14px;
          ">
            Try Again
          </button>
        </div>
      </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Background Sync for document uploads
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'upload-documents') {
    event.waitUntil(syncUploadQueue());
  }
});

// Function to handle background document uploads
async function syncUploadQueue() {
  try {
    // Get pending uploads from IndexedDB or localStorage
    const pendingUploads = await getPendingUploads();
    
    for (const upload of pendingUploads) {
      try {
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: upload.formData
        });
        
        if (response.ok) {
          await removePendingUpload(upload.id);
          console.log('Service Worker: Upload synced successfully', upload.id);
        }
      } catch (error) {
        console.log('Service Worker: Upload sync failed', upload.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Sync queue failed', error);
  }
}

// Helper functions for upload queue (simplified)
async function getPendingUploads() {
  // In a real implementation, you'd use IndexedDB
  const uploads = localStorage.getItem('pendingUploads');
  return uploads ? JSON.parse(uploads) : [];
}

async function removePendingUpload(uploadId) {
  const uploads = await getPendingUploads();
  const filtered = uploads.filter(upload => upload.id !== uploadId);
  localStorage.setItem('pendingUploads', JSON.stringify(filtered));
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'DocuAI notification',
      icon: '/apple-touch-icon.png',
      badge: '/favicon-32x32.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/apple-touch-icon.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/favicon-32x32.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'DocuAI', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Script loaded');