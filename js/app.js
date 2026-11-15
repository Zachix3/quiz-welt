
/* =========================================
   HAUPTPROGRAMM – POKÉMON UND ONE PIECE
   ========================================= */


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
// 2. SPIELEINSTELLUNGEN
// =========================================

// Pokémon
let ALLE_POKEMON = [];

let MAX_GENERATION = null;

let AUSGEWAEHLTE_GENERATIONEN = new Set();


// One Piece
let OP_EPISODE = null;

let OP_FREIGABE = "erwaehnung";

let OP_VOLLER_KATALOG = false;


// Aktuelle Sitzung
let AKTIVER_MODUS = null;

let AKTIVE_WELT = null;

const SITZUNGEN = new Map();


// Laufende Ladevorgänge
let pokemonLaden = null;

let onepieceLaden = null;


// =========================================
// 3. NAVIGATION
// =========================================

/**
 * Zeigt einen Seitenbereich an.
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
    ).textContent = {

        welt: "Wähle ein Universum",

        pokemon: "Pokémon",

        onepiece: "One Piece",

        spiel: MODI_TITEL[AKTIVER_MODUS] || "Quiz"

    }[name];
}


/**
 * Pausiert den derzeitigen Spielmodus.
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
 * Beendet gespeicherte Spielrunden einer Spielwelt.
 *
 * @param {string} welt - "pokemon" oder "onepiece"
 * @returns {void}
 */
function verwerfeSitzungen(welt) {

    for (const [schluessel, spiel] of SITZUNGEN) {

        if (!schluessel.startsWith(`${welt}:`)) {
            continue;
        }

        spiel.dispose();

        SITZUNGEN.delete(schluessel);
    }
}


// =========================================
// 4. POKÉMON-GENERATIONEN
// =========================================

/**
 * Erstellt die Generations-Buttons.
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

        const ausgewaehlt =
            AUSGEWAEHLTE_GENERATIONEN.has(gen);

        button.classList.toggle(
            "aktiv",
            ausgewaehlt
        );

        button.setAttribute(
            "aria-pressed",
            String(ausgewaehlt)
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
 * Aktualisiert die Pokémon-Anzahl und Modusauswahl.
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

        ? `${pool.length} Pokémon: Gen ` +
          [...AUSGEWAEHLTE_GENERATIONEN]
              .sort((a, b) => a - b)
              .join(" + ") +
          `; Typwissen bis Gen ${MAX_GENERATION}.`

        : "Wähle mindestens eine Pokémon-Generation.";
}


/**
 * Lädt den Pokédex und öffnet das Pokémon-Menü.
 *
 * @returns {Promise<void>}
 */
async function oeffnePokemonBereich() {

    zeigeSeite("pokemon");

    if (ALLE_POKEMON.length) return;

    if (pokemonLaden) return pokemonLaden;

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

                select.value = String(MAX_GENERATION);
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
// 5. ONE PIECE – GESAMTKATALOG-SCHALTER
// =========================================

/**
 * Fügt im bestehenden One-Piece-Menü einen
 * Spoiler-Schalter hinzu.
 *
 * @returns {void}
 */
function erstelleOPKatalogSchalter() {

    const feld = document.querySelector(
        "#seite-onepiece .einstellungen"
    );

    if (
        !feld ||
        document.getElementById("op-vollkatalog")
    ) {
        return;
    }

    const label = document.createElement("label");

    label.className = "hinweis";

    const checkbox = document.createElement("input");

    checkbox.id = "op-vollkatalog";
    checkbox.type = "checkbox";
    checkbox.checked = OP_VOLLER_KATALOG;

    label.append(

        checkbox,

        document.createTextNode(
            " Vollständigen Datenkatalog verwenden " +
            "(ACHTUNG: ungefilterte Spoiler!)"
        )
    );


    // Warnhinweis
    const warnung = document.createElement("p");

    warnung.id = "op-katalog-warnung";
    warnung.className = "hinweis";

    warnung.textContent =
        "Aus: Nur Figuren/Früchte mit " +
        "nachgewiesener Anime-Episode.";


    // Vor dem Speichern-Button einfügen
    const button = document.getElementById(
        "episode-speichern"
    );

    feld.insertBefore(label, button);
    feld.insertBefore(warnung, button);


    // Schalteränderung
    checkbox.addEventListener("change", () => {

        warnung.textContent = checkbox.checked

            ? "An: Aktuelle Kopfgelder, spätere Figuren, " +
              "Fruchtnamen und Bilder können die Handlung spoilern."

            : "Aus: Nur Figuren/Früchte mit " +
              "nachgewiesener Anime-Episode.";

        if (Number.isInteger(OP_EPISODE)) {

            speichereOnePieceEinstellungen();
        }
    });
}


// =========================================
// 6. ONE PIECE – MENÜSTATUS
// =========================================

/**
 * Zeigt die für den Episodenstand freigegebenen
 * Figuren und Teufelsfrüchte an.
 *
 * @returns {void}
 */
function aktualisiereOnePieceMenue() {

    const gueltig =
        Number.isInteger(OP_EPISODE) &&
        OP_EPISODE >= 1;

    document.getElementById(
        "onepiece-modi"
    ).hidden = !gueltig || !OP_FRUECHTE.length;

    const status = document.getElementById(
        "episode-status"
    );

    if (!gueltig) {

        status.textContent =
            "Bitte zuerst eine gültige Episode eingeben.";

        return;
    }

    if (!OP_FRUECHTE.length) {

        status.textContent =
            "One-Piece-Katalog wird geladen …";

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

    const regel = OP_VOLLER_KATALOG

        ? "GESAMTKATALOG MIT SPOILERN"

        : `Erste ${OP_FREIGABE}`;

    status.textContent =

        `Episode ${OP_EPISODE} · ${regel}` +

        ` · ${figuren.length} Figuren` +

        ` / ${fruechte.length} Früchte` +

        ` · ${OP_KATALOG_INFO.quelle}.`;
}


// =========================================
// 7. ONE PIECE – DATEN LADEN
// =========================================

/**
 * Lädt den großen One-Piece-Katalog beim Öffnen
 * des One-Piece-Bereichs.
 *
 * @returns {Promise<void>}
 */
async function oeffneOnePieceBereich() {

    zeigeSeite("onepiece");

    if (OP_FRUECHTE.length) {

        aktualisiereOnePieceMenue();

        return;
    }

    if (onepieceLaden) return onepieceLaden;

    const status = document.getElementById(
        "episode-status"
    );

    status.textContent =
        "Lade Charaktere und Teufelsfrüchte " +
        "aus dem Online-Katalog …";

    onepieceLaden = ladeOnePieceDaten()

        .then(() => {

            aktualisiereOnePieceMenue();
        })

        .catch(fehler => {

            status.textContent =
                "One-Piece-Katalog konnte nicht geladen werden: " +
                fehler.message;
        })

        .finally(() => {

            onepieceLaden = null;
        });

    return onepieceLaden;
}


// =========================================
// 8. ONE PIECE – EINSTELLUNGEN SPEICHERN
// =========================================

/**
 * Speichert Episode, Freigabe und Gesamtkatalogmodus.
 *
 * @returns {void}
 */
function speichereOnePieceEinstellungen() {

    const feld = document.getElementById(
        "onepiece-episode"
    );

    const episode = Number(feld.value);

    if (
        !feld.value ||
        !Number.isInteger(episode) ||
        episode < 1
    ) {

        document.getElementById(
            "episode-status"
        ).textContent =
            "Bitte gültige Episode eingeben.";

        return;
    }

    const art = document.querySelector(
        'input[name="op-freigabe"]:checked'
    )?.value || "erwaehnung";

    const voll = document.getElementById(
        "op-vollkatalog"
    )?.checked ?? false;

    const geaendert =
        episode !== OP_EPISODE ||
        art !== OP_FREIGABE ||
        voll !== OP_VOLLER_KATALOG;

    if (geaendert) {

        verwerfeSitzungen("onepiece");
    }

    OP_EPISODE = episode;
    OP_FREIGABE = art;
    OP_VOLLER_KATALOG = voll;


    // Speicherung im Browser
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
        // Auch ohne Browser-Speicher spielbar.
    }

    aktualisiereOnePieceMenue();
}


// =========================================
// 9. ONE PIECE – EINSTELLUNGEN WIEDERHERSTELLEN
// =========================================

/**
 * Lädt den zuletzt gespeicherten Episodenstand.
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
                daten.freigabe === "anwendung"
                    ? "anwendung"
                    : "erwaehnung";

            OP_VOLLER_KATALOG =
                daten.vollerKatalog === true;

            document.getElementById(
                "onepiece-episode"
            ).value = String(OP_EPISODE);

            const radio = document.querySelector(

                `input[name="op-freigabe"]` +
                `[value="${OP_FREIGABE}"]`
            );

            if (radio) {
                radio.checked = true;
            }
        }

    } catch {
        // Kein vorhandener Speicherstand.
    }

    erstelleOPKatalogSchalter();

    const checkbox = document.getElementById(
        "op-vollkatalog"
    );

    if (checkbox) {

        checkbox.checked = OP_VOLLER_KATALOG;

        document.getElementById(
            "op-katalog-warnung"
        ).textContent = OP_VOLLER_KATALOG

            ? "An: Aktuelle Figuren, Bilder, Kopfgelder " +
              "und Früchte können Spoiler enthalten."

            : "Aus: Nur Inhalte mit belegter Anime-Episode.";
    }

    aktualisiereOnePieceMenue();
}


// =========================================
// 10. SPIELMODUS ÖFFNEN
// =========================================

/**
 * Startet einen Pokémon- oder One-Piece-Spielmodus.
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
            !AUSGEWAEHLTE_GENERATIONEN.size
        )
    ) {
        return;
    }

    if (
        welt === "onepiece" &&
        (
            !OP_EPISODE ||
            !OP_FRUECHTE.length
        )
    ) {
        return;
    }

    pausiereAktivesSpiel();

    AKTIVER_MODUS = modus;
    AKTIVE_WELT = welt;

    const schluessel = `${welt}:${modus}`;

    document.getElementById(
        "spiel-titel"
    ).textContent = MODI_TITEL[modus];


    // Übungsumfang anzeigen
    document.getElementById(
        "spiel-umfang"
    ).textContent = welt === "pokemon"

        ? `Gen ` +
          [...AUSGEWAEHLTE_GENERATIONEN]
              .sort((a, b) => a - b)
              .join(" + ") +
          ` · Typwissen bis Gen ${MAX_GENERATION}`

        : `One Piece · Episode ${OP_EPISODE} · ` +
          (
              OP_VOLLER_KATALOG

                  ? "VOLLER KATALOG / SPOILER"

                  : `Erste ${OP_FREIGABE}`
          );


    // -------------------------------------
    // NEUE SPIELSITZUNG
    // -------------------------------------

    if (!SITZUNGEN.has(schluessel)) {

        const timerAnzeige = document.getElementById(
            "spiel-timer"
        );

        let spiel = null;

        if (welt === "pokemon") {

            const kontext = {

                pool: ALLE_POKEMON.filter(p =>
                    AUSGEWAEHLTE_GENERATIONEN.has(p.gen)
                ),

                maxGen: MAX_GENERATION,

                timerAnzeige
            };

            const fabrik = {

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

            if (fabrik[modus]) {

                spiel = fabrik[modus]();

            } else if (

                modus.startsWith("attacke-") ||
                modus.startsWith("pokemon-attacken-")

            ) {

                spiel = erstelleAttackenModus(
                    kontext,
                    modus
                );
            }

        } else {

            // One-Piece-Spiel erstellen
            spiel = erstelleOnePieceSpiel(

                {
                    episode: OP_EPISODE,
                    freigabe: OP_FREIGABE,

                    vollkatalog: OP_VOLLER_KATALOG,

                    timerAnzeige
                },

                modus
            );
        }

        if (!spiel) return;

        SITZUNGEN.set(schluessel, spiel);
    }


    // -------------------------------------
    // SPIEL ANZEIGEN
    // -------------------------------------

    document.getElementById(
        "spiel-inhalt"
    ).replaceChildren(

        SITZUNGEN.get(schluessel).root
    );

    zeigeSeite("spiel");

    SITZUNGEN.get(schluessel).resume();
}


// =========================================
// 11. ZURÜCK ZUM MENÜ
// =========================================

/**
 * Öffnet das Menü der zuletzt gespielten Welt.
 *
 * @returns {void}
 */
function zurueckZumMenue() {

    pausiereAktivesSpiel();

    AKTIVER_MODUS = null;

    zeigeSeite(AKTIVE_WELT || "welt");
}


/**
 * Öffnet die erste Startseite.
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

// Startseite
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


// Zurück-Navigation
document.getElementById(
    "zur-welt"
).addEventListener(
    "click",
    zurQuizWelt
);

document.getElementById(
    "pokemon-zurueck"
).addEventListener(
    "click",
    zurQuizWelt
);

document.getElementById(
    "onepiece-zurueck"
).addEventListener(
    "click",
    zurQuizWelt
);

document.getElementById(
    "spiel-zurueck"
).addEventListener(
    "click",
    zurueckZumMenue
);


// =========================================
// 13. POKÉMON-GENERATION AUSWÄHLEN
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
