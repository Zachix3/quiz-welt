
/* =========================================
   SERVICE WORKER – QUIZ-WELT
   ========================================= */

const CACHE_NAME = "quiz-welt-v3";


// Lokale Dateien speichern
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

    // NEU
    "./js/vorschlaege.js",

    "./js/modi-namen.js",
    "./js/modi-typen.js",
    "./js/modi-attacken.js",
    "./js/modi-vergleich.js",
    "./js/onepiece-spiele.js",
    "./js/app.js"
];


// =========================================
// DATEIEN VORAB SPEICHERN
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
// ALTE CACHE-VERSIONEN ENTFERNEN
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

                    .map(name => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});


// =========================================
// DATEIEN LADEN
// =========================================

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);


    // Externe APIs und Bilder nicht abfangen
    if (url.origin !== self.location.origin) {
        return;
    }


    event.respondWith((async () => {

        try {

            // Aktuelle Datei vom Server laden
            const antwort = await fetch(event.request);


            if (antwort.ok) {

                const cache =
                    await caches.open(CACHE_NAME);

                await cache.put(
                    event.request,
                    antwort.clone()
                );
            }

            return antwort;

        } catch {

            // Falls kein Internet vorhanden:
            // Datei aus dem Cache verwenden
            const gespeichert =
                await caches.match(event.request);

            if (gespeichert) {

                return gespeichert;
            }


            // Fallback für die Startseite
            if (event.request.mode === "navigate") {

                const startseite =
                    await caches.match("./index.html");

                if (startseite) {

                    return startseite;
                }
            }

            return Response.error();
        }

    })());
});
