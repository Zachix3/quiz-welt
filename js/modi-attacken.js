
/* =====================================================
   ATTACKENQUIZ

   - Zufallsmodus und Übungsmodus
   - Normal und Hardcore
   - Vorschläge kommen aus vorschlaege.js
   - Im Hardcore-Modus keine Aufdeckhilfen
   ===================================================== */

let attackenModusZaehler = 0;


/**
 * Erstellt einen der sechs Attackenmodi.
 *
 * @param {Object} kontext - pool, maxGen, timerAnzeige
 * @param {string} modus - Spielmodus-Kennung
 * @returns {Object} Spielsitzung
 */
function erstelleAttackenModus(kontext, modus) {

    // =====================================
    // SPIELART BESTIMMEN
    // =====================================

    const { pool, maxGen, timerAnzeige } = kontext;

    const uebersetzung = [
        "attacke-de-en",
        "attacke-en-de"
    ].includes(modus);

    const werLernt =
        modus.startsWith("attacke-wer");

    const reihenfolge =
        modus.endsWith("-reihe");

    const attackenRaten =
        !uebersetzung && !werLernt;

    const zielIstAttacke =
        uebersetzung || werLernt;

    const listenId =
        `attacken-uebung-${++attackenModusZaehler}`;


    // =====================================
    // HTML
    // =====================================

    const root = document.createElement("div");
    root.className = "frage-karte";

    root.innerHTML = `
        <p class="lade-info" role="status">
            Attackendaten werden geladen …
        </p>

        <div class="einstellungen quiz-einstellungen"
             hidden>

            <h3>Spiel einstellen</h3>

            <label>
                Schwierigkeit:
                <select class="schwierigkeit">
                    <option value="normal">Normal</option>
                    <option value="hardcore">Hardcore</option>
                </select>
            </label>

            <label class="uebung-label">
                <input class="uebung-aktiv"
                       type="checkbox">
                Übungsmodus – Aufgabe gezielt auswählen
            </label>

            <div class="uebungs-auswahl" hidden>

                <label for="${listenId}"></label>

                <input id="${listenId}"
                       class="uebungs-eingabe"
                       list="${listenId}-vorschlaege"
                       type="text"
                       autocomplete="off"
                       spellcheck="false"
                       placeholder="Pokémon oder Attacke auswählen …">

                <datalist id="${listenId}-vorschlaege"></datalist>

                <p class="hinweis">
                    Deutscher oder englischer Name möglich.
                </p>
            </div>

            <p class="meldung einstellungs-meldung"
               role="status"></p>

            <button class="spiel-start" type="button">
                Spiel starten
            </button>
        </div>


        <!-- Eigentliches Quiz -->

        <div class="attacken-spiel" hidden>

            <div class="optionen-zeile"
                 ${uebersetzung ? "hidden" : ""}>

                <label>
                    Edition:
                    <select class="edition"></select>
                </label>

                <label>
                    Lernmethode:
                    <select class="lernmethode"></select>
                </label>
            </div>

            <p class="hinweis laufende-einstellungen"></p>

            <p class="fortschritt"></p>

            <div class="frage-name"></div>

            <div class="pokemon-frage" hidden>
                <img class="artwork" alt="">
                <strong class="pokemon-name"></strong>
            </div>

            <form class="antwort-form">

                <input class="namen-eingabe"
                       type="text"
                       placeholder="Antwort eingeben …"
                       autocomplete="off"
                       spellcheck="false">

                <button type="submit">Prüfen</button>
            </form>

            <p class="meldung" role="status"></p>

            <div class="dex-grid antwort-raster"></div>

            <div class="aktionen">

                ${attackenRaten ? `
                    <button class="einzelhinweis sekundaer"
                            type="button">
                        Eine Attacke aufdecken
                    </button>
                ` : ""}

                <button class="aufgeben" type="button">
                    Aufgeben / alle Lösungen
                </button>

                <button class="neu sekundaer" type="button">
                    Neue Runde
                </button>

                <button class="naechstes" type="button" hidden>
                    Neue Aufgabe
                </button>

                <button class="einstellungen-oeffnen sekundaer"
                        type="button">
                    Spielart / Übung ändern
                </button>

            </div>
        </div>
    `;


    // =====================================
    // HTML-ELEMENTE
    // =====================================

    const ladeInfo =
        root.querySelector(".lade-info");

    const einstellungen =
        root.querySelector(".quiz-einstellungen");

    const spiel =
        root.querySelector(".attacken-spiel");

    const schwierigkeit =
        root.querySelector(".schwierigkeit");

    const uebungAktiv =
        root.querySelector(".uebung-aktiv");

    const uebungAuswahl =
        root.querySelector(".uebungs-auswahl");

    const uebungLabel =
        root.querySelector(".uebungs-auswahl label");

    const uebungEingabe =
        root.querySelector(".uebungs-eingabe");

    const uebungListe =
        root.querySelector("datalist");

    const einstellungsMeldung =
        root.querySelector(".einstellungs-meldung");

    const laufendeEinstellungen =
        root.querySelector(".laufende-einstellungen");

    const edition =
        root.querySelector(".edition");

    const methodeAuswahl =
        root.querySelector(".lernmethode");

    const frage =
        root.querySelector(".frage-name");

    const pokemonFrage =
        root.querySelector(".pokemon-frage");

    const fortschritt =
        root.querySelector(".fortschritt");

    const formular =
        root.querySelector(".antwort-form");

    const eingabe =
        root.querySelector(".namen-eingabe");

    const meldung =
        spiel.querySelector(".meldung");

    const raster =
        root.querySelector(".antwort-raster");

    const hinweisButton =
        root.querySelector(".einzelhinweis");

    const aufgebenButton =
        root.querySelector(".aufgeben");

    const neuButton =
        root.querySelector(".neu");

    const naechstesButton =
        root.querySelector(".naechstes");

    const timer =
        erstelleStoppuhr(timerAnzeige);


    // =====================================
    // SPIELZUSTAND
    // =====================================

    let daten = null;
    let lernsets = null;
    let maschinen = new Map();

    let gruppenId = null;
    let methode = "alle";

    let bereit = false;
    let spielLaeuft = false;

    let beendet = false;
    let gesperrt = false;

    let pausiert = false;
    let entsorgt = false;

    let weiterTimer = null;
    let wartet = false;

    let trainingsZiel = null;
    let letzteAufgabe = null;

    let ziele = [];
    let aktuelleFrage = null;

    let position = 0;

    let gefunden = new Set();
    let aufgedeckt = new Set();

    const lernsetCache = new Map();
    const zuordnungCache = new Map();


    // =====================================
    // HARDCORE-REGELN
    // =====================================

    /**
     * @returns {boolean} Ist Hardcore aktiviert?
     */
    function istHardcore() {

        return schwierigkeit.value === "hardcore";
    }


    /**
     * Blendet alle Aufdeckmöglichkeiten
     * im Hardcore-Modus aus.
     *
     * @returns {void}
     */
    function aktualisiereHilfen() {

        const ausblenden = istHardcore();

        if (hinweisButton) {
            hinweisButton.hidden = ausblenden;
        }

        aufgebenButton.hidden = ausblenden;
    }


    // =====================================
    // ÜBUNGSMODUS
    // =====================================

    /**
     * Erstellt Namen für die Übungsauswahl.
     *
     * @returns {void}
     */
    function baueUebungsliste() {

        uebungListe.replaceChildren();

        const kandidaten = zielIstAttacke

            ? daten.attacken.filter(
                attacke => attacke.gen <= maxGen
            )

            : pool;

        const fragment =
            document.createDocumentFragment();

        for (const kandidat of kandidaten) {

            const option =
                document.createElement("option");

            option.value = kandidat.de;

            option.label =
                `${kandidat.en} · #${kandidat.id}`;

            fragment.appendChild(option);
        }

        uebungListe.appendChild(fragment);
    }


    /**
     * Sucht das ausgewählte Trainingsziel.
     *
     * @returns {Object|null} Pokémon oder Attacke
     */
    function holeTrainingsZiel() {

        const eingegeben =
            normalisiere(uebungEingabe.value);

        const kandidaten = zielIstAttacke

            ? daten.attacken.filter(
                attacke => attacke.gen <= maxGen
            )

            : pool;

        const passende = kandidaten.filter(kandidat =>

            normalisiere(kandidat.de) === eingegeben ||

            normalisiere(kandidat.en) === eingegeben ||

            String(kandidat.id) ===
                uebungEingabe.value.trim()
        );

        return passende.length === 1
            ? passende[0]
            : null;
    }


    /**
     * Pausiert das Spiel und öffnet die Einstellungen.
     *
     * @returns {void}
     */
    function oeffneEinstellungen() {

        clearTimeout(weiterTimer);
        weiterTimer = null;

        timer.pause();

        spielLaeuft = false;

        einstellungen.hidden = false;
        spiel.hidden = true;

        einstellungsMeldung.textContent = "";
    }


    /**
     * Übernimmt Schwierigkeit und Übungsziel.
     *
     * @returns {void}
     */
    function starteMitEinstellungen() {

        if (!bereit) return;

        trainingsZiel = null;

        if (uebungAktiv.checked) {

            trainingsZiel = holeTrainingsZiel();

            if (!trainingsZiel) {

                einstellungsMeldung.textContent =
                    "Bitte einen eindeutigen Pokémon- " +
                    "oder Attackennamen auswählen.";

                return;
            }
        }


        einstellungen.hidden = true;
        spiel.hidden = false;

        spielLaeuft = true;
        letzteAufgabe = null;

        laufendeEinstellungen.textContent =

            `${istHardcore() ? "Hardcore" : "Normal"} · ` +

            (
                trainingsZiel
                    ? `Übung: ${trainingsZiel.de}`
                    : "Zufallsmodus"
            );


        // NEU: Hardcore darf keine Hilfen anzeigen.
        aktualisiereHilfen();

        neueRunde(true);
    }


    // =====================================
    // DATENZUGRIFF
    // =====================================

    /**
     * Liefert alle Attacken eines Pokémon
     * in Edition und Lernmethode.
     *
     * @param {Object} pokemon - Pokémon
     * @returns {Object[]} Lernbare Attacken
     */
    function attackenVon(pokemon) {

        const key =
            `${gruppenId}:${methode}:${pokemon.pokemonId}`;

        if (!lernsetCache.has(key)) {

            lernsetCache.set(

                key,

                holeLernbareAttacken(

                    pokemon,
                    gruppenId,
                    methode,
                    lernsets,
                    daten.nachId,
                    maschinen
                )
            );
        }

        return lernsetCache.get(key);
    }


    /**
     * Erstellt Attacke -> Pokémon-Zuordnungen.
     *
     * @returns {Map<number, Object[]>} Zuordnung
     */
    function pokemonNachAttacke() {

        const key =
            `${gruppenId}:${methode}`;

        if (zuordnungCache.has(key)) {
            return zuordnungCache.get(key);
        }

        const map = new Map();

        for (const pokemon of pool) {

            for (const attacke of attackenVon(pokemon)) {

                if (!map.has(attacke.id)) {

                    map.set(attacke.id, []);
                }

                map.get(attacke.id).push(pokemon);
            }
        }

        zuordnungCache.set(key, map);

        return map;
    }


    /**
     * Sortiert die Antworten nach Spielregel.
     *
     * @returns {void}
     */
    function sortiereZiele() {

        if (!reihenfolge) return;

        if (werLernt) {

            ziele.sort((a, b) =>
                a.id - b.id
            );

        } else if (methode === "level") {

            ziele.sort((a, b) =>

                a.level - b.level ||

                a.reihenfolge - b.reihenfolge ||

                a.id - b.id
            );

        } else {

            ziele.sort((a, b) =>
                a.de.localeCompare(b.de, "de")
            );
        }
    }


    /**
     * @returns {Object[]} Noch offene Antworten
     */
    function fehlendeZiele() {

        return ziele.filter(ziel =>

            !gefunden.has(ziel.id) &&

            !aufgedeckt.has(ziel.id)
        );
    }


    /**
     * @returns {Object|undefined} Nächste offene Antwort
     */
    function naechstesZiel() {

        return fehlendeZiele()[0];
    }


    // =====================================
    // ANTWORTKARTEN
    // =====================================

    /**
     * Zeichnet die Ergebnisse.
     *
     * @returns {void}
     */
    function zeichneRaster() {

        raster.replaceChildren();

        const fragment =
            document.createDocumentFragment();

        const erwartet = naechstesZiel();

        for (const ziel of ziele) {

            const karte =
                document.createElement("div");

            karte.className = "pokemon-karte";

            const inhalt =
                document.createElement("div");

            inhalt.className = "karten-inhalt";

            const richtig =
                gefunden.has(ziel.id);

            const hilfe =
                aufgedeckt.has(ziel.id);


            if (richtig || hilfe) {

                karte.classList.add(
                    richtig ? "gefunden" : "aufgedeckt"
                );

                if (werLernt) {

                    const bild = pokemonBild(ziel);
                    bild.className = "mini-bild";

                    inhalt.appendChild(bild);
                }

                const name =
                    document.createElement("span");

                name.className = "mini-name";
                name.textContent = ziel.de;

                inhalt.appendChild(name);

            } else {

                const fragezeichen =
                    document.createElement("span");

                fragezeichen.className = "fragezeichen";
                fragezeichen.textContent = "?";

                inhalt.appendChild(fragezeichen);
            }


            // Lernlevel bei Pokémon -> Attacken
            if (
                attackenRaten &&
                methode === "level"
            ) {

                const label =
                    document.createElement("span");

                label.className = "zeit-etikett";

                label.textContent = ziel.level === 0

                    ? "Start / Level 0"

                    : `Level ${ziel.level}`;

                inhalt.appendChild(label);
            }


            // Aktuelle Antwort markieren
            if (
                reihenfolge &&
                !richtig &&
                !hilfe &&
                !beendet
            ) {

                const aktuell =
                    attackenRaten &&
                    methode === "level"

                        ? ziel.level === erwartet?.level

                        : ziel.id === erwartet?.id;

                karte.classList.toggle(
                    "aktuell",
                    aktuell
                );
            }

            karte.appendChild(inhalt);
            fragment.appendChild(karte);
        }

        raster.appendChild(fragment);


        meldung.dataset.fortschritt =

            `${gefunden.size} richtig · ` +
            `${aufgedeckt.size} aufgedeckt / ` +
            `${ziele.length}`;
    }


    // =====================================
    // FRAGE ANZEIGEN
    // =====================================

    /**
     * Zeigt die aktuelle Frage.
     *
     * @returns {void}
     */
    function zeigeFrage() {

        wartet = false;


        if (uebersetzung) {

            if (position >= ziele.length) {

                beendeRunde();
                return;
            }

            const attacke = ziele[position];

            frage.hidden = false;
            pokemonFrage.hidden = true;

            frage.textContent =
                modus === "attacke-de-en"
                    ? attacke.de
                    : attacke.en;

            fortschritt.textContent =
                `Frage ${position + 1} / ${ziele.length}`;

            raster.replaceChildren();


        } else if (werLernt) {

            frage.hidden = false;
            pokemonFrage.hidden = true;

            frage.textContent =
                `Welche Pokémon lernen ${aktuelleFrage.de}?`;

            fortschritt.textContent = reihenfolge

                ? "Nationaldex-Reihenfolge"

                : "Pokémon in beliebiger Reihenfolge";

            zeichneRaster();


        } else {

            frage.hidden = true;
            pokemonFrage.hidden = false;

            const bild =
                pokemonFrage.querySelector("img");

            bild.onerror = () => {

                bild.onerror = null;

                bild.src =
                    bildAdresse(aktuelleFrage);
            };

            bild.src =
                bildAdresse(aktuelleFrage, true);

            bild.alt = aktuelleFrage.de;


            pokemonFrage.querySelector(
                ".pokemon-name"
            ).textContent = aktuelleFrage.de;


            fortschritt.textContent = reihenfolge

                ? methode === "level"

                    ? "Nach Lernlevel – gleicher Level frei wählbar"

                    : "Alphabetisch nach deutschem Attackennamen"

                : "Attacken in beliebiger Reihenfolge";

            zeichneRaster();
        }


        gesperrt = false;

        eingabe.disabled = false;
        eingabe.value = "";

        aufgebenButton.disabled = false;

        if (hinweisButton) {
            hinweisButton.disabled = false;
        }

        if (root.isConnected && !pausiert) {
            eingabe.focus();
        }
    }


    // =====================================
    // NEUE RUNDE
    // =====================================

    /**
     * Startet eine neue oder dieselbe Aufgabe.
     *
     * @param {boolean} neueAufgabe
     * true = neu, false = dieselbe Aufgabe
     *
     * @param {string} grund - Optionale Meldung
     * @returns {void}
     */
    function neueRunde(
        neueAufgabe = true,
        grund = ""
    ) {

        if (!bereit || !spielLaeuft) return;

        clearTimeout(weiterTimer);

        weiterTimer = null;
        wartet = false;

        gefunden = new Set();
        aufgedeckt = new Set();

        position = 0;

        beendet = false;
        gesperrt = false;

        ziele = [];
        aktuelleFrage = null;

        naechstesButton.hidden = true;


        // =================================
        // A. Übersetzung
        // =================================

        if (uebersetzung) {

            if (
                !neueAufgabe &&
                letzteAufgabe?.liste
            ) {

                ziele = [...letzteAufgabe.liste];

            } else {

                ziele = trainingsZiel

                    ? [trainingsZiel]

                    : mische(
                        daten.attacken.filter(
                            attacke =>
                                attacke.gen <= maxGen
                        )
                    );

                letzteAufgabe = {
                    liste: [...ziele]
                };
            }


        // =================================
        // B. Attacke -> Pokémon
        // =================================

        } else if (werLernt) {

            const zuordnung =
                pokemonNachAttacke();

            const ids = [...zuordnung.keys()];

            const id = trainingsZiel?.id ?? (

                !neueAufgabe &&
                letzteAufgabe?.id != null

                    ? letzteAufgabe.id

                    : ids[
                        Math.floor(
                            Math.random() * ids.length
                        )
                    ]
            );


            aktuelleFrage =
                daten.nachId.get(id);

            ziele = [
                ...(zuordnung.get(id) || [])
            ];

            letzteAufgabe = { id };


        // =================================
        // C. Pokémon -> Attacken
        // =================================

        } else {

            const kandidaten = trainingsZiel

                ? [trainingsZiel]

                : pool.filter(pokemon =>
                    attackenVon(pokemon).length > 0
                );

            const id = trainingsZiel?.id ?? (

                !neueAufgabe &&
                letzteAufgabe?.id != null

                    ? letzteAufgabe.id

                    : kandidaten[
                        Math.floor(
                            Math.random() *
                            kandidaten.length
                        )
                    ]?.id
            );


            aktuelleFrage = pool.find(
                pokemon => pokemon.id === id
            ) || null;

            ziele = aktuelleFrage

                ? [...attackenVon(aktuelleFrage)]

                : [];

            letzteAufgabe = { id };
        }


        // =================================
        // D. Keine passende Aufgabe
        // =================================

        if (
            !ziele.length ||
            (!uebersetzung && !aktuelleFrage)
        ) {

            beendet = true;
            timer.stop();

            frage.hidden = false;
            pokemonFrage.hidden = true;

            frage.textContent =
                "Keine passenden Aufgaben";

            raster.replaceChildren();

            eingabe.disabled = true;
            aufgebenButton.disabled = true;

            if (hinweisButton) {
                hinweisButton.disabled = true;
            }

            meldung.textContent =
                "Für diese Edition und Lernmethode " +
                "gibt es keine passenden Antworten. " +
                "Bitte die Auswahl ändern.";

            meldung.dataset.fortschritt = "";

            return;
        }


        sortiereZiele();

        timer.start();

        if (pausiert) timer.pause();

        zeigeFrage();

        meldung.textContent = grund;
    }


    /**
     * Beendet die Runde.
     *
     * @returns {void}
     */
    function beendeRunde() {

        beendet = true;
        gesperrt = true;

        timer.stop();

        eingabe.disabled = true;
        aufgebenButton.disabled = true;

        if (hinweisButton) {
            hinweisButton.disabled = true;
        }

        naechstesButton.hidden = false;

        naechstesButton.textContent = trainingsZiel

            ? "Dieselbe Aufgabe wiederholen"

            : "Neue Aufgabe";


        meldung.textContent =

            `Fertig! ${gefunden.size} richtig, ` +
            `${aufgedeckt.size} aufgedeckt ` +
            `(${ziele.length} insgesamt).`;


        if (uebersetzung) {

            frage.textContent =
                "Runde abgeschlossen!";

            fortschritt.textContent =
                `${ziele.length} / ${ziele.length}`;
        }
    }


    // =====================================
    // ÜBERSETZUNGSFRAGE
    // =====================================

    /**
     * Beendet eine Übersetzungsfrage.
     *
     * @param {boolean} richtig - Richtige Antwort?
     * @returns {void}
     */
    function beendeUebersetzung(richtig) {

        if (beendet || gesperrt) return;

        const attacke = ziele[position];

        const antwort =
            modus === "attacke-de-en"
                ? attacke.en
                : attacke.de;

        gesperrt = true;

        eingabe.disabled = true;
        aufgebenButton.disabled = true;


        if (richtig) {

            gefunden.add(attacke.id);

        } else {

            aufgedeckt.add(attacke.id);
        }


        meldung.textContent =

            `${richtig ? "Richtig" : "Lösung"}: ` +
            antwort;

        position++;


        if (position >= ziele.length) {
            timer.stop();
        }

        wartet = true;

        weiterTimer = setTimeout(() => {

            weiterTimer = null;

            if (!pausiert) {
                zeigeFrage();
            }

        }, richtig ? 700 : 1700);
    }


    // =====================================
    // ANTWORT PRÜFEN
    // =====================================

    /**
     * Prüft die aktuelle Eingabe.
     *
     * @param {boolean} bestaetigt
     * false = beim Tippen
     * true = mit Enter oder Prüfen
     *
     * @returns {void}
     */
    function pruefeAntwort(bestaetigt = false) {

        if (
            !bereit ||
            !spielLaeuft ||
            beendet ||
            gesperrt ||
            eingabe.disabled ||
            pausiert
        ) {
            return;
        }


        const text =
            normalisiere(eingabe.value);


        if (!text) {

            if (bestaetigt) {

                meldung.textContent =
                    "Bitte eine Antwort eingeben.";
            }

            return;
        }


        // =================================
        // A. Übersetzung
        // =================================

        if (uebersetzung) {

            const attacke = ziele[position];

            const richtig = normalisiere(

                modus === "attacke-de-en"

                    ? attacke.en

                    : attacke.de

            ) === text;


            if (richtig) {

                beendeUebersetzung(true);

            } else if (bestaetigt) {

                falscheAntwort();
            }

            return;
        }


        // =================================
        // B. Namen suchen
        // =================================

        const treffer = werLernt

            ? sucheNamen(
                pool,
                eingabe.value
            )

            : daten.attacken.filter(attacke =>

                normalisiere(attacke.de) === text ||

                normalisiere(attacke.en) === text
            );


        // Vollständige Lernobjekte verwenden,
        // damit die Lernlevel erhalten bleiben.
        const passende = ziele.filter(ziel =>

            !gefunden.has(ziel.id) &&

            !aufgedeckt.has(ziel.id) &&

            treffer.some(trefferElement =>
                trefferElement.id === ziel.id
            )
        );


        // =================================
        // C. Reihenfolge prüfen
        // =================================

        let erlaubte = passende;


        if (reihenfolge) {

            const erwartet = naechstesZiel();

            erlaubte = passende.filter(antwort =>

                attackenRaten &&
                methode === "level"

                    ? antwort.level === erwartet?.level

                    : antwort.id === erwartet?.id
            );
        }


        // =================================
        // D. Nicht passende Antwort
        // =================================

        if (!erlaubte.length) {

            // Nicht schon während des Tippens
            // einen Hardcore-Neustart auslösen.
            if (bestaetigt) {

                const hinweis =

                    reihenfolge &&
                    attackenRaten &&
                    methode === "level" &&
                    passende.length

                        ? "Diese Attacke ist lernbar, " +
                          "aber noch nicht an der Reihe."

                        : "Nicht passend, bereits beantwortet " +
                          "oder nicht an der Reihe.";

                falscheAntwort(hinweis);
            }

            return;
        }


        // =================================
        // E. Richtige Antwort
        // =================================

        for (const antwort of erlaubte) {

            gefunden.add(antwort.id);
        }


        eingabe.value = "";

        meldung.textContent =

            `Richtig: ${erlaubte.map(
                antwort => antwort.de
            ).join(", ")}`;


        zeichneRaster();


        if (fehlendeZiele().length === 0) {

            beendeRunde();

        } else {

            eingabe.focus();
        }
    }


    /**
     * Verarbeitet falsche Antworten.
     *
     * @param {string} hinweis - Fehlermeldung
     * @returns {void}
     */
    function falscheAntwort(
        hinweis = "Leider falsch. Versuche es erneut."
    ) {

        if (istHardcore()) {

            neueRunde(
                false,
                "Hardcore: Falsche Antwort – von vorne!"
            );

        } else {

            meldung.textContent = hinweis;
        }
    }


    // =====================================
    // HILFEN – NUR NORMALMODUS
    // =====================================

    /**
     * Deckt eine fehlende Attacke auf.
     *
     * Nur im normalen Modus.
     *
     * @returns {void}
     */
    function eineAttackeAufdecken() {

        if (
            !attackenRaten ||
            istHardcore() ||
            !spielLaeuft ||
            !bereit ||
            beendet ||
            gesperrt ||
            pausiert
        ) {
            return;
        }


        const fehlende = fehlendeZiele();

        if (!fehlende.length) return;


        const attacke = reihenfolge

            ? fehlende[0]

            : fehlende[
                Math.floor(
                    Math.random() * fehlende.length
                )
            ];


        // Hilfen sind keine richtigen Antworten.
        aufgedeckt.add(attacke.id);

        zeichneRaster();


        if (!fehlendeZiele().length) {

            beendeRunde();

            meldung.textContent +=
                ` Letzte Hilfe: ${attacke.de}.`;

        } else {

            meldung.textContent =
                `Hilfe: ${attacke.de} aufgedeckt. Weiter!`;

            eingabe.focus();
        }
    }


    /**
     * Deckt alle fehlenden Antworten auf.
     *
     * Nicht im Hardcore-Modus verfügbar.
     *
     * @returns {void}
     */
    function aufloesen() {

        if (
            istHardcore() ||
            beendet ||
            gesperrt
        ) {
            return;
        }


        if (uebersetzung) {

            beendeUebersetzung(false);
            return;
        }


        for (const ziel of fehlendeZiele()) {

            aufgedeckt.add(ziel.id);
        }

        zeichneRaster();

        beendeRunde();
    }


    // =====================================
    // DATEN LADEN
    // =====================================

    /**
     * Lädt Attacken, Editionen und Lernmethoden.
     *
     * @returns {Promise<void>}
     */
    async function initialisieren() {

        try {

            daten = await ladeAttackenNamen();

            if (entsorgt) return;


            if (!uebersetzung) {

                ladeInfo.textContent =
                    "Lernsets und Maschinen werden geladen …";


                [lernsets, maschinen] =
                    await Promise.all([

                        ladeLernsets(),
                        ladeMaschinen()

                    ]);


                if (entsorgt) return;


                // Editionen mit passenden Lernsets
                const gruppen = daten.gruppen

                    .filter(gruppe =>
                        gruppe.gen <= maxGen
                    )

                    .filter(gruppe =>

                        pool.some(pokemon =>

                            (
                                lernsets.get(
                                    pokemon.pokemonId
                                ) || []
                            ).some(eintrag =>
                                eintrag.gruppe === gruppe.id
                            )
                        )
                    )

                    .sort((a, b) =>
                        a.reihenfolge - b.reihenfolge
                    );


                for (const gruppe of gruppen) {

                    const option =
                        document.createElement("option");

                    option.value = gruppe.id;

                    option.textContent =

                        `Gen ${gruppe.gen}: ${gruppe.name}`;

                    edition.appendChild(option);
                }


                gruppenId =
                    gruppen.at(-1)?.id ?? null;

                edition.value =
                    String(gruppenId ?? "");


                // Lernmethoden
                for (const filter of ATTACKEN_METHODEN) {

                    const option =
                        document.createElement("option");

                    option.value = filter.id;
                    option.textContent = filter.name;

                    methodeAuswahl.appendChild(option);
                }


                methode =
                    reihenfolge && attackenRaten
                        ? "level"
                        : "alle";

                methodeAuswahl.value = methode;
            }


            uebungLabel.textContent = zielIstAttacke

                ? "Welche Attacke möchtest du üben?"

                : "Welches Pokémon möchtest du üben?";


            bereit = true;

            ladeInfo.hidden = true;

            einstellungen.hidden = false;

        } catch (fehler) {

            if (entsorgt) return;

            ladeInfo.textContent =

                "Attackendaten konnten nicht geladen " +
                "werden: " + fehler.message;

            console.error(fehler);
        }
    }


    // =====================================
    // EVENTS
    // =====================================

    uebungAktiv.addEventListener("change", () => {

        uebungAuswahl.hidden =
            !uebungAktiv.checked;

        einstellungsMeldung.textContent = "";


        if (
            uebungAktiv.checked &&
            !uebungListe.childElementCount &&
            bereit
        ) {

            baueUebungsliste();
        }
    });


    root.querySelector(".spiel-start").addEventListener(
        "click",
        starteMitEinstellungen
    );


    root.querySelector(
        ".einstellungen-oeffnen"
    ).addEventListener(
        "click",
        oeffneEinstellungen
    );


    eingabe.addEventListener("input", () => {

        pruefeAntwort(false);
    });


    formular.addEventListener("submit", event => {

        event.preventDefault();

        pruefeAntwort(true);
    });


    hinweisButton?.addEventListener(
        "click",
        eineAttackeAufdecken
    );


    aufgebenButton.addEventListener(
        "click",
        aufloesen
    );


    neuButton.addEventListener("click", () => {

        neueRunde(true);
    });


    naechstesButton.addEventListener("click", () => {

        neueRunde(true);
    });


    edition.addEventListener("change", () => {

        gruppenId = Number(edition.value);

        neueRunde(true);
    });


    methodeAuswahl.addEventListener("change", () => {

        methode = methodeAuswahl.value;

        neueRunde(true);
    });


    // =====================================
    // START
    // =====================================

    initialisieren();


    return {

        root,

        pause() {

            pausiert = true;

            timer.pause();

            clearTimeout(weiterTimer);

            weiterTimer = null;
        },

        resume() {

            pausiert = false;


            if (
                wartet &&
                spielLaeuft &&
                !beendet
            ) {
                zeigeFrage();
            }


            if (
                spielLaeuft &&
                !beendet &&
                einstellungen.hidden &&
                !wartet
            ) {

                timer.resume();

                if (!eingabe.disabled) {

                    eingabe.focus();
                }
            }
        },

        dispose() {

            entsorgt = true;

            clearTimeout(weiterTimer);

            timer.dispose();
        }
    };
}
