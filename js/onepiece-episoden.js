
/* =====================================================
   ONE PIECE – ZUSÄTZLICHE EPISODENDATEN

   Ergänzt die bestehende onepiece-daten.js

   Quelle:
   https://huggingface.co/datasets/
   yjg30737/onepiece-characters

   WICHTIG:
   "Fruit Debut" ist NICHT automatisch
   die erste namentliche Erwähnung.
   ===================================================== */


// =========================================
// 1. DATENQUELLE
// =========================================

const OP_EPISODEN_URL =
    "https://huggingface.co/datasets/" +
    "yjg30737/onepiece-characters/raw/main/data.json";

const OP_EPISODEN_CACHE = "op-episoden-v1";

const OP_EPISODEN_CACHE_DAUER =
    24 * 60 * 60 * 1000;


// Originale Ladefunktion aufheben
const opOriginalLadefunktion = ladeOnePieceDaten;

// Verhindert, dass mehrfach parallel geladen wird
let opErweiterterLadevorgang = null;


// =========================================
// 2. EPISODENNUMMER ERMITTELN
// =========================================

/**
 * Liest eine Anime-Episodennummer aus einem Text.
 *
 * Beispiel:
 * "Chapter 551; Episode 460" -> 460
 *
 * Reine Mangakapitel werden nicht akzeptiert.
 *
 * @param {string} text - Debütangabe
 * @returns {number|null} Episodennummer oder null
 */
function opLeseFolge(text) {

    if (typeof text !== "string") return null;

    // Nur Erwähnung, kein sichtbarer Auftritt
    if (/\bmentioned\b/i.test(text)) return null;

    const treffer = text.match(
        /\bEpisode\s*#?\s*(\d{1,4})\b/i
    );

    return treffer
        ? Number(treffer[1])
        : null;
}


// =========================================
// 3. NAMEN BEREINIGEN
// =========================================

/**
 * Extrahiert einen verwendbaren englischen Namen.
 *
 * Manche Datensätze enthalten mehrere Übersetzungen
 * und zusätzliche Hinweise in Klammern.
 *
 * @param {Object} eintrag - Externer Datensatz
 * @returns {string} Bereinigter Name
 */
function opEpisodenName(eintrag) {

    let name = eintrag["Official English Name"];

    if (
        typeof name !== "string" ||
        name.trim() === "N/A" ||
        !name.trim()
    ) {

        name = eintrag["Romanized Name"] || "";
    }

    return String(name)
        .split(";")[0]
        .replace(/\s*\([^)]*\)/g, "")
        .trim();
}


// =========================================
// 4. ZUSATZDATEN LADEN
// =========================================

/**
 * Lädt die Episodeninformationen und verwendet
 * einen lokalen Cache, sofern vorhanden.
 *
 * @returns {Promise<Object[]>} Externe Datensätze
 */
async function opLadeEpisodenQuelle() {

    // Lokalen Cache prüfen
    try {

        const gespeichert = JSON.parse(
            localStorage.getItem(OP_EPISODEN_CACHE)
        );

        if (
            gespeichert &&
            Date.now() - gespeichert.zeit <
                OP_EPISODEN_CACHE_DAUER &&
            Array.isArray(gespeichert.daten) &&
            gespeichert.daten.length > 100
        ) {

            return gespeichert.daten;
        }

    } catch {
        // Cache ist optional.
    }


    // Online-Daten holen
    const antwort = await fetch(OP_EPISODEN_URL);

    if (!antwort.ok) {
        throw new Error(
            `Episodenquelle: HTTP ${antwort.status}`
        );
    }

    const json = await antwort.json();

    if (!Array.isArray(json) || json.length < 100) {
        throw new Error(
            "Episoden-Datensatz ist leer oder ungültig."
        );
    }


    // Daten zwischenspeichern
    try {

        localStorage.setItem(
            OP_EPISODEN_CACHE,
            JSON.stringify({
                zeit: Date.now(),
                daten: json
            })
        );

    } catch {
        // Auch ohne Cache verwendbar.
    }

    return json;
}


// =========================================
// 5. CHARAKTERE ERWEITERN
// =========================================

/**
 * Ergänzt Charakterdebüts aus der zweiten Datenquelle.
 *
 * Figuren ohne eindeutige Anime-Folge bleiben im
 * episodenbegrenzten Modus ausgeschlossen.
 *
 * @param {Object[]} datensaetze - Externe Daten
 * @returns {number} Anzahl neu ergänzter Figuren
 */
function opErgaenzeCharaktere(datensaetze) {

    const vorhandene = new Map();

    // Bereits bekannte Figuren indexieren
    for (const figur of OP_CHARAKTERE) {

        for (const name of [
            figur.name,
            figur.en,
            ...(figur.alias || [])
        ]) {

            const schluessel = opNorm(name);

            if (schluessel && !vorhandene.has(schluessel)) {

                vorhandene.set(schluessel, figur);
            }
        }
    }

    let hinzugefuegt = 0;


    for (const eintrag of datensaetze) {

        // Charaktere besitzen ein "Debut"-Feld.
        // Gruppen und Teufelsfrüchte nicht aufnehmen.
        const debut = eintrag["Debut"];

        if (typeof debut !== "string") continue;

        const episode = opLeseFolge(debut);

        if (episode === null) continue;

        const name = opEpisodenName(eintrag);

        if (!name) continue;

        const schluessel = opNorm(name);

        if (!schluessel) continue;


        // ---------------------------------
        // A. Vorhandenen Charakter ergänzen
        // ---------------------------------

        if (vorhandene.has(schluessel)) {

            const figur = vorhandene.get(schluessel);

            // Bereits manuell geprüfte Folgen haben Vorrang.
            if (!Number.isInteger(figur.episode)) {

                figur.episode = episode;
            }

            continue;
        }


        // ---------------------------------
        // B. Neuen Charakter hinzufügen
        // ---------------------------------

        const figur = {

            id: `episoden:${schluessel}`,

            name,
            en: name,

            // Ohne weitere Belege keine späteren Aliasse
            alias: [],

            episode,

            // Unbekannte Werte nicht erfinden
            arc: null,
            alter: null,
            groesse: null,
            kopfgeld: null,
            fruchtId: null,

            bild: null,
            metadatenAktuell: false
        };

        OP_CHARAKTERE.push(figur);

        vorhandene.set(schluessel, figur);

        hinzugefuegt++;
    }

    return hinzugefuegt;
}


// =========================================
// 6. TEUFELSFRÜCHTE ERWEITERN
// =========================================

/**
 * Ergänzt Frucht-Debüt und erste Anwendung.
 *
 * Das Frucht-Debüt wird separat gespeichert.
 * Es wird NICHT als erste namentliche Erwähnung
 * verwendet.
 *
 * @param {Object[]} datensaetze - Externe Daten
 * @returns {Object} Statistik der Ergänzungen
 */
function opErgaenzeFruechte(datensaetze) {

    const vorhandene = new Map();

    for (const frucht of OP_FRUECHTE) {

        for (const name of [
            frucht.en,
            frucht.ja,
            ...(frucht.alias || [])
        ]) {

            const schluessel = opNorm(name);

            if (schluessel && !vorhandene.has(schluessel)) {

                vorhandene.set(schluessel, frucht);
            }
        }
    }

    let neu = 0;
    let anwendungen = 0;


    for (const eintrag of datensaetze) {

        const hatFruchtDaten =
            eintrag["Fruit Debut"] ||
            eintrag["Usage Debut"];

        if (!hatFruchtDaten) continue;


        const erstGezeigt = opLeseFolge(
            eintrag["Fruit Debut"]
        );

        const erstGenutzt = opLeseFolge(
            eintrag["Usage Debut"]
        );


        const name = opEpisodenName(eintrag);

        if (!name) continue;

        const schluessel = opNorm(name);

        let frucht = vorhandene.get(schluessel);


        // ---------------------------------
        // A. Noch unbekannte Frucht erzeugen
        // ---------------------------------

        if (!frucht) {

            frucht = {

                id: `episoden:${schluessel}`,

                de: null,
                en: name,

                // Japanische Rōmaji-Namen nur übernehmen,
                // wenn tatsächlich eine Umschrift vorliegt.
                ja: /no mi/i.test(
                    eintrag["Romanized Name"] || ""
                )
                    ? eintrag["Romanized Name"]
                    : null,

                alias: [],

                erwaehnung: null,
                anwendung: null,

                fruchtDebuet: null,
                anwender: [],

                typ: eintrag["Type"] || null,
                bild: null
            };

            OP_FRUECHTE.push(frucht);
            vorhanden.set(schluessel, frucht);

            neu++;
        }


        // ---------------------------------
        // B. Frucht-Debüt speichern
        // ---------------------------------

        if (
            erstGezeigt !== null &&
            !Number.isInteger(frucht.fruchtDebuet)
        ) {

            frucht.fruchtDebuet = erstGezeigt;
        }


        // ---------------------------------
        // C. Erste Nutzung ergänzen
        // ---------------------------------

        if (
            erstGenutzt !== null &&
            !Number.isInteger(frucht.anwendung)
        ) {

            frucht.anwendung = erstGenutzt;
            anwendungen++;
        }


        // "erwaehnung" bleibt bewusst unverändert,
        // weil Debüt und namentliche Erwähnung
        // unterschiedliche Ereignisse sein können.
    }

    return { neu, anwendungen };
}


// =========================================
// 7. URSPRÜNGLICHE LADEFUNKTION ERWEITERN
// =========================================

/**
 * Lädt zuerst den bestehenden OP-Katalog und
 * ergänzt anschließend historische Episodendaten.
 *
 * Das bisherige Hauptprogramm muss dafür nicht
 * verändert werden.
 *
 * @returns {Promise<Object>} Geladener OP-Katalog
 */
ladeOnePieceDaten = function() {

    if (opErweiterterLadevorgang) {
        return opErweiterterLadevorgang;
    }

    opErweiterterLadevorgang = (async () => {

        // Bisherigen Katalog unverändert laden
        const katalog = await opOriginalLadefunktion();

        try {

            const daten = await opLadeEpisodenQuelle();

            const neueFiguren =
                opErgaenzeCharaktere(daten);

            const fruechte =
                opErgaenzeFruechte(daten);


            // Ladeergebnis für die Menüanzeige
            OP_KATALOG_INFO.quelle =
                `${OP_KATALOG_INFO.quelle} + Episodendaten`;

            OP_KATALOG_INFO.figuren =
                OP_CHARAKTERE.length;

            OP_KATALOG_INFO.fruechte =
                OP_FRUECHTE.length;


            console.info(
                "One Piece: Historische Daten ergänzt",
                {
                    neueFiguren,
                    neueFruechte: fruechte.neu,
                    neueErstnutzungen:
                        fruechte.anwendungen,
                    gesamtFiguren: OP_CHARAKTERE.length,
                    gesamtFruechte: OP_FRUECHTE.length
                }
            );

        } catch (fehler) {

            // Das Hauptquiz soll weiterhin funktionieren,
            // auch wenn die zusätzliche Quelle ausfällt.
            console.error(
                "Zusätzliche Episodendaten konnten " +
                "nicht geladen werden:",
                fehler
            );

            OP_KATALOG_INFO.quelle +=
                " (Episoden-Erweiterung fehlgeschlagen)";
        }

        return katalog;

    })();

    return opErweiterterLadevorgang;
};
