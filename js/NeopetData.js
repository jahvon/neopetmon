// Neopet species data
const NEOPET_SPECIES = [
    "Acara", "Aisha", "Blumaroo", "Bori", "Buzz", "Bruce", "Chia", "Chomby",
    "Cybunny", "Draik", "Elephante", "Eyrie", "Flotsam", "Gelert", "Gnorbu", "Grarrl",
    "Grundo", "Hissi", "Ixi", "Jetsam", "Jubjub", "Kacheek", "Kau", "Kiko",
    "Koi", "Korbat", "Kougra", "Krawk", "Kyrii", "Lenny", "Lupe", "Lutari",
    "Meerca", "Moehog", "Mynci", "Nimmo", "Ogrin", "Peophin", "Poogle", "Pteri",
    "Quiggle", "Ruki", "Scorchio", "Shoyru", "Skeith", "Techo", "Tonu", "Tuskaninny",
    "Uni", "Usul", "Vandagyre", "Wocky", "Xweetok", "Yurble", "Zafara", "Bottled Faerie"
];

// Get neopet species name by index
function getNeopetSpecies(index) {
    return NEOPET_SPECIES[index] || "Unknown";
}
