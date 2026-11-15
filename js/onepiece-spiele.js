
/* =========================================
   ONE PIECE – SPIELMODI
   ========================================= */


/**
 * Erstellt den gewünschten One-Piece-Spielmodus.
 *
 * @param {Object} kontext - Episode, Spoilerregel, Timer
 * @param {string} modus - Spielmodus-Kennung
 * @returns {Object} Spielsitzung
 */
function erstelleOnePieceSpiel(kontext, modus) {

    if (modus === "op-vergleich") {

        return erstelleOnePieceVergleich(kontext);
    }

    return erstelleOnePieceFruchtQuiz(kontext, modus);
}


// =========================================
// 1. TEUFELSFRUCHT-QUIZ
// =========================================

/**
 * Erstellt ein Übersetzungs- oder Anwenderquiz.
 *
 * @param {Object} kontext - Einstellungen
 * @param {string} modus - Spielmodus
 * @returns {Object} Spielsitzung
 */
function erstelleOnePieceFruchtQuiz(kontext, modus) {

    const {
        episode,
        freigabe,
        vollkatalog,
        timerAnzeige
    } = kontext;

    const uebersetzung =
        modus === "op-frucht-sprache";

    const fruchtZuFigur =
        modus === "op-frucht-anwender";

    const alleFruechte = holeBekannteFruechte(
        episode,
        freigabe,
        vollkatalog
    );

    const figuren = holeBekannteCharaktere(
        episode,
        vollkatalog
    );

    const figurNachId = new Map(
        figuren.map(c => [c.id, c])
    );


    // =====================================
    // HTML-OBERFLÄCHE
    // =====================================

    const root = document.createElement("div");
    root.className = "frage-karte";

    root.innerHTML = `
        <p class="inhalt-hinweis"></p>

        <div class="optionen-zeile sprachen"
             ${uebersetzung ? "" : "hidden"}>

            <label>
                Von:
                <select class="sprache-von">
                    <option value="de">Deutsch</option>
                    <option value="en">Englisch</option>
                    <option value="ja">Japanisch (Rōmaji)</option>
                </select>
            </label>

            <label>
                Nach:
                <select class="sprache-nach">
                    <option value="en">Englisch</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">Japanisch (Rōmaji)</option>
                </select>
            </label>
        </div>

        <p class="fortschritt"></p>

        <div class="frage-name"></div>
        <div class="frucht-vorschau"></div>

        <input class="namen-eingabe"
               type="text"
               placeholder="Antwort eintippen …"
               autocomplete="off"
               spellcheck="false">

        <div class="vorschlaege"></div>

        <p class="meldung" role="status"></p>

        <div class="aktionen">
            <button class="aufgeben" type="button">
                Aufgeben / Lösung
            </button>

            <button class="neu sekundaer" type="button">
                Neustart
            </button>
        </div>
    `;

    const von = root.querySelector(".sprache-von");
    const nach = root.querySelector(".sprache-nach");

    const frage = root.querySelector(".frage-name");
    const bildBox = root.querySelector(".frucht-vorschau");

    const fortschritt = root.querySelector(".fortschritt");
    const eingabe = root.querySelector(".namen-eingabe");

    const vorschlaege = root.querySelector(".vorschlaege");
    const meldung = root.querySelector(".meldung");

    const aufgeben = root.querySelector(".aufgeben");

    const timer = erstelleStoppuhr(timerAnzeige);


    // =====================================
    // SPIELZUSTAND
    // =====================================

    let liste = [];

    let index = 0;
    let richtig = 0;
    let aufgegeben = 0;

    let gesperrt = false;
    let beendet = false;
    let pausiert = false;
    let warte = false;

    let wechselTimer = null;


    // Spoilerregel anzeigen
    root.querySelector(".inhalt-hinweis").textContent =

        vollkatalog

            ? "Vollständiger Online-Katalog: Achtung, " +
              "auch spätere Charaktere, Früchte und Anwender!"

            : `Spoilergrenze: Episode ${episode}, ` +
              `Freigabe bei erster ${freigabe}. ` +
              "Nur belegte Einträge.";


    // =====================================
    // BILDER
    // =====================================

    /**
     * Zeigt ein Bild an, falls vorhanden.
     *
     * Bei aktiver Spoilerbegrenzung werden keine
     * möglicherweise späteren Figurenbilder gezeigt.
     *
     * @param {string|null} url - Bildadresse
     * @param {string} alt - Alternativtext
     * @returns {void}
     */
    function bildAnzeigen(url, alt = "") {

        bildBox.replaceChildren();

        if (!url || !vollkatalog) return;

        const bild = document.createElement("img");

        bild.className = "onepiece-bild";
        bild.loading = "lazy";

        bild.alt = alt;
        bild.src = url;

        bild.onerror = () => bild.remove();

        bildBox.appendChild(bild);
    }


    // =====================================
    // QUIZFRAGEN VORBEREITEN
    // =====================================

    /**
     * Erstellt ausschließlich beantwortbare Fragen.
     *
     * @returns {Object[]} Frage-Antwort-Paare
     */
    function erstelleListe() {

        if (uebersetzung) {

            // Ausgangs- und Zielsprache müssen verschieden sein.
            if (von.value === nach.value) {

                nach.value = von.value === "de"
                    ? "en"
                    : "de";
            }

            // Nur Früchte mit Namen in beiden Sprachen
            return alleFruechte

                .filter(frucht =>

                    typeof frucht[von.value] === "string" &&
                    opNorm(frucht[von.value]) &&

                    typeof frucht[nach.value] === "string" &&
                    opNorm(frucht[nach.value])
                )

                .map(frucht => ({
                    frucht,
                    figur: null
                }));
        }


        // Bekannte Frucht-Anwender-Paare sammeln
        const paare = [];

        for (const frucht of alleFruechte) {

            for (const id of frucht.anwender || []) {

                const figur = figurNachId.get(id);

                if (figur) {

                    paare.push({
                        frucht,
                        figur
                    });
                }
            }
        }

        if (fruchtZuFigur) {

            // Dieselbe Frucht nur einmal fragen.
            // Mehrere Anwender bleiben als Antwort gültig.
            const map = new Map();

            for (const paar of paare) {

                if (!map.has(paar.frucht.id)) {
                    map.set(paar.frucht.id, paar);
                }
            }

            return [...map.values()];
        }

        // Im umgekehrten Modus Figur/Frucht-Paare abfragen
        return paare;
    }


    // =====================================
    // FRAGE ANZEIGEN
    // =====================================

    /**
     * Zeigt die nächste Frage oder das Endergebnis.
     *
     * @returns {void}
     */
    function anzeigen() {

        warte = false;

        vorschlaege.replaceChildren();
        bildBox.replaceChildren();

        if (index >= liste.length) {

            beendet = true;
            timer.stop();

            frage.textContent = "Geschafft! 🎉";

            fortschritt.textContent =
                `${liste.length} / ${liste.length}`;

            meldung.textContent =
                `Richtig: ${richtig} · Aufgegeben: ${aufgegeben}`;

            eingabe.disabled = true;
            aufgeben.disabled = true;

            return;
        }

        const { frucht, figur } = liste[index];

        if (uebersetzung) {

            frage.textContent = frucht[von.value];

        } else if (fruchtZuFigur) {

            frage.textContent =
                frucht.de || frucht.en || frucht.ja;

        } else {

            frage.textContent = figur.name;
        }

        // Passende Bilder bei freiem Gesamtkatalog
        const bildUrl = fruchtZuFigur
            ? frucht.bild
            : !uebersetzung
                ? figur?.bild
                : null;

        bildAnzeigen(
            bildUrl,
            frage.textContent
        );

        fortschritt.textContent =
            `Frage ${index + 1} / ${liste.length}`;

        eingabe.value = "";
        eingabe.disabled = false;
        aufgeben.disabled = false;

        gesperrt = false;
        meldung.textContent = "";

        if (root.isConnected && !pausiert) {
            eingabe.focus();
        }
    }


    // =====================================
    // RICHTIGE LÖSUNGEN
    // =====================================

    /**
     * Liefert alle zulässigen Antworten auf die aktuelle Frage.
     *
     * @returns {string[]} Antwortnamen
     */
    function loesungen() {

        if (index >= liste.length) return [];

        const { frucht } = liste[index];

        if (uebersetzung) {

            return [frucht[nach.value]];
        }

        if (fruchtZuFigur) {

            return (frucht.anwender || [])

                .map(id => figurNachId.get(id)?.name)

                .filter(Boolean);
        }

        return [

            frucht.de,
            frucht.en,
            frucht.ja,
            ...(frucht.alias || [])

        ].filter(Boolean);
    }


    // =====================================
    // FRAGE ABSCHLIESSEN
    // =====================================

    /**
     * Beendet die Frage nach richtiger Antwort oder Aufgeben.
     *
     * @param {boolean} istAufgegeben - Aufgegeben?
     * @returns {void}
     */
    function abschliessen(istAufgegeben) {

        if (gesperrt || beendet) return;

        const antworten = loesungen();

        gesperrt = true;

        eingabe.disabled = true;
        aufgeben.disabled = true;

        if (istAufgegeben) {

            aufgegeben++;

        } else {

            richtig++;
        }

        meldung.textContent =
            `${istAufgegeben ? "Lösung" : "Richtig"}: ` +
            antworten.join(" / ");

        index++;

        if (index >= liste.length) {
            timer.stop();
        }

        warte = true;

        wechselTimer = setTimeout(() => {

            wechselTimer = null;

            if (!pausiert) {
                anzeigen();
            }

        }, istAufgegeben ? 1800 : 750);
    }


    // =====================================
    // EINGABE AUTOMATISCH PRÜFEN
    // =====================================

    /**
     * Prüft Namen und zeigt Charaktervorschläge.
     *
     * @returns {void}
     */
    function pruefen() {

        if (gesperrt || beendet) return;

        const text = opNorm(eingabe.value);

        if (!text) {

            vorschlaege.replaceChildren();
            return;
        }

        if (
            loesungen().some(name =>
                opNorm(name) === text
            )
        ) {

            abschliessen(false);
            return;
        }

        // Autovervollständigung bei Frucht -> Figur
        if (fruchtZuFigur) {

            zeigeVorschlaege(

                vorschlaege,

                eingabe.value,

                figuren,

                charakter => [
                    charakter.name,
                    charakter.en,
                    ...(charakter.alias || [])
                ],

                charakter => {

                    if (!vollkatalog || !charakter.bild) {
                        return null;
                    }

                    const bild = document.createElement("img");

                    bild.src = charakter.bild;
                    bild.loading = "lazy";
                    bild.alt = "";

                    return bild;
                },

                charakter => {

                    eingabe.value = charakter.name;
                    pruefen();
                }
            );
        }
    }


    // =====================================
    // NEUSTART
    // =====================================

    /**
     * Startet die gesamte Fragerunde neu.
     *
     * @returns {void}
     */
    function neu() {

        clearTimeout(wechselTimer);
        wechselTimer = null;

        liste = mische(erstelleListe());

        index = 0;
        richtig = 0;
        aufgegeben = 0;

        gesperrt = false;
        beendet = false;
        warte = false;

        if (!liste.length) {

            beendet = true;
            timer.stop();

            frage.textContent = "Keine geeigneten Aufgaben";

            fortschritt.textContent = "0 / 0";

            eingabe.disabled = true;
            aufgeben.disabled = true;

            vorschlaege.replaceChildren();

            meldung.textContent = uebersetzung

                ? "Für diese Sprachrichtung fehlen noch " +
                  "überprüfte Übersetzungen."

                : "Keine spoilerfrei belegten " +
                  "Frucht-Anwender-Paare für diesen Stand.";

            return;
        }

        timer.start();

        if (pausiert) {
            timer.pause();
        }

        anzeigen();
    }


    // =====================================
    // EVENT-LISTENER
    // =====================================

    eingabe.addEventListener("input", pruefen);

    aufgeben.addEventListener("click", () =>
        abschliessen(true)
    );

    root.querySelector(".neu").addEventListener(
        "click",
        neu
    );

    if (uebersetzung) {

        von.addEventListener("change", neu);
        nach.addEventListener("change", neu);
    }

    neu();


    // =====================================
    // SPIELSTEUERUNG ZURÜCKGEBEN
    // =====================================

    return {

        root,

        pause() {

            pausiert = true;
            timer.pause();

            clearTimeout(wechselTimer);
            wechselTimer = null;
        },

        resume() {

            pausiert = false;

            if (warte) {
                anzeigen();
            }

            if (!beendet) {
                timer.resume();
            }
        },

        dispose() {

            clearTimeout(wechselTimer);
            timer.dispose();
        }
    };
}


// =========================================
// 2. ONE-PIECE-CHARAKTERVERGLEICH
// =========================================

/**
 * Erstellt das Vergleichsquiz.
 *
 * @param {Object} kontext - Episode, Freigabe, Timer
 * @returns {Object} Spielsitzung
 */
function erstelleOnePieceVergleich(kontext) {

    const {
        episode,
        freigabe,
        vollkatalog,
        timerAnzeige
    } = kontext;

    const figuren = holeBekannteCharaktere(
        episode,
        vollkatalog
    );

    const fruechte = holeBekannteFruechte(
        episode,
        freigabe,
        vollkatalog
    );

    // Bekannte Frucht pro Charakter
    const fruchtVonFigur = new Map();

    for (const frucht of fruechte) {

        for (const id of frucht.anwender || []) {

            if (!fruchtVonFigur.has(id)) {
                fruchtVonFigur.set(id, frucht);
            }
        }
    }


    // =====================================
    // HTML
    // =====================================

    const root = document.createElement("div");
    root.className = "frage-karte";

    root.innerHTML = `
        <label class="uebung-label">
            <input class="uebung" type="checkbox">
            Übungsmodus – nach richtiger Antwort neue Figur
        </label>

        <p class="vergleich-info">
            Grün = richtig · Gelb = nah dran ·
            Rot = falsch · Grau = Wert nicht verfügbar.
        </p>

        <input class="namen-eingabe"
               type="text"
               autocomplete="off"
               spellcheck="false"
               placeholder="Figur oder Alias eingeben …">

        <div class="vorschlaege"></div>

        <p class="meldung" role="status"></p>

        <div class="tabellen-scroll">
            <table class="vergleich-tabelle">

                <thead>
                    <tr>
                        <th>Figur</th>
                        <th>Alter</th>
                        <th>Größe</th>
                        <th>Kopfgeld</th>
                        <th>Frucht</th>
                        <th>Debüt-Arc</th>
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
    `;

    const eingabe = root.querySelector(".namen-eingabe");

    const vorschlaege = root.querySelector(".vorschlaege");
    const meldung = root.querySelector(".meldung");

    const tabelle = root.querySelector("tbody");

    const uebung = root.querySelector(".uebung");

    const aufgebenButton = root.querySelector(".aufgeben");

    const timer = erstelleStoppuhr(timerAnzeige);

    const geraten = new Set();

    let geheim = null;
    let beendet = false;
    let pausiert = false;
    let wechselTimer = null;


    // =====================================
    // FRUCHT ZU CHARAKTER FINDEN
    // =====================================

    /**
     * Liefert den Namen einer bekannten Frucht.
     *
     * @param {Object} charakter - One-Piece-Figur
     * @returns {string|null} Fruchtname oder null
     */
    function fruchtName(charakter) {

        const frucht = fruchtVonFigur.get(charakter.id);

        return frucht

            ? frucht.de || frucht.en || frucht.ja

            : null;
    }


    // =====================================
    // TABELLENFELDER
    // =====================================

    /**
     * Vergleicht zwei Textwerte.
     *
     * @param {string|null} wert - Geratener Wert
     * @param {string|null} ziel - Gesuchter Wert
     * @returns {HTMLTableCellElement} Vergleichszelle
     */
    function feld(wert, ziel) {

        return vergleichsZelle(

            wert ?? "Unbekannt",

            wert == null || ziel == null

                ? "neutral"

                : wert === ziel
                    ? "gruen"
                    : "rot"
        );
    }


    // =====================================
    // VERGLEICHSZEILE
    // =====================================

    /**
     * Fügt den Vergleich mit einer geratenen Figur hinzu.
     *
     * @param {Object} charakter - Geratene Figur
     * @returns {void}
     */
    function zeigeVersuch(charakter) {

        const zeile = document.createElement("tr");

        const name = vergleichsZelle(

            charakter.name,

            charakter.id === geheim.id
                ? "gruen"
                : "neutral"
        );

        // Portrait aus dem Online-Katalog
        if (vollkatalog && charakter.bild) {

            const bild = document.createElement("img");

            bild.src = charakter.bild;
            bild.loading = "lazy";
            bild.alt = "";

            bild.onerror = () => bild.remove();

            name.prepend(bild);
        }

        zeile.appendChild(name);


        // Numerische Felder vergleichen
        for (const eigenschaft of [
            "alter",
            "groesse",
            "kopfgeld"
        ]) {

            const wert = charakter[eigenschaft];
            const ziel = geheim[eigenschaft];

            const vergleich = zahlenVergleich(
                wert,
                ziel
            );

            const einheit = eigenschaft === "groesse"

                ? " cm"

                : eigenschaft === "kopfgeld"
                    ? " Berry"
                    : "";

            const text = wert == null

                ? "Unbekannt"

                : `${Number(wert).toLocaleString("de-DE")}` +
                  `${einheit} ${vergleich.pfeil}`;

            zeile.appendChild(

                vergleichsZelle(
                    text.trim(),
                    vergleich.status
                )
            );
        }


        // Teufelsfrucht vergleichen
        zeile.appendChild(

            feld(
                fruchtName(charakter),
                fruchtName(geheim)
            )
        );


        // Debüt-Arc vergleichen
        zeile.appendChild(

            feld(
                charakter.arc,
                geheim.arc
            )
        );

        tabelle.prepend(zeile);
    }


    // =====================================
    // CHARAKTER RATEN
    // =====================================

    /**
     * Übernimmt eine Figur als Rateversuch.
     *
     * @param {Object} charakter - Ausgewählte Figur
     * @returns {void}
     */
    function raten(charakter) {

        if (
            beendet ||
            geraten.has(charakter.id)
        ) {
            return;
        }

        geraten.add(charakter.id);

        zeigeVersuch(charakter);

        eingabe.value = "";
        vorschlaege.replaceChildren();

        if (charakter.id !== geheim.id) {

            meldung.textContent =
                `${geraten.size} Versuch(e).`;

            eingabe.focus();
            return;
        }

        beendet = true;
        timer.stop();

        eingabe.disabled = true;
        aufgebenButton.disabled = true;

        meldung.textContent =
            `Richtig! ${geheim.name} nach ` +
            `${geraten.size} Versuchen.`;

        // Bei Übungsmodus automatisch weitermachen
        if (uebung.checked) {

            wechselTimer = setTimeout(() => {

                wechselTimer = null;

                if (!pausiert) {
                    neu();
                }

            }, 1400);
        }
    }


    // =====================================
    // AUTOVERVOLLSTÄNDIGUNG
    // =====================================

    /**
     * Prüft eine vollständige Eingabe oder zeigt Vorschläge.
     *
     * @returns {void}
     */
    function pruefen() {

        if (beendet) return;

        const treffer = sucheOnePieceCharaktere(
            figuren,
            eingabe.value
        );

        if (treffer.length === 1) {

            raten(treffer[0]);
            return;
        }

        zeigeVorschlaege(

            vorschlaege,

            eingabe.value,

            figuren,

            charakter => [
                charakter.name,
                charakter.en,
                ...(charakter.alias || [])
            ],

            charakter => {

                if (!vollkatalog || !charakter.bild) {
                    return null;
                }

                const bild = document.createElement("img");

                bild.src = charakter.bild;
                bild.loading = "lazy";
                bild.alt = "";

                return bild;
            },

            raten
        );
    }


    // =====================================
    // NEUE RUNDE
    // =====================================

    /**
     * Wählt einen neuen geheimen Charakter aus.
     *
     * @returns {void}
     */
    function neu() {

        clearTimeout(wechselTimer);
        wechselTimer = null;

        if (!figuren.length) {

            meldung.textContent =
                "Keine Figuren mit belegtem Debüt " +
                "für diesen Episodenstand.";

            eingabe.disabled = true;
            aufgebenButton.disabled = true;

            timer.stop();
            return;
        }

        geheim = figuren[
            Math.floor(Math.random() * figuren.length)
        ];

        geraten.clear();
        beendet = false;

        tabelle.replaceChildren();
        vorschlaege.replaceChildren();

        eingabe.value = "";
        eingabe.disabled = false;

        aufgebenButton.disabled = false;

        meldung.textContent =
            `Errate die geheime Figur! ` +
            `(${figuren.length} mögliche Figuren)`;

        timer.start();

        if (pausiert) {
            timer.pause();
        }

        if (root.isConnected) {
            eingabe.focus();
        }
    }


    // =====================================
    // AUFGEBEN
    // =====================================

    /**
     * Deckt den geheimen Charakter auf.
     *
     * @returns {void}
     */
    function aufgeben() {

        if (beendet) return;

        beendet = true;
        timer.stop();

        zeigeVersuch(geheim);

        eingabe.disabled = true;
        aufgebenButton.disabled = true;

        meldung.textContent =
            `Lösung: ${geheim.name}`;
    }


    // =====================================
    // EVENTS UND START
    // =====================================

    eingabe.addEventListener("input", pruefen);

    aufgebenButton.addEventListener(
        "click",
        aufgeben
    );

    root.querySelector(".neu").addEventListener(
        "click",
        neu
    );

    neu();


    // =====================================
    // ÖFFENTLICHE SPIELSTEUERUNG
    // =====================================

    return {

        root,

        pause() {

            pausiert = true;

            timer.pause();

            clearTimeout(wechselTimer);
            wechselTimer = null;
        },

        resume() {

            pausiert = false;

            if (beendet && uebung.checked) {

                neu();

            } else if (!beendet) {

                timer.resume();
            }
        },

        dispose() {

            clearTimeout(wechselTimer);
            timer.dispose();
        }
    };
}
