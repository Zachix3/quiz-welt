
/* =====================================================
   GEMEINSAME AUTOVERVOLLSTÄNDIGUNG

   - Vorschläge ab 2 Buchstaben
   - Enter übernimmt den markierten Vorschlag
   - Pfeil hoch/runter wechselt den Vorschlag
   - Escape schließt die Liste
   - Klick auf einen Vorschlag funktioniert ebenfalls
   ===================================================== */

const QUIZ_VORSCHLAEGE = new WeakMap();
const QUIZ_AUSWAHL_LAEUFT = new WeakSet();


/**
 * Normalisiert einen Text für die Suche.
 *
 * @param {string} wert - Eingegebener Text
 * @returns {string} Normalisierter Text
 */
function quizSuchtext(wert) {
    return normalisiere(String(wert || ""));
}


/**
 * Ermittelt die passenden Daten für den aktuellen Modus.
 *
 * @param {HTMLInputElement} eingabe - Eingabefeld
 * @returns {Promise<Object>} Typ, Sprache und Kandidaten
 */
function quizAktuelleAuswahl(eingabe) {

    const modus =
        typeof AKTIVER_MODUS === "string"
            ? AKTIVER_MODUS
            : "";

    const welt =
        typeof AKTIVE_WELT === "string"
            ? AKTIVE_WELT
            : "";

    const istTraining =
        eingabe.classList.contains("uebungs-eingabe");


    // =====================================
    // POKÉMON
    // =====================================

    if (welt === "pokemon") {

        const istAttackenEingabe = istTraining

            ? modus.startsWith("attacke-")

            : modus.startsWith("pokemon-attacken-") ||
              modus === "attacke-de-en" ||
              modus === "attacke-en-de";


        // Attackennamen vorschlagen
        if (istAttackenEingabe) {

            const sprache =
                modus === "attacke-de-en"
                    ? "en"
                    : "de";

            return ladeAttackenNamen().then(daten => ({

                typ: "attacke",
                sprache,

                liste: daten.attacken.filter(
                    attacke =>
                        attacke.gen <= MAX_GENERATION
                )
            }));
        }


        // Pokémon-Namen vorschlagen
        const sprache =
            modus === "de-en"
                ? "en"
                : "de";

        return Promise.resolve({

            typ: "pokemon",
            sprache,

            liste: ALLE_POKEMON.filter(pokemon =>
                AUSGEWAEHLTE_GENERATIONEN.has(
                    pokemon.gen
                )
            )
        });
    }


    // =====================================
    // ONE PIECE
    // =====================================

    if (welt === "onepiece") {

        // Teufelsfruchtnamen vorschlagen
        if (
            modus === "op-frucht-sprache" ||
            modus === "op-anwender-frucht"
        ) {

            const sprache =
                modus === "op-frucht-sprache"

                    ? (
                        eingabe
                            .closest(".frage-karte")
                            ?.querySelector(".sprache-nach")
                            ?.value || "de"
                    )

                    : "de";

            return Promise.resolve({

                typ: "frucht",
                sprache,

                liste: holeBekannteFruechte(
                    OP_EPISODE,
                    OP_FREIGABE,
                    OP_VOLLER_KATALOG
                )
            });
        }


        // Charaktere vorschlagen
        return Promise.resolve({

            typ: "figur",
            sprache: "de",

            liste: holeBekannteCharaktere(
                OP_EPISODE,
                OP_VOLLER_KATALOG
            )
        });
    }


    return Promise.resolve({
        typ: "keine",
        sprache: "de",
        liste: []
    });
}


/**
 * Gibt alle Namen und Aliasse eines Eintrags zurück.
 *
 * @param {Object} item - Pokémon, Attacke, Frucht oder Figur
 * @param {string} typ - Datentyp
 * @returns {string[]} Namen
 */
function quizNamen(item, typ) {

    if (typ === "pokemon" || typ === "attacke") {

        return [
            item.de,
            item.en
        ].filter(Boolean);
    }

    if (typ === "figur") {

        return [
            item.name,
            item.en,
            ...(item.alias || [])
        ].filter(Boolean);
    }

    return [
        item.de,
        item.en,
        item.ja,
        ...(item.alias || [])
    ].filter(Boolean);
}


/**
 * Ermittelt den Text, der in die Eingabe übernommen wird.
 *
 * @param {Object} item - Kandidat
 * @param {string} typ - Datentyp
 * @param {string} sprache - "de", "en" oder "ja"
 * @returns {string} Anzeigename
 */
function quizAnzeigename(item, typ, sprache) {

    if (typ === "figur") {
        return item.name;
    }

    return item[sprache] ||
           item.de ||
           item.en ||
           item.ja ||
           "";
}


/**
 * Findet oder erstellt den Vorschlagsbereich.
 *
 * @param {HTMLInputElement} eingabe - Eingabefeld
 * @returns {Object} Vorschlagszustand
 */
function quizVorschlagContainer(eingabe) {

    let zustand = QUIZ_VORSCHLAEGE.get(eingabe);

    if (zustand) return zustand;

    const bereich =
        eingabe.closest(".frage-karte");

    // Vorhandenen Vorschlagsbereich wiederverwenden
    let container =
        !eingabe.classList.contains("uebungs-eingabe")

            ? bereich?.querySelector(".vorschlaege")

            : null;


    // Sonst einen neuen erstellen
    if (!container) {

        container = document.createElement("div");
        container.className = "vorschlaege";

        const anker =
            eingabe.closest(".antwort-form") ||
            eingabe.closest(".eingabe-leiste") ||
            eingabe;

        anker.insertAdjacentElement(
            "afterend",
            container
        );
    }

    container.setAttribute("role", "listbox");

    zustand = {
        container,
        optionen: [],
        index: 0,
        anfrage: 0
    };

    QUIZ_VORSCHLAEGE.set(eingabe, zustand);

    return zustand;
}


/**
 * Leert die Vorschlagsliste.
 *
 * @param {HTMLInputElement} eingabe
 * @returns {void}
 */
function quizVorschlaegeLeeren(eingabe) {

    const zustand =
        QUIZ_VORSCHLAEGE.get(eingabe);

    if (!zustand) return;

    zustand.anfrage++;
    zustand.optionen = [];

    zustand.container.replaceChildren();
}


/**
 * Übernimmt einen Vorschlag in das Eingabefeld.
 *
 * @param {HTMLInputElement} eingabe
 * @param {Object} kandidat - Ausgewählter Vorschlag
 * @returns {void}
 */
function quizVorschlagWaehlen(eingabe, kandidat) {

    const zustand =
        QUIZ_VORSCHLAEGE.get(eingabe);

    if (!zustand) return;

    QUIZ_AUSWAHL_LAEUFT.add(eingabe);

    eingabe.value = kandidat.eingabewert;

    quizVorschlaegeLeeren(eingabe);


    // Das bestehende Quiz über die Eingabe informieren.
    // So funktionieren vorhandene Prüfungen weiter.
    eingabe.dispatchEvent(
        new Event("input", {
            bubbles: true
        })
    );


    // Attackenquiz:
    // Auch eine ausgewählte falsche Antwort muss
    // als bestätigte Antwort gewertet werden.
    const formular =
        eingabe.closest(".antwort-form");

    if (formular) {

        formular.dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true
            })
        );
    }

    if (
        eingabe.isConnected &&
        !eingabe.disabled
    ) {
        eingabe.focus();
    }
}


/**
 * Hebt den markierten Vorschlag optisch hervor.
 *
 * @param {HTMLInputElement} eingabe
 * @returns {void}
 */
function quizAktivenVorschlagMarkieren(eingabe) {

    const zustand =
        QUIZ_VORSCHLAEGE.get(eingabe);

    if (!zustand) return;

    for (
        let i = 0;
        i < zustand.container.children.length;
        i++
    ) {

        const button =
            zustand.container.children[i];

        const ausgewaehlt =
            i === zustand.index;

        button.setAttribute(
            "aria-selected",
            String(ausgewaehlt)
        );

        button.style.outline = ausgewaehlt
            ? "2px solid #e9494b"
            : "";
    }
}


/**
 * Sucht und zeichnet passende Vorschläge.
 *
 * @param {HTMLInputElement} eingabe
 * @returns {Promise<void>}
 */
async function quizVorschlaegeAnzeigen(eingabe) {

    const zustand =
        quizVorschlagContainer(eingabe);

    const gesucht =
        quizSuchtext(eingabe.value);


    // Erst ab zwei Zeichen anzeigen
    if (gesucht.length < 2) {

        quizVorschlaegeLeeren(eingabe);
        return;
    }

    const anfrage = ++zustand.anfrage;

    let daten;

    try {

        daten = await quizAktuelleAuswahl(eingabe);

    } catch (fehler) {

        console.warn(
            "Vorschläge konnten nicht geladen werden:",
            fehler
        );

        quizVorschlaegeLeeren(eingabe);
        return;
    }


    // Veraltete Suchanfragen ignorieren
    if (
        anfrage !== zustand.anfrage ||
        quizSuchtext(eingabe.value) !== gesucht ||
        eingabe.disabled ||
        !eingabe.isConnected
    ) {
        return;
    }


    // =====================================
    // KANDIDATEN SUCHEN
    // =====================================

    const kandidaten = daten.liste.map(item => {

        const namen =
            quizNamen(item, daten.typ);

        const anzeigename =
            quizAnzeigename(
                item,
                daten.typ,
                daten.sprache
            );

        const normalisiert =
            namen.map(quizSuchtext);

        return {
            item,
            namen,
            anzeigename,
            normalisiert,

            eingabewert: anzeigename,

            // Namen, die direkt mit der Eingabe
            // beginnen, stehen weiter oben.
            rang:
                quizSuchtext(anzeigename).startsWith(
                    gesucht
                )
                    ? 0
                    : normalisiert.some(name =>
                        name.startsWith(gesucht)
                    )
                        ? 1
                        : 2
        };

    }).filter(kandidat =>

        kandidat.eingabewert &&

        kandidat.normalisiert.some(name =>
            name.includes(gesucht)
        )
    );


    // Vorschläge sortieren
    kandidaten.sort((a, b) =>

        a.rang - b.rang ||

        a.anzeigename.localeCompare(
            b.anzeigename,
            "de"
        )
    );


    // Maximal acht Ergebnisse
    zustand.optionen =
        kandidaten.slice(0, 8);

    zustand.index = 0;

    zustand.container.replaceChildren();


    // =====================================
    // VORSCHLAGS-BUTTONS ERSTELLEN
    // =====================================

    for (const kandidat of zustand.optionen) {

        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "vorschlag";
        button.setAttribute("role", "option");


        // Pokémon mit Bild
        if (daten.typ === "pokemon") {

            const bild =
                pokemonBild(kandidat.item);

            bild.alt = "";
            bild.loading = "lazy";

            button.appendChild(bild);


        // One-Piece-Figur mit Bild, falls vorhanden
        } else if (
            daten.typ === "figur" &&
            kandidat.item.bild
        ) {

            const bild =
                document.createElement("img");

            bild.src = kandidat.item.bild;
            bild.alt = "";
            bild.loading = "lazy";

            bild.onerror = () => bild.remove();

            button.appendChild(bild);


        // Sonst neutrales Symbol
        } else {

            const symbol =
                document.createElement("span");

            symbol.className = "vorschlag-bild";

            symbol.textContent =
                daten.typ === "frucht"
                    ? "🍈"
                    : daten.typ === "attacke"
                        ? "⚡"
                        : "👤";

            button.appendChild(symbol);
        }


        // Anzeigename
        const label =
            document.createElement("span");

        label.textContent =
            kandidat.anzeigename;


        // Weiteren Namen anzeigen
        const beschreibung =
            kandidat.namen.find(name =>
                name !== kandidat.anzeigename
            );

        if (beschreibung) {

            const klein =
                document.createElement("small");

            klein.textContent = beschreibung;

            label.appendChild(klein);
        }

        button.appendChild(label);


        // Anklicken übernimmt Vorschlag
        button.addEventListener("click", () => {

            quizVorschlagWaehlen(
                eingabe,
                kandidat
            );
        });

        zustand.container.appendChild(button);
    }

    quizAktivenVorschlagMarkieren(eingabe);
}


// =====================================
// EVENT-LISTENER FÜR ALLE EINGABEFELDER
// =====================================

document.addEventListener("input", event => {

    const eingabe = event.target;

    if (
        !(eingabe instanceof HTMLInputElement) ||
        !eingabe.matches(
            ".namen-eingabe, .uebungs-eingabe"
        )
    ) {
        return;
    }


    // Bereits übernommene Auswahl nicht
    // direkt wieder als Vorschlag anzeigen.
    if (QUIZ_AUSWAHL_LAEUFT.has(eingabe)) {

        QUIZ_AUSWAHL_LAEUFT.delete(eingabe);

        quizVorschlaegeLeeren(eingabe);
        return;
    }

    quizVorschlaegeAnzeigen(eingabe);
});


document.addEventListener("keydown", event => {

    const eingabe = event.target;

    if (
        !(eingabe instanceof HTMLInputElement) ||
        !eingabe.matches(
            ".namen-eingabe, .uebungs-eingabe"
        )
    ) {
        return;
    }

    const zustand =
        QUIZ_VORSCHLAEGE.get(eingabe);

    if (!zustand?.optionen.length) return;


    // Nächsten Vorschlag markieren
    if (event.key === "ArrowDown") {

        event.preventDefault();

        zustand.index =
            (zustand.index + 1) %
            zustand.optionen.length;

        quizAktivenVorschlagMarkieren(eingabe);


    // Vorherigen Vorschlag markieren
    } else if (event.key === "ArrowUp") {

        event.preventDefault();

        zustand.index =
            (
                zustand.index - 1 +
                zustand.optionen.length
            ) % zustand.optionen.length;

        quizAktivenVorschlagMarkieren(eingabe);


    // Markierten Vorschlag übernehmen
    } else if (event.key === "Enter") {

        event.preventDefault();
        event.stopImmediatePropagation();

        quizVorschlagWaehlen(
            eingabe,
            zustand.optionen[zustand.index]
        );


    // Vorschlagsliste schließen
    } else if (event.key === "Escape") {

        event.preventDefault();

        quizVorschlaegeLeeren(eingabe);
    }

}, true);
