const CACHE_NAME = 'roda-drinks-v1';
const urlsToCache = [
    './',
    './index.html',
    './crono.html',
    './receita.html',
    './admin-secreto.html',
    './style.css',
    './responsivo.css',
    './app.js',
    './core.js',
    './efeitos.js',
    './firebase.js',
    './roleta.js',
    './temas.js',
    './logo.png',
    './resources/spin.mp3',
    './resources/win.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto - Arquivos salvos para offline');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retorna o cache se existir, senão faz a requisição na rede
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
