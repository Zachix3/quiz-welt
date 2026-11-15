
/* =============================================
   RUSSISCH – ALPHABET UND VOKABELN
   Alles lokal, keine API.
   ============================================= */

const RU_ALPHABET_GRUNDLAGE = [
    ["А", "A", "a wie in Abend"],
    ["Б", "B", "b wie in Ball"],
    ["В", "W", "w wie in Wasser"],
    ["Г", "G", "g wie in Garten"],
    ["Д", "D", "d wie in Dach"],
    ["Е", "Je", "je wie in jetzt; nach Konsonanten oft e"],
    ["Ё", "Jo", "jo wie in Joghurt"],
    ["Ж", "Sch (stimmhaft)", "stimmhaftes sch, ähnlich J in Journal"],
    ["З", "S (stimmhaft)", "stimmhaftes s wie in Sonne"],
    ["И", "I", "i wie in Igel"],
    ["Й", "J", "kurzes j wie in ja"],
    ["К", "K", "k wie in Katze"],
    ["Л", "L", "l wie in Lampe"],
    ["М", "M", "m wie in Mama"],
    ["Н", "N", "n wie in Nase"],
    ["О", "O", "betont o, unbetont oft a-artig"],
    ["П", "P", "p wie in Papa"],
    ["Р", "R", "gerolltes r"],
    ["С", "Ss (stimmlos)", "stimmloses s wie in Kasse"],
    ["Т", "T", "t wie in Tisch"],
    ["У", "U", "u wie in Uhr"],
    ["Ф", "F", "f wie in Fisch"],
    ["Х", "Ch", "ch wie in Bach"],
    ["Ц", "Z", "z wie in Zeit (ts)"],
    ["Ч", "Tsch", "tsch wie in Tschüss, weich"],
    ["Ш", "Sch (stimmlos)", "stimmloses sch wie in Schule"],
    ["Щ", "Schtsch", "langes, weiches sch"],
    ["Ъ", "Härtezeichen", "kein eigener Laut; trennt Laute"],
    ["Ы", "Y (hartes i)", "harter i-Laut ohne deutsche Entsprechung"],
    ["Ь", "Weichheitszeichen", "kein eigener Laut; macht vorigen Konsonanten weich"],
    ["Э", "E", "offenes e wie in Bett"],
    ["Ю", "Ju", "ju wie in Jugend"],
    ["Я", "Ja", "ja wie in Januar"]
];


/*
 * Jeden Buchstaben zweimal aufnehmen:
 * Großbuchstabe und Kleinbuchstabe.
 *
 * Beispielsweise:
 * Б -> B
 * б -> b
 */

const RU_ALPHABET = RU_ALPHABET_GRUNDLAGE.flatMap(
    ([ru, latein, aussprache]) => [
        {
            ru,
            latein,
            aussprache,
            gross: true
        },
        {
            ru: ru.toLowerCase(),

            latein:
                latein.charAt(0).toLowerCase() +
                latein.slice(1),

            aussprache,
            gross: false
        }
    ]
);


/*
 * VOKABELFORMAT
 *
 * russisch|deutsch
 *
 * Mehrere gültige deutsche Antworten:
 * russisch|antwort1;antwort2
 *
 * Ein # beginnt einen Themenabschnitt.
 *
 * Das Betonungszeichen ´ kann direkt auf
 * einem russischen Vokal stehen.
 */

const RU_VOKABEL_TEXT = `
# Höflichkeit, Fragen und Alltagswörter
да|ja
нет|nein
спаси́бо|danke
пожа́луйста|bitte;gern geschehen
здра́вствуйте|guten Tag;hallo
приве́т|hallo;hi
пока́|tschüss;tschüs
до свида́ния|auf Wiedersehen
извини́|entschuldige
извини́те|entschuldigen Sie
хорошо́|gut
пло́хо|schlecht
коне́чно|natürlich;klar
возмо́жно|möglicherweise;vielleicht
мо́жет быть|vielleicht
пра́вда|Wahrheit;stimmt
о́чень|sehr
то́же|auch
то́лько|nur
да́же|sogar
вме́сте|zusammen
здесь|hier
там|dort
сюда́|hierher
туда́|dorthin
где|wo
куда́|wohin
когда́|wann
почему́|warum
заче́м|wozu
как|wie
что|was
кто|wer
како́й|welcher
ско́лько|wie viel;wieviel
мо́жно|darf man;ist es erlaubt
нельзя́|man darf nicht;verboten
ну|na ja;also
и́ли|oder
и|und
но|aber
а|aber;und
не|nicht
е́сли|wenn;falls
потому́ что|weil
без|ohne
для|für
с|mit
на|auf
в|in
под|unter
над|über
из|aus
у|bei
о|über

# Pronomen, Personen und Beziehungen
я|ich
ты|du
вы|ihr;Sie
он|er
она́|sie
оно́|es
они́|sie
мы|wir
э́то|das;dies
э́тот|dieser
э́та|diese
тот|jener
мой|mein
моя́|meine
моё|mein
твой|dein
твоя́|deine
наш|unser
ваш|euer;Ihr
его́|sein;ihn
её|ihr;sie
их|ihr;ihre
себя́|sich
всё|alles
все|alle
никто́|niemand
кто́-то|jemand
челове́к|Mensch
лю́ди|Leute;Menschen
друг|Freund
подру́га|Freundin
семья́|Familie
ма́ма|Mama;Mutter
па́па|Papa;Vater
ма́ть|Mutter
оте́ц|Vater
брат|Bruder
сестра́|Schwester
ребёнок|Kind
де́ти|Kinder
жена́|Ehefrau;Frau
муж|Ehemann;Mann
мужчи́на|Mann
же́нщина|Frau
де́вушка|Mädchen;junge Frau
па́рень|Junge;junger Mann

# Dinge, Orte und Lernen
дом|Haus
кварти́ра|Wohnung
ко́мната|Zimmer
дверь|Tür
окно́|Fenster
стол|Tisch
стул|Stuhl
крова́ть|Bett
ку́хня|Küche
ва́нна|Badewanne
сад|Garten
го́род|Stadt
дере́вня|Dorf
у́лица|Straße
доро́га|Weg;Straße
маши́на|Auto
авто́бус|Bus
по́езд|Zug
метро́|U-Bahn;Metro
самолёт|Flugzeug
вокза́л|Bahnhof
аэропо́рт|Flughafen
магази́н|Geschäft;Laden
ры́нок|Markt
апте́ка|Apotheke
больни́ца|Krankenhaus
шко́ла|Schule
университе́т|Universität
рабо́та|Arbeit
де́ньги|Geld
цена́|Preis
биле́т|Fahrkarte;Ticket;Eintrittskarte
ка́рта|Karte
телефо́н|Telefon
компью́тер|Computer
кни́га|Buch
тетра́дь|Heft
ру́чка|Kugelschreiber;Stift
каранда́ш|Bleistift
бума́га|Papier
письмо́|Brief
сло́во|Wort
язы́к|Sprache;Zunge
вопро́с|Frage
отве́т|Antwort
и́мя|Vorname;Name
фами́лия|Nachname

# Essen, Trinken und Körper
вода́|Wasser
чай|Tee
ко́фе|Kaffee
молоко́|Milch
хлеб|Brot
сыр|Käse
ма́сло|Butter;Öl
мя́со|Fleisch
ку́рица|Hähnchen;Huhn
яйцо́|Ei
суп|Suppe
о́вощи|Gemüse
фру́кты|Obst
я́блоко|Apfel
бана́н|Banane
карто́фель|Kartoffel
рис|Reis
соль|Salz
са́хар|Zucker
за́втрак|Frühstück
обе́д|Mittagessen
у́жин|Abendessen
рестора́н|Restaurant
кафе́|Café
ча́шка|Tasse
стака́н|Glas
ло́жка|Löffel
ви́лка|Gabel
нож|Messer
таре́лка|Teller
рука́|Hand;Arm
нога́|Bein;Fuß
голова́|Kopf
глаз|Auge
у́хо|Ohr
нос|Nase
рот|Mund
се́рдце|Herz
ко́шка|Katze
соба́ка|Hund
пти́ца|Vogel
ры́ба|Fisch

# Verben (Grundform)
быть|sein
жить|leben
знать|wissen;kennen
понима́ть|verstehen
говори́ть|sprechen
сказа́ть|sagen
чита́ть|lesen
писа́ть|schreiben
слу́шать|zuhören
слы́шать|hören
смотре́ть|anschauen;ansehen
ви́деть|sehen
де́лать|machen;tun
рабо́тать|arbeiten
учи́ться|lernen
учи́ть|lernen;unterrichten
люби́ть|lieben
нра́виться|gefallen
хоте́ть|wollen
мочь|können
идти́|gehen
ходи́ть|gehen
е́хать|fahren
е́здить|fahren
приходи́ть|kommen
бежа́ть|laufen;rennen
есть|essen
пить|trinken
спать|schlafen
встава́ть|aufstehen
сиде́ть|sitzen
стоя́ть|stehen
лежа́ть|liegen
дава́ть|geben
брать|nehmen
покупа́ть|kaufen
плати́ть|bezahlen
ждать|warten
иска́ть|suchen
находи́ть|finden
спра́шивать|fragen
отвеча́ть|antworten
забыва́ть|vergessen
по́мнить|sich erinnern;erinnern
открыва́ть|öffnen
закрыва́ть|schließen
начина́ть|anfangen;beginnen
зака́нчивать|beenden
ду́мать|denken
ве́рить|glauben
игра́ть|spielen
гуля́ть|spazieren gehen;spazieren
помога́ть|helfen
гото́вить|kochen;zubereiten
уме́ть|können
реша́ть|entscheiden;lösen
звони́ть|anrufen

# Eigenschaften
хоро́ший|gut
плохо́й|schlecht
большо́й|groß
ма́ленький|klein
но́вый|neu
ста́рый|alt
молодо́й|jung
краси́вый|schön
у́мный|klug;schlau
глу́пый|dumm
до́брый|nett;freundlich
зло́й|böse
бы́стрый|schnell
ме́дленный|langsam
лёгкий|leicht
тру́дный|schwierig;schwer
просто́й|einfach
ва́жный|wichtig
ну́жный|nötig;notwendig
свобо́дный|frei
заня́тый|beschäftigt
дорого́й|teuer
дешёвый|billig;günstig
беспла́тный|kostenlos
откры́тый|offen
закры́тый|geschlossen
тёплый|warm
холо́дный|kalt
горя́чий|heiß
пра́вый|rechts
ле́вый|links
но́рмальный|normal

# Zeit, Natur und Freizeit
вре́мя|Zeit
год|Jahr
ме́сяц|Monat
неде́ля|Woche
день|Tag
ночь|Nacht
у́тро|Morgen
ве́чер|Abend
час|Stunde
мину́та|Minute
секу́нда|Sekunde
сего́дня|heute
за́втра|morgen
вчера́|gestern
сейча́с|jetzt
пото́м|später;danach
ра́но|früh
по́здно|spät
всегда́|immer
никогда́|nie
иногда́|manchmal
ча́сто|oft
ре́дко|selten
бы́стро|schnell
ме́дленно|langsam
пого́да|Wetter
дождь|Regen
снег|Schnee
со́лнце|Sonne
ве́тер|Wind
не́бо|Himmel
мо́ре|Meer
река́|Fluss
гора́|Berg
лес|Wald
земля́|Erde;Land
цвет|Farbe
му́зыка|Musik
фильм|Film
игра́|Spiel
спорт|Sport
футбо́л|Fußball

# Zahlen, Tage und Farben
оди́н|eins
два|zwei
три|drei
четы́ре|vier
пять|fünf
шесть|sechs
семь|sieben
во́семь|acht
де́вять|neun
де́сять|zehn
пе́рвый|erste;erster
второ́й|zweite;zweiter
понеде́льник|Montag
вто́рник|Dienstag
среда́|Mittwoch
четве́рг|Donnerstag
пя́тница|Freitag
суббо́та|Samstag
воскресе́нье|Sonntag
бе́лый|weiß
чёрный|schwarz
кра́сный|rot
си́ний|blau
голубо́й|hellblau
зелёный|grün
жёлтый|gelb
се́рый|grau
ро́зовый|rosa
ора́нжевый|orange
кори́чневый|braun
`;


/**
 * Entfernt Betonungszeichen aus russischen Wörtern.
 *
 * Beispiel:
 * "кни́га" -> "книга"
 *
 * @param {string} text
 * @returns {string}
 */
function ruOhneBetonung(text) {

    return String(text)
        .normalize("NFD")
        .replace(/\u0301/g, "")
        .normalize("NFC");
}


/**
 * Erzeugt eine vereinfachte deutsche Lautumschrift.
 *
 * Das ist eine Lernhilfe und keine exakte Aussprache.
 * Für echte Aussprache gibt es die Sprachausgabe.
 *
 * @param {string} text
 * @returns {string}
 */
function ruLautschrift(text) {

    const map = {
        "а": "a",
        "б": "b",
        "в": "w",
        "г": "g",
        "д": "d",
        "е": "je",
        "ё": "jo",
        "ж": "sch",
        "з": "s",
        "и": "i",
        "й": "j",
        "к": "k",
        "л": "l",
        "м": "m",
        "н": "n",
        "о": "o",
        "п": "p",
        "р": "r",
        "с": "ss",
        "т": "t",
        "у": "u",
        "ф": "f",
        "х": "ch",
        "ц": "z",
        "ч": "tsch",
        "ш": "sch",
        "щ": "schtsch",
        "ъ": "’",
        "ы": "y",
        "ь": "’",
        "э": "e",
        "ю": "ju",
        "я": "ja"
    };

    let result = "";

    for (const zeichen of text.toLowerCase()) {

        // Betonungszeichen beibehalten
        if (zeichen === "\u0301") {
            result += "́";
            continue;
        }

        if (zeichen === "\u0308") {
            continue;
        }

        result += map[zeichen] ?? zeichen;
    }

    return result;
}


/**
 * Wandelt die Textdaten in Vokabelobjekte um.
 *
 * Beispielobjekt:
 *
 * {
 *   id: 1,
 *   ru: "спасибо",
 *   betont: "спаси́бо",
 *   deutsch: ["danke"],
 *   aussprache: "..."
 * }
 */
const RU_VOKABELN = RU_VOKABEL_TEXT
    .trim()
    .split("\n")

    .map(zeile => zeile.trim())

    .filter(zeile =>
        zeile &&
        !zeile.startsWith("#")
    )

    .map((zeile, index) => {

        const [betont, deutsch] =
            zeile.split("|");

        return {
            id: index + 1,

            ru: ruOhneBetonung(betont),

            betont,

            deutsch: deutsch
                .split(";")
                .map(text => text.trim()),

            aussprache: ruLautschrift(betont)
        };
    });
