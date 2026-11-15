
/* =====================================================
   DATEN – Pokémon einmal gesammelt laden und cachen
   ===================================================== */


// =====================================
// 1. DATENQUELLEN UND CACHE
// =====================================

// PokeAPI stellt die Pokémon-Daten als CSV-Dateien bereit.
const CSV_BASIS =
    "https://raw.githubusercontent.com/PokeAPI/pokeapi/" +
    "master/data/v2/csv/";

// Bilder und Typsymbole stammen aus dem Sprites-Repository.
const SPRITE_BASIS =
    "https://raw.githubusercontent.com/PokeAPI/sprites/" +
    "master/sprites/";

// Browser-Zwischenspeicher
const CACHE_SCHLUESSEL = "pokemon-quiz-pokedex-v4";

// Daten eine Woche lang aufbewahren
const CACHE_DAUER = 7 * 24 * 60 * 60 * 1000;


// =====================================
// 2. POKÉMON-TYPEN
// =====================================

/*
 * Die IDs entsprechen den Typ-IDs der PokéAPI.
 *
 * name   = Deutscher Typname
 * farbe  = Farbe des Typs
 * ab     = Erste Generation, in der der Typ existierte
 */

const TYP_INFO = {
    0:  { name: "Kein Typ", farbe: "#64748b", ab: 1 },
    1:  { name: "Normal",   farbe: "#9299a1", ab: 1 },
    2:  { name: "Kampf",    farbe: "#ce406a", ab: 1 },
    3:  { name: "Flug",     farbe: "#8fa8dd", ab: 1 },
    4:  { name: "Gift",     farbe: "#ab6ac8", ab: 1 },
    5:  { name: "Boden",    farbe: "#d97746", ab: 1 },
    6:  { name: "Gestein",  farbe: "#c7b78b", ab: 1 },
    7:  { name: "Käfer",    farbe: "#91c12f", ab: 1 },
    8:  { name: "Geist",    farbe: "#5269ac", ab: 1 },
    9:  { name: "Stahl",    farbe: "#5a8ea2", ab: 2 },
    10: { name: "Feuer",    farbe: "#ff9c54", ab: 1 },
    11: { name: "Wasser",   farbe: "#5090d6", ab: 1 },
    12: { name: "Pflanze",  farbe: "#63bc5a", ab: 1 },
    13: { name: "Elektro",  farbe: "#f4d23c", ab: 1 },
    14: { name: "Psycho",   farbe: "#f97176", ab: 1 },
    15: { name: "Eis",      farbe: "#73cec0", ab: 1 },
    16: { name: "Drache",   farbe: "#0b6dc3", ab: 1 },
    17: { name: "Unlicht",  farbe: "#5b5466", ab: 2 },
    18: { name: "Fee",      farbe: "#ec8fe6", ab: 6 }
};


// =====================================
// 3. LADESTATUS
// =====================================

// Versprechen für den einmaligen Datenabruf
let datenVersprechen = null;


// =====================================
// 4. CSV-DATEIEN LESEN
// =====================================

/**
 * Liest eine CSV-Datei einschließlich Anführungszeichen.
 *
 * @param {string} csv - CSV-Inhalt als Text
 * @returns {string[][]} Datenzeilen ohne Kopfzeile
 */
function leseCSV(csv) {
    const zeilen = [];

    let zeile = [];
    let feld = "";
    let inAnfuehrung = false;

    for (let i = 0; i < csv.length; i++) {
        const zeichen = csv[i];

        if (zeichen === '"') {

            // Zwei Anführungszeichen = ein echtes Zeichen
            if (inAnfuehrung && csv[i + 1] === '"') {
                feld += '"';
                i++;

            } else {
                inAnfuehrung = !inAnfuehrung;
            }

        } else if (zeichen === "," && !inAnfuehrung) {

            zeile.push(feld);
            feld = "";

        } else if (
            (zeichen === "\n" || zeichen === "\r") &&
            !inAnfuehrung
        ) {

            if (zeichen === "\r" && csv[i + 1] === "\n") {
                i++;
            }

            zeile.push(feld);

            if (zeile.some(wert => wert !== "")) {
                zeilen.push(zeile);
            }

            zeile = [];
            feld = "";

        } else {
            feld += zeichen;
        }
    }

    if (feld || zeile.length) {
        zeile.push(feld);
        zeilen.push(zeile);
    }

    // Erste Zeile enthält nur die Spaltenüberschriften
    return zeilen.slice(1);
}


/**
 * Lädt eine CSV-Datei und wandelt sie in Datenzeilen um.
 *
 * @param {string} dateiname - Name der CSV-Datei
 * @returns {Promise<string[][]>} CSV-Daten
 */
async function holeTabelle(dateiname) {
    const antwort = await fetch(CSV_BASIS + dateiname);

    if (!antwort.ok) {
        throw new Error(
            `Fehler beim Laden: ${dateiname} (${antwort.status})`
        );
    }

    const csvText = await antwort.text();

    return leseCSV(csvText);
}


// =====================================
// 5. GESAMTEN POKÉDEX LADEN
// =====================================

/**
 * Lädt Pokémon, Namen, Generationen und historische Typen.
 *
 * Bei erneutem Aufruf wird derselbe Datenbestand genutzt.
 * Im Browser werden die Daten bis zu sieben Tage gespeichert.
 *
 * @returns {Promise<Object[]>} Pokémon-Liste nach Nationaldex
 */
function ladePokemonDaten() {

    // Wenn bereits geladen wird oder wurde:
    // Kein zweites Mal herunterladen.
    if (datenVersprechen) {
        return datenVersprechen;
    }

    datenVersprechen = (async () => {

        // ---------------------------------
        // A. Zuerst lokalen Cache versuchen
        // ---------------------------------

        try {
            const cache = JSON.parse(
                localStorage.getItem(CACHE_SCHLUESSEL)
            );

            if (
                cache &&
                Date.now() - cache.zeit < CACHE_DAUER &&
                cache.pokemon?.length >= 1025
            ) {
                return cache.pokemon;
            }

        } catch {
            // Browser-Speicher nicht verfügbar:
            // Daten normal herunterladen.
        }


        // ---------------------------------
        // B. Fünf Tabellen parallel laden
        // ---------------------------------

        const [
            arten,
            namen,
            formen,
            typen,
            alteTypen
        ] = await Promise.all([

            holeTabelle("pokemon_species.csv"),

            holeTabelle("pokemon_species_names.csv"),

            holeTabelle("pokemon.csv"),

            holeTabelle("pokemon_types.csv"),

            holeTabelle("pokemon_types_past.csv")

        ]);


        // ---------------------------------
        // C. Deutsche und englische Namen
        // ---------------------------------

        const namenMap = new Map();

        for (const [id, sprache, name] of namen) {

            // Sprache 6 = Deutsch
            // Sprache 9 = Englisch
            if (sprache !== "6" && sprache !== "9") {
                continue;
            }

            if (!namenMap.has(+id)) {
                namenMap.set(+id, {});
            }

            const sprachCode = sprache === "6" ? "de" : "en";

            namenMap.get(+id)[sprachCode] = name;
        }


        // ---------------------------------
        // D. Reguläre Pokémon-Form finden
        // ---------------------------------

        const standardFormen = new Map();

        for (
            const [id, , artId, , , , , standard]
            of formen
        ) {
            if (standard === "1") {
                standardFormen.set(+artId, +id);
            }
        }


        // ---------------------------------
        // E. Aktuelle Typen sammeln
        // ---------------------------------

        const aktuelleTypen = new Map();

        for (const [pokemonId, typId, slot] of typen) {

            if (!aktuelleTypen.has(+pokemonId)) {
                aktuelleTypen.set(+pokemonId, []);
            }

            // slot 1 = erster Typ
            // slot 2 = zweiter Typ
            aktuelleTypen.get(+pokemonId)[+slot - 1] = +typId;
        }


        // ---------------------------------
        // F. Historische Typen sammeln
        // ---------------------------------

        const fruehereTypen = new Map();

        for (
            const [pokemonId, bisGen, typId, slot]
            of alteTypen
        ) {

            if (!fruehereTypen.has(+pokemonId)) {
                fruehereTypen.set(+pokemonId, new Map());
            }

            const abstufungen = fruehereTypen.get(+pokemonId);

            if (!abstufungen.has(+bisGen)) {
                abstufungen.set(+bisGen, []);
            }

            abstufungen.get(+bisGen)[+slot - 1] = +typId;
        }


        // ---------------------------------
        // G. Pokémon-Objekte erzeugen
        // ---------------------------------

        const pokemon = arten.map(
            ([id, bezeichner, generation]) => {

                const artId = +id;

                const formId =
                    standardFormen.get(artId) ?? artId;

                const sprache =
                    namenMap.get(artId) ?? {};

                const alt =
                    fruehereTypen.get(formId) ?? new Map();

                const vergangen = [...alt.entries()]

                    .map(([bis, typListe]) => ({
                        bis,
                        typen: typListe.filter(Boolean)
                    }))

                    .sort((a, b) => a.bis - b.bis);

                return {
                    id: artId,
                    pokemonId: formId,
                    gen: +generation,

                    de: sprache.de ||
                        sprache.en ||
                        bezeichner,

                    en: sprache.en || bezeichner,

                    typen: (
                        aktuelleTypen.get(formId) ?? []
                    ).filter(Boolean),

                    vergangen
                };
            }
        )

        // Nur Arten mit gültiger Generation und Typen
        .filter(p =>
            p.gen > 0 &&
            p.typen.length > 0
        )

        // Nationaldex-Reihenfolge
        .sort((a, b) => a.id - b.id);


        // ---------------------------------
        // H. Datenbestand kontrollieren
        // ---------------------------------

        if (pokemon.length < 1025) {
            throw new Error(
                "Pokédex-Daten sind unvollständig."
            );
        }


        // ---------------------------------
        // I. Für spätere Aufrufe speichern
        // ---------------------------------

        try {
            localStorage.setItem(
                CACHE_SCHLUESSEL,

                JSON.stringify({
                    zeit: Date.now(),
                    pokemon: pokemon
                })
            );

        } catch {
            // Auch ohne lokalen Cache spielbar.
        }

        return pokemon;

    })().catch(fehler => {

        // Nach einem Fehler darf erneut geladen werden.
        datenVersprechen = null;

        throw fehler;
    });

    return datenVersprechen;
}


// =====================================
// 6. POKÉMON-BILDER
// =====================================

/**
 * Liefert eine Sprite- oder Artwork-Adresse.
 *
 * @param {Object} pokemon - Pokémon-Objekt
 * @param {boolean} gross - Artwork statt kleinem Sprite?
 * @returns {string} Bildadresse
 */
function bildAdresse(pokemon, gross = false) {

    const unterordner = gross
        ? "other/official-artwork/"
        : "";

    return SPRITE_BASIS +
        "pokemon/" +
        unterordner +
        pokemon.pokemonId +
        ".png";
}


/**
 * Erstellt ein Pokémon-Bild.
 *
 * Kleine Bilder werden erst bei Bedarf geladen.
 * Falls das kleine Sprite fehlt, wird Artwork versucht.
 *
 * @param {Object} pokemon - Pokémon
 * @param {boolean} gross - Großes Artwork verwenden?
 * @returns {HTMLImageElement} Pokémon-Bild
 */
function pokemonBild(pokemon, gross = false) {

    const bild = document.createElement("img");

    bild.src = bildAdresse(pokemon, gross);
    bild.alt = pokemon.de;

    // Kleine Bilder später laden
    bild.loading = gross ? "eager" : "lazy";

    // Bilddarstellung asynchron vorbereiten
    bild.decoding = "async";

    // Ersatz, falls ein kleines Sprite nicht existiert
    bild.onerror = () => {

        if (
            !gross &&
            bild.dataset.ersatz !== "ja"
        ) {

            bild.dataset.ersatz = "ja";

            bild.src = bildAdresse(pokemon, true);

        } else {

            bild.hidden = true;
        }
    };

    return bild;
}


// =====================================
// 7. OFFIZIELLE POKÉMON-TYP-SYMBOLE
// =====================================

/**
 * Erstellt ein Pokémon-Typsymbol.
 *
 * Typ 0 = Kein Typ
 * Typ 1–18 = Pokémon-Typsymbol aus Karmesin/Purpur
 *
 * @param {number} id - Pokémon-Typ-ID
 * @returns {HTMLElement} Typsymbol
 */
function typSymbol(id) {

    const symbol = document.createElement("span");
    symbol.className = "typ-symbol";

    if (id === 0) {
        symbol.textContent = "∅";
        return symbol;
    }

    const bild = document.createElement("img");

    bild.alt = "";
    bild.loading = "lazy";

    bild.src =
        SPRITE_BASIS +
        "types/generation-ix/scarlet-violet/small/" +
        id +
        ".png";

    // Ersatz, wenn die Bilddatei nicht geladen werden kann
    bild.onerror = () => {

        symbol.textContent =
            TYP_INFO[id]?.name?.slice(0, 2) ?? "?";
    };

    symbol.appendChild(bild);

    return symbol;
}
