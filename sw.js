
/* =========================================
   QUIZ-WELT PWA-CACHE
   Russisch hinzugefügt
   ========================================= */

const CACHE_NAME = "quiz-welt-v4";


const DATEIEN = [
    "./",
    "./index.html",

    // NEUE RUSSISCH-SEITE
    "./russisch.html",

    // CSS UND APP-DATEIEN
    "./style.css",
    "./mobile.css",
    "./manifest.webmanifest",

    "./icons/icon-192.png",
    "./icons/icon-512.png",

    // POKÉMON UND ONE PIECE
    "./js/daten.js",
    "./js/onepiece-daten.js",
    "./js/onepiece-episoden.js",
    "./js/attacken-daten.js",

    "./js/hilfe.js",
    "./js/timer.js",
    "./js/vorschlaege.js",

    "./js/modi-namen.js",
    "./js/modi-typen.js",
    "./js/modi-attacken.js",
    "./js/modi-vergleich.js",
    "./js/onepiece-spiele.js",
    "./js/app.js",

    // NEU: RUSSISCH-DATEN UND SPIELLOGIK
    "./js/russisch-daten.js",
    "./js/russisch-spiele.js"
];


// =========================================
// 1. APP-DATEIEN SPEICHERN
// =========================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache =>
                cache.addAll(DATEIEN)
            )

            .then(() =>
                self.skipWaiting()
            )
    );
});


// =========================================
// 2. ALTE CACHE-VERSIONEN ENTFERNEN
// =========================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

            .then(namen => Promise.all(

                namen

                    .filter(name =>

                        name.startsWith("quiz-welt-") &&

                        name !== CACHE_NAME
                    )

                    .map(name =>
                        caches.delete(name)
                    )
            ))

            .then(() =>
                self.clients.claim()
            )
    );
});


// =========================================
// 3. DATEIEN LADEN
// =========================================

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    // Externe Bilder oder APIs nicht abfangen.
    if (
        new URL(event.request.url).origin !==
        self.location.origin
    ) {
        return;
    }

    event.respondWith((async () => {

        try {

            const antwort =
                await fetch(event.request);

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

            const gespeichert =
                await caches.match(event.request);

            if (gespeichert) {
                return gespeichert;
            }

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
