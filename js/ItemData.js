// ItemData.js
// Defines all items: food, toys, and grooming items

const ITEMS = {
    food: [
        { id: 'choc_donut', name: 'Chocolate Donut', hungerRestore: 20 },
        { id: 'apple', name: 'Green Apple', hungerRestore: 15 },
        { id: 'pizza_slice', name: 'Pizza Slice', hungerRestore: 25 },
        { id: 'negg', name: 'Negg', hungerRestore: 30 },
        { id: 'jelly', name: 'Strawberry Jelly', hungerRestore: 10 },
        { id: 'burger', name: 'Neoburger', hungerRestore: 35 },
        { id: 'smoothie', name: 'Fruit Smoothie', hungerRestore: 20 },
        { id: 'cookie', name: 'Chocolate Chip Cookie', hungerRestore: 15 },
        { id: 'spicy_pepper', name: 'Spicy Pepper', hungerRestore: 10 }
    ],
    toys: [
        { id: 'bouncy_ball', name: 'Bouncy Ball', funValue: 25 },
        { id: 'plushie', name: 'Usul Plushie', funValue: 30 },
        { id: 'yo_yo', name: 'Yo-Yo', funValue: 20 },
        { id: 'puzzle', name: 'Puzzle Box', funValue: 35 },
        { id: 'ball_of_yarn', name: 'Ball of Yarn', funValue: 20 },
        { id: 'squeaky_toy', name: 'Squeaky Toy', funValue: 25 },
        { id: 'kite', name: 'Rainbow Kite', funValue: 30 }
    ],
    grooming: [
        { id: 'brush', name: 'Grooming Brush', happinessBoost: 15 },
        { id: 'shampoo', name: 'Neopet Shampoo', happinessBoost: 20 },
        { id: 'cologne', name: 'Sweet Cologne', happinessBoost: 10 }
    ],
    potions: [
        { id: 'healing_potion', name: 'Healing Potion', hpRestore: 50 }
    ]
};

// Species-specific preferences (favorite foods and toys)
const SPECIES_PREFERENCES = {
    'Acara': { favoriteFood: 'negg', lovedToy: 'bouncy_ball', dislikes: ['spicy_pepper'] },
    'Aisha': { favoriteFood: 'smoothie', lovedToy: 'plushie', dislikes: ['spicy_pepper'] },
    'Blumaroo': { favoriteFood: 'pizza_slice', lovedToy: 'yo_yo', dislikes: ['jelly'] },
    'Bori': { favoriteFood: 'apple', lovedToy: 'puzzle', dislikes: ['spicy_pepper'] },
    'Bruce': { favoriteFood: 'jelly', lovedToy: 'kite', dislikes: ['burger'] },
    'Buzz': { favoriteFood: 'cookie', lovedToy: 'squeaky_toy', dislikes: ['smoothie'] },
    'Chia': { favoriteFood: 'apple', lovedToy: 'ball_of_yarn', dislikes: ['spicy_pepper'] },
    'Chomby': { favoriteFood: 'burger', lovedToy: 'bouncy_ball', dislikes: ['jelly'] },
    'Cybunny': { favoriteFood: 'cookie', lovedToy: 'plushie', dislikes: ['spicy_pepper'] },
    'Draik': { favoriteFood: 'negg', lovedToy: 'kite', dislikes: ['apple'] },
    'Elephante': { favoriteFood: 'apple', lovedToy: 'bouncy_ball', dislikes: ['spicy_pepper'] },
    'Eyrie': { favoriteFood: 'burger', lovedToy: 'kite', dislikes: ['jelly'] },
    'Flotsam': { favoriteFood: 'jelly', lovedToy: 'bouncy_ball', dislikes: ['spicy_pepper'] },
    'Gelert': { favoriteFood: 'burger', lovedToy: 'squeaky_toy', dislikes: ['smoothie'] },
    'Gnorbu': { favoriteFood: 'smoothie', lovedToy: 'plushie', dislikes: ['spicy_pepper'] },
    'Grarrl': { favoriteFood: 'burger', lovedToy: 'bouncy_ball', dislikes: ['apple'] },
    'Grundo': { favoriteFood: 'negg', lovedToy: 'puzzle', dislikes: ['jelly'] },
    'Hissi': { favoriteFood: 'apple', lovedToy: 'ball_of_yarn', dislikes: ['spicy_pepper'] },
    'Ixi': { favoriteFood: 'apple', lovedToy: 'kite', dislikes: ['spicy_pepper'] },
    'Jetsam': { favoriteFood: 'burger', lovedToy: 'bouncy_ball', dislikes: ['cookie'] },
    'JubJub': { favoriteFood: 'jelly', lovedToy: 'bouncy_ball', dislikes: ['spicy_pepper'] },
    'Kacheek': { favoriteFood: 'choc_donut', lovedToy: 'bouncy_ball', dislikes: ['spicy_pepper'] },
    'Kau': { favoriteFood: 'apple', lovedToy: 'ball_of_yarn', dislikes: ['spicy_pepper'] },
    'Kiko': { favoriteFood: 'jelly', lovedToy: 'bouncy_ball', dislikes: ['burger'] },
    'Koi': { favoriteFood: 'smoothie', lovedToy: 'puzzle', dislikes: ['spicy_pepper'] },
    'Korbat': { favoriteFood: 'cookie', lovedToy: 'kite', dislikes: ['smoothie'] },
    'Kougra': { favoriteFood: 'burger', lovedToy: 'squeaky_toy', dislikes: ['jelly'] },
    'Krawk': { favoriteFood: 'pizza_slice', lovedToy: 'bouncy_ball', dislikes: ['apple'] },
    'Kyrii': { favoriteFood: 'cookie', lovedToy: 'plushie', dislikes: ['spicy_pepper'] },
    'Lenny': { favoriteFood: 'smoothie', lovedToy: 'puzzle', dislikes: ['burger'] },
    'Lupe': { favoriteFood: 'burger', lovedToy: 'squeaky_toy', dislikes: ['jelly'] },
    'Meerca': { favoriteFood: 'apple', lovedToy: 'yo_yo', dislikes: ['spicy_pepper'] },
    'Moehog': { favoriteFood: 'apple', lovedToy: 'ball_of_yarn', dislikes: ['spicy_pepper'] },
    'Mynci': { favoriteFood: 'apple', lovedToy: 'yo_yo', dislikes: ['spicy_pepper'] },
    'Nimmo': { favoriteFood: 'jelly', lovedToy: 'bouncy_ball', dislikes: ['spicy_pepper'] },
    'Ogrin': { favoriteFood: 'smoothie', lovedToy: 'plushie', dislikes: ['burger'] },
    'Peophin': { favoriteFood: 'smoothie', lovedToy: 'kite', dislikes: ['spicy_pepper'] },
    'Poogle': { favoriteFood: 'cookie', lovedToy: 'plushie', dislikes: ['spicy_pepper'] },
    'Pteri': { favoriteFood: 'negg', lovedToy: 'kite', dislikes: ['burger'] },
    'Quiggle': { favoriteFood: 'jelly', lovedToy: 'bouncy_ball', dislikes: ['spicy_pepper'] },
    'Ruki': { favoriteFood: 'apple', lovedToy: 'puzzle', dislikes: ['smoothie'] },
    'Scorchio': { favoriteFood: 'spicy_pepper', lovedToy: 'kite', dislikes: ['smoothie'] },
    'Shoyru': { favoriteFood: 'negg', lovedToy: 'kite', dislikes: ['jelly'] },
    'Skeith': { favoriteFood: 'burger', lovedToy: 'bouncy_ball', dislikes: ['apple'] },
    'Techo': { favoriteFood: 'pizza_slice', lovedToy: 'yo_yo', dislikes: ['smoothie'] },
    'Tonu': { favoriteFood: 'burger', lovedToy: 'bouncy_ball', dislikes: ['cookie'] },
    'Tuskaninny': { favoriteFood: 'jelly', lovedToy: 'bouncy_ball', dislikes: ['spicy_pepper'] },
    'Uni': { favoriteFood: 'smoothie', lovedToy: 'plushie', dislikes: ['burger'] },
    'Usul': { favoriteFood: 'cookie', lovedToy: 'plushie', dislikes: ['spicy_pepper'] },
    'Wocky': { favoriteFood: 'burger', lovedToy: 'squeaky_toy', dislikes: ['jelly'] },
    'Xweetok': { favoriteFood: 'cookie', lovedToy: 'plushie', dislikes: ['spicy_pepper'] },
    'Yurble': { favoriteFood: 'apple', lovedToy: 'ball_of_yarn', dislikes: ['spicy_pepper'] },
    'Zafara': { favoriteFood: 'pizza_slice', lovedToy: 'yo_yo', dislikes: ['smoothie'] }
};

// Helper functions
function getItem(category, itemId) {
    if (!ITEMS[category]) return null;
    return ITEMS[category].find(item => item.id === itemId) || null;
}

function getItemByName(name) {
    for (const category in ITEMS) {
        const item = ITEMS[category].find(i => i.name === name);
        if (item) return { ...item, category };
    }
    return null;
}

function getSpeciesPreference(species, preferenceType) {
    const prefs = SPECIES_PREFERENCES[species];
    if (!prefs) return null;
    return prefs[preferenceType] || null;
}

function checkIfItemLiked(species, itemId) {
    const prefs = SPECIES_PREFERENCES[species];
    if (!prefs) return 'neutral';

    if (prefs.favoriteFood === itemId || prefs.lovedToy === itemId) {
        return 'loved';
    }
    if (prefs.dislikes && prefs.dislikes.includes(itemId)) {
        return 'disliked';
    }
    return 'neutral';
}

// Export for browser use (make functions globally accessible)
window.ITEMS = ITEMS;
window.SPECIES_PREFERENCES = SPECIES_PREFERENCES;
window.getItem = getItem;
window.getItemByName = getItemByName;
window.getSpeciesPreference = getSpeciesPreference;
window.checkIfItemLiked = checkIfItemLiked;
