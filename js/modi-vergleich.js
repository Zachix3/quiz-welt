
/* =========================================
   VERGLEICHSQUIZ – POKÉMON UND HILFSFUNKTIONEN
   ========================================= */


// =====================================
// 1. VERGLEICHSDATEN
// =====================================

let vergleichsDatenPromise = null;

const POKEMON_FARBEN = {
    1: "Schwarz",
    2: "Blau",
    3: "Braun",
    4: "Grau",
    5: "Grün",
    6: "Rosa",
    7: "Lila",
    8: "Rot",
    9: "Weiß",
    10: "Gelb"
};


/**
 * Lädt Farbe, Größe, Gewicht und Entwicklungsketten.
 *
 * @returns {Promise<Map>} Pokémon-ID -> Eigenschaften
 */
function ladePokemonVergleichsdaten() {

    if (vergleichsDatenPromise) {
        return vergleichsDatenPromise;
    }

    vergleichsDatenPromise = (async () => {

        const [arten, formen] = await Promise.all([
            holeTabelle("pokemon_species.csv"),
            holeTabelle("pokemon.csv")
        ]);

        const eltern = new Map();
        const eigenschaften = new Map();

        for (const zeile of arten) {

            const id = Number(zeile[0]);

            eltern.set(
                id,
                zeile[3] ? Number(zeile[3]) : null
            );

            eigenschaften.set(id, {
                farbe: POKEMON_FARBEN[Number(zeile[6])] ||
                    "Unbekannt",
                groesse: null,
                gewicht: null,
                stufe: 1
            });
        }

        // Entwicklungstiefe berechnen
        function stufe(id) {

            let tiefe = 1;
            let elternId = eltern.get(id);

            const besucht = new Set([id]);

            while (
                elternId &&
                !besucht.has(elternId)
            ) {

                besucht.add(elternId);
                tiefe++;

                elternId = eltern.get(elternId);
            }

            return tiefe;
        }

        for (const zeile of formen) {

            // Nur die Standardform verwenden
            if (zeile[7] !== "1") continue;

            const artId = Number(zeile[2]);
            const werte = eigenschaften.get(artId);

            if (!werte) continue;

            // PokéAPI: Dezimeter und Hektogramm
            werte.groesse = Number(zeile[3]) / 10;
            werte.gewicht = Number(zeile[4]) / 10;
        }

        for (const [id, werte] of eigenschaften) {
            werte.stufe = stufe(id);
        }

        return eigenschaften;

    })().catch(fehler => {
        vergleichsDatenPromise = null;
        throw fehler;
    });

    return vergleichsDatenPromise;
}


// =====================================
// 2. VORSCHLÄGE BEIM TIPPEN
// =====================================

/**
 * Erstellt Vorschläge anhand einer Texteingabe.
 *
 * @param {HTMLElement} container - Vorschlagsbereich
 * @param {string} text - Eingabe
 * @param {Array} elemente - Mögliche Figuren / Pokémon
 * @param {Function} namen - Liefert Suchnamen als Array
 * @param {Function} bildErstellen - Liefert ein Bildelement
 * @param {Function} beimAuswaehlen - Klick-Callback
 * @returns {void}
 */
function zeigeVorschlaege(
    container,
    text,
    elemente,
    namen,
    bildErstellen,
    beimAuswaehlen
) {

    container.replaceChildren();

    const gesucht = normalisiere(text);

    if (!gesucht) return;

    const passende = elemente.filter(element =>

        namen(element).some(name =>
            normalisiere(name).includes(gesucht)
        )
    ).slice(0, 8);

    for (const element of passende) {

        const button = document.createElement("button");
        button.type = "button";
        button.className = "vorschlag";

        const bild = bildErstellen(element);

        if (bild) {
            button.appendChild(bild);
        }

        const beschriftung = document.createElement("span");
        beschriftung.textContent = namen(element)[0];

        button.appendChild(beschriftung);

        button.addEventListener("click", () => {
            container.replaceChildren();
            beimAuswaehlen(element);
        });

        container.appendChild(button);
    }
}


// =====================================
// 3. VERGLEICHSFELDER
// =====================================

/**
 * Erstellt ein farbiges Vergleichsfeld.
 *
 * @param {string} wert - Sichtbarer Text
 * @param {string} status - "gruen", "gelb", "rot", "neutral"
 * @returns {HTMLTableCellElement} Tabellenzelle
 */
function vergleichsZelle(wert, status) {

    const zelle = document.createElement("td");
    zelle.className = status;
    zelle.textContent = wert ?? "–";

    return zelle;
}


/**
 * Vergleicht zwei Zahlen.
 *
 * @param {number|null} geraten - Geratener Wert
 * @param {number|null} gesucht - Zielwert
 * @returns {Object} Text und Farbe
 */
function zahlenVergleich(geraten, gesucht) {

    if (
        geraten == null ||
        gesucht == null
    ) {

        return {
            status: "neutral",
            pfeil: ""
        };
    }

    if (geraten === gesucht) {

        return {
            status: "gruen",
            pfeil: "✓"
        };
    }

    const abstand = Math.abs(geraten - gesucht);
    const toleranz = Math.max(1, gesucht * 0.2);

    return {
        status: abstand <= toleranz
            ? "gelb"
            : "rot",

        pfeil: geraten < gesucht ? "↑" : "↓"
    };
}


// =====================================
// 4. POKÉMON-VERGLEICH
// =====================================

/**
 * Erstellt ein Vergleichsquiz mit einem geheimen Pokémon.
 *
 * @param {Object} kontext - Pokémon, Gen, Timeranzeige
 * @returns {Object} Spielsitzung
 */
function erstellePokemonVergleich(kontext) {

    const { pool, maxGen, timerAnzeige } = kontext;

    const root = document.createElement("div");
    root.className = "frage-karte vergleich-frage";

    root.innerHTML = `
        <p class="lade-info">Vergleichsdaten werden geladen …</p>

        <div class="vergleich-spiel" hidden>

            <label class="uebung-label">
                <input class="uebung" type="checkbox">
                Übungsmodus – automatisch weiterspielen
            </label>

            <p class="vergleich-info">
                Grün = richtig · Gelb = teilweise / nah dran ·
                Rot = falsch. ↑ bedeutet: Das gesuchte
                Pokémon hat einen höheren Wert.
            </p>

            <input class="namen-eingabe" type="text"
                   placeholder="Pokémon eingeben ..."
                   autocomplete="off"
                   spellcheck="false">

            <div class="vorschlaege"></div>
            <p class="meldung" role="status"></p>

            <div class="tabellen-scroll">
                <table class="vergleich-tabelle">
                    <thead>
                        <tr>
                            <th>Pokémon</th>
                            <th>Farbe</th>
                            <th>Typ 1</th>
                            <th>Typ 2</th>
                            <th>Größe</th>
                            <th>Gewicht</th>
                            <th>Entwicklungsstufe</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>

            <div class="aktionen">
                <button class="aufgeben" type="button">
                    Aufgeben
                </button>

                <button class="neu sekundaer" type="button">
                    Neue Runde
                </button>
            </div>
        </div>
    `;

    const ladeInfo = root.querySelector(".lade-info");
    const spiel = root.querySelector(".vergleich-spiel");
    const eingabe = root.querySelector(".namen-eingabe");
    const vorschlaege = root.querySelector(".vorschlaege");
    const meldung = root.querySelector(".meldung");
    const tabelle = root.querySelector("tbody");
    const uebung = root.querySelector(".uebung");

    const timer = erstelleStoppuhr(timerAnzeige);

    let werte = null;
    let geheim = null;
    let beendet = false;
    let entsorgt = false;
    let pausiert = false;
    let naechsteRundeTimer = null;

    const geraten = new Set();


    /**
     * Wählt ein neues geheimes Pokémon.
     *
     * @returns {void}
     */
    function neu() {

        clearTimeout(naechsteRundeTimer);

        geheim = pool[
            Math.floor(Math.random() * pool.length)
        ];

        geraten.clear();

        beendet = false;

        tabelle.replaceChildren();
        vorschlaege.replaceChildren();

        eingabe.value = "";
        eingabe.disabled = false;

        meldung.textContent =
            "Errate das geheime Pokémon!";

        timer.start();

        if (pausiert) timer.pause();

        if (root.isConnected) eingabe.focus();
    }


    /**
     * Erstellt eine farbige Zeile für ein geratenes Pokémon.
     *
     * @param {Object} pokemon - Geratenes Pokémon
     * @returns {void}
     */
    function zeigeVergleich(pokemon) {

        const ziel = werte.get(geheim.id);
        const versuch = werte.get(pokemon.id);

        const zielTypen = typenIn(geheim, maxGen);
        const versuchTypen = typenIn(pokemon, maxGen);

        const zeile = document.createElement("tr");

        const name = vergleichsZelle(
            pokemon.de,
            pokemon.id === geheim.id
                ? "gruen"
                : "neutral"
        );

        const bild = pokemonBild(pokemon);

        name.prepend(bild);
        zeile.appendChild(name);

        // Farbe
        zeile.appendChild(vergleichsZelle(
            versuch.farbe,
            versuch.farbe === ziel.farbe
                ? "gruen"
                : "rot"
        ));

        // Beide Typfelder einzeln vergleichen
        for (let i = 0; i < 2; i++) {

            const typId = versuchTypen[i];
            const genau = typId === zielTypen[i];

            const teilweise = !genau &&
                zielTypen.includes(typId);

            zeile.appendChild(vergleichsZelle(
                TYP_INFO[typId]?.name || "–",
                genau
                    ? "gruen"
                    : teilweise
                        ? "gelb"
                        : "rot"
            ));
        }

        // Größe und Gewicht
        for (const [wert, einheit, stellen] of [
            ["groesse", "m", 1],
            ["gewicht", "kg", 1],
            ["stufe", "", 0]
        ]) {

            const vergleich = zahlenVergleich(
                versuch[wert],
                ziel[wert]
            );

            const text = versuch[wert] == null
                ? "–"
                : `${versuch[wert].toFixed(stellen)} ` +
                  `${einheit} ${vergleich.pfeil}`;

            zeile.appendChild(vergleichsZelle(
                text.trim(),
                vergleich.status
            ));
        }

        tabelle.prepend(zeile);
    }


    /**
     * Übernimmt einen Pokémon-Vorschlag.
     *
     * @param {Object} pokemon - Ausgewähltes Pokémon
     * @returns {void}
     */
    function raten(pokemon) {

        if (beendet || geraten.has(pokemon.id)) return;

        geraten.add(pokemon.id);

        eingabe.value = "";
        vorschlaege.replaceChildren();

        zeigeVergleich(pokemon);

        if (pokemon.id !== geheim.id) {

            meldung.textContent =
                `${geraten.size} Versuch(e). Weiter raten!`;

            eingabe.focus();
            return;
        }

        beendet = true;
        timer.stop();
        eingabe.disabled = true;

        meldung.textContent =
            `Richtig! ${geheim.de} nach ` +
            `${geraten.size} Versuchen gefunden!`;

        if (uebung.checked) {

            naechsteRundeTimer = setTimeout(() => {
                if (!pausiert && !entsorgt) neu();
            }, 1500);
        }
    }


    /**
     * Zeigt passende Pokémon bei jeder Eingabe.
     *
     * @returns {void}
     */
    function pruefen() {

        if (beendet) return;

        const text = eingabe.value;

        zeigeVorschlaege(
            vorschlaege,
            text,
            pool,
            p => [p.de, p.en],
            p => pokemonBild(p),
            raten
        );

        // Exakter vollständiger Name:
        // Sofort als Rateversuch übernehmen.
        const treffer = sucheNamen(pool, text);

        if (treffer.length === 1) {
            raten(treffer[0]);
        }
    }


    /**
     * Gibt die richtige Antwort preis.
     *
     * @returns {void}
     */
    function aufgeben() {

        if (beendet) return;

        beendet = true;
        timer.stop();

        ratenErgebnis();

        eingabe.disabled = true;

        meldung.textContent =
            `Lösung: ${geheim.de} (${geheim.en})`;
    }


    function ratenErgebnis() {
        if (!geraten.has(geheim.id)) {
            zeigeVergleich(geheim);
        }
    }


    // Eingabe und Buttons verbinden
    eingabe.addEventListener("input", pruefen);

    root.querySelector(".neu").addEventListener(
        "click",
        neu
    );

    root.querySelector(".aufgeben").addEventListener(
        "click",
        aufgeben
    );


    // Vergleichsdaten erst beim Öffnen laden
    ladePokemonVergleichsdaten().then(daten => {

        if (entsorgt) return;

        werte = daten;

        ladeInfo.hidden = true;
        spiel.hidden = false;

        neu();

    }).catch(fehler => {

        ladeInfo.textContent =
            "Vergleichsdaten konnten nicht geladen werden: " +
            fehler.message;
    });


    return {
        root,

        pause() {
            pausiert = true;
            timer.pause();

            clearTimeout(naechsteRundeTimer);
        },

        resume() {
            pausiert = false;

            if (!beendet && werte) {
                timer.resume();
            }

            if (beendet && uebung.checked && werte) {
                neu();
            }
        },

        dispose() {
            entsorgt = true;
            clearTimeout(naechsteRundeTimer);
            timer.dispose();
        }
    };
}
