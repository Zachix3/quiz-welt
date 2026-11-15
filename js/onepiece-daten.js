
/* ==========================================================
   ONE PIECE – LOKALER WIKI-DATENSATZ

   Quellen je Frucht:
   https://onepiece.fandom.com/wiki/<wiki>

   "Fruit Debut" = erste Darstellung der Frucht selbst.
   "Usage Debut" = erste gezeigte Verwendung der Fähigkeit.
   Das ist NICHT automatisch die erste Namens-Erwähnung!

   null = keine belegte Anime-Episode im Wiki-Infokasten.

   Enthält bewusst keine API-Anfrage. Ergänzungen erfolgen
   hier im Quelltext und werden über GitHub veröffentlicht.
   ========================================================== */

/* Hilfsfunktion für die kompakte manuelle Datenpflege.
   f(wiki, deutsch, englisch, nutzungsfolge, fruchtfolge,
     anwendender, typ, weitere Namen)
*/
function opFrucht(
    wiki,
    de,
    en,
    anwendung,
    fruchtDebuet,
    nutzer,
    typ = "Paramecia",
    alias = []
) {
    // Wiki-URL und japanische Bezeichnung aus Artikeltitel.
    const seitenname = wiki.replaceAll("_", " ");
    const ja = seitenname.replace(
        /, Model: /,
        ", Moderu "
    );

    const id = wiki.toLowerCase().replace(
        /[^a-z0-9]+/g,
        "-"
    );

    const nutzerListe = Array.isArray(nutzer)
        ? nutzer
        : [nutzer];

    return {
        id,
        de,
        en,
        ja,
        alias,
        typ,
        anwendung,
        fruchtDebuet,

        // Kompatibilität mit dem bisherigen app.js:
        // Das neue Menü nennt diese Option "Fruit Debut".
        erwaehnung: fruchtDebuet,

        nutzerDaten: nutzerListe
            .filter(Boolean)
            .map(n => ({
                name: n,
                ab: anwendung
            })),

        anwender: [],

        quelle:
            "https://onepiece.fandom.com/wiki/" + wiki,

        bild: null
    };
}


// Wiki-Infokästen wurden einzeln geprüft.
// null beim Fruit Debut ist häufig: das Wiki nennt dort
// ein Magazin anstelle einer Anime-Episode.

const OP_FRUECHTE = [

    // =====================================
    // EAST BLUE / FRÜHE GRAND LINE
    // =====================================

    opFrucht(
        "Gomu_Gomu_no_Mi",
        "Gum-Gum-Frucht",
        "Gum-Gum Fruit",
        1, 4,
        "Monkey D. Ruffy"
    ),

    opFrucht(
        "Bara_Bara_no_Mi",
        "Trenn-Trenn-Frucht",
        "Chop-Chop Fruit",
        5, 8,
        "Buggy"
    ),

    opFrucht(
        "Sube_Sube_no_Mi",
        "Alabaster-Frucht",
        "Slip-Slip Fruit",
        46, null,
        "Alvida"
    ),

    opFrucht(
        "Moku_Moku_no_Mi",
        "Rauch-Frucht",
        "Smoke-Smoke Fruit",
        48, null,
        "Smoker",
        "Logia"
    ),

    opFrucht(
        "Bomu_Bomu_no_Mi",
        "Bomb-Bomb-Frucht",
        "Bomb-Bomb Fruit",
        65, null,
        "Mr. 5"
    ),

    opFrucht(
        "Kiro_Kiro_no_Mi",
        "Kilo-Kilo-Frucht",
        "Kilo-Kilo Fruit",
        66, null,
        "Miss Valentine"
    ),

    opFrucht(
        "Hana_Hana_no_Mi",
        "Flora-Frucht",
        "Flower-Flower Fruit",
        67, null,
        "Nico Robin"
    ),

    opFrucht(
        "Doru_Doru_no_Mi",
        "Wachs-Frucht",
        "Wax-Wax Fruit",
        71, null,
        "Mr. 3"
    ),

    opFrucht(
        "Suna_Suna_no_Mi",
        "Sand-Frucht",
        "Sand-Sand Fruit",
        77, null,
        "Crocodile",
        "Logia"
    ),

    opFrucht(
        "Baku_Baku_no_Mi",
        "Munch-Frucht",
        "Munch-Munch Fruit",
        79, null,
        "Wapol"
    ),

    opFrucht(
        "Ushi_Ushi_no_Mi,_Model:_Bison",
        "Ochsen-Frucht, Modell Bison",
        "Ox-Ox Fruit, Model: Bison",
        81, 1101,
        "Dalton",
        "Zoan"
    ),

    opFrucht(
        "Hito_Hito_no_Mi",
        "Mensch-Mensch-Frucht",
        "Human-Human Fruit",
        83, null,
        "Tony Tony Chopper",
        "Zoan"
    ),

    opFrucht(
        "Mane_Mane_no_Mi",
        "Nachahmungs-Frucht",
        "Clone-Clone Fruit",
        92, null,
        "Bon Curry"
    ),

    opFrucht(
        "Mera_Mera_no_Mi",
        "Feuer-Frucht",
        "Flame-Flame Fruit",
        94, 629,
        "Portgas D. Ace",
        "Logia"
    ),

    opFrucht(
        "Supa_Supa_no_Mi",
        "Schnitt-Frucht",
        "Dice-Dice Fruit",
        103, null,
        "Mr. 1"
    ),

    opFrucht(
        "Tori_Tori_no_Mi,_Model:_Falcon",
        "Vogel-Frucht, Modell Falke",
        "Bird-Bird Fruit, Model: Falcon",
        106, null,
        "Pell",
        "Zoan"
    ),

    opFrucht(
        "Mogu_Mogu_no_Mi",
        "Maulwurf-Frucht",
        "Mole-Mole Fruit",
        113, null,
        "Miss Merry Christmas",
        "Zoan"
    ),

    opFrucht(
        "Toge_Toge_no_Mi",
        "Stachel-Frucht",
        "Spike-Spike Fruit",
        117, null,
        "Miss Doublefinger"
    ),

    opFrucht(
        "Inu_Inu_no_Mi,_Model:_Jackal",
        "Hund-Frucht, Modell Schakal",
        "Dog-Dog Fruit, Model: Jackal",
        120, null,
        "Chaka",
        "Zoan"
    ),

    opFrucht(
        "Ori_Ori_no_Mi",
        "Fessel-Frucht",
        "Bind-Bind Fruit",
        130, null,
        "Hina"
    ),


    // =====================================
    // JAYA / SKYPIA / WATER 7
    // =====================================

    opFrucht(
        "Bane_Bane_no_Mi",
        "Spiral-Frucht",
        "Spring-Spring Fruit",
        150, null,
        "Bellamy"
    ),

    opFrucht(
        "Ito_Ito_no_Mi",
        "Faden-Frucht",
        "String-String Fruit",
        151, 723,
        "Donquixote Doflamingo"
    ),

    opFrucht(
        "Uma_Uma_no_Mi",
        "Pferde-Frucht",
        "Horse-Horse Fruit",
        153, null,
        "Pierre",
        "Zoan"
    ),

    opFrucht(
        "Goro_Goro_no_Mi",
        "Donner-Frucht",
        "Rumble-Rumble Fruit",
        155, null,
        "Enel",
        "Logia"
    ),

    opFrucht(
        "Noro_Noro_no_Mi",
        "Lahm-Frucht",
        "Slow-Slow Fruit",
        210, null,
        "Foxy"
    ),

    opFrucht(
        "Hie_Hie_no_Mi",
        "Gefrier-Frucht",
        "Ice-Ice Fruit",
        225, null,
        "Kuzan",
        "Logia"
    ),

    opFrucht(
        "Doa_Doa_no_Mi",
        "Tür-Frucht",
        "Door-Door Fruit",
        231, null,
        "Blueno"
    ),

    opFrucht(
        "Neko_Neko_no_Mi,_Model:_Leopard",
        "Katzen-Frucht, Modell Leopard",
        "Cat-Cat Fruit, Model: Leopard",
        245, 1101,
        "Rob Lucci",
        "Zoan"
    ),

    opFrucht(
        "Inu_Inu_no_Mi,_Model:_Wolf",
        "Hund-Frucht, Modell Wolf",
        "Dog-Dog Fruit, Model: Wolf",
        266, null,
        "Jabra",
        "Zoan"
    ),

    opFrucht(
        "Zou_Zou_no_Mi",
        "Elefanten-Frucht",
        "Elephant-Elephant Fruit",
        285, null,
        "Funkfreed",
        "Zoan"
    ),

    opFrucht(
        "Ushi_Ushi_no_Mi,_Model:_Giraffe",
        "Ochsen-Frucht, Modell Giraffe",
        "Ox-Ox Fruit, Model: Giraffe",
        286, 266,
        "Kaku",
        "Zoan"
    ),

    opFrucht(
        "Awa_Awa_no_Mi",
        "Schaum-Frucht",
        "Bubble-Bubble Fruit",
        293, 266,
        "Kalifa"
    ),

    opFrucht(
        "Beri_Beri_no_Mi",
        "Beeren-Frucht",
        "Berry-Berry Fruit",
        309, null,
        "Very Good"
    ),

    opFrucht(
        "Sabi_Sabi_no_Mi",
        "Rost-Frucht",
        "Rust-Rust Fruit",
        309, null,
        "Shu"
    ),


    // =====================================
    // THRILLER BARK / SABAODY /
    // IMPEL DOWN / MARINEFORD
    // =====================================

    opFrucht(
        "Horo_Horo_no_Mi",
        "Geister-Frucht",
        "Hollow-Hollow Fruit",
        337, null,
        "Perona"
    ),

    opFrucht(
        "Yomi_Yomi_no_Mi",
        "Totenreich-Frucht",
        "Revive-Revive Fruit",
        337, null,
        "Brook"
    ),

    opFrucht(
        "Kage_Kage_no_Mi",
        "Schatten-Frucht",
        "Shadow-Shadow Fruit",
        338, null,
        "Gecko Moria"
    ),

    opFrucht(
        "Suke_Suke_no_Mi",
        "Unsichtbarkeits-Frucht",
        "Clear-Clear Fruit",
        339, null,
        "Absalom"
    ),

    opFrucht(
        "Nikyu_Nikyu_no_Mi",
        "Tatzen-Frucht",
        "Paw-Paw Fruit",
        368, 1130,
        "Bartholomew Kuma"
    ),

    opFrucht(
        "Toshi_Toshi_no_Mi",
        "Alters-Frucht",
        "Age-Age Fruit",
        393, null,
        "Jewelry Bonney"
    ),

    opFrucht(
        "Ope_Ope_no_Mi",
        "Operations-Frucht",
        "Op-Op Fruit",
        398, 704,
        "Trafalgar D. Water Law"
    ),

    opFrucht(
        "Jiki_Jiki_no_Mi",
        "Magnet-Frucht",
        "Magnet-Magnet Fruit",
        398, 1103,
        "Eustass Kid"
    ),

    opFrucht(
        "Pika_Pika_no_Mi",
        "Funkel-Frucht",
        "Glint-Glint Fruit",
        400, null,
        "Borsalino",
        "Logia"
    ),

    opFrucht(
        "Shiro_Shiro_no_Mi",
        "Festungs-Frucht",
        "Castle-Castle Fruit",
        401, null,
        "Capone Bege"
    ),

    opFrucht(
        "Wara_Wara_no_Mi",
        "Stroh-Frucht",
        "Straw-Straw Fruit",
        401, null,
        "Basil Hawkins"
    ),

    opFrucht(
        "Oto_Oto_no_Mi",
        "Ton-Frucht",
        "Tone-Tone Fruit",
        402, null,
        "Scratchmen Apoo"
    ),

    opFrucht(
        "Mero_Mero_no_Mi",
        "Liebes-Frucht",
        "Love-Love Fruit",
        410, 1101,
        "Boa Hancock"
    ),

    opFrucht(
        "Hebi_Hebi_no_Mi,_Model:_Anaconda",
        "Schlangen-Frucht, Modell Anakonda",
        "Snake-Snake Fruit, Model: Anaconda",
        412, null,
        "Boa Sandersonia",
        "Zoan"
    ),

    opFrucht(
        "Hebi_Hebi_no_Mi,_Model:_King_Cobra",
        "Schlangen-Frucht, Modell Königskobra",
        "Snake-Snake Fruit, Model: King Cobra",
        412, null,
        "Boa Marigold",
        "Zoan"
    ),

    opFrucht(
        "Doku_Doku_no_Mi",
        "Gift-Frucht",
        "Venom-Venom Fruit",
        425, null,
        "Magellan"
    ),

    opFrucht(
        "Horu_Horu_no_Mi",
        "Hormon-Frucht",
        "Horm-Horm Fruit",
        439, null,
        "Emporio Ivankov"
    ),

    opFrucht(
        "Choki_Choki_no_Mi",
        "Scheren-Frucht",
        "Snip-Snip Fruit",
        442, null,
        "Inazuma"
    ),

    opFrucht(
        "Poke_Poke_no_Mi",
        "Taschen-Frucht",
        "Pocket-Pocket Fruit",
        461, null,
        "Blamenco"
    ),

    opFrucht(
        "Gura_Gura_no_Mi",
        "Erdbeben-Frucht",
        "Tremor-Tremor Fruit",
        461, null,
        "Edward Newgate"
    ),

    opFrucht(
        "Magu_Magu_no_Mi",
        "Magma-Frucht",
        "Mag-Mag Fruit",
        463, null,
        "Sakazuki",
        "Logia"
    ),

    opFrucht(
        "Kira_Kira_no_Mi",
        "Glitzer-Frucht",
        "Twinkle-Twinkle Fruit",
        463, null,
        "Jozu"
    ),

    opFrucht(
        "Tori_Tori_no_Mi,_Model:_Phoenix",
        "Vogel-Frucht, Modell Phönix",
        "Bird-Bird Fruit, Model: Phoenix",
        463, null,
        "Marco",
        "Mythische Zoan"
    ),

    opFrucht(
        "Woshu_Woshu_no_Mi",
        "Wäsche-Frucht",
        "Wash-Wash Fruit",
        465, null,
        "Tsuru"
    ),

    opFrucht(
        "Hito_Hito_no_Mi,_Model:_Daibutsu",
        "Mensch-Frucht, Modell Buddha",
        "Human-Human Fruit, Model: Buddha",
        480, null,
        "Sengoku",
        "Mythische Zoan"
    ),

    opFrucht(
        "Yami_Yami_no_Mi",
        "Finster-Frucht",
        "Dark-Dark Fruit",
        325, 325,
        "Marshall D. Teach",
        "Logia"
    ),


    // =====================================
    // NACH DEM ZEITSPRUNG /
    // FISCHMENSCHENINSEL / PUNK HAZARD
    // =====================================

    opFrucht(
        "Numa_Numa_no_Mi",
        "Sumpf-Frucht",
        "Swamp-Swamp Fruit",
        521, null,
        "Caribou",
        "Logia"
    ),

    opFrucht(
        "Mato_Mato_no_Mi",
        "Ziel-Frucht",
        "Mark-Mark Fruit",
        532, null,
        "Vander Decken IX"
    ),

    opFrucht(
        "Kame_Kame_no_Mi",
        "Schildkröten-Frucht",
        "Turtle-Turtle Fruit",
        572, null,
        "Pekoms",
        "Zoan"
    ),

    opFrucht(
        "Gasu_Gasu_no_Mi",
        "Gas-Frucht",
        "Gas-Gas Fruit",
        581, null,
        "Caesar Clown",
        "Logia"
    ),

    opFrucht(
        "Fuku_Fuku_no_Mi",
        "Kleider-Frucht",
        "Garb-Garb Fruit",
        588, null,
        "Kinemon"
    ),

    opFrucht(
        "Yuki_Yuki_no_Mi",
        "Schnee-Frucht",
        "Snow-Snow Fruit",
        607, null,
        "Monet",
        "Logia"
    ),

    opFrucht(
        "Buki_Buki_no_Mi",
        "Waffen-Frucht",
        "Arms-Arms Fruit",
        608, null,
        "Baby 5"
    ),

    opFrucht(
        "Guru_Guru_no_Mi",
        "Rotier-Frucht",
        "Spin-Spin Fruit",
        618, null,
        "Buffalo"
    ),

    opFrucht(
        "Beta_Beta_no_Mi",
        "Klebe-Frucht",
        "Stick-Stick Fruit",
        629, null,
        "Trebol"
    ),

    opFrucht(
        "Hobi_Hobi_no_Mi",
        "Hobby-Frucht",
        "Hobby-Hobby Fruit",
        630, null,
        "Sugar"
    ),

    opFrucht(
        "Bari_Bari_no_Mi",
        "Barriere-Frucht",
        "Barrier-Barrier Fruit",
        637, null,
        "Bartolomeo"
    ),

    opFrucht(
        "Giro_Giro_no_Mi",
        "Blick-Frucht",
        "Glare-Glare Fruit",
        640, null,
        "Viola"
    ),

    opFrucht(
        "Nui_Nui_no_Mi",
        "Näh-Frucht",
        "Sew-Sew Fruit",
        641, null,
        "Leo"
    ),

    opFrucht(
        "Mushi_Mushi_no_Mi,_Model:_Kabutomushi",
        "Insekten-Frucht, Modell Nashornkäfer",
        "Bug-Bug Fruit, Model: Rhinoceros Beetle",
        648, null,
        "Kabu",
        "Zoan"
    ),


    // =====================================
    // AB EPISODE 651
    // =====================================

    opFrucht(
        "Pamu_Pamu_no_Mi",
        "Platz-Frucht",
        "Pop-Pop Fruit",
        653, null,
        "Gladius"
    ),

    opFrucht(
        "Sui_Sui_no_Mi",
        "Schwimm-Frucht",
        "Swim-Swim Fruit",
        664, null,
        "Senor Pink"
    ),

    opFrucht(
        "Ton_Ton_no_Mi",
        "Tonnen-Frucht",
        "Ton-Ton Fruit",
        667, null,
        "Machvise"
    ),

    opFrucht(
        "Ishi_Ishi_no_Mi",
        "Stein-Frucht",
        "Stone-Stone Fruit",
        669, null,
        "Pica"
    ),

    opFrucht(
        "Nagi_Nagi_no_Mi",
        "Stille-Frucht",
        "Calm-Calm Fruit",
        703, null,
        "Donquixote Rosinante"
    ),

    opFrucht(
        "Buku_Buku_no_Mi",
        "Bücher-Frucht",
        "Book-Book Fruit",
        810, null,
        "Charlotte Mont-d'Or"
    ),

    opFrucht(
        "Kuku_Kuku_no_Mi",
        "Koch-Frucht",
        "Cook-Cook Fruit",
        832, null,
        "Streusen"
    ),

    opFrucht(
        "Kobu_Kobu_no_Mi",
        "Ansporn-Frucht",
        "Pump-Pump Fruit",
        880, null,
        "Belo Betty"
    ),

    opFrucht(
        "Zou_Zou_no_Mi,_Model:_Mammoth",
        "Elefanten-Frucht, Modell Mammut",
        "Eleph-Eleph Fruit, Model: Mammoth",
        757, null,
        "Jack",
        "Antike Zoan"
    )
];


// =========================================
// CHARAKTERE
// =========================================

// Bereits bekannte Figuren behalten.
// Für weitere Fruchtanwender wird eine konservative
// Freigabegrenze aus der ersten Nutzung verwendet.

const OP_FIGUREN_GRUNDLAGE = [
    ["luffy", "Monkey D. Ruffy", "Monkey D. Luffy", 1,
        ["Ruffy", "Luffy"]],

    ["zoro", "Lorenor Zorro", "Roronoa Zoro", 1,
        ["Zorro", "Zoro"]],

    ["nami", "Nami", "Nami", 1, []],

    ["koby", "Corby", "Koby", 1,
        ["Coby"]],

    ["alvida", "Alvida", "Alvida", 1, []],

    ["buggy", "Buggy", "Buggy", 4,
        ["Buggy der Clown"]],

    ["usopp", "Lysop", "Usopp", 8,
        ["Usopp"]],

    ["sanji", "Sanji", "Sanji", 20, []],

    ["robin", "Nico Robin", "Nico Robin", 67,
        ["Robin", "Miss All Sunday"]],

    ["chopper", "Tony Tony Chopper",
        "Tony Tony Chopper", 81, ["Chopper"]],

    ["ace", "Portgas D. Ace",
        "Portgas D. Ace", 91,
        ["Ace", "Feuerfaust Ace"]]
];


// Bekannte Alternativnamen für Suchvorschläge

const OP_ALIAS_FIGUREN = {
    "Mr. 5": ["Gem", "Mr 5"],
    "Miss Valentine": ["Mikita"],
    "Mr. 3": ["Galdino"],
    "Bon Curry": ["Bentham", "Bon Clay", "Mr. 2"],
    "Mr. 1": ["Daz Bonez"],
    "Miss Merry Christmas": ["Drophy"],
    "Miss Doublefinger": ["Zala"],
    "Kuzan": ["Aokiji"],
    "Borsalino": ["Kizaru"],
    "Sakazuki": ["Akainu"],
    "Edward Newgate": ["Whitebeard"],
    "Marshall D. Teach": ["Blackbeard"],
    "Trafalgar D. Water Law": ["Law"],
    "Emporio Ivankov": ["Ivankov"],
    "Boa Hancock": ["Hancock"],
    "Gecko Moria": ["Moria"],
    "Vander Decken IX": ["Vander Decken"],
    "Kinemon": ["Kin'emon"]
};


/**
 * Vereinheitlicht Schreibweisen für die Namenssuche.
 *
 * @param {string} text - Name
 * @returns {string} Vergleichbarer Text
 */
function opNorm(text) {

    return String(text ?? "")
        .toLocaleLowerCase("de-DE")
        .replaceAll("ß", "ss")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}


const OP_CHARAKTERE = OP_FIGUREN_GRUNDLAGE.map(
    ([id, name, en, episode, alias]) => ({
        id,
        name,
        en,
        episode,
        alias,
        arc: null,
        alter: null,
        groesse: null,
        kopfgeld: null,
        fruchtId: null,
        bild: null
    })
);


// Weitere Anwender hinzufügen, ohne zukünftige
// Informationen zu früh freizuschalten.

for (const frucht of OP_FRUECHTE) {

    for (const nutzer of frucht.nutzerDaten) {

        const key = opNorm(nutzer.name);

        let figur = OP_CHARAKTERE.find(c =>
            [
                c.name,
                c.en,
                ...(c.alias || [])
            ].some(n => opNorm(n) === key)
        );

        if (!figur) {

            figur = {
                id: `figur-${key}`,
                name: nutzer.name,
                en: nutzer.name,
                alias: OP_ALIAS_FIGUREN[nutzer.name] || [],
                episode: nutzer.ab,
                arc: null,
                alter: null,
                groesse: null,
                kopfgeld: null,
                fruchtId: null,
                bild: null
            };

            OP_CHARAKTERE.push(figur);
        }

        nutzer.id = figur.id;
        frucht.anwender.push(figur.id);
    }
}


// Anwender-IDs vereinheitlichen.

for (const frucht of OP_FRUECHTE) {

    frucht.anwender = frucht.nutzerDaten.map(
        n => n.id
    );
}


const OP_KATALOG_INFO = {
    quelle: "Lokaler One Piece Wiki-Datensatz",
    vollstaendig: false,
    figuren: OP_CHARAKTERE.length,
    fruechte: OP_FRUECHTE.length
};


/**
 * Gibt den lokalen Katalog zurück.
 * Es wird kein Internetzugriff durchgeführt.
 *
 * @returns {Promise<Object>} Statischer Wiki-Datensatz
 */
async function ladeOnePieceDaten() {

    return {
        figuren: OP_CHARAKTERE,
        fruechte: OP_FRUECHTE,
        vollstaendig: false
    };
}


/**
 * Filtert Teufelsfrüchte nach Anime-Episode.
 *
 * @param {number} episode - Gesehene Folge
 * @param {string} art - "anwendung" oder "erwaehnung"
 * @param {boolean} vollkatalog - Episodenfilter umgehen
 * @returns {Object[]} Freigeschaltete Früchte
 */
function holeBekannteFruechte(
    episode,
    art,
    vollkatalog = false
) {

    if (
        !vollkatalog &&
        !["anwendung", "erwaehnung"].includes(art)
    ) {
        return [];
    }

    return OP_FRUECHTE

        .filter(frucht =>
            vollkatalog ||
            (
                Number.isInteger(frucht[art]) &&
                frucht[art] <= episode
            )
        )

        // Spätere Anwender nicht vorzeitig zeigen
        .map(frucht => ({
            ...frucht,

            anwender: frucht.nutzerDaten

                .filter(n =>
                    vollkatalog || n.ab <= episode
                )

                .map(n => n.id)
        }));
}


/**
 * Filtert bekannte Charaktere.
 *
 * @param {number} episode - Episodengrenze
 * @param {boolean} vollkatalog - Spoiler zulassen
 * @returns {Object[]} Erlaubte Charaktere
 */
function holeBekannteCharaktere(
    episode,
    vollkatalog = false
) {

    return OP_CHARAKTERE.filter(c =>
        vollkatalog ||
        (
            Number.isInteger(c.episode) &&
            c.episode <= episode
        )
    );
}


/**
 * Erkennt Charaktere anhand von Namen und Alias.
 *
 * @param {Object[]} charaktere - Erlaubte Figuren
 * @param {string} eingabe - Name oder Alias
 * @returns {Object[]} Exakte Treffer
 */
function sucheOnePieceCharaktere(
    charaktere,
    eingabe
) {

    const name = opNorm(eingabe);

    if (!name) return [];

    return charaktere.filter(c =>
        [
            c.name,
            c.en,
            ...(c.alias || [])
        ].some(n => opNorm(n) === name)
    );
}


/**
 * Prüft den Namen einer Teufelsfrucht.
 *
 * @param {Object} frucht - Fruchtdaten
 * @param {string} eingabe - Eingabe
 * @returns {boolean} Ob die Antwort stimmt
 */
function istFruchtName(frucht, eingabe) {

    const name = opNorm(eingabe);

    if (!name) return false;

    return [
        frucht.de,
        frucht.en,
        frucht.ja,
        ...(frucht.alias || [])
    ].some(n => opNorm(n) === name);
}
