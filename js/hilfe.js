
/* =====================================================
   HILFE – Namen, Generationen, Karten und Typen
   ===================================================== */


// =====================================
// 1. NAMEN UND LISTEN
// =====================================

/**
 * Vereinheitlicht Pokémon-Namen.
 *
 * Akzente, Leerzeichen, Satzzeichen und Großschreibung
 * beeinflussen die Eingabe nicht.
 *
 * @param {string} text - Pokémon-Name
 * @returns {string} Normalisierter Name
 */
function normalisiere(text) {

    return String(text)

        .toLocaleLowerCase("de-DE")

        .replaceAll("♀", "f")
        .replaceAll("♂", "m")
        .replaceAll("ß", "ss")

        .normalize("NFKD")

        .replace(/[\u0300-\u036f]/g, "")

        .replace(/[^a-z0-9]/g, "");
}


/**
 * Sucht deutsche oder englische Pokémon-Namen.
 *
 * "Nidoran" findet beide Arten, wenn beide in der
 * aktuell ausgewählten Pokémon-Liste vorhanden sind.
 *
 * @param {Object[]} pool - Pokémon, die gespielt werden
 * @param {string} text - Name des Pokémon
 * @param {string} sprache - "beide", "de" oder "en"
 * @returns {Object[]} Alle Treffer
 */
function sucheNamen(pool, text, sprache = "beide") {

    const gesucht = normalisiere(text);

    if (!gesucht) {
        return [];
    }

    // Nidoran-Sonderregel
    if (gesucht === "nidoran") {

        return pool.filter(p =>
            p.id === 29 ||
            p.id === 32
        );
    }

    // Deutsche oder englische Namen prüfen
    return pool.filter(p =>

        (
            sprache !== "en" &&
            normalisiere(p.de) === gesucht
        )

        ||

        (
            sprache !== "de" &&
            normalisiere(p.en) === gesucht
        )

    );
}


/**
 * Erstellt eine neue zufällig gemischte Array-Kopie.
 *
 * @param {Object[]} liste - Pokémon-Liste
 * @returns {Object[]} Gemischte Pokémon-Liste
 */
function mische(liste) {

    const neu = [...liste];

    for (let i = neu.length - 1; i > 0; i--) {

        const zufall = Math.floor(
            Math.random() * (i + 1)
        );

        [neu[i], neu[zufall]] = [
            neu[zufall],
            neu[i]
        ];
    }

    return neu;
}


// =====================================
// 2. HISTORISCHE TYPEN
// =====================================

/**
 * Prüft, ob ein Typ bereits existierte.
 *
 * @param {number} id - Typ-ID
 * @param {number} generation - Spielgeneration
 * @returns {boolean} true, wenn der Typ existierte
 */
function typExistiert(id, generation) {

    return (
        id === 0 ||

        (
            TYP_INFO[id] &&
            TYP_INFO[id].ab <= generation
        )
    );
}


/**
 * Liefert die Typen eines Pokémon in einer Generation.
 *
 * Alte Typen aus PokéAPI gelten bis einschließlich
 * der jeweils angegebenen Generation.
 *
 * @param {Object} pokemon - Pokémon
 * @param {number} generation - Historische Generation
 * @returns {number[]} Immer zwei Typ-IDs
 */
function typenIn(pokemon, generation) {

    const alt = pokemon.vergangen.find(
        eintrag => generation <= eintrag.bis
    );

    const typen = alt
        ? alt.typen
        : pokemon.typen;

    // Typ 0 = Kein zweiter Typ
    return [
        typen[0] ?? 0,
        typen[1] ?? 0
    ];
}


/**
 * Fasst Generationen mit gleichen Typen zusammen.
 *
 * Beispiel Magnetilo:
 * Generation 1 = Elektro + Kein Typ
 * Generation 2–9 = Elektro + Stahl
 *
 * @param {Object} pokemon - Pokémon
 * @param {number} bisGeneration - Generationsobergrenze
 * @returns {Object[]} Liste mit Zeiträumen und Typen
 */
function typenPerioden(pokemon, bisGeneration) {

    const gruppen = [];

    for (
        let gen = pokemon.gen;
        gen <= bisGeneration;
        gen++
    ) {

        const typen = typenIn(pokemon, gen);

        const signatur = [...typen]
            .sort((a, b) => a - b)
            .join("-");

        const letzte = gruppen[gruppen.length - 1];

        if (
            letzte &&
            letzte.signatur === signatur
        ) {

            letzte.bis = gen;

        } else {

            gruppen.push({
                von: gen,
                bis: gen,
                typen,
                signatur
            });
        }
    }

    return gruppen;
}


/**
 * Formatiert einen Generationen-Zeitraum.
 *
 * @param {number} von - Erste Generation
 * @param {number} bis - Letzte Generation
 * @returns {string} Beispiel: "Generationen 1–5"
 */
function generationsText(von, bis) {

    return von === bis
        ? `Generation ${von}`
        : `Generationen ${von}–${bis}`;
}


/**
 * Sucht alle Pokémon mit einem Typ in mindestens
 * einer der bekannten Generationen.
 *
 * @param {Object[]} pool - Ausgewählte Pokémon
 * @param {number} typId - Typ-ID
 * @param {number} maxGeneration - Generationsobergrenze
 * @returns {Object[]} Alle passenden Pokémon
 */
function pokemonMitTyp(pool, typId, maxGeneration) {

    return pool.filter(p => {

        for (
            let gen = p.gen;
            gen <= maxGeneration;
            gen++
        ) {

            if (typenIn(p, gen).includes(typId)) {
                return true;
            }
        }

        return false;
    });
}


/**
 * Erstellt die möglichen Aufgaben für das Zufalls-Typquiz.
 *
 * Aufgaben enthalten einen Pokémon-Typ, einen historischen
 * Zeitraum und die dazu passenden Pokémon-Nummern.
 *
 * @param {Object[]} pool - Ausgewählte Pokémon
 * @param {number} maxGeneration - Generationsobergrenze
 * @returns {Object[]} Liste aller möglichen Typaufgaben
 */
function typenAufgaben(pool, maxGeneration) {

    const alle = [];

    // Alle 18 regulären Typen
    for (let typId = 1; typId <= 18; typId++) {

        let letzte = null;

        // Alle freigeschalteten Generationen überprüfen
        for (let gen = 1; gen <= maxGeneration; gen++) {

            if (!typExistiert(typId, gen)) {
                letzte = null;
                continue;
            }

            // Alle Pokémon finden, die in dieser Generation
            // existierten und den gesuchten Typ hatten
            const ids = pool

                .filter(p =>
                    p.gen <= gen &&
                    typenIn(p, gen).includes(typId)
                )

                .map(p => p.id);

            if (!ids.length) {
                letzte = null;
                continue;
            }

            const signatur = ids.join(",");

            // Gleiche Aufgaben über Generationen zusammenfassen
            if (
                letzte &&
                letzte.bis === gen - 1 &&
                letzte.signatur === signatur
            ) {

                letzte.bis = gen;

            } else {

                letzte = {
                    typId,
                    von: gen,
                    bis: gen,
                    ids,
                    signatur
                };

                alle.push(letzte);
            }
        }
    }

    return alle;
}


// =====================================
// 3. TYP-SYMBOLE UND BUTTONS
// =====================================

/**
 * Erstellt einen anklickbaren Typ-Button.
 *
 * @param {number} id - Typ-ID
 * @param {Function} beimKlick - Wird bei einem Klick ausgeführt
 * @returns {HTMLButtonElement} Typ-Button
 */
function typButton(id, beimKlick) {

    const typ = TYP_INFO[id];

    const button = document.createElement("button");
    button.type = "button";
    button.className = "typ-button";

    button.style.setProperty(
        "--typ-farbe",
        typ.farbe
    );

    const name = document.createElement("span");
    name.textContent = typ.name;

    button.append(
        typSymbol(id),
        name
    );

    button.addEventListener("click", () => {

        // Die angeklickte Typ-ID an die Funktion übergeben
        beimKlick(id);
    });

    return button;
}


// =====================================
// 4. POKÉMON-KARTEN
// =====================================

/**
 * Erstellt eine leere Pokédex-Karte.
 *
 * @param {Object} pokemon - Pokémon
 * @param {boolean} nummerAnzeigen - Pokédex-Nummer zeigen?
 * @returns {Object} Karte und Inhaltsbereich
 */
function pokemonKarte(pokemon, nummerAnzeigen = true) {

    const karte = document.createElement("div");
    karte.className = "pokemon-karte";

    if (nummerAnzeigen) {

        const nummer = document.createElement("span");
        nummer.className = "dex-nummer";

        nummer.textContent =
            `#${String(pokemon.id).padStart(4, "0")}`;

        karte.appendChild(nummer);
    }

    const inhalt = document.createElement("div");
    inhalt.className = "karten-inhalt";

    karte.appendChild(inhalt);

    return {
        karte,
        inhalt
    };
}


/**
 * Zeigt eine Karte als Fragezeichen, Schatten,
 * richtig gefundenes oder aufgegebenes Pokémon.
 *
 * @param {Object} pokemon - Pokémon
 * @param {Object} teile - Kartenelemente
 * @param {string} status - "frage", "schatten",
 *                          "gefunden" oder "aufgedeckt"
 * @returns {void}
 */
function zeichneKarte(pokemon, teile, status) {

    const { karte, inhalt } = teile;

    karte.classList.toggle(
        "gefunden",
        status === "gefunden"
    );

    karte.classList.toggle(
        "aufgedeckt",
        status === "aufgedeckt"
    );

    // Alten Karteninhalt entfernen
    inhalt.replaceChildren();
    karte.removeAttribute("title");

    // Fall 1: Fragezeichen
    if (status === "frage") {

        const frage = document.createElement("span");
        frage.className = "fragezeichen";
        frage.textContent = "?";

        inhalt.appendChild(frage);

        return;
    }

    // Fall 2–4: Pokémon-Bild erstellen
    const bild = pokemonBild(pokemon);

    bild.className =
        "mini-bild" +
        (status === "schatten" ? " schatten" : "");

    inhalt.appendChild(bild);

    // Schatten zeigen noch keinen Pokémon-Namen
    if (status !== "schatten") {

        const text = document.createElement("span");
        text.className = "mini-name";
        text.textContent = pokemon.de;

        inhalt.appendChild(text);

        // Beide Namen beim Überfahren mit der Maus
        karte.title = `${pokemon.de} / ${pokemon.en}`;
    }
}
