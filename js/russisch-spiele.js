
/* =====================================================
   RUSSISCH-QUIZ

   1. Alphabet: Russisch -> Deutsch
   2. Alphabet: Deutsch -> Russisch
   3. Vokabeln: Russisch -> Deutsch
   4. Vokabeln: Deutsch -> Russisch

   Mit russischer Tastatur und Aussprache.
   ===================================================== */

(() => {

    "use strict";


    // =========================================
    // 1. HTML-ELEMENTE
    // =========================================

    const $ = id =>
        document.getElementById(id);

    const modusAuswahl = $("ru-modus");
    const wortschatzAuswahl = $("ru-wortschatz");
    const anzahlAuswahl = $("ru-anzahl");
    const buchstabenAuswahl = $("ru-buchstaben");
    const hardcoreAuswahl = $("ru-hardcore");

    const eingabe = $("ru-eingabe");
    const formular = $("ru-formular");
    const tastatur = $("ru-tastatur");

    const meldung = $("ru-meldung");
    const frageText = $("ru-frage");
    const aussprechText = $("ru-aussprache");

    const fortschritt = $("ru-fortschritt");
    const fortschrittBalken = $("ru-balken");

    const loesungButton = $("ru-aufdecken");
    const weiterButton = $("ru-weiter");
    const pruefenButton = $("ru-pruefen");
    const hoerenButton = $("ru-hoeren");

    const statistik = $("ru-statistik");


    // =========================================
    // 2. SPIELZUSTAND
    // =========================================

    let fragen = [];
    let index = 0;

    let richtig = 0;
    let aufgedeckt = 0;

    let abgeschlossen = false;
    let beantwortet = false;

    // Großschreibung bei der Bildschirmtastatur
    let shift = false;


    // =========================================
    // 3. RUSSISCHE TASTATURBELEGUNG
    // =========================================

    const russenTasten = [
        "йцукенгшщзхъ",
        "фывапролджэ",
        "ячсмитьбю",
        "ё"
    ];


    // =========================================
    // 4. FRAGEN MISCHEN
    // =========================================

    /**
     * Mischt eine Kopie eines Arrays.
     *
     * Fisher-Yates-Algorithmus.
     *
     * @param {Array} werte - Ursprüngliches Array
     * @returns {Array} Gemischte Kopie
     */
    function mischen(werte) {

        const kopie = [...werte];

        for (
            let i = kopie.length - 1;
            i > 0;
            i--
        ) {

            const j = Math.floor(
                Math.random() * (i + 1)
            );

            [kopie[i], kopie[j]] = [
                kopie[j],
                kopie[i]
            ];
        }

        return kopie;
    }


    // =========================================
    // 5. VOKABELN VERGLEICHEN
    // =========================================

    /**
     * Entfernt Unterschiede, die bei Vokabeln
     * nicht als Fehler gelten sollen.
     *
     * Alphabet-Aufgaben verwenden diese Funktion
     * bewusst NICHT.
     *
     * @param {string} text
     * @param {string} sprache - "ru" oder "de"
     * @returns {string} Vergleichstext
     */
    function vokabelVergleich(text, sprache) {

        let wert = String(text)
            .trim()
            .toLocaleLowerCase("de-DE")
            .normalize("NFD")
            .replace(/\u0301/g, "")
            .normalize("NFC")
            .replace(/[.!?]+$/g, "")
            .replace(/\s+/g, " ");


        // Deutsche Artikel optional erlauben
        if (sprache === "de") {

            wert = wert.replace(
                /^(der|die|das|ein|eine)\s+/,
                ""
            );

            wert = wert.replaceAll("ß", "ss");
        }

        return wert;
    }


    // =========================================
    // 6. EINGABESPRACHE
    // =========================================

    /**
     * Prüft, ob die Antwort kyrillisch sein muss.
     *
     * @returns {boolean}
     */
    function zielIstRussisch() {

        return modusAuswahl.value.endsWith("de-ru");
    }


    /**
     * @returns {boolean}
     * Ob gerade das Alphabet geübt wird.
     */
    function frageIstAlphabet() {

        return modusAuswahl.value.startsWith("alpha-");
    }


    // =========================================
    // 7. FRAGENPOOL ERSTELLEN
    // =========================================

    /**
     * Baut die Liste für die aktuelle Runde auf.
     *
     * @returns {Object[]} Gemischte Fragen
     */
    function baueFragen() {

        const alphabet = frageIstAlphabet();

        let pool;


        // -------------------------------------
        // ALPHABET
        // -------------------------------------

        if (alphabet) {

            pool = RU_ALPHABET.filter(eintrag => {

                if (
                    buchstabenAuswahl.value === "gross"
                ) {
                    return eintrag.gross;
                }

                if (
                    buchstabenAuswahl.value === "klein"
                ) {
                    return !eintrag.gross;
                }

                return true;
            });


        // -------------------------------------
        // VOKABELN
        // -------------------------------------

        } else {

            const umfang =
                wortschatzAuswahl.value === "alle"

                    ? RU_VOKABELN.length

                    : Number(wortschatzAuswahl.value);

            pool = RU_VOKABELN.slice(0, umfang);
        }


        // -------------------------------------
        // FRAGENANZAHL
        // -------------------------------------

        const gewuenscht =
            anzahlAuswahl.value === "alle"

                ? pool.length

                : Math.min(
                    Number(anzahlAuswahl.value),
                    pool.length
                );

        return mischen(pool).slice(0, gewuenscht);
    }


    // =========================================
    // 8. EINSTELLUNGEN ANPASSEN
    // =========================================

    /**
     * Blendet je nach Modus passende Optionen ein.
     *
     * @returns {void}
     */
    function aktualisiereEinstellungen() {

        const alphabet = frageIstAlphabet();

        $("ru-wortschatz-feld").hidden = alphabet;

        $("ru-buchstaben-feld").hidden = !alphabet;

        $("ru-dateninfo").textContent = alphabet

            ? `33 Buchstaben, jeweils groß und klein: ` +
              `${RU_ALPHABET.length} Aufgaben.`

            : `${RU_VOKABELN.length} lokale ` +
              `Alltagsvokabeln verfügbar.`;
    }


    // =========================================
    // 9. FRAGE ANZEIGEN
    // =========================================

    /**
     * Zeigt die aktuelle Frage.
     *
     * @returns {void}
     */
    function zeigeFrage() {


        // -------------------------------------
        // RUNDE ABGESCHLOSSEN
        // -------------------------------------

        if (index >= fragen.length) {

            abgeschlossen = true;
            beantwortet = true;

            frageText.textContent =
                "Runde abgeschlossen!";

            aussprechText.textContent = "";

            meldung.textContent =
                `Ergebnis: ${richtig} richtig · ` +
                `${aufgedeckt} aufgedeckt · ` +
                `${fragen.length} Aufgaben.`;

            statistik.textContent =
                "Du kannst eine neue Runde starten.";

            fortschritt.textContent =
                `${fragen.length} / ${fragen.length}`;

            fortschrittBalken.style.width = "100%";

            eingabe.disabled = true;
            pruefenButton.disabled = true;
            weiterButton.hidden = true;
            loesungButton.hidden = true;
            hoerenButton.disabled = true;
            tastatur.hidden = true;

            return;
        }


        // -------------------------------------
        // NEUE FRAGE
        // -------------------------------------

        abgeschlossen = false;
        beantwortet = false;

        const aktuell = fragen[index];

        const alphabet = frageIstAlphabet();
        const nachRussisch = zielIstRussisch();


        // Was muss übersetzt werden?
        frageText.textContent = alphabet

            ? (
                nachRussisch
                    ? aktuell.latein
                    : aktuell.ru
            )

            : (
                nachRussisch
                    ? aktuell.deutsch[0]
                    : aktuell.ru
            );


        // Aussprache wird IMMER angezeigt.
        aussprechText.textContent = alphabet

            ? `Aussprache: ${aktuell.aussprache}`

            : `Aussprache (vereinfacht): ` +
              aktuell.aussprache;


        // Aufgabenbeschreibung
        $("ru-frage-label").textContent = alphabet

            ? (
                nachRussisch
                    ? "Schreibe den russischen Buchstaben"
                    : "Schreibe die deutsche Umschrift"
            )

            : (
                nachRussisch
                    ? "Übersetze ins Russische"
                    : "Übersetze ins Deutsche"
            );


        // Fortschritt
        fortschritt.textContent =
            `Frage ${index + 1} / ${fragen.length}`;

        fortschrittBalken.style.width =
            `${100 * index / fragen.length}%`;

        statistik.textContent =
            `${richtig} richtig · ` +
            `${aufgedeckt} aufgedeckt`;


        // Eingabe zurücksetzen
        meldung.textContent = "";
        meldung.className = "meldung";

        eingabe.value = "";
        eingabe.disabled = false;

        pruefenButton.disabled = false;
        weiterButton.hidden = true;

        loesungButton.hidden =
            hardcoreAuswahl.checked;

        hoerenButton.disabled = false;

        // Russische Tastatur nur bei kyrillischen Antworten
        tastatur.hidden = !nachRussisch;

        eingabe.placeholder = nachRussisch

            ? "Auf Russisch eingeben …"

            : "Antwort eingeben …";

        eingabe.setAttribute(
            "lang",
            nachRussisch ? "ru" : "de"
        );


        // Bei großen Buchstaben Shift einschalten
        shift =
            alphabet &&
            nachRussisch &&
            aktuell.gross;

        zeichneTastatur();

        eingabe.focus();
    }


    // =========================================
    // 10. ANTWORT ABSCHLIESSEN
    // =========================================

    /**
     * Schließt eine Aufgabe ab.
     *
     * @param {boolean} aufgegeben
     * true = Lösung aufgedeckt
     * false = korrekt beantwortet
     *
     * @returns {void}
     */
    function richtigeLoesung(aufgegeben = false) {

        if (beantwortet || abgeschlossen) {
            return;
        }

        const aktuell = fragen[index];

        beantwortet = true;

        eingabe.disabled = true;
        pruefenButton.disabled = true;

        loesungButton.hidden = true;
        weiterButton.hidden = false;


        // Statistik
        if (aufgegeben) {

            aufgedeckt++;

        } else {

            richtig++;
        }


        // Lösung bestimmen
        const antwort = frageIstAlphabet()

            ? (
                zielIstRussisch()
                    ? aktuell.ru
                    : aktuell.latein
            )

            : (
                zielIstRussisch()
                    ? aktuell.ru
                    : aktuell.deutsch.join(" / ")
            );


        // Bei mehreren korrekten Übersetzungen
        // auch die tatsächliche Eingabe akzeptieren.
        const tatsaechlicheAntwort =
            !aufgegeben && eingabe.value.trim();

        meldung.textContent =
            `${aufgegeben ? "Aufgedeckt" : "Richtig"}: ` +
            (tatsaechlicheAntwort || antwort);

        if (
            tatsaechlicheAntwort &&
            tatsaechlicheAntwort !== antwort
        ) {

            meldung.textContent +=
                ` (Beispiel-Lösung: ${antwort})`;
        }

        meldung.className = aufgegeben

            ? "meldung ru-warn"

            : "meldung ru-ok";

        statistik.textContent =
            `${richtig} richtig · ` +
            `${aufgedeckt} aufgedeckt`;

        weiterButton.focus();
    }


    // =========================================
    // 11. ANTWORT PRÜFEN
    // =========================================

    /**
     * Prüft die Eingabe beim Drücken von Enter
     * oder beim Klick auf "Prüfen".
     *
     * @param {SubmitEvent} event
     * @returns {void}
     */
    function pruefen(event) {

        event.preventDefault();

        if (
            beantwortet ||
            abgeschlossen ||
            !fragen.length
        ) {
            return;
        }

        const antwort = eingabe.value.trim();

        if (!antwort) {

            meldung.textContent =
                "Bitte zuerst eine Antwort eingeben.";

            return;
        }

        const eintrag = fragen[index];

        let istRichtig;


        // -------------------------------------
        // A. ALPHABET: GROSS/KLEIN IST WICHTIG
        // -------------------------------------

        if (frageIstAlphabet()) {

            const erwartet = zielIstRussisch()

                ? eintrag.ru

                : eintrag.latein;

            // EXAKTER Vergleich:
            // "Б" ist nicht dasselbe wie "б".
            istRichtig = antwort === erwartet;


        // -------------------------------------
        // B. DEUTSCH -> RUSSISCH
        // -------------------------------------

        } else if (zielIstRussisch()) {

            /*
             * Manche deutschen Wörter haben
             * mehrere korrekte russische Varianten.
             *
             * Beispiel: gehen -> идти / ходить
             *
             * Deshalb akzeptieren wir alle Einträge,
             * die dieselbe deutsche Bedeutung haben.
             */

            const fragedeut = vokabelVergleich(
                eintrag.deutsch[0],
                "de"
            );

            istRichtig = RU_VOKABELN.some(wort =>

                wort.deutsch.some(de =>
                    vokabelVergleich(de, "de") === fragedeut
                )

                &&

                vokabelVergleich(antwort, "ru") ===
                    vokabelVergleich(wort.ru, "ru")
            );


        // -------------------------------------
        // C. RUSSISCH -> DEUTSCH
        // -------------------------------------

        } else {

            istRichtig = eintrag.deutsch.some(de =>

                vokabelVergleich(antwort, "de") ===
                    vokabelVergleich(de, "de")
            );
        }


        // -------------------------------------
        // D. ERGEBNIS
        // -------------------------------------

        if (istRichtig) {

            richtigeLoesung(false);

        } else if (hardcoreAuswahl.checked) {

            // Dieselbe Runde von vorne.
            index = 0;
            richtig = 0;
            aufgedeckt = 0;

            zeigeFrage();

            meldung.textContent =
                "Hardcore: Falsche Antwort – " +
                "Runde zurückgesetzt!";

            meldung.className =
                "meldung ru-warn";

        } else {

            meldung.textContent =
                "Noch nicht richtig. Versuch es erneut " +
                "oder decke die Lösung auf.";

            meldung.className =
                "meldung ru-warn";

            eingabe.select();
        }
    }


    // =========================================
    // 12. NÄCHSTE FRAGE
    // =========================================

    /**
     * Springt zur nächsten Aufgabe.
     *
     * @returns {void}
     */
    function weiter() {

        if (!beantwortet || abgeschlossen) {
            return;
        }

        index++;

        zeigeFrage();
    }


    // =========================================
    // 13. RUSSISCH ANHÖREN
    // =========================================

    /**
     * Verwendet die Sprachausgabe des Browsers.
     *
     * @returns {void}
     */
    function anhoeren() {

        if (!fragen.length || abgeschlossen) {
            return;
        }

        if (!("speechSynthesis" in window)) {

            meldung.textContent =
                "Auf diesem Gerät ist keine " +
                "Sprachausgabe verfügbar.";

            return;
        }

        const text = fragen[index].ru;

        window.speechSynthesis.cancel();

        const stimme =
            new SpeechSynthesisUtterance(text);

        stimme.lang = "ru-RU";

        // Etwas langsamer als die normale Geschwindigkeit
        stimme.rate = 0.78;

        window.speechSynthesis.speak(stimme);
    }


    // =========================================
    // 14. RUSSISCHE TASTATUR: EINGABE
    // =========================================

    /**
     * Fügt einen Buchstaben am Cursor ein.
     *
     * @param {string} zeichen - Taste oder "zurueck"
     * @returns {void}
     */
    function tasteEingeben(zeichen) {

        if (eingabe.disabled) return;

        const von =
            eingabe.selectionStart ??
            eingabe.value.length;

        const bis =
            eingabe.selectionEnd ??
            eingabe.value.length;

        const wert = eingabe.value;


        // -------------------------------------
        // LÖSCHTASTE
        // -------------------------------------

        if (zeichen === "zurueck") {

            const beginn = von === bis

                ? Math.max(0, von - 1)

                : von;

            eingabe.value =
                wert.slice(0, beginn) +
                wert.slice(bis);

            eingabe.setSelectionRange(
                beginn,
                beginn
            );


        // -------------------------------------
        // NORMALER BUCHSTABE / LEERZEICHEN
        // -------------------------------------

        } else {

            eingabe.value =
                wert.slice(0, von) +
                zeichen +
                wert.slice(bis);

            const cursor =
                von + zeichen.length;

            eingabe.setSelectionRange(
                cursor,
                cursor
            );

            // Shift gilt für einen Buchstaben
            if (shift) {
                shift = false;
            }
        }

        eingabe.focus();

        zeichneTastatur();
    }


    // =========================================
    // 15. BILDSCHIRMTASTATUR ZEICHNEN
    // =========================================

    /**
     * Baut die kyrillischen Tasten dynamisch auf.
     *
     * @returns {void}
     */
    function zeichneTastatur() {

        tastatur.replaceChildren();

        if (!zielIstRussisch()) return;


        // -------------------------------------
        // BUCHSTABENZEILEN
        // -------------------------------------

        for (const buchstaben of russenTasten) {

            const zeile =
                document.createElement("div");

            zeile.className =
                "ru-tastenzeile";

            for (const klein of buchstaben) {

                const taste =
                    document.createElement("button");

                taste.type = "button";
                taste.className = "ru-taste";

                const zeichen = shift

                    ? klein.toUpperCase()

                    : klein;

                taste.textContent = zeichen;

                taste.addEventListener(
                    "click",
                    () => tasteEingeben(zeichen)
                );

                zeile.appendChild(taste);
            }

            tastatur.appendChild(zeile);
        }


        // -------------------------------------
        // SONDER-TASTEN
        // -------------------------------------

        const zeile =
            document.createElement("div");

        zeile.className = "ru-tastenzeile";

        const spezial = [

            [
                shift ? "⇧ GROSS" : "⇧ Groß",

                () => {
                    shift = !shift;
                    zeichneTastatur();
                }
            ],

            [
                "Leerzeichen",

                () => tasteEingeben(" ")
            ],

            [
                "⌫",

                () => tasteEingeben("zurueck")
            ]
        ];

        for (const [label, handler] of spezial) {

            const taste =
                document.createElement("button");

            taste.type = "button";

            taste.className =
                "ru-taste ru-sonder";

            taste.textContent = label;

            taste.addEventListener(
                "click",
                handler
            );

            zeile.appendChild(taste);
        }

        tastatur.appendChild(zeile);
    }


    // =========================================
    // 16. NEUE RUNDE
    // =========================================

    /**
     * Startet die ausgewählte Übungsrunde.
     *
     * @returns {void}
     */
    function neueRunde() {

        fragen = baueFragen();

        index = 0;
        richtig = 0;
        aufgedeckt = 0;

        abgeschlossen = false;
        beantwortet = false;

        $("ru-spiel").hidden = false;

        zeigeFrage();
    }


    // =========================================
    // 17. EVENT-LISTENER
    // =========================================

    modusAuswahl.addEventListener("change", () => {

        aktualisiereEinstellungen();

        // Bei Moduswechsel eine neue Runde verlangen
        $("ru-spiel").hidden = true;
    });


    $("ru-start").addEventListener(
        "click",
        neueRunde
    );


    formular.addEventListener(
        "submit",
        pruefen
    );


    loesungButton.addEventListener(
        "click",
        () => richtigeLoesung(true)
    );


    weiterButton.addEventListener(
        "click",
        weiter
    );


    hoerenButton.addEventListener(
        "click",
        anhoeren
    );


    // =========================================
    // 18. INITIALISIEREN
    // =========================================

    aktualisiereEinstellungen();

})();
