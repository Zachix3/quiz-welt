
/* =====================================================
   TYPEN-MODI
   Typen zuordnen, Zufallstyp, Typ vervollständigen
   ===================================================== */


// =====================================
// 1. TYPENPLAKETTE ERSTELLEN
// =====================================

/**
 * Erstellt eine farbige Anzeige für einen Pokémon-Typ.
 *
 * @param {number} typId - PokéAPI-Typ-ID
 * @returns {HTMLElement} Farbige Typplakette
 */
function typPlakette(typId) {

    const typ = TYP_INFO[typId];

    const element = document.createElement("span");
    element.className = "typ-plakette";

    element.style.setProperty(
        "--typ-farbe",
        typ.farbe
    );

    const name = document.createElement("span");
    name.textContent = typ.name;

    element.append(
        typSymbol(typId),
        name
    );

    return element;
}


// =====================================
// 2. MODUS: TYPEN ZUORDNEN
// =====================================

/**
 * Erstellt ein Quiz, in dem man die historischen Typen
 * eines angezeigten Pokémon anklicken muss.
 *
 * @param {Object} kontext - Enthält Pokémon, Generation,
 *                           Timeranzeige
 * @returns {Object} Spielsitzung
 */
function erstelleTypZuordnung(kontext) {

    const {
        pool,
        maxGen,
        timerAnzeige
    } = kontext;


    // ---------------------------------
    // A. HTML erzeugen
    // ---------------------------------

    const root = document.createElement("div");
    root.className = "frage-karte typen-karte";

    root.innerHTML = `
        <p class="fortschritt"></p>

        <div class="pokemon-frage">
            <img class="artwork" alt="">
            <strong class="pokemon-name"></strong>
        </div>

        <p class="hinweis">
            Pro Zeitraum zwei Typen:
            Bei Einzeltypen zusätzlich
            „Kein Typ“ wählen.
        </p>

        <div class="typen-perioden"></div>

        <h3>Typ-Symbole</h3>

        <div class="typen-palette"></div>

        <p class="meldung" role="status"></p>

        <p class="statistik"></p>

        <div class="aktionen">

            <button class="aufgeben" type="button">
                Aufgeben
            </button>

            <button class="neu sekundaer" type="button">
                Neustart
            </button>

        </div>
    `;


    // ---------------------------------
    // B. HTML-Elemente
    // ---------------------------------

    const bild = root.querySelector(".artwork");
    const name = root.querySelector(".pokemon-name");

    const bereich = root.querySelector(".typen-perioden");
    const palette = root.querySelector(".typen-palette");

    const meldung = root.querySelector(".meldung");
    const fortschritt = root.querySelector(".fortschritt");
    const statistik = root.querySelector(".statistik");

    const aufgeben = root.querySelector(".aufgeben");

    const timer = erstelleStoppuhr(timerAnzeige);


    // ---------------------------------
    // C. Spielzustand
    // ---------------------------------

    let liste = [];

    let index = 0;
    let richtig = 0;
    let aufgegeben = 0;

    let zeitraeume = [];
    let ausgewaehlt = [];
    let felder = [];

    let aktiv = null;

    let gesperrt = false;
    let beendet = false;

    let wechsel = null;
    let warteAufNaechste = false;


    // ---------------------------------
    // D. Auswahlfelder und Palette zeichnen
    // ---------------------------------

    function felderZeichnen() {

        for (
            const { button, zeile, slot }
            of felder
        ) {

            const typId = ausgewaehlt[zeile][slot];

            button.replaceChildren();

            if (typId === null) {

                button.textContent = `? Typ ${slot + 1}`;

            } else {

                button.append(
                    typPlakette(typId)
                );
            }

            button.classList.toggle(
                "aktiv",

                aktiv?.zeile === zeile &&
                aktiv?.slot === slot
            );
        }


        // Palette an den aktiven Zeitraum anpassen
        palette.replaceChildren();

        if (gesperrt || aktiv === null) {
            return;
        }

        const generation =
            zeitraeume[aktiv.zeile].von;


        // Nur zu dieser Generation passende Typen
        for (let typId = 0; typId <= 18; typId++) {

            if (typExistiert(typId, generation)) {

                palette.appendChild(
                    typButton(typId, waehlen)
                );
            }
        }
    }


    // ---------------------------------
    // E. Nächstes leeres Typ-Feld finden
    // ---------------------------------

    function naechstesLeeresFeld() {

        for (
            let zeile = 0;
            zeile < ausgewaehlt.length;
            zeile++
        ) {

            for (let slot = 0; slot < 2; slot++) {

                if (ausgewaehlt[zeile][slot] === null) {

                    return {
                        zeile,
                        slot
                    };
                }
            }
        }

        return null;
    }


    // ---------------------------------
    // F. Einen Typ auswählen
    // ---------------------------------

    function waehlen(typId) {

        if (gesperrt || !aktiv) {
            return;
        }

        const { zeile, slot } = aktiv;

        const anderer =
            slot === 0 ? 1 : 0;


        // Gleiche Typen dürfen nicht doppelt vorkommen
        if (ausgewaehlt[zeile][anderer] === typId) {

            meldung.textContent =
                "Bitte zwei unterschiedliche Typen auswählen.";

            return;
        }

        ausgewaehlt[zeile][slot] = typId;

        aktiv = naechstesLeeresFeld();

        felderZeichnen();


        // Alle Felder sind ausgefüllt?
        if (
            ausgewaehlt.every(
                paar => paar.every(
                    wert => wert !== null
                )
            )
        ) {

            pruefen();
        }
    }


    // ---------------------------------
    // G. Antwort prüfen
    // ---------------------------------

    function pruefen() {

        const korrekt = zeitraeume.every(
            (zeitraum, i) => {

                // Reihenfolge der beiden Typen ignorieren
                const richtigeTypen = [...zeitraum.typen]
                    .sort((a, b) => a - b)
                    .join(",");

                const spielerTypen = [...ausgewaehlt[i]]
                    .sort((a, b) => a - b)
                    .join(",");

                return richtigeTypen === spielerTypen;
            }
        );

        if (korrekt) {

            abschliessen(false);

        } else {

            meldung.textContent =
                "Noch nicht richtig. Klicke ein Feld an " +
                "und ändere den Typ.";

            aktiv = {
                zeile: 0,
                slot: 0
            };

            felderZeichnen();
        }
    }


    // ---------------------------------
    // H. Pokémon-Frage anzeigen
    // ---------------------------------

    function anzeigen() {

        warteAufNaechste = false;

        statistik.textContent =
            `Richtig: ${richtig} · ` +
            `Aufgegeben: ${aufgegeben}`;


        // Runde beendet?
        if (index >= liste.length) {

            beendet = true;

            timer.stop();

            bild.hidden = true;
            name.textContent = "Geschafft! 🎉";

            bereich.replaceChildren();
            palette.replaceChildren();

            fortschritt.textContent =
                `${liste.length} / ${liste.length}`;

            meldung.textContent =
                `Richtig: ${richtig} · ` +
                `Aufgegeben: ${aufgegeben}`;

            aufgeben.disabled = true;

            return;
        }


        const pokemon = liste[index];

        bild.hidden = false;

        // Offizielles Artwork für dieses Pokémon
        bild.src = bildAdresse(pokemon, true);
        bild.alt = pokemon.de;

        // Falls Artwork fehlt: kleines Sprite versuchen
        bild.onerror = () => {

            bild.onerror = null;
            bild.src = bildAdresse(pokemon);
        };

        name.textContent = pokemon.de;


        // Nächstes Artwork im Hintergrund vorladen
        // Höchstens ein weiteres Bild!
        if (liste[index + 1]) {

            const vorladen = new Image();

            vorladen.src = bildAdresse(
                liste[index + 1],
                true
            );
        }


        // Historische Typ-Zeiträume bestimmen
        zeitraeume = typenPerioden(pokemon, maxGen);

        // Pro Zeitraum zwei leere Felder
        ausgewaehlt = zeitraeume.map(
            () => [null, null]
        );

        felder = [];
        bereich.replaceChildren();


        // Für jeden Zeitraum zwei Buttons erstellen
        for (
            let zeile = 0;
            zeile < zeitraeume.length;
            zeile++
        ) {

            const abschnitt = zeitraeume[zeile];

            const block = document.createElement("section");
            block.className = "typen-zeitraum";

            const titel = document.createElement("h3");

            titel.textContent = generationsText(
                abschnitt.von,
                abschnitt.bis
            );

            const feldreihe = document.createElement("div");
            feldreihe.className = "typ-felder";


            for (let slot = 0; slot < 2; slot++) {

                const button = document.createElement("button");
                button.type = "button";
                button.className = "typ-feld";

                button.addEventListener("click", () => {

                    if (gesperrt) return;

                    aktiv = {
                        zeile,
                        slot
                    };

                    felderZeichnen();
                });

                feldreihe.appendChild(button);

                felder.push({
                    button,
                    zeile,
                    slot
                });
            }

            block.append(titel, feldreihe);

            bereich.appendChild(block);
        }


        // Erstes Typ-Feld aktivieren
        aktiv = {
            zeile: 0,
            slot: 0
        };

        gesperrt = false;
        aufgeben.disabled = false;

        meldung.textContent = "";

        fortschritt.textContent =
            `Frage ${index + 1} / ${liste.length}`;

        felderZeichnen();
    }


    // ---------------------------------
    // I. Frage abschließen
    // ---------------------------------

    function abschliessen(aufgabeAufgegeben) {

        if (gesperrt || beendet) {
            return;
        }

        gesperrt = true;


        if (aufgabeAufgegeben) {

            aufgegeben++;

            // Alle korrekten historischen Typen anzeigen
            ausgewaehlt = zeitraeume.map(
                z => [...z.typen]
            );

            meldung.textContent = "Lösung angezeigt.";

        } else {

            richtig++;

            meldung.textContent = "Richtig!";
        }


        index++;

        aktiv = null;
        aufgeben.disabled = true;

        felderZeichnen();


        if (index === liste.length) {
            timer.stop();
        }

        warteAufNaechste = true;

        wechsel = setTimeout(() => {

            wechsel = null;

            anzeigen();

        }, aufgabeAufgegeben ? 1800 : 700);
    }


    // ---------------------------------
    // J. Neustart
    // ---------------------------------

    function neu() {

        clearTimeout(wechsel);
        wechsel = null;

        liste = mische(pool);

        index = 0;
        richtig = 0;
        aufgegeben = 0;

        beendet = false;
        gesperrt = false;

        warteAufNaechste = false;

        timer.start();
        anzeigen();
    }


    // ---------------------------------
    // K. Events
    // ---------------------------------

    aufgeben.addEventListener("click", () => {
        abschliessen(true);
    });

    root.querySelector(".neu").addEventListener(
        "click",
        neu
    );


    // ---------------------------------
    // L. Spiel starten
    // ---------------------------------

    neu();

    return {

        root,

        pause() {

            timer.pause();

            if (wechsel !== null) {

                clearTimeout(wechsel);
                wechsel = null;
            }
        },

        resume() {

            if (warteAufNaechste) {
                anzeigen();
            }

            timer.resume();
        },

        dispose() {

            clearTimeout(wechsel);
            timer.dispose();
        }
    };
}


// =====================================
// 3. TYP-NAMENSSPIELE
// =====================================

/**
 * Erstellt einen der beiden Spielmodi:
 *
 * false = Zufälligen Typ erhalten und Pokémon nennen
 * true  = Typ selbst auswählen und alle Pokémon erraten
 *
 * @param {Object} kontext - Pokémon, maximale Generation,
 *                           Timeranzeige
 * @param {boolean} typWaehlen - Fester oder zufälliger Typ?
 *
 * @returns {Object} Spielsitzung
 */
function erstelleTypNamenModus(kontext, typWaehlen) {

    const {
        pool,
        maxGen,
        timerAnzeige
    } = kontext;


    // ---------------------------------
    // A. HTML erzeugen
    // ---------------------------------

    const root = document.createElement("div");

    root.innerHTML = `
        <div
            class="typ-auswahl"
            ${typWaehlen ? "" : "hidden"}
        ></div>

        <div class="typ-frage" hidden></div>

        <div class="eingabe-leiste">

            <input
                class="namen-eingabe"
                type="text"
                placeholder="Deutscher oder englischer Name …"
                autocomplete="off"
                spellcheck="false"
                aria-label="Pokémon-Name"
            >

            <button class="aufgeben" type="button">
                Aufgeben
            </button>

            <button class="neu sekundaer" type="button">
                Neustart
            </button>

        </div>

        <p class="meldung" role="status"></p>

        <div class="dex-grid"></div>
    `;


    // ---------------------------------
    // B. HTML-Elemente
    // ---------------------------------

    const auswahl = root.querySelector(".typ-auswahl");
    const frage = root.querySelector(".typ-frage");
    const eingabe = root.querySelector("input");

    const meldung = root.querySelector(".meldung");
    const raster = root.querySelector(".dex-grid");

    const aufgeben = root.querySelector(".aufgeben");

    const timer = erstelleStoppuhr(timerAnzeige);


    // ---------------------------------
    // C. Spielzustand
    // ---------------------------------

    const gefundene = new Set();
    const offengelegt = new Set();
    const karten = new Map();

    let ziel = [];

    let gewaehlterTyp = null;
    let aufgabe = null;

    let beendet = false;
    let begonnen = false;

    let alleAufgaben = [];


    // ---------------------------------
    // D. Pokédex-Raster erstellen
    // ---------------------------------

    function aufbauRaster() {

        raster.replaceChildren();
        karten.clear();

        const fragment = document.createDocumentFragment();

        for (const p of ziel) {

            const teile = pokemonKarte(
                p,
                !typWaehlen
            );

            zeichneKarte(
                p,
                teile,
                "frage"
            );

            karten.set(p.id, teile);

            fragment.appendChild(teile.karte);
        }

        raster.appendChild(fragment);

        raster.classList.toggle(
            "typ-raster",
            typWaehlen
        );
    }


    // ---------------------------------
    // E. Gesuchten Typ anzeigen
    // ---------------------------------

    function frageAnzeigen() {

        frage.replaceChildren();

        if (gewaehlterTyp === null) {

            frage.hidden = true;
            return;
        }

        frage.hidden = false;

        frage.appendChild(
            typPlakette(gewaehlterTyp)
        );

        const info = document.createElement("span");

        info.textContent = typWaehlen
            ? `Alle passenden Pokémon bis Generation ${maxGen}`
            : generationsText(aufgabe.von, aufgabe.bis);

        frage.appendChild(info);
    }


    // ---------------------------------
    // F. Zufällige Typ-Frage
    // ---------------------------------

    function neueZufallsFrage() {

        // Nur Aufgaben verwenden, bei denen noch
        // mindestens ein Pokémon nicht gefunden wurde.
        const moegliche = alleAufgaben.filter(
            a => a.ids.some(
                id => !gefundene.has(id)
            )
        );

        if (!moegliche.length) {

            aufgabe = null;
            gewaehlterTyp = null;

            return;
        }

        const zufall = Math.floor(
            Math.random() * moegliche.length
        );

        aufgabe = moegliche[zufall];

        gewaehlterTyp = aufgabe.typId;

        frageAnzeigen();
    }


    // ---------------------------------
    // G. Pokémon aufdecken
    // ---------------------------------

    function zeichneGefunden(p, aufgegeben = false) {

        zeichneKarte(

            p,

            karten.get(p.id),

            aufgegeben
                ? "aufgedeckt"
                : "gefunden"

        );


        // Im festen Typmodus den relevanten
        // historischen Zeitraum anzeigen.
        if (typWaehlen) {

            const zeitraeume = typenPerioden(
                p,
                maxGen
            ).filter(
                z => z.typen.includes(gewaehlterTyp)
            );

            const start =
                zeitraeume[0]?.von ?? p.gen;

            const ende =
                zeitraeume[zeitraeume.length - 1]?.bis ??
                maxGen;

            const etikett = document.createElement("span");
            etikett.className = "zeit-etikett";

            etikett.textContent = generationsText(
                start,
                ende
            )

            .replace("Generationen", "Gen.")
            .replace("Generation", "Gen.");

            karten.get(p.id).inhalt.appendChild(etikett);
        }
    }


    // ---------------------------------
    // H. Fortschritt
    // ---------------------------------

    function bericht() {

        meldung.dataset.fortschritt =
            `${gefundene.size} / ${ziel.length}`;
    }


    // ---------------------------------
    // I. Runde starten
    // ---------------------------------

    function rundeStarten() {

        // Bei fester Typwahl muss erst eine
        // Kategorie angeklickt werden.
        if (
            typWaehlen &&
            gewaehlterTyp === null
        ) {
            return;
        }

        begonnen = true;
        beendet = false;

        gefundenReset();


        // Entweder nur Pokémon des gewählten Typs
        // oder alle ausgewählten Pokémon.
        ziel = typWaehlen

            ? pokemonMitTyp(
                pool,
                gewaehlterTyp,
                maxGen
            )

            : [...pool];


        // Mögliche Typ-Fragen vorbereiten
        if (!typWaehlen) {

            alleAufgaben = typenAufgaben(
                pool,
                maxGen
            );
        }

        aufbauRaster();

        eingabe.disabled = false;
        aufgeben.disabled = false;

        eingabe.value = "";
        meldung.textContent = "";


        if (!typWaehlen) {

            neueZufallsFrage();

        } else {

            frageAnzeigen();
        }

        bericht();

        timer.start();

        if (root.isConnected) {
            eingabe.focus();
        }
    }


    // ---------------------------------
    // J. Gefundene Pokémon zurücksetzen
    // ---------------------------------

    function gefundenReset() {

        gefundene.clear();
        offengelegt.clear();
    }


    // ---------------------------------
    // K. Typ manuell auswählen
    // ---------------------------------

    function typAuswaehlen(typId) {

        gewaehlterTyp = typId;


        // Gewählten Typ markieren
        auswahl.querySelectorAll("button").forEach(b => {

            b.classList.toggle(
                "aktiv",
                +b.dataset.typ === typId
            );
        });

        // Neustart-Button aktivieren
        root.querySelector(".neu").disabled = false;

        rundeStarten();
    }


    // ---------------------------------
    // L. Auswahl der Typen aufbauen
    // ---------------------------------

    if (typWaehlen) {

        // Nur Typen mit passenden Pokémon anbieten.
        for (let typId = 1; typId <= 18; typId++) {

            if (
                !typExistiert(typId, maxGen) ||
                !pokemonMitTyp(
                    pool,
                    typId,
                    maxGen
                ).length
            ) {

                continue;
            }

            const button = typButton(
                typId,
                typAuswaehlen
            );

            button.dataset.typ = typId;

            auswahl.appendChild(button);
        }


        // Vor der ersten Typwahl kein Spiel starten
        eingabe.disabled = true;
        aufgeben.disabled = true;

        root.querySelector(".neu").disabled = true;

        meldung.textContent =
            "Bitte zuerst einen Typ auswählen.";

        timer.pause();

    } else {

        // Zufallsmodus sofort starten
        rundeStarten();
    }


    // ---------------------------------
    // M. Namenseingabe prüfen
    // ---------------------------------

    function pruefen() {

        if (!begonnen || beendet) {
            return;
        }

        const treffer = sucheNamen(
            pool,
            eingabe.value
        );

        if (!treffer.length) {

            meldung.textContent = "";
            return;
        }


        // Prüfen, welche Pokémon noch fehlen
        // und zur aktuellen Typ-Aufgabe passen.
        const neu = treffer.filter(p =>

            !gefundene.has(p.id)

            &&

            (
                typWaehlen

                    ? karten.has(p.id)

                    : aufgabe?.ids.includes(p.id)
            )
        );


        if (!neu.length) {

            meldung.textContent =
                "Schon gefunden oder kein passender Typ.";

            return;
        }


        // Ein oder mehrere Pokémon aufdecken
        for (const p of neu) {

            gefundene.add(p.id);

            zeichneGefunden(p);
        }

        eingabe.value = "";

        bericht();

        meldung.textContent = neu.length > 1
            ? "Beide Nidoran-Arten entdeckt!"
            : `${neu[0].de} entdeckt!`;


        // Runde vollständig?
        if (gefundene.size === ziel.length) {

            beendet = true;
            timer.stop();

            eingabe.disabled = true;
            aufgeben.disabled = true;

            meldung.textContent =
                `Geschafft! ${ziel.length} Pokémon erraten.`;

            return;
        }


        // Im Zufallsmodus nach jeder Antwort
        // einen neuen passenden Typ auswählen
        if (!typWaehlen) {

            neueZufallsFrage();
        }

        eingabe.focus();
    }


    // ---------------------------------
    // N. Aufgeben
    // ---------------------------------

    function aufloesen() {

        if (beendet || !begonnen) return;

        beendet = true;

        timer.stop();


        // Alle fehlenden Pokémon aufdecken
        for (const p of ziel) {

            if (!gefundene.has(p.id)) {

                offengelegt.add(p.id);

                zeichneGefunden(p, true);
            }
        }

        eingabe.disabled = true;
        aufgeben.disabled = true;

        meldung.textContent =
            `Richtig: ${gefundene.size} · ` +
            `Aufgedeckt: ${offengelegt.size}`;

        bericht();
    }


    // ---------------------------------
    // O. Events
    // ---------------------------------

    eingabe.addEventListener("input", pruefen);

    aufgeben.addEventListener("click", aufloesen);

    root.querySelector(".neu").addEventListener(
        "click",
        rundeStarten
    );


    // ---------------------------------
    // P. Funktionen zurückgeben
    // ---------------------------------

    return {

        root,

        pause: timer.pause,

        resume() {

            if (begonnen) {

                timer.resume();

                if (!beendet) {
                    eingabe.focus();
                }
            }
        },

        dispose: timer.dispose
    };
}
