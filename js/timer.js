
/* =====================================================
   TIMER – Läuft nur, wenn der Spielmodus geöffnet ist
   ===================================================== */


/**
 * Erstellt eine unabhängige Stoppuhr.
 *
 * @param {HTMLElement} anzeige - Element für die Zeit
 *
 * @returns {Object} Funktionen für
 *                   start, pause, resume, stop und dispose
 */
function erstelleStoppuhr(anzeige) {

    let vergangen = 0;
    let startzeit = 0;
    let intervall = null;
    let beendet = false;


    // ---------------------------------
    // Zeit im HTML anzeigen
    // ---------------------------------

    function anzeigen() {

        const ms =
            vergangen +
            (
                intervall !== null
                    ? performance.now() - startzeit
                    : 0
            );

        const sek = Math.floor(ms / 1000);

        const hh = Math.floor(sek / 3600);
        const mm = Math.floor((sek % 3600) / 60);
        const ss = sek % 60;

        // MM:SS oder HH:MM:SS
        anzeige.textContent = [hh, mm, ss]

            .filter(
                (wert, i) => i > 0 || hh > 0
            )

            .map(
                wert => String(wert).padStart(2, "0")
            )

            .join(":");
    }


    // ---------------------------------
    // Timer pausieren
    // ---------------------------------

    function pause() {

        if (intervall !== null) {

            vergangen += performance.now() - startzeit;

            clearInterval(intervall);
            intervall = null;

            anzeigen();
        }
    }


    // ---------------------------------
    // Timer fortsetzen
    // ---------------------------------

    function resume() {

        if (beendet || intervall !== null) {
            return;
        }

        startzeit = performance.now();

        intervall = setInterval(anzeigen, 250);

        anzeigen();
    }


    // ---------------------------------
    // Timer neu starten
    // ---------------------------------

    function start() {

        pause();

        vergangen = 0;
        beendet = false;

        anzeigen();
        resume();
    }


    // ---------------------------------
    // Timer nach Spielende stoppen
    // ---------------------------------

    function stop() {

        pause();
        beendet = true;
    }


    // ---------------------------------
    // Timer vollständig schließen
    // ---------------------------------

    function dispose() {

        pause();
        beendet = true;
    }


    // Anfangszeit anzeigen
    anzeigen();

    // Funktionen an den Spielmodus zurückgeben
    return {
        start,
        pause,
        resume,
        stop,
        dispose
    };
}
