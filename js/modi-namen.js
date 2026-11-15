
/* ================================================
   POKÉDEX-NAMEN UND ÜBERSETZUNGEN

   NEU:
   Ein Pokémon aufdecken im Reihenfolge-Modus.
   Nicht verfügbar in Hardcore.
   ================================================ */


/**
 * Erstellt den freien oder sortierten Pokédex.
 *
 * @param {Object} kontext - Pokémon und Timeranzeige
 * @param {boolean} reihenfolge - Nationaldex-Reihenfolge?
 * @returns {Object} Spielsitzung
 */
function erstellePokedexModus(kontext, reihenfolge) {

    const { pool, timerAnzeige } = kontext;

    const root = document.createElement("div");

    root.innerHTML = `
        <div class="eingabe-leiste">

            <strong class="ziel-text"></strong>

            <input class="namen-eingabe"
                   type="text"
                   placeholder="Deutsch oder Englisch ..."
                   autocomplete="off"
                   spellcheck="false">

            <label class="schatten-label">
                <input class="schatten-an"
                       type="checkbox">
                Schatten
            </label>

            ${reihenfolge ? `
                <label class="hardcore-label">
                    <input class="hardcore-an"
                           type="checkbox">
                    Hardcore
                </label>

                <button class="einzelhinweis sekundaer"
                        type="button">
                    Ein Pokémon aufdecken
                </button>
            ` : ""}

            <button class="aufgeben" type="button">
                Aufgeben
            </button>

            <button class="neu sekundaer" type="button">
                Neustart
            </button>

        </div>

        <p class="meldung" role="status"></p>

        <div class="dex-grid"></div>
    `;


    // =====================================
    // HTML-ELEMENTE
    // =====================================

    const eingabe =
        root.querySelector(".namen-eingabe");

    const ziel =
        root.querySelector(".ziel-text");

    const schatten =
        root.querySelector(".schatten-an");

    const hardcore =
        root.querySelector(".hardcore-an");

    const hinweisButton =
        root.querySelector(".einzelhinweis");

    const meldung =
        root.querySelector(".meldung");

    const raster =
        root.querySelector(".dex-grid");

    const aufgebenButton =
        root.querySelector(".aufgeben");

    const timer = erstelleStoppuhr(timerAnzeige);


    // =====================================
    // SPIELZUSTAND
    // =====================================

    const gefunden = new Set();
    const aufgedeckt = new Set();

    const karten = new Map();

    let naechster = 0;
    let beendet = false;


    /**
     * Blendet Hinweise im Hardcore-Modus aus.
     *
     * @returns {void}
     */
    function hardcoreAnzeige() {

        const aktiv = !!hardcore?.checked;

        if (hinweisButton) {
            hinweisButton.hidden = aktiv;
        }

        aufgebenButton.hidden = aktiv;
    }


    /**
     * Aktualisiert eine Pokémon-Karte.
     *
     * @param {Object} pokemon - Pokémon
     * @returns {void}
     */
    function zeichne(pokemon) {

        const status = gefunden.has(pokemon.id)
            ? "gefunden"
            : aufgedeckt.has(pokemon.id)
                ? "aufgedeckt"
                : schatten.checked
                    ? "schatten"
                    : "frage";

        const teile = karten.get(pokemon.id);

        if (!teile) return;

        zeichneKarte(pokemon, teile, status);

        teile.karte.classList.toggle(

            "aktuell",

            reihenfolge &&
            !beendet &&
            pool[naechster]?.id === pokemon.id
        );
    }


    /**
     * Erstellt das Pokédex-Raster.
     *
     * @returns {void}
     */
    function erstelleRaster() {

        const fragment =
            document.createDocumentFragment();

        for (const pokemon of pool) {

            const teile = pokemonKarte(pokemon);

            karten.set(pokemon.id, teile);

            zeichne(pokemon);

            fragment.appendChild(teile.karte);
        }

        raster.appendChild(fragment);
    }


    /**
     * Gibt die Zahl aller erledigten Pokémon zurück.
     *
     * @returns {number} Richtig + aufgedeckt
     */
    function anzahlErledigt() {

        return gefunden.size + aufgedeckt.size;
    }


    /**
     * Aktualisiert die gesuchte Nummer und Statistik.
     *
     * Aufgedeckte Pokémon werden bei der Reihenfolge
     * übersprungen.
     *
     * @returns {void}
     */
    function aktualisieren() {

        if (reihenfolge) {

            while (

                naechster < pool.length &&

                (
                    gefunden.has(pool[naechster].id) ||
                    aufgedeckt.has(pool[naechster].id)
                )

            ) {
                naechster++;
            }


            ziel.textContent = naechster < pool.length

                ? `Gesucht: #${String(
                    pool[naechster].id
                ).padStart(4, "0")}`

                : "Alle erledigt!";

        } else {

            ziel.textContent = "Pokédex";
        }


        meldung.dataset.fortschritt =

            `${gefunden.size} richtig · ` +
            `${aufgedeckt.size} aufgedeckt / ` +
            `${pool.length}`;


        if (reihenfolge) {

            for (const pokemon of pool) {

                karten.get(pokemon.id).karte.classList.toggle(

                    "aktuell",

                    !beendet &&
                    pool[naechster]?.id === pokemon.id
                );
            }
        }
    }


    /**
     * Beendet die Spielrunde.
     *
     * @returns {void}
     */
    function beenden() {

        beendet = true;

        timer.stop();

        eingabe.disabled = true;
        aufgebenButton.disabled = true;
        schatten.disabled = true;

        if (hinweisButton) {
            hinweisButton.disabled = true;
        }

        aktualisieren();

        meldung.textContent =

            `Fertig! ${gefunden.size} richtig, ` +
            `${aufgedeckt.size} aufgedeckt.`;
    }


    /**
     * Startet eine neue Runde.
     *
     * @param {string} grund - Optionale Meldung
     * @returns {void}
     */
    function neu(grund = "") {

        beendet = false;
        naechster = 0;

        gefunden.clear();
        aufgedeckt.clear();

        eingabe.value = "";
        eingabe.disabled = false;

        schatten.checked = false;
        schatten.disabled = false;

        aufgebenButton.disabled = false;

        if (hinweisButton) {
            hinweisButton.disabled = false;
        }

        hardcoreAnzeige();


        for (const pokemon of pool) {
            zeichne(pokemon);
        }

        aktualisieren();

        meldung.textContent = grund;

        timer.start();

        if (root.isConnected) {
            eingabe.focus();
        }
    }


    /**
     * Prüft einen eingegebenen Pokémon-Namen.
     *
     * @returns {void}
     */
    function pruefen() {

        if (beendet) return;

        const treffer =
            sucheNamen(pool, eingabe.value);

        const alleBekannten =
            reihenfolge && hardcore?.checked

                ? sucheNamen(
                    ALLE_POKEMON,
                    eingabe.value
                )

                : [];


        // =====================================
        // REIHENFOLGE PRÜFEN
        // =====================================

        if (reihenfolge) {

            const erwartet = pool[naechster];

            const passt = treffer.some(pokemon =>
                pokemon.id === erwartet?.id
            );

            if (!passt) {

                // Hardcore:
                // Vollständiger, aber falscher Name
                if (alleBekannten.length) {

                    neu(
                        `Hardcore: ${alleBekannten[0].de} ` +
                        "war falsch! Von vorne."
                    );
                }

                return;
            }

        } else if (!treffer.length) {

            meldung.textContent = "";
            return;
        }


        // =====================================
        // NEUE TREFFER AUFNEHMEN
        // =====================================

        const neueTreffer = treffer.filter(pokemon =>

            !gefunden.has(pokemon.id) &&

            !aufgedeckt.has(pokemon.id)
        );


        if (!neueTreffer.length) {

            meldung.textContent =
                "Bereits entdeckt oder aufgedeckt.";

            return;
        }


        for (const pokemon of neueTreffer) {

            gefunden.add(pokemon.id);

            zeichne(pokemon);
        }

        eingabe.value = "";

        aktualisieren();


        meldung.textContent = neueTreffer.length > 1

            ? "Beide Nidoran-Arten entdeckt!"

            : `${neueTreffer[0].de} entdeckt!`;


        if (anzahlErledigt() === pool.length) {

            beenden();

        } else {

            eingabe.focus();
        }
    }


    /**
     * Deckt genau das nächste Pokémon auf.
     *
     * Nicht im Hardcore-Modus verfügbar.
     *
     * @returns {void}
     */
    function einPokemonAufdecken() {

        if (
            !reihenfolge ||
            beendet ||
            hardcore?.checked
        ) {
            return;
        }


        // Das nächste noch nicht erledigte Pokémon
        const pokemon = pool[naechster];

        if (!pokemon) return;


        // Aufgedeckt zählt nicht als richtig
        aufgedeckt.add(pokemon.id);

        zeichne(pokemon);

        eingabe.value = "";

        aktualisieren();


        if (anzahlErledigt() === pool.length) {

            beenden();

        } else {

            meldung.textContent =

                `Hilfe: ${pokemon.de} ` +
                `(#${pokemon.id}) aufgedeckt.`;

            eingabe.focus();
        }
    }


    /**
     * Deckt alle fehlenden Pokémon auf.
     *
     * @returns {void}
     */
    function aufloesen() {

        if (beendet || hardcore?.checked) {
            return;
        }

        for (const pokemon of pool) {

            if (!gefunden.has(pokemon.id)) {

                aufgedeckt.add(pokemon.id);

                zeichne(pokemon);
            }
        }

        beenden();
    }


    // =====================================
    // EVENT-LISTENER
    // =====================================

    erstelleRaster();

    eingabe.addEventListener(
        "input",
        pruefen
    );


    schatten.addEventListener("change", () => {

        for (const pokemon of pool) {

            if (

                !gefunden.has(pokemon.id) &&

                !aufgedeckt.has(pokemon.id)

            ) {

                zeichne(pokemon);
            }
        }
    });


    // Hardcore-Wechsel startet eine frische Runde.
    hardcore?.addEventListener("change", () => {

        neu(

            hardcore.checked

                ? "Hardcore aktiviert: " +
                  "keine Hilfen und keine Lösungen."

                : "Normalmodus aktiviert: " +
                  "Hilfen sind wieder verfügbar."
        );
    });


    hinweisButton?.addEventListener(
        "click",
        einPokemonAufdecken
    );

    aufgebenButton.addEventListener(
        "click",
        aufloesen
    );

    root.querySelector(".neu").addEventListener(
        "click",
        () => neu()
    );


    // =====================================
    // START
    // =====================================

    neu();


    return {

        root,

        pause: timer.pause,

        resume() {

            if (!beendet) timer.resume();

            if (!beendet) eingabe.focus();
        },

        dispose: timer.dispose
    };
}


/* ================================================
   POKÉMON-NAMEN ÜBERSETZEN
   ================================================ */


/**
 * Erstellt Deutsch -> Englisch oder Englisch -> Deutsch.
 *
 * @param {Object} kontext - Pokémon und Timeranzeige
 * @param {boolean} deNachEn - Übersetzungsrichtung
 * @returns {Object} Spielsitzung
 */
function erstelleUebersetzung(kontext, deNachEn) {

    const { pool, timerAnzeige } = kontext;

    const root = document.createElement("div");
    root.className = "frage-karte";

    root.innerHTML = `
        <p class="fortschritt"></p>

        <p>
            Wie heißt dieses Pokémon auf
            ${deNachEn ? "Englisch" : "Deutsch"}?
        </p>

        <div class="frage-name"></div>

        <input class="namen-eingabe"
               type="text"
               placeholder="Antwort eingeben ..."
               autocomplete="off"
               spellcheck="false">

        <p class="meldung" role="status"></p>

        <p class="statistik"></p>

        <div class="aktionen">

            <button class="aufgeben" type="button">
                Aufgeben / Lösung anzeigen
            </button>

            <button class="neu sekundaer" type="button">
                Neustart
            </button>

        </div>
    `;


    const anzeige =
        root.querySelector(".frage-name");

    const eingabe =
        root.querySelector(".namen-eingabe");

    const meldung =
        root.querySelector(".meldung");

    const fortschritt =
        root.querySelector(".fortschritt");

    const statistik =
        root.querySelector(".statistik");

    const aufgebenButton =
        root.querySelector(".aufgeben");

    const timer = erstelleStoppuhr(timerAnzeige);


    let liste = [];

    let index = 0;
    let richtig = 0;
    let aufgegeben = 0;

    let gesperrt = false;
    let beendet = false;

    let wechsel = null;
    let wartet = false;


    /**
     * Zeigt die nächste Übersetzungsfrage.
     *
     * @returns {void}
     */
    function anzeigen() {

        wartet = false;

        statistik.textContent =

            `Richtig: ${richtig} · ` +
            `Aufgegeben: ${aufgegeben}`;


        if (index >= liste.length) {

            beendet = true;

            timer.stop();

            anzeige.textContent = "Geschafft! 🎉";

            fortschritt.textContent =
                `${liste.length} / ${liste.length}`;

            meldung.textContent =
                `Richtig: ${richtig} · ` +
                `Aufgegeben: ${aufgegeben}`;

            eingabe.disabled = true;
            aufgebenButton.disabled = true;

            return;
        }


        const pokemon = liste[index];

        anzeige.textContent = deNachEn
            ? pokemon.de
            : pokemon.en;

        fortschritt.textContent =
            `Frage ${index + 1} / ${liste.length}`;

        gesperrt = false;

        eingabe.disabled = false;
        aufgebenButton.disabled = false;

        eingabe.value = "";
        meldung.textContent = "";

        if (root.isConnected) {
            eingabe.focus();
        }
    }


    /**
     * Schließt eine einzelne Frage ab.
     *
     * @param {boolean} istAufgegeben - Aufgegeben?
     * @returns {void}
     */
    function beantworten(istAufgegeben) {

        if (gesperrt || beendet) return;

        const pokemon = liste[index];

        const loesung = deNachEn
            ? pokemon.en
            : pokemon.de;

        gesperrt = true;

        eingabe.disabled = true;
        aufgebenButton.disabled = true;

        if (istAufgegeben) {
            aufgegeben++;
        } else {
            richtig++;
        }


        meldung.textContent =

            `${istAufgegeben ? "Lösung" : "Richtig"}: ` +
            loesung;

        index++;


        statistik.textContent =

            `Richtig: ${richtig} · ` +
            `Aufgegeben: ${aufgegeben}`;


        if (index >= liste.length) {
            timer.stop();
        }

        wartet = true;

        wechsel = setTimeout(() => {

            wechsel = null;
            anzeigen();

        }, istAufgegeben ? 1800 : 650);
    }


    /**
     * Prüft den eingegebenen Namen.
     *
     * @returns {void}
     */
    function pruefen() {

        if (gesperrt || beendet) return;

        const pokemon = liste[index];

        const treffer = sucheNamen(

            [pokemon],

            eingabe.value,

            deNachEn ? "en" : "de"
        );

        if (treffer.length) {

            beantworten(false);
        }
    }


    /**
     * Startet die Namensübersetzung neu.
     *
     * @returns {void}
     */
    function neu() {

        clearTimeout(wechsel);

        wechsel = null;

        liste = mische(pool);

        index = 0;
        richtig = 0;
        aufgegeben = 0;

        gesperrt = false;
        beendet = false;
        wartet = false;

        timer.start();

        anzeigen();
    }


    // =====================================
    // EVENTS UND START
    // =====================================

    eingabe.addEventListener("input", pruefen);

    aufgebenButton.addEventListener(
        "click",
        () => beantworten(true)
    );

    root.querySelector(".neu").addEventListener(
        "click",
        neu
    );

    neu();


    return {

        root,

        pause() {

            timer.pause();

            clearTimeout(wechsel);

            wechsel = null;
        },

        resume() {

            if (wartet) anzeigen();

            if (!beendet) timer.resume();

            if (!beendet && !gesperrt) {
                eingabe.focus();
            }
        },

        dispose() {

            clearTimeout(wechsel);

            timer.dispose();
        }
    };
}
