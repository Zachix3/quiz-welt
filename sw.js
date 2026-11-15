
/* =========================================
   SERVICE WORKER – QUIZ-WELT
   ========================================= */

// Bei Änderungen an den lokalen Dateien
// die Versionsnummer erhöhen.
const CACHE_NAME = "quiz-welt-v1";


// Dateien, die lokal gespeichert werden sollen
const DATEIEN = [
    "./",
    "./index.html",
    "./style.css",
    "./mobile.css",
    "./manifest.webmanifest",

    "./icons/icon-192.png",
    "./icons/icon-512.png",

    "./js/daten.js",
    "./js/onepiece-daten.js",
    "./js/onepiece-episoden.js",
    "./js/attacken-daten.js",
    "./js/hilfe.js",
    "./js/timer.js",

    "./js/modi-namen.js",
    "./js/modi-typen.js",
    "./js/modi-attacken.js",
    "./js/modi-vergleich.js",
    "./js/onepiece-spiele.js",
    "./js/app.js"
];


// =========================================
// 1. APP-DATEIEN SPEICHERN
// =========================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(DATEIEN);
        })

    );

    self.skipWaiting();
});


// =========================================
// 2. ALTE CACHE-VERSIONEN ENTFERNEN
// =========================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(namen => {

            return Promise.all(

                namen

                    .filter(name =>
                        name.startsWith("quiz-welt-") &&
                        name !== CACHE_NAME
                    )

                    .map(name =>
                        caches.delete(name)
                    )
            );
        })
    );

    self.clients.claim();
});


// =========================================
// 3. DATEIEN LADEN
// =========================================

self.addEventListener("fetch", event => {

    // Nur GET-Anfragen bearbeiten
    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    // Externe APIs und Bilder nicht abfangen.
    // Dafür gelten eigene Lade- und Cache-Regeln.
    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith((async () => {

        try {

            // Zuerst aktuelle Datei vom Server versuchen
            const antwort = await fetch(event.request);

            if (antwort.ok) {

                const cache = await caches.open(
                    CACHE_NAME
                );

                await cache.put(
                    event.request,
                    antwort.clone()
                );
            }

            return antwort;

        } catch {

            // Falls Internet fehlt:
            // Gespeicherte lokale Datei verwenden.
            const gespeichert = await caches.match(
                event.request
            );

            if (gespeichert) {
                return gespeichert;
            }

            // Bei Seitennavigation auf index.html fallen
            if (event.request.mode === "navigate") {

                const startseite = await caches.match(
                    "./index.html"
                );

                if (startseite) return startseite;
            }

            return Response.error();
        }

    })());
});
