
/* =========================================
   ATTACKENDATEN UND LERNMETHODEN
   ========================================= */


/*
 * Lernmethoden der PokéAPI:
 *
 * 1 = Levelaufstieg
 * 2 = Ei / Zucht
 * 3 = Attacken-Lehrer
 * 4 = Maschine
 * 5+ = Weitere Spezialmethoden
 */

const ATTACKEN_METHODEN = [
    { id: "alle", name: "Alle Lernmethoden" },
    { id: "level", name: "Levelaufstieg" },
    { id: "tm", name: "TM" },
    { id: "vm", name: "VM" },
    { id: "tr", name: "TR" },
    { id: "ei", name: "Ei / Zucht" },
    { id: "tutor", name: "Attacken-Lehrer" },
    { id: "maschine", name: "Alle Maschinen (TM/VM/TR)" },
    { id: "spezial", name: "Weitere Sondermethoden" }
];

let attackenNamenPromise = null;
let lernsetPromise = null;
let maschinenPromise = null;


/**
 * Lädt deutsche und englische Attackennamen und Editionen.
 *
 * @returns {Promise<Object>} Attacken, Gruppen und ID-Index
 */
function ladeAttackenNamen() {

    if (attackenNamenPromise) {
        return attackenNamenPromise;
    }

    attackenNamenPromise = (async () => {

        const [moves, names, groups] = await Promise.all([
            holeTabelle("moves.csv"),
            holeTabelle("move_names.csv"),
            holeTabelle("version_groups.csv")
        ]);

        const namen = new Map();

        for (const [idText, sprache, name] of names) {

            if (sprache !== "6" && sprache !== "9") continue;

            const id = Number(idText);

            if (!namen.has(id)) namen.set(id, {});

            namen.get(id)[sprache === "6" ? "de" : "en"] =
                name;
        }

        const attacken = moves.map(zeile => {

            const id = Number(zeile[0]);
            const name = namen.get(id) || {};

            return {
                id,
                de: name.de || "",
                en: name.en || "",
                gen: Number(zeile[2]),
                typ: Number(zeile[3])
            };

        }).filter(a =>
            a.id < 10000 &&
            a.gen >= 1 &&
            a.gen <= 9 &&
            a.de &&
            a.en
        );

        const gruppen = groups.map(zeile => ({
            id: Number(zeile[0]),
            name: zeile[1],
            gen: Number(zeile[2]),
            reihenfolge: Number(zeile[3])
        }));

        return {
            attacken,
            gruppen,
            nachId: new Map(
                attacken.map(a => [a.id, a])
            )
        };

    })().catch(fehler => {
        attackenNamenPromise = null;
        throw fehler;
    });

    return attackenNamenPromise;
}


/**
 * Lädt größere CSV-Dateien mit Browser-Cache.
 *
 * @param {string} datei - CSV-Dateiname
 * @returns {Promise<string>} Inhalt der CSV
 */
async function ladeGrosseCSV(datei) {

    const url = CSV_BASIS + datei;

    if ("caches" in window) {

        try {
            const cache = await caches.open(
                "pokemon-attacken-v2"
            );

            const gespeichert = await cache.match(url);

            if (gespeichert) {
                return await gespeichert.text();
            }

            const antwort = await fetch(url);

            if (!antwort.ok) {
                throw new Error(`HTTP ${antwort.status}`);
            }

            await cache.put(url, antwort.clone());

            return await antwort.text();

        } catch (fehler) {
            console.warn("Cache nicht nutzbar:", fehler);
        }
    }

    const antwort = await fetch(url);

    if (!antwort.ok) {
        throw new Error(`${datei}: HTTP ${antwort.status}`);
    }

    return antwort.text();
}


/**
 * Lädt alle erfassten Pokémon-Attacken-Lernwege.
 *
 * @returns {Promise<Map>} Pokémon-ID -> Lernset-Einträge
 */
function ladeLernsets() {

    if (lernsetPromise) return lernsetPromise;

    lernsetPromise = (async () => {

        const csv = await ladeGrosseCSV(
            "pokemon_moves.csv"
        );

        const map = new Map();

        for (const zeile of csv.split(/\r?\n/).slice(1)) {

            if (!zeile) continue;

            const [
                pokemonId,
                gruppe,
                attacke,
                methode,
                level,
                reihenfolge
            ] = zeile.split(",");

            const id = Number(pokemonId);

            if (!id || !attacke || !methode) continue;

            if (!map.has(id)) map.set(id, []);

            map.get(id).push({
                gruppe: Number(gruppe),
                attacke: Number(attacke),
                methode: Number(methode),
                level: Number(level) || 0,
                reihenfolge:
                    reihenfolge === ""
                        ? 9999
                        : Number(reihenfolge)
            });
        }

        return map;

    })().catch(fehler => {
        lernsetPromise = null;
        throw fehler;
    });

    return lernsetPromise;
}


/**
 * Lädt die konkrete TM/VM/TR-Einteilung pro Edition.
 *
 * PokéAPI behandelt diese drei zunächst alle als
 * Methode 4 ("machine"). Deshalb werden zusätzlich
 * machines.csv und items.csv benötigt.
 *
 * @returns {Promise<Map>} "gruppe:attacke" -> Set von
 *                         "tm", "vm" und/oder "tr"
 */
function ladeMaschinen() {

    if (maschinenPromise) return maschinenPromise;

    maschinenPromise = (async () => {

        const [maschinen, items] = await Promise.all([
            holeTabelle("machines.csv"),
            holeTabelle("items.csv")
        ]);

        const itemNamen = new Map(
            items.map(zeile => [
                Number(zeile[0]),
                zeile[1]
            ])
        );

        const map = new Map();

        for (const zeile of maschinen) {

            // machine_number, version_group_id,
            // item_id, move_id
            const gruppe = Number(zeile[1]);
            const itemId = Number(zeile[2]);
            const attacke = Number(zeile[3]);

            const name = itemNamen.get(itemId) || "";

            let art = null;

            if (/^tm\d+/i.test(name)) art = "tm";
            else if (/^hm\d+/i.test(name)) art = "vm";
            else if (/^tr\d+/i.test(name)) art = "tr";

            if (!art) continue;

            const schluessel = `${gruppe}:${attacke}`;

            if (!map.has(schluessel)) {
                map.set(schluessel, new Set());
            }

            map.get(schluessel).add(art);
        }

        return map;

    })().catch(fehler => {
        maschinenPromise = null;
        throw fehler;
    });

    return maschinenPromise;
}


/**
 * Prüft, ob ein Lernset-Eintrag zur gewählten Methode passt.
 *
 * @param {Object} eintrag - Eintrag aus pokemon_moves.csv
 * @param {string} filter - Gewählte Methode
 * @param {Map} maschinen - TM/VM/TR-Tabelle
 * @returns {boolean} Ob die Attacke mitzählt
 */
function passtLernmethode(eintrag, filter, maschinen) {

    if (filter === "alle") return true;

    if (filter === "level") {
        return eintrag.methode === 1;
    }

    if (filter === "ei") {
        return eintrag.methode === 2;
    }

    if (filter === "tutor") {
        return eintrag.methode === 3;
    }

    if (filter === "maschine") {
        return eintrag.methode === 4;
    }

    if (filter === "spezial") {
        return eintrag.methode >= 5;
    }

    if (["tm", "vm", "tr"].includes(filter)) {

        if (eintrag.methode !== 4) return false;

        const schluessel =
            `${eintrag.gruppe}:${eintrag.attacke}`;

        return (
            maschinen.get(schluessel)?.has(filter) ??
            false
        );
    }

    return false;
}


/**
 * Liefert die Attacken eines Pokémon für eine Edition
 * und die ausgewählte Lernmethode.
 *
 * Jede Attacke wird nur einmal zurückgegeben.
 *
 * @param {Object} pokemon - Pokémon
 * @param {number} gruppenId - Versionsgruppen-ID
 * @param {string} methode - Lernmethode
 * @param {Map} lernsets - Geladene Lernsets
 * @param {Map} attackenNachId - Attacken-Index
 * @param {Map} maschinen - Maschinen-Zuordnung
 * @returns {Object[]} Lernbare Attacken
 */
function holeLernbareAttacken(
    pokemon,
    gruppenId,
    methode,
    lernsets,
    attackenNachId,
    maschinen
) {

    const liste = lernsets.get(pokemon.pokemonId) || [];
    const eindeutig = new Map();

    for (const eintrag of liste) {

        if (eintrag.gruppe !== gruppenId) continue;

        if (!passtLernmethode(
            eintrag,
            methode,
            maschinen
        )) {
            continue;
        }

        const attacke = attackenNachId.get(
            eintrag.attacke
        );

        if (!attacke) continue;

        const vorhanden = eindeutig.get(attacke.id);

        const datensatz = {
            ...attacke,
            level: eintrag.level,
            reihenfolge: eintrag.reihenfolge
        };

        if (
            !vorhanden ||
            eintrag.level < vorhanden.level
        ) {
            eindeutig.set(attacke.id, datensatz);
        }
    }

    const ergebnis = [...eindeutig.values()];

    // Bei Levelaufstieg nach Level und Lernreihenfolge
    if (methode === "level") {

        ergebnis.sort((a, b) =>
            a.level - b.level ||
            a.reihenfolge - b.reihenfolge ||
            a.id - b.id
        );

    } else {

        ergebnis.sort((a, b) => a.id - b.id);
    }

    return ergebnis;
}
