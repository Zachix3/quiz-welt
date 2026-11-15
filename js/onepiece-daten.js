
/* =========================================
   ONE PIECE – VOLLSTÄNDIGERER DATENKATALOG
   ========================================= */

// =========================================
// 1. API UND CACHE
// =========================================

const OP_API = "https://onepieceapi.com/api";

const OP_CACHE_KEY = "quiz-onepiece-katalog-v2";

const OP_CACHE_MS = 24 * 60 * 60 * 1000;


// =========================================
// 2. GEPRÜFTE EPISODENDATEN
// =========================================

/*
 * erwaehnung = erste bekannte namentliche Erwähnung
 * anwendung  = erste bekannte Nutzung der Kraft
 *
 * null bedeutet: noch nicht verifiziert.
 */

const OP_GEPRUEFTE_FRUECHTE = [
    {
        id: "gomu",
        ja: "Gomu Gomu no Mi",
        de: "Gum-Gum-Frucht",
        en: "Gum-Gum Fruit",
        alias: ["Gumm-Gumm-Frucht"],
        erwaehnung: 1,
        anwendung: 1,
        anwender: ["luffy"]
    },
    {
        id: "bara",
        ja: "Bara Bara no Mi",
        de: "Trenn-Trenn-Frucht",
        en: "Chop-Chop Fruit",
        alias: [],
        erwaehnung: 5,
        anwendung: 5,
        anwender: ["buggy"]
    },
    {
        id: "sube",
        ja: "Sube Sube no Mi",
        de: "Alabaster-Frucht",
        en: "Slip-Slip Fruit",
        alias: ["Glätte-Frucht"],
        erwaehnung: 52,
        anwendung: 46,
        anwender: ["alvida"]
    },
    {
        id: "hana",
        ja: "Hana Hana no Mi",
        de: "Flora-Frucht",
        en: "Flower-Flower Fruit",
        alias: [],
        erwaehnung: 67,
        anwendung: 67,
        anwender: ["robin"]
    },
    {
        id: "mera",
        ja: "Mera Mera no Mi",
        de: "Feuer-Frucht",
        en: "Flame-Flame Fruit",
        alias: [],
        erwaehnung: 96,
        anwendung: 94,
        anwender: ["ace"]
    }
];


// =========================================
// 3. FIGUREN MIT BEKANNTEM ANIME-DEBÜT
// =========================================

/*
 * Wir übernehmen bei diesen Figuren nur Daten,
 * die zum jeweiligen frühen Serienstand passen.
 *
 * Die API kann bereits spätere Kopfgelder,
 * Altersangaben oder Outfits enthalten.
 */

const OP_GEPRUEFTE_FIGUREN = [
    {
        id: "luffy",
        name: "Monkey D. Ruffy",
        en: "Monkey D. Luffy",
        alias: ["Ruffy", "Luffy", "Strohhut Ruffy"],
        episode: 1,
        arc: "Romance Dawn",
        alter: 17,
        groesse: 172
    },
    {
        id: "zoro",
        name: "Lorenor Zorro",
        en: "Roronoa Zoro",
        alias: ["Zorro", "Zoro"],
        episode: 1,
        arc: "Romance Dawn"
    },
    {
        id: "nami",
        name: "Nami",
        en: "Nami",
        alias: [],
        episode: 1,
        arc: "Romance Dawn"
    },
    {
        id: "koby",
        name: "Corby",
        en: "Koby",
        alias: ["Coby"],
        episode: 1,
        arc: "Romance Dawn"
    },
    {
        id: "alvida",
        name: "Alvida",
        en: "Alvida",
        alias: ["Lady Alvida"],
        episode: 1,
        arc: "Romance Dawn"
    },
    {
        id: "buggy",
        name: "Buggy",
        en: "Buggy",
        alias: ["Buggy der Clown", "Buggy the Clown"],
        episode: 4,
        arc: "Orange Town",
        alter: 37,
        groesse: 192
    },
    {
        id: "usopp",
        name: "Lysop",
        en: "Usopp",
        alias: ["Usopp"],
        episode: 8,
        arc: "Syrup Village"
    },
    {
        id: "sanji",
        name: "Sanji",
        en: "Sanji",
        alias: ["Schwarzfuß Sanji"],
        episode: 20,
        arc: "Baratié"
    },
    {
        id: "robin",
        name: "Nico Robin",
        en: "Nico Robin",
        alias: ["Robin", "Miss All Sunday"],
        episode: 67,
        arc: "Whisky Peak",
        alter: 28,
        groesse: 188
    },
    {
        id: "chopper",
        name: "Tony Chopper",
        en: "Tony Tony Chopper",
        alias: ["Chopper"],
        episode: 81,
        arc: "Drum Island"
    },
    {
        id: "ace",
        name: "Portgas D. Ace",
        en: "Portgas D. Ace",
        alias: ["Ace", "Feuerfaust Ace"],
        episode: 91,
        arc: "Drum Island",
        alter: 20,
        groesse: 185
    }
];


// =========================================
// 4. DEUTSCHE TEUFELSFRUCHT-NAMEN
// =========================================

/*
 * Deutsche Bezeichnungen aus deutschsprachigen
 * One-Piece-Übersichten.
 *
 * Nicht zugeordnete Früchte bekommen de = null.
 * Das Spiel erfindet keine Übersetzung.
 */

const OP_DEUTSCHE_FRUCHTNAMEN = {
    "Bomu Bomu no Mi": "Bomb-Bomb-Frucht",
    "Kilo Kilo no Mi": "Kilo-Kilo-Frucht",
    "Doru Doru no Mi": "Wachs-Frucht",
    "Baku Baku no Mi": "Munch-Frucht",
    "Mane Mane no Mi": "Nachahmungs-Frucht",
    "Supa Supa no Mi": "Schnitt-Frucht",
    "Toge Toge no Mi": "Stachel-Frucht",
    "Ori Ori no Mi": "Fessel-Frucht",
    "Bane Bane no Mi": "Spiral-Frucht",
    "Ito Ito no Mi": "Faden-Frucht",
    "Noro Noro no Mi": "Lahm-Frucht",
    "Doa Doa no Mi": "Door-Door-Frucht",
    "Awa Awa no Mi": "Schaum-Frucht",
    "Sabi Sabi no Mi": "Rost-Frucht",
    "Horo Horo no Mi": "Geister-Frucht",
    "Yomi Yomi no Mi": "Totenreich-Frucht",
    "Kage Kage no Mi": "Schatten-Frucht",
    "Suke Suke no Mi": "Unsichtbarkeits-Frucht",
    "Nikyu Nikyu no Mi": "Tatzen-Frucht",
    "Toshi Toshi no Mi": "Alters-Frucht",
    "Jiki Jiki no Mi": "Magnet-Frucht",
    "Ope Ope no Mi": "Operations-Frucht",
    "Shiro Shiro no Mi": "Festungs-Frucht",
    "Wara Wara no Mi": "Stroh-Frucht",
    "Oto Oto no Mi": "Ton-Frucht",
    "Mero Mero no Mi": "Liebes-Frucht",
    "Doku Doku no Mi": "Gift-Frucht",
    "Horu Horu no Mi": "Hormon-Frucht",
    "Choki Choki no Mi": "Scheren-Frucht",
    "Gura Gura no Mi": "Erdbeben-Frucht",
    "Kira Kira no Mi": "Glitzer-Frucht",
    "Poke Poke no Mi": "Taschen-Frucht",
    "Woshu Woshu no Mi": "Wäsche-Frucht",
    "Mato Mato no Mi": "Ziel-Frucht",
    "Fuku Fuku no Mi": "Kleider-Frucht",
    "Hobi Hobi no Mi": "Hobby-Frucht",
    "Buki Buki no Mi": "Waffen-Frucht",
    "Guru Guru no Mi": "Rotier-Frucht",
    "Beta Beta no Mi": "Klebe-Frucht",
    "Zushi Zushi no Mi": "Stampf-Frucht",
    "Bari Bari no Mi": "Barriere-Frucht",
    "Nui Nui no Mi": "Näh-Frucht",
    "Giro Giro no Mi": "Blick-Frucht",
    "Ato Ato no Mi": "Kunst-Frucht",
    "Jake Jake no Mi": "Jacken-Frucht",
    "Pamu Pamu no Mi": "Platz-Frucht",
    "Sui Sui no Mi": "Schwimm-Frucht",
    "Ton Ton no Mi": "Tonnen-Frucht",
    "Hira Hira no Mi": "Flaggen-Frucht",
    "Ishi Ishi no Mi": "Stein-Frucht",
    "Fude Fude no Mi": "Pinsel-Frucht",
    "Nagi Nagi no Mi": "Stille-Frucht",
    "Chiyu Chiyu no Mi": "Heilungs-Frucht",
    "Soru Soru no Mi": "Seelen-Frucht",
    "Mira Mira no Mi": "Spiegel-Frucht",
    "Pero Pero no Mi": "Schleck-Frucht",
    "Bisu Bisu no Mi": "Keks-Frucht",
    "Buku Buku no Mi": "Bücher-Frucht",
    "Shibo Shibo no Mi": "Wring-Frucht",
    "Memo Memo no Mi": "Gedächtnis-Frucht",
    "Mochi Mochi no Mi": "Mochi-Frucht",
    "Hoya Hoya no Mi": "Lampen-Frucht",
    "Netsu Netsu no Mi": "Hitze-Frucht",
    "Kuku Kuku no Mi": "Koch-Frucht",
    "Kibi Kibi no Mi": "Hirse-Frucht",
    "Toki Toki no Mi": "Zeit-Frucht",
    "Juku Juku no Mi": "Reife-Frucht",
    "Maki Maki no Mi": "Schriftrollen-Frucht",
    "Wapu Wapu no Mi": "Warp-Frucht",
    "Riki Riki no Mi": "Stärke-Frucht",
    "Shiku Shiku no Mi": "Krankheits-Frucht",
    "Nomi Nomi no Mi": "Gehirn-Frucht",
    "Shima Shima no Mi": "Insel-Frucht",
    "Gabu Gabu no Mi": "Glug-Glug-Frucht",
    "Moku Moku no Mi": "Rauch-Frucht",
    "Suna Suna no Mi": "Sand-Frucht",
    "Goro Goro no Mi": "Donner-Frucht",
    "Hie Hie no Mi": "Gefrier-Frucht",
    "Yami Yami no Mi": "Finster-Frucht",
    "Pika Pika no Mi": "Funkel-Frucht",
    "Magu Magu no Mi": "Magma-Frucht",
    "Numa Numa no Mi": "Sumpf-Frucht",
    "Gasu Gasu no Mi": "Gas-Frucht",
    "Yuki Yuki no Mi": "Schnee-Frucht",
    "Mori Mori no Mi": "Wald-Frucht"
};


// =========================================
// 5. TEUFELSFRUCHT-ANWENDER
// =========================================

/*
 * Diese Verbindungen werden im Gesamtkatalog genutzt.
 * Sie sagen NICHT aus, ab welcher Episode ein Anwender
 * eine Frucht besitzt oder verwendet.
 */

const OP_FRUCHT_ANWENDER_NAMEN = {
    "Gomu Gomu no Mi": ["Monkey D. Luffy"],
    "Bara Bara no Mi": ["Buggy"],
    "Sube Sube no Mi": ["Alvida"],
    "Hana Hana no Mi": ["Nico Robin"],
    "Mera Mera no Mi": ["Portgas D. Ace", "Sabo"],
    "Bomu Bomu no Mi": ["Gem", "Mr. 5"],
    "Kilo Kilo no Mi": ["Mikita", "Miss Valentine"],
    "Doru Doru no Mi": ["Galdino", "Mr. 3"],
    "Baku Baku no Mi": ["Wapol"],
    "Mane Mane no Mi": ["Bentham", "Bon Clay"],
    "Supa Supa no Mi": ["Daz Bonez", "Mr. 1"],
    "Toge Toge no Mi": ["Zala", "Miss Doublefinger"],
    "Ori Ori no Mi": ["Hina"],
    "Bane Bane no Mi": ["Bellamy"],
    "Ito Ito no Mi": ["Donquixote Doflamingo"],
    "Noro Noro no Mi": ["Foxy"],
    "Doa Doa no Mi": ["Blueno"],
    "Awa Awa no Mi": ["Kalifa"],
    "Beri Beri no Mi": ["Very Good"],
    "Sabi Sabi no Mi": ["Shu"],
    "Shari Shari no Mi": ["Sharinguru"],
    "Horo Horo no Mi": ["Perona"],
    "Yomi Yomi no Mi": ["Brook"],
    "Kage Kage no Mi": ["Gecko Moria"],
    "Suke Suke no Mi": ["Absalom", "Shiryu"],
    "Nikyu Nikyu no Mi": ["Bartholomew Kuma"],
    "Toshi Toshi no Mi": ["Jewelry Bonney"],
    "Jiki Jiki no Mi": ["Eustass Kid"],
    "Ope Ope no Mi": ["Trafalgar D. Water Law"],
    "Shiro Shiro no Mi": ["Capone Bege"],
    "Wara Wara no Mi": ["Basil Hawkins"],
    "Oto Oto no Mi": ["Scratchmen Apoo"],
    "Mero Mero no Mi": ["Boa Hancock"],
    "Doku Doku no Mi": ["Magellan"],
    "Horu Horu no Mi": ["Emporio Ivankov"],
    "Choki Choki no Mi": ["Inazuma"],
    "Gura Gura no Mi": ["Edward Newgate", "Marshall D. Teach"],
    "Kira Kira no Mi": ["Jozu"],
    "Poke Poke no Mi": ["Blamenco"],
    "Woshu Woshu no Mi": ["Tsuru"],
    "Mato Mato no Mi": ["Vander Decken IX"],
    "Fuku Fuku no Mi": ["Kinemon"],
    "Hobi Hobi no Mi": ["Sugar"],
    "Buki Buki no Mi": ["Baby 5"],
    "Guru Guru no Mi": ["Buffalo"],
    "Beta Beta no Mi": ["Trebol"],
    "Zushi Zushi no Mi": ["Issho"],
    "Bari Bari no Mi": ["Bartolomeo"],
    "Nui Nui no Mi": ["Leo"],
    "Giro Giro no Mi": ["Viola"],
    "Ato Ato no Mi": ["Giolla"],
    "Jake Jake no Mi": ["Kelly Funk"],
    "Pamu Pamu no Mi": ["Gladius"],
    "Sui Sui no Mi": ["Senor Pink"],
    "Ton Ton no Mi": ["Machvise"],
    "Hira Hira no Mi": ["Diamante"],
    "Ishi Ishi no Mi": ["Pica"],
    "Fude Fude no Mi": ["Kurozumi Kanjuro"],
    "Nagi Nagi no Mi": ["Donquixote Rosinante"],
    "Chiyu Chiyu no Mi": ["Mansherry"],
    "Soru Soru no Mi": ["Charlotte Linlin"],
    "Mira Mira no Mi": ["Charlotte Brulee"],
    "Pero Pero no Mi": ["Charlotte Perospero"],
    "Bisu Bisu no Mi": ["Charlotte Cracker"],
    "Buku Buku no Mi": ["Charlotte Mont-d'Or"],
    "Shibo Shibo no Mi": ["Charlotte Smoothie"],
    "Memo Memo no Mi": ["Charlotte Pudding"],
    "Mochi Mochi no Mi": ["Charlotte Katakuri"],
    "Hoya Hoya no Mi": ["Charlotte Daifuku"],
    "Netsu Netsu no Mi": ["Charlotte Oven"],
    "Kuku Kuku no Mi": ["Streusen"],
    "Kobi Kobi no Mi": ["Belo Betty"],
    "Oshi Oshi no Mi": ["Morley"],
    "Kibi Kibi no Mi": ["Kurozumi Tama"],
    "Toki Toki no Mi": ["Kozuki Toki"],
    "Juku Juku no Mi": ["Shinobu"],
    "Maki Maki no Mi": ["Raizo"],
    "Wapu Wapu no Mi": ["Van Augur"],
    "Riki Riki no Mi": ["Jesus Burgess"],
    "Shiku Shiku no Mi": ["Doc Q"],
    "Nomi Nomi no Mi": ["Vegapunk"],
    "Shima Shima no Mi": ["Avalo Pizarro"],
    "Gabu Gabu no Mi": ["Vasco Shot"],
    "Moku Moku no Mi": ["Smoker"],
    "Suna Suna no Mi": ["Crocodile"],
    "Goro Goro no Mi": ["Enel"],
    "Hie Hie no Mi": ["Kuzan"],
    "Yami Yami no Mi": ["Marshall D. Teach"],
    "Pika Pika no Mi": ["Borsalino"],
    "Magu Magu no Mi": ["Sakazuki"],
    "Numa Numa no Mi": ["Caribou"],
    "Gasu Gasu no Mi": ["Caesar Clown"],
    "Yuki Yuki no Mi": ["Monet"],
    "Mori Mori no Mi": ["Aramaki"],

    // Zoan-Früchte mit bekannten Anwendern
    "Hito Hito no Mi": ["Tony Tony Chopper"],
    "Hito Hito no Mi, Model: Nika": ["Monkey D. Luffy"],
    "Hito Hito no Mi, Model: Daibutsu": ["Sengoku"],
    "Tori Tori no Mi, Model: Phoenix": ["Marco"],
    "Tori Tori no Mi, Model: Falcon": ["Pell"],
    "Uo Uo no Mi, Model: Seiryu": ["Kaido"],
    "Neko Neko no Mi, Model: Leopard": ["Rob Lucci"],
    "Ushi Ushi no Mi, Model: Giraffe": ["Kaku"],
    "Ushi Ushi no Mi, Model: Bison": ["Dalton"],
    "Inu Inu no Mi, Model: Wolf": ["Jabra"],
    "Mogu Mogu no Mi": ["Drophy"],
    "Uma Uma no Mi": ["Pierre"],
    "Zou Zou no Mi": ["Funkfreed"],
    "Ryu Ryu no Mi, Model: Allosaurus": ["X Drake"],
    "Zou Zou no Mi, Model: Mammoth": ["Jack"],
    "Ryu Ryu no Mi, Model: Spinosaurus": ["Page One"],
    "Ryu Ryu no Mi, Model: Pteranodon": ["King"],
    "Ryu Ryu no Mi, Model: Brachiosaurus": ["Queen"],
    "Ryu Ryu no Mi, Model: Triceratops": ["Sasaki"],
    "Hebi Hebi no Mi, Model: King Cobra": ["Boa Marigold"],
    "Hebi Hebi no Mi, Model: Anaconda": ["Boa Sandersonia"],
    "Inu Inu no Mi, Model: Kyubi no Kitsune": ["Catarina Devon"],
    "Inu Inu no Mi, Model: Okuchi no Makami": ["Yamato"]
};


// =========================================
// 6. SPIELDATEN
// =========================================

let OP_FRUECHTE = [];
let OP_CHARAKTERE = [];

let opLadePromise = null;

let OP_KATALOG_INFO = {
    quelle: "Noch nicht geladen",
    vollstaendig: false
};


// =========================================
// 7. TEXT- UND DATENFUNKTIONEN
// =========================================

/**
 * Normalisiert Namen für die Suche.
 *
 * @param {string} text - Name
 * @returns {string} Vergleichbarer Name
 */
function opNorm(text) {
    return String(text ?? "")
        .toLocaleLowerCase("de-DE")
        .replaceAll("ß", "ss")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}


/**
 * Holt den englischen, romanisierten oder japanischen Namen.
 *
 * @param {Object|string} value - API-Namensfeld
 * @returns {string} Anzeigename
 */
function opName(value) {
    if (typeof value === "string") return value;

    return value?.en ||
           value?.romaji ||
           value?.jp ||
           "";
}


/**
 * Liest explizite Anime-Episodennummern.
 *
 * Kapitelnummern werden NICHT als Episoden interpretiert.
 *
 * @param {string|number} value - Ersterscheinungsangabe
 * @returns {number|null} Episode oder null
 */
function opEpisode(value) {

    if (Number.isInteger(value) && value > 0) {
        return value;
    }

    if (typeof value !== "string") {
        return null;
    }

    const treffer = value.match(
        /\b(?:episode|ep\.)\s*#?\s*(\d{1,4})\b/i
    );

    return treffer ? Number(treffer[1]) : null;
}


// =========================================
// 8. ALLE API-SEITEN LADEN
// =========================================

/**
 * Lädt sämtliche verfügbaren Seiten einer API-Ressource.
 *
 * Vier Seiten werden gleichzeitig angefordert.
 *
 * @param {string} ressource - "characters" oder "devil-fruits"
 * @returns {Promise<Object[]>} Vollständige API-Ergebnisse
 */
async function opLadeAlleSeiten(ressource) {

    const limit = 100;
    const ergebnis = new Map();

    let weiter = true;

    for (
        let start = 1;
        start <= 160 && weiter;
        start += 4
    ) {

        const seiten = await Promise.all(

            [start, start + 1, start + 2, start + 3]
                .map(async page => {

                    const url =
                        `${OP_API}/${ressource}` +
                        `?page=${page}&limit=${limit}`;

                    const response = await fetch(url);

                    if (!response.ok) {
                        throw new Error(
                            `${ressource}: HTTP ${response.status}`
                        );
                    }

                    const json = await response.json();

                    if (Array.isArray(json)) return json;

                    if (Array.isArray(json.data)) {
                        return json.data;
                    }

                    if (Array.isArray(json.results)) {
                        return json.results;
                    }

                    return [];
                })
        );

        const vorher = ergebnis.size;

        for (const block of seiten) {

            for (const eintrag of block) {

                if (eintrag?.id != null) {
                    ergebnis.set(
                        String(eintrag.id),
                        eintrag
                    );
                }
            }
        }

        weiter =
            seiten.every(block => block.length > 0) &&
            ergebnis.size > vorher;
    }

    return [...ergebnis.values()];
}


// =========================================
// 9. CHARAKTERDATEN VORBEREITEN
// =========================================

/**
 * Verbindet den Online-Katalog mit unseren bekannten
 * deutschen Namen und Debüt-Episoden.
 *
 * @param {Object[]} roh - API-Charaktere
 * @returns {Object[]} Spielbare Charaktere
 */
function opErstelleFiguren(roh) {

    const map = new Map();

    for (const zeile of roh) {

        const en = opName(zeile.name);

        if (!en) continue;

        const extra = zeile.extra_data || {};

        const bounties = Array.isArray(zeile.bounties)
            ? zeile.bounties
            : [];

        const bounty =
            bounties.find(b =>
                b?.is_active &&
                Number.isFinite(b.amount)
            ) ||
            bounties.find(b =>
                Number.isFinite(b?.amount)
            );

        map.set(opNorm(en), {

            id: `api:${zeile.id}`,

            name: en,
            en,

            alias: [
                zeile.name?.romaji,
                extra.epithet
            ].filter(Boolean),

            episode: opEpisode(
                extra.first_anime_episode ??
                extra.first_appearance
            ),

            arc: typeof extra.first_arc === "string"
                ? extra.first_arc
                : null,

            alter: Number.isFinite(zeile.age)
                ? zeile.age
                : null,

            groesse: Number.isFinite(zeile.height)
                ? zeile.height
                : null,

            kopfgeld: Number.isFinite(bounty?.amount)
                ? bounty.amount
                : null,

            fruchtId: null,
            bild: zeile.image_url || null,

            metadatenAktuell: true
        });
    }

    // Deutsche Namen, frühe Angaben und bekannte
    // Anime-Episoden haben Vorrang.
    for (const kuratiert of OP_GEPRUEFTE_FIGUREN) {

        const key = opNorm(kuratiert.en);

        const gefunden = map.get(key) || {};

        map.set(key, {

            ...gefunden,
            ...kuratiert,

            alias: [
                ...new Set([
                    ...(gefunden.alias || []),
                    ...(kuratiert.alias || [])
                ])
            ],

            kopfgeld: null
        });
    }

    return [...map.values()];
}


// =========================================
// 10. TEUFELSFRÜCHTE VORBEREITEN
// =========================================

/**
 * Verbindet Online-Früchte, deutsche Namen, Aliasnamen,
 * geprüfte Episoden und bekannte Anwender.
 *
 * @param {Object[]} roh - API-Früchte
 * @param {Object[]} figuren - Geladene Charaktere
 * @returns {Object[]} Spielbare Teufelsfrüchte
 */
function opErstelleFruechte(roh, figuren) {

    const map = new Map();

    for (const zeile of roh) {

        const ja =
            zeile.name?.romaji ||
            zeile.name?.jp ||
            "";

        const en = opName(zeile.name);

        if (!ja && !en) continue;

        const modell = opName(zeile.model);

        const key =
            opNorm(ja || en) + ":" + opNorm(modell);

        map.set(key, {

            id: `api:${zeile.id}`,

            de: OP_DEUTSCHE_FRUCHTNAMEN[ja] || null,

            en: modell
                ? `${en} – ${modell}`
                : en,

            ja: modell
                ? `${ja} – ${modell}`
                : ja,

            alias: [en, ja].filter(Boolean),

            erwaehnung: null,
            anwendung: null,
            anwender: [],

            typ: zeile.type || null,
            bild: zeile.image_url || null,

            katalogEintrag: true
        });
    }

    // Separat geprüfte Daten ergänzen
    for (const frucht of OP_GEPRUEFTE_FRUECHTE) {

        const treffer = [...map.entries()].find(
            ([, eintrag]) =>

                opNorm(eintrag.ja).startsWith(
                    opNorm(frucht.ja)
                ) &&

                !eintrag.ja.includes("–")
        );

        if (treffer) {

            map.set(treffer[0], {

                ...treffer[1],
                ...frucht,

                alias: [
                    ...new Set([
                        ...(treffer[1].alias || []),
                        ...(frucht.alias || [])
                    ])
                ]
            });

        } else {

            map.set(`geprueft:${frucht.id}`, {

                ...frucht,
                typ: null,
                bild: null
            });
        }
    }

    // Namen/Aliasse zu Charakter-Objekten zuordnen
    const namenMap = new Map();

    for (const charakter of figuren) {

        const namen = [
            charakter.name,
            charakter.en,
            ...charakter.alias
        ];

        for (const name of namen) {

            const key = opNorm(name);

            if (key && !namenMap.has(key)) {
                namenMap.set(key, charakter);
            }
        }
    }

    // Bekannte Frucht-Anwender verknüpfen
    for (const frucht of map.values()) {

        const eintragKey = opNorm(frucht.ja)
            .replace("model", "");

        const zuordnungKey = Object.keys(
            OP_FRUCHT_ANWENDER_NAMEN
        ).find(key =>

            opNorm(key).replace("model", "") ===
            eintragKey
        );

        const namen = zuordnungKey
            ? OP_FRUCHT_ANWENDER_NAMEN[zuordnungKey]
            : [];

        const benutzer = namen

            .map(name => namenMap.get(opNorm(name)))

            .filter(Boolean)

            .map(charakter => charakter.id);

        frucht.anwender = [
            ...new Set([
                ...frucht.anwender,
                ...benutzer
            ])
        ];
    }

    return [...map.values()];
}


// =========================================
// 11. KATALOG EINMALIG LADEN
// =========================================

/**
 * Lädt alle Charaktere und Früchte.
 *
 * Verwendet bei Netzfehler den geprüften Grundbestand.
 *
 * @returns {Promise<Object>} Geladener Datenbestand
 */
function ladeOnePieceDaten() {

    if (opLadePromise) return opLadePromise;

    opLadePromise = (async () => {

        let rohFiguren = [];
        let rohFruechte = [];

        let vollstaendig = false;

        // Zuerst Browser-Cache verwenden
        try {

            const gespeichert = JSON.parse(
                localStorage.getItem(OP_CACHE_KEY)
            );

            if (
                gespeichert &&
                Date.now() - gespeichert.zeit < OP_CACHE_MS &&
                Array.isArray(gespeichert.figuren) &&
                Array.isArray(gespeichert.fruechte)
            ) {

                rohFiguren = gespeichert.figuren;
                rohFruechte = gespeichert.fruechte;

                vollstaendig = true;
            }

        } catch {
            // Cache ist optional.
        }

        // Bei fehlendem Cache aus dem Internet laden
        if (!vollstaendig) {

            try {

                [rohFiguren, rohFruechte] =
                    await Promise.all([

                        opLadeAlleSeiten("characters"),

                        opLadeAlleSeiten("devil-fruits")

                    ]);

                if (
                    rohFiguren.length < 100 ||
                    rohFruechte.length < 20
                ) {

                    throw new Error(
                        "Online-Katalog unvollständig"
                    );
                }

                vollstaendig = true;

                // Browser-Cache aktualisieren
                try {

                    localStorage.setItem(

                        OP_CACHE_KEY,

                        JSON.stringify({
                            zeit: Date.now(),
                            figuren: rohFiguren,
                            fruechte: rohFruechte
                        })
                    );

                } catch {
                    // Browser-Speicher eventuell voll.
                }

            } catch (fehler) {

                console.warn(
                    "One-Piece-API nicht verfügbar:",
                    fehler
                );

                rohFiguren = [];
                rohFruechte = [];
            }
        }

        OP_CHARAKTERE = opErstelleFiguren(
            rohFiguren
        );

        OP_FRUECHTE = opErstelleFruechte(
            rohFruechte,
            OP_CHARAKTERE
        );

        OP_KATALOG_INFO = {

            quelle: vollstaendig
                ? "One Piece API"
                : "Offline-Grundbestand",

            vollstaendig,

            figuren: OP_CHARAKTERE.length,

            fruechte: OP_FRUECHTE.length
        };

        return {
            figuren: OP_CHARAKTERE,
            fruechte: OP_FRUECHTE,
            vollstaendig
        };

    })();

    return opLadePromise;
}


// =========================================
// 12. SPOILER-FILTER
// =========================================

/**
 * Gibt Teufelsfrüchte nach Spoiler-Einstellung zurück.
 *
 * @param {number} episode - Zuletzt gesehene Episode
 * @param {string} art - "erwaehnung" oder "anwendung"
 * @param {boolean} vollkatalog - Spoilerfilter ausschalten?
 * @returns {Object[]} Freigegebene Früchte
 */
function holeBekannteFruechte(
    episode,
    art,
    vollkatalog = false
) {

    if (vollkatalog) return OP_FRUECHTE;

    if (!["erwaehnung", "anwendung"].includes(art)) {
        return [];
    }

    return OP_FRUECHTE.filter(frucht =>

        Number.isInteger(frucht[art]) &&
        frucht[art] <= episode
    );
}


/**
 * Liefert Charaktere nach Episodengrenze.
 *
 * Aktuelle API-Attribute werden im sicheren Modus
 * nicht ungeprüft übernommen.
 *
 * @param {number} episode - Episodengrenze
 * @param {boolean} vollkatalog - Spoiler zulassen?
 * @returns {Object[]} Charaktere
 */
function holeBekannteCharaktere(
    episode,
    vollkatalog = false
) {

    if (vollkatalog) return OP_CHARAKTERE;

    return OP_CHARAKTERE

        .filter(charakter =>
            Number.isInteger(charakter.episode) &&
            charakter.episode <= episode
        )

        .map(charakter => {

            const kuratiert =
                OP_GEPRUEFTE_FIGUREN.find(
                    c => c.id === charakter.id
                );

            return {

                ...charakter,

                alias: [
                    ...(kuratiert?.alias || [])
                ],

                alter: kuratiert?.alter ?? null,
                groesse: kuratiert?.groesse ?? null,

                kopfgeld: null,
                bild: null,
                fruchtId: null
            };
        });
}


// =========================================
// 13. NAMEN UND ALIASSE
// =========================================

/**
 * Sucht einen Charakter nach Namen oder Alias.
 *
 * @param {Object[]} charaktere - Erlaubte Figuren
 * @param {string} eingabe - Eingegebener Text
 * @returns {Object[]} Passende Charaktere
 */
function sucheOnePieceCharaktere(charaktere, eingabe) {

    const gesucht = opNorm(eingabe);

    if (!gesucht) return [];

    return charaktere.filter(charakter =>

        [
            charakter.name,
            charakter.en,
            ...(charakter.alias || [])
        ].some(name => opNorm(name) === gesucht)
    );
}


/**
 * Prüft deutsche, englische, japanische Fruchtnamen
 * und weitere Alias-Bezeichnungen.
 *
 * @param {Object} frucht - Teufelsfrucht
 * @param {string} eingabe - Texteingabe
 * @returns {boolean} Passender Fruchtname?
 */
function istFruchtName(frucht, eingabe) {

    const gesucht = opNorm(eingabe);

    if (!gesucht) return false;

    return [

        frucht.de,
        frucht.en,
        frucht.ja,
        ...(frucht.alias || [])

    ].some(name => opNorm(name) === gesucht);
}
