
/* =====================================================
   ATTACKENQUIZ – ZUFALL, ÜBUNG, NORMAL UND HARDCORE

   Eine Attacke aufdecken:
   - bei "Welche Attacken lernt dieses Pokémon?"
   - im normalen Zufallsmodus und Übungsmodus
   - frei: zufällige fehlende Attacke
   - Reihenfolge: nächste fehlende Attacke
   - zählt nicht als richtige Antwort
   - löst keinen Hardcore-Neustart aus
   ===================================================== */

let attackenModusZaehler = 0;


/**
 * Erstellt eines der sechs Attackenquizze.
 *
 * @param {Object} kontext
 * Enthält pool, maxGen und timerAnzeige.
 *
 * @param {string} modus
 * Kennung des Spielmodus aus app.js.
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

    // Diese beiden Modi bekommen den Hinweis-Button.
    const attackenRaten = !uebersetzung && !werLernt;

    const zielIstAttacke = uebersetzung || werLernt;

    const listenId =
        `attacken-uebung-${++attackenModusZaehler}`;


    // ====================================
    // 2. HTML ERSTELLEN
    // ====================================

    const root = document.createElement("div");
    root.className = "frage-karte";

    root.innerHTML = `
        <p class="lade-info" role="status">
            Attackendaten werden geladen …
        </p>

        <!-- SPIELEINSTELLUNGEN -->

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

                <datalist id="${listenId}-vorschlaege">
                </datalist>

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

                ${attackenRaten ? `
                    <button class="einzelhinweis sekundaer"
                            type="button">
                        Eine Attacke aufdecken
                    </button>
                ` : ""}

                <button class="aufgeben" type="button">
                    Aufgeben / alle Lösungen
                </button>

                <button class="neu sekundaer"
                        type="button">
                    Neue Runde
                </button>

                <button class="naechstes"
                        type="button"
                        hidden>
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


    // ====================================
    // 4. TIMER UND SPIELZUSTAND
    // ====================================

    const timer = erstelleStoppuhr(timerAnzeige);

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

    // Richtig erratene Antworten
    let gefunden = new Set();

    // Mit Hilfe oder Aufgeben aufgedeckte Antworten
    let aufgedeckt = new Set();

    // Zwischenspeicher für die Lernsets
    const lernsetCache = new Map();

    const zuordnungCache = new Map();


    // ====================================
    // 5. ÜBUNGSLISTE AUFBAUEN
    // ====================================

    /**
     * Erstellt Namensvorschläge für den Übungsmodus.
     *
     * Bei Übersetzungen und "Wer lernt X?"
     * werden Attacken angeboten.
     *
     * Bei "Welche Attacken lernt Y?"
     * werden Pokémon angeboten.
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

            const option = document.createElement("option");

            option.value = kandidat.de;

            option.label =
                `${kandidat.en} · #${kandidat.id}`;

            fragment.appendChild(option);
        }

        uebungListe.appendChild(fragment);
    }


    // ====================================
    // 6. TRAININGSZIEL FINDEN
    // ====================================

    /**
     * Sucht das gewählte Pokémon bzw. die Attacke.
     *
     * @returns {Object|null}
     * Eindeutiger Treffer oder null.
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

            normalisiere(kandidat.de) === eingegeben

            ||

            normalisiere(kandidat.en) === eingegeben

            ||

            String(kandidat.id) ===
                uebungEingabe.value.trim()
        );

        return passende.length === 1
            ? passende[0]
            : null;
    }


    // ====================================
    // 7. EINSTELLUNGEN ÖFFNEN
    // ====================================

    /**
     * Öffnet die Spieleinstellungen und pausiert.
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
    // 8. SPIEL STARTEN
    // ====================================

    /**
     * Übernimmt Schwierigkeit und Trainingsziel.
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

            (
                schwierigkeit.value === "hardcore"
                    ? "Hardcore"
                    : "Normal"
            )

            + " · " +

            (
                trainingsZiel
                    ? `Übung: ${trainingsZiel.de}`
                    : "Zufallsmodus"
            );

        neueRunde(true);
    }


    // ====================================
    // 9. ATTACKEN EINES POKÉMON
    // ====================================

    /**
     * Liefert alle Attacken eines Pokémon für die
     * ausgewählte Edition und Lernmethode.
     *
     * @param {Object} pokemon - Pokémon-Objekt
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


    // ====================================
    // 10. POKÉMON NACH ATTACKE GRUPPIEREN
    // ====================================

    /**
     * Ermittelt, welche Pokémon eine Attacke lernen.
     *
     * @returns {Map<number, Object[]>}
     * Attacken-ID -> Liste mit Pokémon.
     */
    function pokemonNachAttacke() {

        const key = `${gruppenId}:${methode}`;

        if (zuordnungCache.has(key)) {

            return zuordnungCache.get(key);
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

        zuordnungCache.set(key, zuordnung);

        return zuordnung;
    }


    // ====================================
    // 11. ANTWORTEN SORTIEREN
    // ====================================

    /**
     * Sortiert nach Nationaldex, Lernlevel
     * oder deutschem Attackennamen.
     *
     * @returns {void}
     */
    function sortiereZiele() {

        if (!reihenfolge) return;

        if (werLernt) {

            ziele.sort((a, b) => a.id - b.id);

        } else if (methode === "level") {

            ziele.sort((a, b) =>

                a.level - b.level

                ||

                a.reihenfolge - b.reihenfolge

                ||

                a.id - b.id
            );

        } else {

            ziele.sort((a, b) =>
                a.de.localeCompare(b.de, "de")
            );
        }
    }


    // ====================================
    // 12. NOCH FEHLENDE ANTWORTEN
    // ====================================

    /**
     * Liefert Antworten, die weder richtig erraten
     * noch durch Hilfe aufgedeckt wurden.
     *
     * @returns {Object[]} Noch fehlende Antworten
     */
    function fehlendeZiele() {

        return ziele.filter(ziel =>

            !gefunden.has(ziel.id)

            &&

            !aufgedeckt.has(ziel.id)
        );
    }


    // ====================================
    // 13. NÄCHSTE ANTWORT
    // ====================================

    /**
     * Liefert die nächste offene Antwort.
     *
     * Aufgedeckte Attacken werden übersprungen.
     *
     * @returns {Object|undefined}
     */
    function naechstesZiel() {

        return fehlendeZiele()[0];
    }


    // ====================================
    // 14. ANTWORTKARTEN ZEICHNEN
    // ====================================

    /**
     * Zeichnet Fragezeichen, gefundene und
     * aufgedeckte Antworten.
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

            const hilfe = aufgedeckt.has(ziel.id);


            // --------------------------------
            // A. Bereits bekannte Antwort
            // --------------------------------

            if (richtig || hilfe) {

                karte.classList.add(
                    richtig
                        ? "gefunden"
                        : "aufgedeckt"
                );

                if (werLernt) {

                    const bild = pokemonBild(ziel);
                    bild.className = "mini-bild";

                    inhalt.appendChild(bild);
                }

                const name = document.createElement("span");

                name.className = "mini-name";
                name.textContent = ziel.de;

                inhalt.appendChild(name);

            } else {

                // --------------------------------
                // B. Unbekannte Antwort
                // --------------------------------

                const unbekannt =
                    document.createElement("span");

                unbekannt.className = "fragezeichen";
                unbekannt.textContent = "?";

                inhalt.appendChild(unbekannt);
            }


            // --------------------------------
            // C. Lernlevel anzeigen
            // --------------------------------

            if (
                attackenRaten &&
                methode === "level"
            ) {

                const lernlevel =
                    document.createElement("span");

                lernlevel.className = "zeit-etikett";

                lernlevel.textContent =
                    ziel.level === 0

                        ? "Start / Level 0"

                        : `Level ${ziel.level}`;

                inhalt.appendChild(lernlevel);
            }


            // --------------------------------
            // D. Aktuelle Antwort markieren
            // --------------------------------

            if (
                reihenfolge &&
                !richtig &&
                !hilfe &&
                !beendet
            ) {

                const istAktuell =
                    attackenRaten &&
                    methode === "level"

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


        // Gefundene und aufgedeckte getrennt zählen
        meldung.dataset.fortschritt =

            `${gefunden.size} richtig · ` +
            `${aufgedeckt.size} aufgedeckt / ` +
            `${ziele.length}`;
    }


    // ====================================
    // 15. FRAGE ANZEIGEN
    // ====================================

    /**
     * Zeigt die aktuelle Aufgabe.
     *
     * @returns {void}
     */
    function zeigeFrage() {

        wartet = false;


        // --------------------------------
        // A. ÜBERSETZUNG
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
        // B. WELCHE POKÉMON LERNEN ATTACKE X?
        // --------------------------------

        } else if (werLernt) {

            frage.hidden = false;
            pokemonFrage.hidden = true;

            frage.textContent =
                `Welche Pokémon lernen ${aktuelleFrage.de}?`;

            fortschritt.textContent = reihenfolge

                ? "Nationaldex-Reihenfolge"

                : "Pokémon in beliebiger Reihenfolge";

            zeichneRaster();


        // --------------------------------
        // C. WELCHE ATTACKEN LERNT POKÉMON Y?
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

                    ? "Nach Lernlevel – gleicher Level frei wählbar"

                    : "Alphabetisch nach deutschem Attackennamen"

                : "Attacken in beliebiger Reihenfolge";

            zeichneRaster();
        }


        // --------------------------------
        // D. EINGABE FREIGEBEN
        // --------------------------------

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


    // ====================================
    // 16. NEUE RUNDE
    // ====================================

    /**
     * Startet entweder eine neue oder dieselbe Aufgabe.
     *
     * @param {boolean} neueAufgabe
     * true  = Neue Zufallsaufgabe
     * false = Dieselbe Aufgabe erneut
     *
     * @param {string} grund
     * Optionale Meldung nach einem Neustart.
     *
     * @returns {void}
     */
    function neueRunde(neueAufgabe = true, grund = "") {

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


        // --------------------------------
        // A. ATTACKEN ÜBERSETZEN
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
        // B. WER LERNT ATTACKE X?
        // --------------------------------

        } else if (werLernt) {

            const zuordnung = pokemonNachAttacke();

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

            aktuelleFrage = daten.nachId.get(id);

            ziele = [...(zuordnung.get(id) || [])];

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
        // D. KEINE PASSENDEN AUFGABEN
        // --------------------------------

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
                "Für diese Edition und Lernmethode gibt " +
                "es keine passenden Antworten. " +
                "Bitte die Auswahl ändern.";

            meldung.dataset.fortschritt = "";

            return;
        }


        // --------------------------------
        // E. SORTIEREN UND STARTEN
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
    // 17. RUNDE BEENDEN
    // ====================================

    /**
     * Stoppt die Runde und zeigt das Ergebnis.
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


    // ====================================
    // 18. ÜBERSETZUNGSFRAGE BEENDEN
    // ====================================

    /**
     * Schließt eine einzelne Übersetzungsfrage ab.
     *
     * @param {boolean} richtig
     * War die Antwort korrekt?
     *
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
            `${richtig ? "Richtig" : "Lösung"}: ${antwort}`;

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


    // ====================================
    // 19. ANTWORT PRÜFEN
    // ====================================

    /**
     * Prüft den eingegebenen Namen.
     *
     * @param {boolean} bestaetigt
     * false = Prüfung während des Tippens
     * true  = Enter oder Prüfen gedrückt
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

        const text = normalisiere(eingabe.value);

        if (!text) {

            if (bestaetigt) {

                meldung.textContent =
                    "Bitte eine Antwort eingeben.";
            }

            return;
        }


        // --------------------------------
        // A. ÜBERSETZUNG
        // --------------------------------

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


        // --------------------------------
        // B. NAMEN SUCHEN
        // --------------------------------

        const treffer = werLernt

            ? sucheNamen(pool, eingabe.value)

            : daten.attacken.filter(attacke =>

                normalisiere(attacke.de) === text

                ||

                normalisiere(attacke.en) === text
            );


        // --------------------------------
        // C. PASSENDE ANTWORTEN
        // --------------------------------

        /*
         * Wichtig:
         *
         * Wir suchen die erkannten IDs direkt
         * in "ziele".
         *
         * Dadurch enthalten die Treffer auch das
         * tatsächliche Lernlevel der Edition.
         */

        const passende = ziele.filter(ziel =>

            !gefunden.has(ziel.id)

            &&

            !aufgedeckt.has(ziel.id)

            &&

            treffer.some(trefferElement =>
                trefferElement.id === ziel.id
            )
        );


        // --------------------------------
        // D. REIHENFOLGE PRÜFEN
        // --------------------------------

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


        // --------------------------------
        // E. FALSCHE ANTWORT
        // --------------------------------

        if (!erlaubte.length) {

            // Erst bei Enter oder Prüfen reagieren.
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


        // --------------------------------
        // F. RICHTIGE ANTWORT
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


        // --------------------------------
        // G. RUNDENENDE PRÜFEN
        // --------------------------------

        if (fehlendeZiele().length === 0) {

            beendeRunde();

        } else {

            eingabe.focus();
        }
    }


    // ====================================
    // 20. FALSCHE ANTWORT VERARBEITEN
    // ====================================

    /**
     * Normal:
     * Zeigt eine Fehlermeldung.
     *
     * Hardcore:
     * Startet dieselbe Aufgabe von vorne.
     *
     * @param {string} hinweis - Fehlerbeschreibung
     * @returns {void}
     */
    function falscheAntwort(
        hinweis = "Leider falsch. Versuche es erneut."
    ) {

        if (schwierigkeit.value === "hardcore") {

            neueRunde(

                false,

                "Hardcore: Falsche Antwort – von vorne!"
            );

        } else {

            meldung.textContent = hinweis;
        }
    }


    // ====================================
    // 21. EINE ATTACKE AUFDECKEN
    // ====================================

    /**
     * Deckt genau eine noch fehlende Attacke auf.
     *
     * Freier Modus:
     * Eine zufällige fehlende Attacke.
     *
     * Reihenfolge:
     * Die nächste fehlende Attacke.
     *
     * Verfügbar im Zufalls- UND Übungsmodus.
     *
     * @returns {void}
     */
    function eineAttackeAufdecken() {

        if (
            !attackenRaten ||
            !spielLaeuft ||
            !bereit ||
            beendet ||
            gesperrt ||
            pausiert
        ) {

            return;
        }

        const fehlende = fehlendeZiele();

        if (!fehlende.length) {

            return;
        }

        let attacke;


        // --------------------------------
        // A. ATTACKE AUSWÄHLEN
        // --------------------------------

        if (reihenfolge) {

            // Nächste fehlende Attacke aufdecken
            attacke = fehlende[0];

        } else {

            // Zufällige fehlende Attacke aufdecken
            const zufall = Math.floor(
                Math.random() * fehlende.length
            );

            attacke = fehlende[zufall];
        }


        // --------------------------------
        // B. ALS HILFE SPEICHERN
        // --------------------------------

        // Nicht zu "gefunden" hinzufügen!
        aufgedeckt.add(attacke.id);


        // --------------------------------
        // C. RASTER AKTUALISIEREN
        // --------------------------------

        zeichneRaster();


        // --------------------------------
        // D. WEITERSPIELEN ODER BEENDEN
        // --------------------------------

        if (fehlendeZiele().length === 0) {

            beendeRunde();

            meldung.textContent +=
                ` Letzte Hilfe: ${attacke.de}.`;

        } else {

            meldung.textContent =
                `Hilfe: ${attacke.de} aufgedeckt. ` +
                "Weiter mit den übrigen Attacken!";

            eingabe.focus();
        }
    }


    // ====================================
    // 22. ALLE LÖSUNGEN AUFDECKEN
    // ====================================

    /**
     * Gibt die aktuelle Frage beziehungsweise
     * alle noch fehlenden Antworten auf.
     *
     * @returns {void}
     */
    function aufloesen() {

        if (beendet || gesperrt) return;

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


    // ====================================
    // 23. ATTACKENDATEN LADEN
    // ====================================

    /**
     * Lädt Attackendaten, Editionen und Lernmethoden.
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

                [lernsets, maschinen] = await Promise.all([

                    ladeLernsets(),

                    ladeMaschinen()
                ]);

                if (entsorgt) return;


                // --------------------------------
                // A. EDITIONEN
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
                // B. LERNMETHODEN
                // --------------------------------

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


            // --------------------------------
            // C. ÜBUNGSAUSWAHL
            // --------------------------------

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


    // ====================================
    // 24. EVENT-LISTENER
    // ====================================

    // Übungsmodus aktivieren/deaktivieren
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


    // Spiel starten
    root.querySelector(".spiel-start").addEventListener(

        "click",

        starteMitEinstellungen
    );


    // Einstellungen erneut öffnen
    root.querySelector(
        ".einstellungen-oeffnen"
    ).addEventListener(

        "click",

        oeffneEinstellungen
    );


    // Antwort beim Tippen prüfen
    eingabe.addEventListener("input", () => {

        pruefeAntwort(false);
    });


    // Enter oder Prüfen-Button
    formular.addEventListener("submit", event => {

        event.preventDefault();

        pruefeAntwort(true);
    });


    // NEU: Eine Attacke aufdecken
    if (hinweisButton) {

        hinweisButton.addEventListener(

            "click",

            eineAttackeAufdecken
        );
    }


    // Aufgeben
    aufgebenButton.addEventListener(

        "click",

        aufloesen
    );


    // Neue Runde
    neuButton.addEventListener("click", () => {

        neueRunde(true);
    });


    // Neue Aufgabe / Übung wiederholen
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
    // 25. SPIEL INITIALISIEREN
    // ====================================

    initialisieren();


    // ====================================
    // 26. SPIELSTEUERUNG ZURÜCKGEBEN
    // ====================================

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
