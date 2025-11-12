// NeopetGallery.js
// Tracks befriended pets, preferences, and encounter history

class NeopetGallery {
    constructor() {
        this.entries = this.loadGallery();
    }

    loadGallery() {
        const saved = localStorage.getItem('neopetGallery');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load gallery:', e);
                return {};
            }
        }
        return {};
    }

    saveGallery() {
        localStorage.setItem('neopetGallery', JSON.stringify(this.entries));
    }

    // Record first sighting of a species
    recordSighting(species, location, mood) {
        if (!this.entries[species]) {
            this.entries[species] = {
                species: species,
                firstSeen: new Date().toISOString(),
                firstLocation: location,
                firstMood: mood,
                timesSeen: 1,
                timesBefriended: 0,
                befriended: false,
                preferences: {
                    favoriteFood: null,
                    lovedToy: null,
                    dislikedItems: []
                },
                notes: []
            };
        } else {
            this.entries[species].timesSeen++;
        }
        this.saveGallery();
    }

    // Record successful befriend
    recordBefriend(species) {
        if (this.entries[species]) {
            this.entries[species].befriended = true;
            this.entries[species].timesBefriended++;
            this.saveGallery();
        }
    }

    // Learn a preference from offering an item
    learnPreference(species, itemType, itemName, reaction) {
        if (!this.entries[species]) return;

        const prefs = this.entries[species].preferences;

        if (reaction === 'loved') {
            if (itemType === 'food') {
                prefs.favoriteFood = itemName;
            } else if (itemType === 'toy') {
                prefs.lovedToy = itemName;
            }
        } else if (reaction === 'disliked') {
            if (!prefs.dislikedItems.includes(itemName)) {
                prefs.dislikedItems.push(itemName);
            }
        }

        this.saveGallery();
    }

    // Add a note to a species entry
    addNote(species, note) {
        if (!this.entries[species]) return;

        if (!this.entries[species].notes.includes(note)) {
            this.entries[species].notes.push(note);
            this.saveGallery();
        }
    }

    // Get entry for a species
    getEntry(species) {
        return this.entries[species] || null;
    }

    // Check if we know preferences for a species
    hasPreferences(species) {
        const entry = this.entries[species];
        if (!entry) return false;

        return entry.preferences.favoriteFood !== null ||
               entry.preferences.lovedToy !== null;
    }

    // Get all befriended species
    getBefriendedSpecies() {
        return Object.values(this.entries)
            .filter(e => e.befriended)
            .map(e => e.species);
    }

    // Get completion percentage
    getCompletionPercentage() {
        const totalSpecies = 56; // From NeopetData.js
        const befriended = this.getBefriendedSpecies().length;
        return Math.floor((befriended / totalSpecies) * 100);
    }

    // Get all entries sorted by befriend status
    getAllEntries() {
        return Object.values(this.entries)
            .sort((a, b) => {
                if (a.befriended && !b.befriended) return -1;
                if (!a.befriended && b.befriended) return 1;
                return b.timesSeen - a.timesSeen;
            });
    }
}

// Make available globally
window.NeopetGallery = NeopetGallery;
