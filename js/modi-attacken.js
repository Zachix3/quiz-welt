
/* ====================================================
   ATTACKENQUIZ – NORMAL, HARDCORE UND ÜBUNGSMODUS

   Alle sechs Attacken-Spielmodi werden unterstützt.

   Übungsmodus:
   - Übersetzungen: gezielte Attacke
   - Wer lernt Attacke X?: gezielte Attacke
   - Welche Attacken lernt Pokémon Y?: gezieltes Pokémon

   Hardcore:
   Falsche, mit Enter bestätigte Antworten setzen
   den Fortschritt zurück. Das Übungsziel bleibt gleich.
   ==================================================== */


// Für eindeutige HTML-IDs der Vorschlagslisten
let attackenModusZaehler = 0;


/**
 * Erstellt eines der sechs Attackenquizze.
 *
 * @param {Object} kontext
 * Enthält pool, maxGen und timerAnzeige.
 *
 * @param {string} modus
 * Kennung des gewählten Spielmodus.
 *
 * @returns {Object}
 * Spielsitzung mit root, pause, resume und dispose.
 */
function erstelleAttackenModus(kontext, modus) {

    // ====================================
    // 1. SPIELMODUS ERKENNEN
    // ====================================

    const { pool, maxGen, timerAnzeige } = kontext;

    const uebersetzung = [
        "attacke-de-en",
        "attacke-en-de"
    ].includes(modus);

    const werLernt = modus.startsWith("attacke-wer");

    const reihenfolge = modus.endsWith("-reihe");

    // Bei welchen Modi wählt man eine Attacke
    // statt eines Pokémon als Übungsziel?
    const zielIstAttacke = uebersetzung || werLernt;

    const listeId =
        `attacken-trainingsliste-${++attackenModusZaehler}`;


    // ====================================
    // 2. HTML ERZEUGEN
    // ====================================

    const root = document.createElement("div");
    root.className = "frage-karte";

    root.innerHTML = `
        <p class="lade-info" role="status">
            Attackendaten werden geladen …
        </p>

        <!-- SPIELEINSTELLUNGEN -->

        <div class="einstellungen quiz-einstellungen" hidden>

            <h3>Spiel einstellen</h3>

            <label>
                Schwierigkeit:

                <select class="schwierigkeit">
                    <option value="normal">
                        Normal
                    </option>

                    <option value="hardcore">
                        Hardcore
                    </option>
                </select>
            </label>

            <label class="uebung-label">

                <input class="uebung-aktiv"
                       type="checkbox">

                Übungsmodus – gezielte Aufgabe wählen
            </label>

            <div class="uebungs-auswahl" hidden>

                <label class="uebungs-beschriftung"
                       for="${listeId}-eingabe"></label>

                <input class="uebungs-eingabe"
                       id="${listeId}-eingabe"
                       list="${listeId}"
                       type="text"
                       autocomplete="off"
                       spellcheck="false"
                       placeholder="Namen eingeben oder auswählen …">

                <datalist id="${listeId}"></datalist>

                <p class="hinweis">
                    Du kannst den deutschen oder
                    englischen Namen eingeben.
                </p>
            </div>

            <p class="meldung einstellungs-meldung"
               role="status"></p>

            <button class="spiel-start" type="button">
                Spiel starten
            </button>
        </div>


        <!-- EIGENTLICHES SPIEL -->

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

                <button type="submit">
                    Prüfen
                </button>
            </form>

            <p class="meldung" role="status"></p>

            <div class="dex-grid antwort-raster"></div>

            <div class="aktionen">

                <button class="aufgeben" type="button">
                    Aufgeben / Lösung anzeigen
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


    // ====================================
    // 3. HTML-ELEMENTE SPEICHERN
    // ====================================

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

    const uebungBeschriftung =
        root.querySelector(".uebungs-beschriftung");

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

    const antwortFormular =
        root.querySelector(".antwort-form");

    const eingabe =
        root.querySelector(".namen-eingabe");

    const meldung =
        spiel.querySelector(".meldung");

    const raster =
        root.querySelector(".antwort-raster");

    const aufgebenButton =
        root.querySelector(".aufgeben");

    const neuButton =
        root.querySelector(".neu");

    const naechstesButton =
        root.querySelector(".naechstes");


    // ====================================
    // 4. TIMER UND SPIELZUSTAND
    // ====================================

    const timer = erstelleStoppuhr(timerAnzeige);

    let daten = null;
    let lernsets = null;
    let maschinen = new Map();

    let gruppenId = null;
    let methode = "alle";

    let spielBereit = false;
    let spielLaeuft = false;

    let beendet = false;
    let gesperrt = false;
    let pausiert = false;
    let entsorgt = false;

    let weiterTimer = null;
    let wartetAufNaechsteFrage = false;

    // Im Übungsmodus das gezielt gewählte Pokémon
    // beziehungsweise die gezielt gewählte Attacke.
    let trainingsZiel = null;

    // Speichert die Aufgabe für Hardcore-Neustarts.
    let letzteAufgabe = null;

    let ziele = [];
    let aktuelleFrage = null;

    let position = 0;

    let gefunden = new Set();
    let aufgegeben = new Set();


    // Zwischenspeicher für häufig benötigte Lernsets
    const lernsetCache = new Map();
    const kandidatenCache = new Map();


    // ====================================
    // 5. ÜBUNGSAUSWAHL ERSTELLEN
    // ====================================

    /**
     * Erstellt die Vorschlagsliste für den Übungsmodus.
     *
     * @returns {void}
     */
    function baueUebungsListe() {

        uebungListe.replaceChildren();

        const kandidaten = zielIstAttacke

            ? daten.attacken.filter(
                attacke => attacke.gen <= maxGen
            )

            : pool;

        const fragment =
            document.createDocumentFragment();

        for (const kandidat of kandidaten) {

            const option = document.createElement("option");

            option.value = kandidat.de;

            option.label = zielIstAttacke

                ? `${kandidat.en} · Attacke #${kandidat.id}`

                : `${kandidat.en} · Pokédex #${kandidat.id}`;

            fragment.appendChild(option);
        }

        uebungListe.appendChild(fragment);
    }


    // ====================================
    // 6. AUSGEWÄHLTES ÜBUNGSZIEL FINDEN
    // ====================================

    /**
     * Sucht das vom Spieler gewählte Pokémon
     * oder die gewählte Attacke.
     *
     * @returns {Object|null}
     * Eindeutiger Treffer oder null.
     */
    function holeTrainingsZiel() {

        const name = normalisiere(
            uebungEingabe.value
        );

        if (!name) return null;

        const kandidaten = zielIstAttacke

            ? daten.attacken.filter(
                attacke => attacke.gen <= maxGen
            )

            : pool;

        const treffer = kandidaten.filter(kandidat =>

            normalisiere(kandidat.de) === name

            ||

            normalisiere(kandidat.en) === name

            ||

            String(kandidat.id) ===
                uebungEingabe.value.trim()
        );

        // Nur eindeutige Treffer akzeptieren.
        return treffer.length === 1
            ? treffer[0]
            : null;
    }


    // ====================================
    // 7. EINSTELLUNGEN ÖFFNEN
    // ====================================

    /**
     * Öffnet die Konfiguration und pausiert das Spiel.
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


    // ====================================
    // 8. SPIEL MIT EINSTELLUNGEN STARTEN
    // ====================================

    /**
     * Übernimmt Schwierigkeit und Trainingsziel.
     *
     * @returns {void}
     */
    function spieleMitEinstellungen() {

        if (!spielBereit) return;

        trainingsZiel = null;

        if (uebungAktiv.checked) {

            trainingsZiel = holeTrainingsZiel();

            if (!trainingsZiel) {

                einstellungsMeldung.textContent =
                    "Bitte wähle einen eindeutigen Pokémon- " +
                    "bzw. Attackennamen aus der Liste.";

                return;
            }
        }

        einstellungen.hidden = true;
        spiel.hidden = false;

        spielLaeuft = true;

        laufendeEinstellungen.textContent =

            (
                schwierigkeit.value === "hardcore"
                    ? "Hardcore"
                    : "Normal"
            )

            +

            (
                trainingsZiel
                    ? ` · Übung: ${trainingsZiel.de}`
                    : " · Zufallsmodus"
            );

        neueRunde(true);
    }


    // ====================================
    // 9. ATTACKEN EINES POKÉMON SUCHEN
    // ====================================

    /**
     * Liefert die gültigen Attacken in der Edition
     * und verwendet einen Zwischenspeicher.
     *
     * @param {Object} pokemon - Pokémon
     * @returns {Object[]} Attacken mit Lernlevel
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


    // ====================================
    // 10. ATTACKE -> POKÉMON-ZUORDNUNG
    // ====================================

    /**
     * Ordnet jeder Attacke alle Pokémon zu,
     * die diese in der gewählten Edition lernen.
     *
     * @returns {Map<number, Object[]>}
     * Attacken-ID -> Pokémon-Array
     */
    function werLerntWelcheAttacke() {

        const key =
            `${gruppenId}:${methode}`;

        if (kandidatenCache.has(key)) {
            return kandidatenCache.get(key);
        }

        const zuordnung = new Map();

        for (const pokemon of pool) {

            for (const attacke of attackenVon(pokemon)) {

                if (!zuordnung.has(attacke.id)) {
                    zuordnung.set(attacke.id, []);
                }

                zuordnung.get(attacke.id).push(pokemon);
            }
        }

        kandidatenCache.set(key, zuordnung);

        return zuordnung;
    }


    // ====================================
    // 11. ANTWORTEN SORTIEREN
    // ====================================

    /**
     * Sortiert die Antworten für den Reihenfolge-Modus.
     *
     * @returns {void}
     */
    function sortiereZiele() {

        if (!reihenfolge) return;

        if (werLernt) {

            // Pokémon nach Nationaldex-Nummer
            ziele.sort((a, b) => a.id - b.id);

        } else if (methode === "level") {

            // Attacken nach Lernlevel
            ziele.sort((a, b) =>

                a.level - b.level ||

                a.reihenfolge - b.reihenfolge ||

                a.id - b.id
            );

        } else {

            // Andere Lernmethoden alphabetisch
            ziele.sort((a, b) =>
                a.de.localeCompare(b.de, "de")
            );
        }
    }


    // ====================================
    // 12. NÄCHSTE OFFENE ANTWORT
    // ====================================

    /**
     * Findet die nächste noch nicht erratene Antwort.
     *
     * @returns {Object|undefined}
     */
    function naechstesZiel() {

        return ziele.find(ziel =>
            !gefunden.has(ziel.id)
        );
    }


    // ====================================
    // 13. ERGEBNISRASTER ZEICHNEN
    // ====================================

    /**
     * Zeigt Fragezeichen, gefundene und aufgegebene
     * Antworten sowie die Lernlevel.
     *
     * @returns {void}
     */
    function zeichneRaster() {

        raster.replaceChildren();

        const fragment =
            document.createDocumentFragment();

        const erwartet = naechstesZiel();

        for (const ziel of ziele) {

            const karte = document.createElement("div");
            karte.className = "pokemon-karte";

            const inhalt = document.createElement("div");
            inhalt.className = "karten-inhalt";

            const richtig = gefunden.has(ziel.id);

            const offengelegt =
                aufgegeben.has(ziel.id);


            // --------------------------------
            // Gefundenes Pokémon oder Attacke
            // --------------------------------

            if (richtig || offengelegt) {

                karte.classList.add(
                    richtig ? "gefunden" : "aufgedeckt"
                );

                if (werLernt) {

                    const bild = pokemonBild(ziel);
                    bild.className = "mini-bild";

                    inhalt.appendChild(bild);
                }

                const text = document.createElement("span");
                text.className = "mini-name";
                text.textContent = ziel.de;

                inhalt.appendChild(text);

            } else {

                // Noch unbekannte Antwort
                const text = document.createElement("span");
                text.className = "fragezeichen";
                text.textContent = "?";

                inhalt.appendChild(text);
            }


            // --------------------------------
            // Lernlevel zusätzlich anzeigen
            // --------------------------------

            if (!werLernt && methode === "level") {

                const level =
                    document.createElement("span");

                level.className = "zeit-etikett";

                level.textContent =
                    ziel.level === 0

                        ? "Start / Level 0"

                        : `Level ${ziel.level}`;

                inhalt.appendChild(level);
            }


            // --------------------------------
            // Aktuell gesuchte Antwort markieren
            // --------------------------------

            if (
                reihenfolge &&
                !richtig &&
                !offengelegt &&
                !beendet
            ) {

                const istAktuell =
                    !werLernt && methode === "level"

                        ? ziel.level === erwartet?.level

                        : ziel.id === erwartet?.id;

                karte.classList.toggle(
                    "aktuell",
                    istAktuell
                );
            }

            karte.appendChild(inhalt);

            fragment.appendChild(karte);
        }

        raster.appendChild(fragment);

        meldung.dataset.fortschritt =
            `${gefunden.size} / ${ziele.length}`;
    }


    // ====================================
    // 14. AKTUELLE FRAGE ANZEIGEN
    // ====================================

    /**
     * Zeigt Übersetzung, Attacke oder Pokémon
     * abhängig vom ausgewählten Spielmodus.
     *
     * @returns {void}
     */
    function zeigeFrage() {

        wartetAufNaechsteFrage = false;


        // --------------------------------
        // Attackennamen übersetzen
        // --------------------------------

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


        // --------------------------------
        // Welche Pokémon lernen Attacke X?
        // --------------------------------

        } else if (werLernt) {

            frage.hidden = false;
            pokemonFrage.hidden = true;

            frage.textContent =
                `Welche Pokémon lernen ${aktuelleFrage.de}?`;

            fortschritt.textContent = reihenfolge

                ? "Nationaldex-Reihenfolge"

                : "Passende Pokémon frei erraten";

            zeichneRaster();


        // --------------------------------
        // Welche Attacken lernt Pokémon Y?
        // --------------------------------

        } else {

            frage.hidden = true;
            pokemonFrage.hidden = false;

            const bild =
                pokemonFrage.querySelector("img");

            bild.onerror = () => {

                bild.onerror = null;

                bild.src = bildAdresse(aktuelleFrage);
            };

            bild.src =
                bildAdresse(aktuelleFrage, true);

            bild.alt = aktuelleFrage.de;

            pokemonFrage.querySelector(
                ".pokemon-name"
            ).textContent = aktuelleFrage.de;

            fortschritt.textContent = reihenfolge

                ? methode === "level"

                    ? "Nach Lernlevel; auf gleichem Level frei wählbar"

                    : "Alphabetische Reihenfolge (Deutsch)"

                : "Attacken frei erraten";

            zeichneRaster();
        }

        gesperrt = false;

        eingabe.disabled = false;
        eingabe.value = "";

        aufgebenButton.disabled = false;

        if (root.isConnected && !pausiert) {
            eingabe.focus();
        }
    }


    // ====================================
    // 15. RUNDE STARTEN ODER ZURÜCKSETZEN
    // ====================================

    /**
     * Startet eine neue Runde.
     *
     * @param {boolean} neueAufgabe
     * true  = neue Zufallsaufgabe
     * false = gleiche Aufgabe erneut
     *
     * @param {string} grund
     * Optionale Meldung nach dem Zurücksetzen.
     *
     * @returns {void}
     */
    function neueRunde(neueAufgabe = true, grund = "") {

        if (!spielBereit || !spielLaeuft) return;

        clearTimeout(weiterTimer);
        weiterTimer = null;

        wartetAufNaechsteFrage = false;

        gefunden = new Set();
        aufgegeben = new Set();

        position = 0;

        beendet = false;
        gesperrt = false;

        aufgebenButton.disabled = false;
        naechstesButton.hidden = true;

        ziele = [];
        aktuelleFrage = null;


        // --------------------------------
        // A. ÜBERSETZUNGSQUIZ
        // --------------------------------

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
                            attacke => attacke.gen <= maxGen
                        )
                    );

                letzteAufgabe = {
                    liste: [...ziele]
                };
            }


        // --------------------------------
        // B. WER LERNT DIESE ATTACKE?
        // --------------------------------

        } else if (werLernt) {

            const zuordnung = werLerntWelcheAttacke();

            const ids = [...zuordnung.keys()];

            const id = trainingsZiel?.id ?? (

                !neueAufgabe &&
                letzteAufgabe?.id != null

                    ? letzteAufgabe.id

                    : ids[
                        Math.floor(Math.random() * ids.length)
                    ]
            );

            aktuelleFrage = daten.nachId.get(id);

            ziele = [
                ...(zuordnung.get(id) || [])
            ];

            letzteAufgabe = { id };


        // --------------------------------
        // C. ATTACKEN EINES POKÉMON
        // --------------------------------

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
                            Math.random() * kandidaten.length
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


        // --------------------------------
        // D. KEINE PASSENDEN DATEN
        // --------------------------------

        if (
            !ziele.length ||
            (!uebersetzung && !aktuelleFrage)
        ) {

            beendet = true;
            timer.stop();

            eingabe.disabled = true;
            aufgebenButton.disabled = true;

            frage.textContent = "Keine passenden Antworten";
            frage.hidden = false;
            pokemonFrage.hidden = true;

            raster.replaceChildren();

            meldung.textContent =
                "Für dieses Übungsziel gibt es in der gewählten " +
                "Edition und Lernmethode keine Einträge. " +
                "Ändere die Edition/Lernmethode oder deine Übungsauswahl.";

            return;
        }


        // --------------------------------
        // E. SORTIEREN UND TIMER STARTEN
        // --------------------------------

        sortiereZiele();

        timer.start();

        if (pausiert) {
            timer.pause();
        }

        zeigeFrage();

        meldung.textContent = grund;
    }


    // ====================================
    // 16. RUNDE BEENDEN
    // ====================================

    /**
     * Stoppt die Runde und zeigt die Statistik.
     *
     * @returns {void}
     */
    function beendeRunde() {

        beendet = true;
        gesperrt = true;

        timer.stop();

        eingabe.disabled = true;
        aufgebenButton.disabled = true;

        naechstesButton.hidden = false;

        naechstesButton.textContent = trainingsZiel

            ? "Dieselbe Aufgabe wiederholen"

            : "Neue Aufgabe";

        meldung.textContent =
            `Richtig: ${gefunden.size} / ${ziele.length}`

            +

            (
                aufgegeben.size
                    ? ` · Aufgedeckt: ${aufgegeben.size}`
                    : ""
            );

        if (uebersetzung) {

            frage.textContent = "Runde abgeschlossen!";

            fortschritt.textContent =
                `${ziele.length} / ${ziele.length}`;
        }
    }


    // ====================================
    // 17. ÜBERSETZUNGSFRAGE BEENDEN
    // ====================================

    /**
     * Beendet eine einzelne Übersetzungsfrage.
     *
     * @param {boolean} richtig - Richtige Antwort?
     * @returns {void}
     */
    function beendeUebersetzungsFrage(richtig) {

        if (beendet || gesperrt) return;

        const attacke = ziele[position];

        const loesung =
            modus === "attacke-de-en"

                ? attacke.en

                : attacke.de;

        gesperrt = true;

        eingabe.disabled = true;
        aufgebenButton.disabled = true;

        if (richtig) {

            gefunden.add(attacke.id);

        } else {

            aufgegeben.add(attacke.id);
        }

        meldung.textContent =
            `${richtig ? "Richtig" : "Lösung"}: ${loesung}`;

        position++;

        if (position >= ziele.length) {
            timer.stop();
        }

        wartetAufNaechsteFrage = true;

        weiterTimer = setTimeout(() => {

            weiterTimer = null;

            if (!pausiert) {
                zeigeFrage();
            }

        }, richtig ? 700 : 1700);
    }


    // ====================================
    // 18. ANTWORT PRÜFEN
    // ====================================

    /**
     * Prüft die eingegebene Antwort.
     *
     * @param {boolean} bestaetigt
     * false = automatische Prüfung beim Tippen
     * true  = Enter oder Prüfen gedrückt
     *
     * @returns {void}
     */
    function pruefeAntwort(bestaetigt = false) {

        if (
            !spielBereit ||
            !spielLaeuft ||
            beendet ||
            gesperrt ||
            eingabe.disabled ||
            pausiert
        ) {
            return;
        }

        const name = normalisiere(eingabe.value);

        if (!name) {

            if (bestaetigt) {

                meldung.textContent =
                    "Bitte eine Antwort eingeben.";
            }

            return;
        }


        // --------------------------------
        // A. ATTACKEN ÜBERSETZEN
        // --------------------------------

        if (uebersetzung) {

            const attacke = ziele[position];

            const korrekt = normalisiere(

                modus === "attacke-de-en"

                    ? attacke.en

                    : attacke.de

            ) === name;

            if (korrekt) {

                beendeUebersetzungsFrage(true);

            } else if (bestaetigt) {

                falscheAntwort();
            }

            return;
        }


        // --------------------------------
        // B. ATTACKEN ODER POKÉMON SUCHEN
        // --------------------------------

        const treffer = werLernt

            ? sucheNamen(pool, eingabe.value)

            : daten.attacken.filter(attacke =>

                normalisiere(attacke.de) === name

                ||

                normalisiere(attacke.en) === name
            );


        // WICHTIG:
        // Die vollständigen Antwortobjekte aus "ziele"
        // enthalten die tatsächlichen Lernlevel.
        const passende = ziele.filter(ziel =>

            !gefunden.has(ziel.id)

            &&

            treffer.some(trefferElement =>
                trefferElement.id === ziel.id
            )
        );


        // --------------------------------
        // C. REIHENFOLGE ÜBERPRÜFEN
        // --------------------------------

        let erlaubte = passende;

        if (reihenfolge) {

            const erwartet = naechstesZiel();

            erlaubte = passende.filter(antwort =>

                !werLernt && methode === "level"

                    ? antwort.level === erwartet?.level

                    : antwort.id === erwartet?.id
            );
        }


        // --------------------------------
        // D. ANTWORT NICHT PASSEND
        // --------------------------------

        if (!erlaubte.length) {

            // Solange der Spieler tippt, nichts zurücksetzen.
            if (bestaetigt) {

                const hinweis =
                    !werLernt &&
                    reihenfolge &&
                    methode === "level" &&
                    passende.length

                        ? "Die Attacke ist lernbar, aber erst " +
                          "auf einem anderen Lernlevel."

                        : "Antwort nicht passend, bereits gefunden " +
                          "oder nicht an der Reihe.";

                falscheAntwort(hinweis);
            }

            return;
        }


        // --------------------------------
        // E. RICHTIGE ANTWORTEN AUFDECKEN
        // --------------------------------

        for (const antwort of erlaubte) {

            gefunden.add(antwort.id);
        }

        eingabe.value = "";

        meldung.textContent =
            `Richtig: ${erlaubte.map(
                antwort => antwort.de
            ).join(", ")}`;

        zeichneRaster();

        if (gefunden.size === ziele.length) {

            beendeRunde();

        } else {

            eingabe.focus();
        }
    }


    // ====================================
    // 19. FALSCHE ANTWORT VERARBEITEN
    // ====================================

    /**
     * Normal: Zeigt einen Fehlerhinweis.
     *
     * Hardcore: Setzt die aktuelle Runde zurück,
     * ohne ein anderes Pokémon auszulosen.
     *
     * @param {string} hinweis - Fehlertext
     * @returns {void}
     */
    function falscheAntwort(
        hinweis = "Leider falsch. Versuche es erneut."
    ) {

        if (schwierigkeit.value === "hardcore") {

            // false = dieselbe Aufgabe behalten
            neueRunde(

                false,

                "Hardcore: Falsche Antwort – " +
                "Fortschritt zurückgesetzt!"
            );

        } else {

            meldung.textContent = hinweis;
        }
    }


    // ====================================
    // 20. AUFGEBEN
    // ====================================

    /**
     * Zeigt die fehlenden Antworten.
     *
     * @returns {void}
     */
    function aufloesen() {

        if (beendet || gesperrt) return;

        if (uebersetzung) {

            // Nur aktuelle Übersetzungsfrage aufgeben
            beendeUebersetzungsFrage(false);
            return;
        }

        for (const ziel of ziele) {

            if (!gefunden.has(ziel.id)) {

                aufgegeben.add(ziel.id);
            }
        }

        zeichneRaster();

        beendeRunde();
    }


    // ====================================
    // 21. ATTACKENDATEN LADEN
    // ====================================

    /**
     * Lädt Attackendaten und aktiviert die Einstellungen.
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


                // --------------------------------
                // EDITIONEN AUFBAUEN
                // --------------------------------

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

                gruppenId = gruppen.at(-1)?.id ?? null;

                edition.value =
                    String(gruppenId ?? "");


                // --------------------------------
                // LERNMETHODEN AUFBAUEN
                // --------------------------------

                for (const filter of ATTACKEN_METHODEN) {

                    const option =
                        document.createElement("option");

                    option.value = filter.id;
                    option.textContent = filter.name;

                    methodeAuswahl.appendChild(option);
                }

                methode =
                    reihenfolge && !werLernt

                        ? "level"

                        : "alle";

                methodeAuswahl.value = methode;
            }


            // --------------------------------
            // ÜBUNGSAUSWAHL VORBEREITEN
            // --------------------------------

            uebungBeschriftung.textContent =
                zielIstAttacke

                    ? "Welche Attacke möchtest du üben?"

                    : "Welches Pokémon möchtest du üben?";

            spielBereit = true;

            ladeInfo.hidden = true;

            // Zuerst Normal/Hardcore/Übung auswählen
            einstellungen.hidden = false;

        } catch (fehler) {

            if (entsorgt) return;

            ladeInfo.textContent =
                "Attackendaten konnten nicht geladen werden: " +
                fehler.message;

            console.error(fehler);
        }
    }


    // ====================================
    // 22. EVENT-LISTENER
    // ====================================

    // Übungsmodus an- oder ausschalten
    uebungAktiv.addEventListener("change", () => {

        uebungAuswahl.hidden =
            !uebungAktiv.checked;

        einstellungsMeldung.textContent = "";

        // Vorschläge erst erstellen, wenn sie benötigt werden
        if (
            uebungAktiv.checked &&
            !uebungListe.childElementCount
        ) {

            baueUebungsListe();
        }
    });


    // Spiel starten
    root.querySelector(".spiel-start").addEventListener(
        "click",
        spieleMitEinstellungen
    );


    // Einstellungen erneut öffnen
    root.querySelector(
        ".einstellungen-oeffnen"
    ).addEventListener(
        "click",
        oeffneEinstellungen
    );


    // Richtige Antworten beim Tippen erkennen
    eingabe.addEventListener("input", () => {

        pruefeAntwort(false);
    });


    // Enter oder Prüfen-Button
    antwortFormular.addEventListener("submit", event => {

        event.preventDefault();

        pruefeAntwort(true);
    });


    // Aufgeben
    aufgebenButton.addEventListener(
        "click",
        aufloesen
    );


    // Neue Runde
    neuButton.addEventListener("click", () => {

        neueRunde(true);
    });


    // Neue Aufgabe / dieselbe Übung wiederholen
    naechstesButton.addEventListener("click", () => {

        neueRunde(true);
    });


    // Edition wechseln
    edition.addEventListener("change", () => {

        gruppenId = Number(edition.value);

        neueRunde(true);
    });


    // Lernmethode wechseln
    methodeAuswahl.addEventListener("change", () => {

        methode = methodeAuswahl.value;

        neueRunde(true);
    });


    // ====================================
    // 23. INITIALISIEREN
    // ====================================

    initialisieren();


    // ====================================
    // 24. SPIELSTEUERUNG ZURÜCKGEBEN
    // ====================================

    return {

        root,

        pause() {

            pausiert = true;

            timer.pause();

            if (weiterTimer !== null) {

                clearTimeout(weiterTimer);

                weiterTimer = null;
            }
        },

        resume() {

            pausiert = false;

            if (wartetAufNaechsteFrage) {

                zeigeFrage();
            }

            // Während der Einstellungen keine Zeit zählen
            if (
                spielLaeuft &&
                !beendet &&
                !einstellungen.hidden
            ) {

                timer.pause();

            } else if (
                spielLaeuft &&
                !beendet
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
