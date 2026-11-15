
/* =====================================================
   QUIZ-WELT – HAUPTPROGRAMM

   Pokémon-Modi bleiben unverändert.
   One Piece nutzt lokale Wiki-Daten ohne Online-API.
   ===================================================== */


// =========================================
// 1. SEITEN UND SPIELMODI
// =========================================

const SEITEN = [
    "welt",
    "pokemon",
    "onepiece",
    "spiel"
];

const MODI_TITEL = {
    frei: "Frei",
    reihe: "Reihenfolge",
    "de-en": "Deutsch → Englisch",
    "en-de": "Englisch → Deutsch",
    typen: "Pokémon-Typen",
    "typ-zufall": "Zufälliger Typ",
    "typ-wahl": "Typ vervollständigen",

    "attacke-de-en": "Attacken Deutsch → Englisch",
    "attacke-en-de": "Attacken Englisch → Deutsch",

    "attacke-wer-frei": "Wer lernt diese Attacke?",
    "attacke-wer-reihe":
        "Wer lernt diese Attacke? – Reihenfolge",

    "pokemon-attacken-frei": "Attacken eines Pokémon",
    "pokemon-attacken-reihe":
        "Attacken eines Pokémon – Reihenfolge",

    "pokemon-vergleich": "Pokémon vergleichen",

    "op-vergleich": "One Piece – Charaktervergleich",
    "op-frucht-sprache": "Teufelsfrüchte übersetzen",
    "op-frucht-anwender": "Teufelsfrucht → Anwender",
    "op-anwender-frucht": "Anwender → Teufelsfrucht"
};


// =========================================
// 2. GLOBALE EINSTELLUNGEN
// =========================================

let ALLE_POKEMON = [];

let MAX_GENERATION = null;

let AUSGEWAEHLTE_GENERATIONEN = new Set();

let OP_EPISODE = null;


// Kompatibilität mit der vorhandenen HTML-Datei:
//
// "erwaehnung" heißt jetzt im Menü "Fruit Debut".
// Diese Bezeichnung ist keine namentliche Erwähnung.

let OP_FREIGABE = "anwendung";

let OP_VOLLER_KATALOG = false;


let AKTIVER_MODUS = null;
let AKTIVE_WELT = null;

const SITZUNGEN = new Map();

let pokemonLaden = null;


// =========================================
// 3. SEITEN ANZEIGEN
// =========================================

/**
 * Zeigt eine Seite an.
 *
 * @param {string} name - Seitenkennung
 * @returns {void}
 */
function zeigeSeite(name) {

    for (const seite of SEITEN) {

        document.getElementById(
            `seite-${seite}`
        ).hidden = seite !== name;
    }

    document.getElementById(
        "kopf-hinweis"
    ).textContent = ({
        welt: "Wähle ein Universum",
        pokemon: "Pokémon",
        onepiece: "One Piece",
        spiel: MODI_TITEL[AKTIVER_MODUS] || "Quiz"
    })[name];
}


/**
 * Pausiert das aktuell geöffnete Spiel.
 *
 * @returns {void}
 */
function pausiereAktivesSpiel() {

    if (!AKTIVER_MODUS || !AKTIVE_WELT) {
        return;
    }

    SITZUNGEN.get(
        `${AKTIVE_WELT}:${AKTIVER_MODUS}`
    )?.pause();
}


/**
 * Verwirft gespeicherte Spielrunden einer Welt.
 *
 * @param {string} welt - "pokemon" oder "onepiece"
 * @returns {void}
 */
function verwerfeSitzungen(welt) {

    for (const [schluessel, spiel] of SITZUNGEN) {

        if (schluessel.startsWith(`${welt}:`)) {

            spiel.dispose();
            SITZUNGEN.delete(schluessel);
        }
    }
}


// =========================================
// 4. POKÉMON-GENERATIONEN
// =========================================

/**
 * Erstellt die Generations-Buttons für Pokémon.
 *
 * @returns {void}
 */
function zeichneGenerationen() {

    const container = document.getElementById(
        "generationen-knopfe"
    );

    container.replaceChildren();

    if (!MAX_GENERATION) return;

    for (
        let gen = 1;
        gen <= MAX_GENERATION;
        gen++
    ) {

        const anzahl = ALLE_POKEMON.filter(
            p => p.gen === gen
        ).length;

        if (!anzahl) continue;

        const button = document.createElement("button");

        button.type = "button";
        button.className = "generations-chip";

        button.textContent =
            `Gen ${gen} (${anzahl})`;

        const aktiv =
            AUSGEWAEHLTE_GENERATIONEN.has(gen);

        button.classList.toggle(
            "aktiv",
            aktiv
        );

        button.setAttribute(
            "aria-pressed",
            String(aktiv)
        );

        button.addEventListener("click", () => {

            if (AUSGEWAEHLTE_GENERATIONEN.has(gen)) {

                AUSGEWAEHLTE_GENERATIONEN.delete(gen);

            } else {

                AUSGEWAEHLTE_GENERATIONEN.add(gen);
            }

            verwerfeSitzungen("pokemon");

            zeichneGenerationen();
            aktualisiereUmfang();
        });

        container.appendChild(button);
    }
}


/**
 * Aktualisiert die Pokémon-Anzahl im Menü.
 *
 * @returns {void}
 */
function aktualisiereUmfang() {

    const pool = ALLE_POKEMON.filter(p =>
        AUSGEWAEHLTE_GENERATIONEN.has(p.gen)
    );

    const ok =
        MAX_GENERATION !== null &&
        pool.length > 0;

    document.getElementById(
        "modi-bereich"
    ).hidden = !ok;

    document.getElementById(
        "umfang-info"
    ).textContent = ok

        ? `${pool.length} Pokémon aus Generation ` +
          [...AUSGEWAEHLTE_GENERATIONEN]
              .sort((a, b) => a - b)
              .join(" + ") +
          `. Typwissen bis Gen ${MAX_GENERATION}.`

        : "Wähle mindestens eine Generation aus.";
}


/**
 * Lädt den Pokédex und öffnet das Pokémon-Menü.
 *
 * @returns {Promise<void>}
 */
async function oeffnePokemonBereich() {

    zeigeSeite("pokemon");

    if (ALLE_POKEMON.length) return;

    if (pokemonLaden) {
        return pokemonLaden;
    }

    const status = document.getElementById(
        "lade-status"
    );

    status.textContent = "Pokédex wird geladen …";

    pokemonLaden = (async () => {

        try {

            ALLE_POKEMON = await ladePokemonDaten();

            status.textContent =
                `${ALLE_POKEMON.length} Pokémon geladen.`;

            document.getElementById(
                "pokemon-einstellungen"
            ).hidden = false;

            const select = document.getElementById(
                "max-generation"
            );

            select.replaceChildren();

            const leer = document.createElement("option");

            leer.value = "";
            leer.textContent = "Bitte auswählen …";

            select.appendChild(leer);

            const max = Math.max(
                ...ALLE_POKEMON.map(p => p.gen)
            );

            for (let gen = 1; gen <= max; gen++) {

                const option =
                    document.createElement("option");

                option.value = String(gen);

                option.textContent =
                    `Generation ${gen}`;

                select.appendChild(option);
            }

            if (MAX_GENERATION) {

                select.value =
                    String(MAX_GENERATION);
            }

            zeichneGenerationen();
            aktualisiereUmfang();

        } catch (fehler) {

            status.textContent =
                "Pokédex konnte nicht geladen werden: " +
                fehler.message;

        } finally {

            pokemonLaden = null;
        }
    })();

    return pokemonLaden;
}


// =========================================
// 5. ONE-PIECE-FILTER BESCHRIFTEN
// =========================================

/**
 * Gibt den Namen der aktuellen Wiki-Regel zurück.
 *
 * @returns {string} Beschreibung
 */
function opRegelText() {

    if (OP_VOLLER_KATALOG) {
        return "Alle lokalen Wiki-Einträge (Spoiler)";
    }

    return OP_FREIGABE === "anwendung"

        ? "Usage Debut – erste Nutzung"

        : "Fruit Debut – Frucht erstmals gezeigt";
}


/**
 * Beschriftet die bisherigen Radio-Buttons neu
 * und ergänzt den Schalter für den Gesamtkatalog.
 *
 * @returns {void}
 */
function erstelleOPKatalogSchalter() {

    const feld = document.querySelector(
        "#seite-onepiece .einstellungen"
    );

    if (!feld) return;


    // -------------------------------------
    // FRUIT DEBUT
    // -------------------------------------

    const fruchtRadio = document.querySelector(
        'input[name="op-freigabe"][value="erwaehnung"]'
    );

    if (fruchtRadio) {

        const label = fruchtRadio.closest("label");

        if (label) {

            label.replaceChildren(

                fruchtRadio,

                document.createTextNode(
                    " Fruit Debut – Frucht erstmals gezeigt"
                )
            );
        }
    }


    // -------------------------------------
    // USAGE DEBUT
    // -------------------------------------

    const nutzungRadio = document.querySelector(
        'input[name="op-freigabe"][value="anwendung"]'
    );

    if (nutzungRadio) {

        const label = nutzungRadio.closest("label");

        if (label) {

            label.replaceChildren(

                nutzungRadio,

                document.createTextNode(
                    " Usage Debut – Fähigkeit erstmals genutzt"
                )
            );
        }
    }


    // Schalter nur einmal erstellen
    if (
        document.getElementById("op-vollkatalog")
    ) {
        return;
    }


    // -------------------------------------
    // ERKLÄRUNG
    // -------------------------------------

    const erklaerung = document.createElement("p");
    erklaerung.className = "hinweis";

    erklaerung.textContent =

        "Fruit Debut ist nicht die erste Namens-Erwähnung. " +
        "Viele Früchte wurden erstmals nur in Magazinen " +
        "oder wesentlich später gezeigt. Für Folge 650 " +
        "liefert Usage Debut wesentlich mehr Fragen.";


    // -------------------------------------
    // GESAMTKATALOG-SCHALTER
    // -------------------------------------

    const label = document.createElement("label");
    label.className = "hinweis";

    const checkbox = document.createElement("input");

    checkbox.id = "op-vollkatalog";
    checkbox.type = "checkbox";
    checkbox.checked = OP_VOLLER_KATALOG;

    label.append(

        checkbox,

        document.createTextNode(
            " Alle lokal erfassten Früchte ohne Episodenfilter " +
            "verwenden (Spoiler!)"
        )
    );


    // Elemente vor dem Speichern-Button einfügen
    const button = document.getElementById(
        "episode-speichern"
    );

    feld.insertBefore(erklaerung, button);
    feld.insertBefore(label, button);


    // Schalteränderung übernehmen
    checkbox.addEventListener("change", () => {

        const episodentext =
            document.getElementById(
                "onepiece-episode"
            ).value;

        if (episodentext) {

            speichereOnePieceEinstellungen();
        }
    });
}


// =========================================
// 6. ONE-PIECE-MENÜ AKTUALISIEREN
// =========================================

/**
 * Zeigt die Anzahl der verfügbaren Früchte und Figuren.
 *
 * @returns {void}
 */
function aktualisiereOnePieceMenue() {

    const ok =
        Number.isInteger(OP_EPISODE) &&
        OP_EPISODE >= 1;

    document.getElementById(
        "onepiece-modi"
    ).hidden = !ok;

    const status = document.getElementById(
        "episode-status"
    );

    if (!ok) {

        status.textContent =
            "Bitte zuerst deine Anime-Episode eingeben.";

        return;
    }

    const fruechte = holeBekannteFruechte(
        OP_EPISODE,
        OP_FREIGABE,
        OP_VOLLER_KATALOG
    );

    const figuren = holeBekannteCharaktere(
        OP_EPISODE,
        OP_VOLLER_KATALOG
    );

    status.textContent =

        `Episode ${OP_EPISODE} · ${opRegelText()} · ` +

        `${fruechte.length} Früchte · ` +
        `${figuren.length} Charaktere · ` +

        OP_KATALOG_INFO.quelle;
}


// =========================================
// 7. ONE-PIECE-MENÜ ÖFFNEN
// =========================================

/**
 * Öffnet One Piece ohne API-Download.
 *
 * @returns {void}
 */
function oeffneOnePieceBereich() {

    zeigeSeite("onepiece");

    aktualisiereOnePieceMenue();
}


// =========================================
// 8. ONE-PIECE-EINSTELLUNGEN SPEICHERN
// =========================================

/**
 * Speichert Episodenstand, Regel und Gesamtkatalogmodus.
 *
 * @returns {void}
 */
function speichereOnePieceEinstellungen() {

    const eingabe = document.getElementById(
        "onepiece-episode"
    );

    const episode = Number(eingabe.value);

    if (
        !eingabe.value ||
        !Number.isInteger(episode) ||
        episode < 1
    ) {

        document.getElementById(
            "episode-status"
        ).textContent =
            "Bitte eine gültige Episodennummer eingeben.";

        return;
    }

    const art = document.querySelector(
        'input[name="op-freigabe"]:checked'
    )?.value || "anwendung";

    const voll = document.getElementById(
        "op-vollkatalog"
    )?.checked ?? false;

    const veraendert =
        episode !== OP_EPISODE ||
        art !== OP_FREIGABE ||
        voll !== OP_VOLLER_KATALOG;

    if (veraendert) {

        verwerfeSitzungen("onepiece");
    }

    OP_EPISODE = episode;
    OP_FREIGABE = art;
    OP_VOLLER_KATALOG = voll;


    // Im Browser speichern
    try {

        localStorage.setItem(

            "quiz-op-einstellungen",

            JSON.stringify({
                episode,
                freigabe: art,
                vollerKatalog: voll
            })
        );

    } catch {

        // Lokaler Speicher ist optional.
    }

    aktualisiereOnePieceMenue();
}


// =========================================
// 9. EINSTELLUNGEN WIEDERHERSTELLEN
// =========================================

/**
 * Lädt die zuletzt gespeicherten Einstellungen.
 *
 * @returns {void}
 */
function ladeOnePieceEinstellungen() {

    try {

        const daten = JSON.parse(
            localStorage.getItem(
                "quiz-op-einstellungen"
            )
        );

        if (
            Number.isInteger(daten?.episode) &&
            daten.episode >= 1
        ) {

            OP_EPISODE = daten.episode;

            OP_FREIGABE =
                daten.freigabe === "erwaehnung"
                    ? "erwaehnung"
                    : "anwendung";

            OP_VOLLER_KATALOG =
                daten.vollerKatalog === true;

            document.getElementById(
                "onepiece-episode"
            ).value = String(OP_EPISODE);
        }

    } catch {

        // Noch nichts gespeichert.
    }


    // Labels und Schalter aufbauen
    erstelleOPKatalogSchalter();


    // Gespeicherte Freigaberegel auswählen
    const radio = document.querySelector(

        `input[name="op-freigabe"]` +
        `[value="${OP_FREIGABE}"]`
    );

    if (radio) {

        radio.checked = true;
    }


    // Gesamtkatalog-Schalter setzen
    const check = document.getElementById(
        "op-vollkatalog"
    );

    if (check) {

        check.checked = OP_VOLLER_KATALOG;
    }

    aktualisiereOnePieceMenue();
}


// =========================================
// 10. SPIELMODUS ÖFFNEN
// =========================================

/**
 * Öffnet einen Pokémon- oder One-Piece-Modus.
 *
 * @param {string} modus - Spielmodus-ID
 * @param {string} welt - "pokemon" oder "onepiece"
 * @returns {void}
 */
function oeffneModus(modus, welt = "pokemon") {

    if (!MODI_TITEL[modus]) return;

    if (
        welt === "pokemon" &&
        (
            !MAX_GENERATION ||
            AUSGEWAEHLTE_GENERATIONEN.size === 0
        )
    ) {
        return;
    }

    if (
        welt === "onepiece" &&
        !OP_EPISODE
    ) {
        return;
    }


    // Aktuelle Sitzung pausieren
    pausiereAktivesSpiel();

    AKTIVER_MODUS = modus;
    AKTIVE_WELT = welt;

    const schluessel = `${welt}:${modus}`;


    // Spieltitel setzen
    document.getElementById(
        "spiel-titel"
    ).textContent = MODI_TITEL[modus];


    // Übungsumfang anzeigen
    document.getElementById(
        "spiel-umfang"
    ).textContent =

        welt === "pokemon"

            ? `Generation ` +
              [...AUSGEWAEHLTE_GENERATIONEN]
                  .sort((a, b) => a - b)
                  .join(" + ") +
              ` · Typwissen bis Gen ${MAX_GENERATION}`

            : `One Piece · Episode ${OP_EPISODE}` +
              ` · ${opRegelText()}`;


    // =====================================
    // NEUE SITZUNG ERSTELLEN
    // =====================================

    if (!SITZUNGEN.has(schluessel)) {

        const timerAnzeige = document.getElementById(
            "spiel-timer"
        );

        let sitzung;


        // ---------------------------------
        // POKÉMON
        // ---------------------------------

        if (welt === "pokemon") {

            const kontext = {

                pool: ALLE_POKEMON.filter(p =>
                    AUSGEWAEHLTE_GENERATIONEN.has(p.gen)
                ),

                maxGen: MAX_GENERATION,

                timerAnzeige
            };

            const fabriken = {

                frei: () =>
                    erstellePokedexModus(kontext, false),

                reihe: () =>
                    erstellePokedexModus(kontext, true),

                "de-en": () =>
                    erstelleUebersetzung(kontext, true),

                "en-de": () =>
                    erstelleUebersetzung(kontext, false),

                typen: () =>
                    erstelleTypZuordnung(kontext),

                "typ-zufall": () =>
                    erstelleTypNamenModus(kontext, false),

                "typ-wahl": () =>
                    erstelleTypNamenModus(kontext, true),

                "pokemon-vergleich": () =>
                    erstellePokemonVergleich(kontext)
            };

            sitzung = fabriken[modus]

                ? fabriken[modus]()

                : erstelleAttackenModus(
                    kontext,
                    modus
                );


        // ---------------------------------
        // ONE PIECE
        // ---------------------------------

        } else {

            sitzung = erstelleOnePieceSpiel(

                {
                    episode: OP_EPISODE,
                    freigabe: OP_FREIGABE,

                    vollkatalog: OP_VOLLER_KATALOG,

                    timerAnzeige
                },

                modus
            );
        }

        if (!sitzung) return;

        SITZUNGEN.set(
            schluessel,
            sitzung
        );
    }


    // =====================================
    // SITZUNG ANZEIGEN
    // =====================================

    document.getElementById(
        "spiel-inhalt"
    ).replaceChildren(
        SITZUNGEN.get(schluessel).root
    );

    zeigeSeite("spiel");

    SITZUNGEN.get(schluessel).resume();
}


// =========================================
// 11. ZUM SPIELMENÜ ZURÜCK
// =========================================

/**
 * Kehrt zum Pokémon- oder One-Piece-Menü zurück.
 *
 * @returns {void}
 */
function zurueckZumMenue() {

    pausiereAktivesSpiel();

    AKTIVER_MODUS = null;

    zeigeSeite(
        AKTIVE_WELT || "welt"
    );
}


/**
 * Kehrt zur ersten Startseite zurück.
 *
 * @returns {void}
 */
function zurQuizWelt() {

    pausiereAktivesSpiel();

    AKTIVER_MODUS = null;
    AKTIVE_WELT = null;

    zeigeSeite("welt");
}


// =========================================
// 12. BUTTONS VERBINDEN
// =========================================


// Startseiten
document.getElementById(
    "welt-pokemon"
).addEventListener(
    "click",
    oeffnePokemonBereich
);

document.getElementById(
    "welt-onepiece"
).addEventListener(
    "click",
    oeffneOnePieceBereich
);


// Zurück-Buttons
for (const id of [
    "zur-welt",
    "pokemon-zurueck",
    "onepiece-zurueck"
]) {

    document.getElementById(
        id
    ).addEventListener(
        "click",
        zurQuizWelt
    );
}

document.getElementById(
    "spiel-zurueck"
).addEventListener(
    "click",
    zurueckZumMenue
);


// =========================================
// 13. POKÉMON-GENERATION
// =========================================

document.getElementById(
    "max-generation"
).addEventListener("change", event => {

    MAX_GENERATION = event.target.value

        ? Number(event.target.value)

        : null;

    AUSGEWAEHLTE_GENERATIONEN = MAX_GENERATION

        ? new Set([MAX_GENERATION])

        : new Set();

    verwerfeSitzungen("pokemon");

    zeichneGenerationen();
    aktualisiereUmfang();
});


// =========================================
// 14. ALLE GENERATIONEN
// =========================================

document.getElementById(
    "alle-generationen"
).addEventListener("click", () => {

    if (!MAX_GENERATION) return;

    AUSGEWAEHLTE_GENERATIONEN = new Set(

        ALLE_POKEMON

            .filter(p =>
                p.gen <= MAX_GENERATION
            )

            .map(p => p.gen)
    );

    verwerfeSitzungen("pokemon");

    zeichneGenerationen();
    aktualisiereUmfang();
});


// =========================================
// 15. AUSWAHL LEEREN
// =========================================

document.getElementById(
    "keine-generationen"
).addEventListener("click", () => {

    AUSGEWAEHLTE_GENERATIONEN.clear();

    verwerfeSitzungen("pokemon");

    zeichneGenerationen();
    aktualisiereUmfang();
});


// =========================================
// 16. ONE-PIECE-EPISODE SPEICHERN
// =========================================

document.getElementById(
    "episode-speichern"
).addEventListener(
    "click",
    speichereOnePieceEinstellungen
);


// =========================================
// 17. POKÉMON-MODI
// =========================================

document.querySelectorAll(
    "[data-modus]"
).forEach(button => {

    button.addEventListener("click", () => {

        oeffneModus(
            button.dataset.modus,
            "pokemon"
        );
    });
});


// =========================================
// 18. ONE-PIECE-MODI
// =========================================

document.querySelectorAll(
    "[data-op-modus]"
).forEach(button => {

    button.addEventListener("click", () => {

        oeffneModus(
            button.dataset.opModus,
            "onepiece"
        );
    });
});


// =========================================
// 19. PROGRAMM STARTEN
// =========================================

ladeOnePieceEinstellungen();

zeigeSeite("welt");
