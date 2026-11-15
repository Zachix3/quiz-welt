
/* =========================================
   NAMENSSPIELE UND HARDCORE-MODUS
   ========================================= */


/**
 * Erstellt den freien oder sortierten Pokédex.
 *
 * @param {Object} kontext - Pokémon und Timeranzeige
 * @param {boolean} reihenfolge - Reihenfolge erzwingen?
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
                <input class="schatten-an" type="checkbox">
                Schatten
            </label>

            ${reihenfolge ? `
                <label class="hardcore-label">
                    <input class="hardcore-an" type="checkbox">
                    Hardcore
                </label>
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

    const eingabe = root.querySelector(".namen-eingabe");
    const ziel = root.querySelector(".ziel-text");
    const schatten = root.querySelector(".schatten-an");
    const hardcore = root.querySelector(".hardcore-an");
    const meldung = root.querySelector(".meldung");
    const raster = root.querySelector(".dex-grid");
    const aufgeben = root.querySelector(".aufgeben");

    const timer = erstelleStoppuhr(timerAnzeige);

    const gefunden = new Set();
    const offengelegt = new Set();
    const karten = new Map();

    let naechster = 0;
    let beendet = false;


    /**
     * Setzt eine Pokémon-Karte auf den aktuellen Zustand.
     *
     * @param {Object} pokemon - Pokémon-Objekt
     * @returns {void}
     */
    function zeichne(pokemon) {

        const status = gefunden.has(pokemon.id)
            ? "gefunden"
            : offengelegt.has(pokemon.id)
                ? "aufgedeckt"
                : schatten.checked
                    ? "schatten"
                    : "frage";

        const teile = karten.get(pokemon.id);

        zeichneKarte(pokemon, teile, status);

        teile.karte.classList.toggle(
            "aktuell",
            reihenfolge &&
            !beendet &&
            pool[naechster]?.id === pokemon.id
        );
    }


    /**
     * Erstellt die Karten einmalig.
     *
     * @returns {void}
     */
    function erstelleRaster() {

        const fragment = document.createDocumentFragment();

        for (const pokemon of pool) {

            const teile = pokemonKarte(pokemon);

            karten.set(pokemon.id, teile);

            zeichne(pokemon);

            fragment.appendChild(teile.karte);
        }

        raster.appendChild(fragment);
    }


    /**
     * Aktualisiert Fortschritt und gesuchtes Pokémon.
     *
     * @returns {void}
     */
    function aktualisieren() {

        // Vorausgefundene Pokémon überspringen
        if (reihenfolge) {

            while (
                naechster < pool.length &&
                gefunden.has(pool[naechster].id)
            ) {
                naechster++;
            }

            ziel.textContent = naechster < pool.length
                ? `Gesucht: #${String(
                    pool[naechster].id
                ).padStart(4, "0")}`
                : "Alle gefunden!";

        } else {

            ziel.textContent = "Pokédex";
        }

        meldung.dataset.fortschritt =
            `${gefunden.size} / ${pool.length}`;

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
     * Startet die Runde neu.
     *
     * @param {string} grund - Optionale Reset-Meldung
     * @returns {void}
     */
    function neu(grund = "") {

        beendet = false;
        naechster = 0;

        gefunden.clear();
        offengelegt.clear();

        eingabe.value = "";
        eingabe.disabled = false;

        schatten.checked = false;
        schatten.disabled = false;

        aufgeben.disabled = false;

        for (const pokemon of pool) {
            zeichne(pokemon);
        }

        aktualisieren();

        meldung.textContent = grund;

        timer.start();

        if (root.isConnected) eingabe.focus();
    }


    /**
     * Prüft eingegebene Pokémon-Namen sofort.
     *
     * Hardcore:
     * Ein vollständiger anderer Pokémon-Name setzt zurück.
     * Ein bloßer Tippfehler während des Tippens nicht.
     *
     * @returns {void}
     */
    function pruefen() {

        if (beendet) return;

        const treffer = sucheNamen(pool, eingabe.value);

        // Hardcore prüft auch Pokémon außerhalb
        // der aktuell ausgewählten Generationen.
        const alleBekannten = reihenfolge && hardcore?.checked
            ? sucheNamen(ALLE_POKEMON, eingabe.value)
            : [];

        if (reihenfolge) {

            const erwartet = pool[naechster];

            const passt = treffer.some(
                p => p.id === erwartet?.id
            );

            // Vollständiger Name, aber falsches Pokémon
            if (!passt) {

                if (alleBekannten.length) {

                    const falsch = alleBekannten[0].de;

                    neu(
                        `Hardcore: ${falsch} war falsch! ` +
                        "Du beginnst wieder von vorne."
                    );
                }

                return;
            }

        } else if (!treffer.length) {

            meldung.textContent = "";
            return;
        }

        const neue = treffer.filter(
            p => !gefunden.has(p.id)
        );

        if (!neue.length) {

            meldung.textContent = "Bereits entdeckt.";
            return;
        }

        // Nidoran deckt bei einer Eingabe beide Arten auf
        for (const p of neue) {

            gefunden.add(p.id);
            zeichne(p);
        }

        eingabe.value = "";
        aktualisieren();

        meldung.textContent = neue.length > 1
            ? "Beide Nidoran-Arten entdeckt!"
            : `${neue[0].de} entdeckt!`;

        if (gefunden.size === pool.length) {

            beendet = true;
            timer.stop();

            eingabe.disabled = true;
            aufgeben.disabled = true;

            meldung.textContent =
                `Geschafft! Alle ${pool.length} Pokémon erraten.`;

        } else {

            eingabe.focus();
        }
    }


    /**
     * Deckt alle fehlenden Pokémon auf.
     *
     * @returns {void}
     */
    function aufloesen() {

        if (beendet) return;

        beendet = true;
        timer.stop();

        for (const p of pool) {

            if (!gefunden.has(p.id)) {

                offengelegt.add(p.id);
                zeichne(p);
            }
        }

        eingabe.disabled = true;
        aufgeben.disabled = true;
        schatten.disabled = true;

        meldung.textContent =
            `Richtig: ${gefunden.size} · ` +
            `Aufgedeckt: ${offengelegt.size}`;

        aktualisieren();
    }


    // Karten erstellen und Eingaben verbinden
    erstelleRaster();

    eingabe.addEventListener("input", pruefen);

    schatten.addEventListener("change", () => {

        for (const pokemon of pool) {

            if (
                !gefunden.has(pokemon.id) &&
                !offengelegt.has(pokemon.id)
            ) {
                zeichne(pokemon);
            }
        }
    });

    aufgeben.addEventListener("click", aufloesen);

    root.querySelector(".neu").addEventListener(
        "click",
        () => neu()
    );

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


/* =========================================
   ÜBERSETZUNGSQUIZ
   ========================================= */


/**
 * Erstellt Deutsch → Englisch oder Englisch → Deutsch.
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

    const anzeige = root.querySelector(".frage-name");
    const eingabe = root.querySelector(".namen-eingabe");
    const meldung = root.querySelector(".meldung");
    const fortschritt = root.querySelector(".fortschritt");
    const statistik = root.querySelector(".statistik");
    const aufgeben = root.querySelector(".aufgeben");

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
     * Zeigt das aktuelle Pokémon oder das Endergebnis.
     *
     * @returns {void}
     */
    function anzeigen() {

        wartet = false;

        statistik.textContent =
            `Richtig: ${richtig} · Aufgegeben: ${aufgegeben}`;

        if (index >= liste.length) {

            beendet = true;
            timer.stop();

            anzeige.textContent = "Geschafft! 🎉";
            fortschritt.textContent =
                `${liste.length} / ${liste.length}`;

            meldung.textContent =
                `Richtig: ${richtig} · Aufgegeben: ${aufgegeben}`;

            eingabe.disabled = true;
            aufgeben.disabled = true;
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
        aufgeben.disabled = false;

        eingabe.value = "";
        meldung.textContent = "";

        if (root.isConnected) eingabe.focus();
    }


    /**
     * Beantwortet die aktuelle Frage.
     *
     * @param {boolean} istAufgegeben
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
        aufgeben.disabled = true;

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
            `Richtig: ${richtig} · Aufgegeben: ${aufgegeben}`;

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
     * Vergleicht die Eingabe mit dem Namen der Zielsprache.
     *
     * @returns {void}
     */
    function pruefen() {

        if (gesperrt || beendet) return;

        const pokemon = liste[index];

        const korrekt = sucheNamen(
            [pokemon],
            eingabe.value,
            deNachEn ? "en" : "de"
        ).length > 0;

        if (korrekt) beantworten(false);
    }


    /**
     * Startet eine neue Runde.
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

    eingabe.addEventListener("input", pruefen);

    aufgeben.addEventListener(
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

            if (!beendet && !gesperrt) eingabe.focus();
        },

        dispose() {
            clearTimeout(wechsel);
            timer.dispose();
        }
    };
}
