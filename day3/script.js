// --- Starting Data ---
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Prepare slides for meeting", category: "work" },
  { id: 4, text: "Call the plumber", category: "personal" },
  { id: 5, text: "Read a chapter of a book", category: "personal" },
  { id: 6, text: "Review pull requests", category: "work" }
];

//  searchNotes(word) 
// Returns an array of notes whose text contains the word, ignoring upper/lower case.
function searchNotes(word) {
    return notes.filter(note => 
        note.text.toLowerCase().includes(word.toLowerCase())
    );
}

// longestNote()
// Returns the note object with the most characters, or null if there are no notes.
function longestNote() {
    if (notes.length === 0) {
        return null; // Handle empty array
    }
    
    let longest = notes[0];
    for (let i = 1; i < notes.length; i++) {
        if (notes[i].text.length > longest.text.length) {
            longest = notes[i];
        }
    }
    return longest;
}

// countByCategory()
// Returns an object counting notes per category.
function countByCategory() {
    const counts = {};
    for (let note of notes) {
        if (counts[note.category]) {
            counts[note.category]++;
        } else {
            counts[note.category] = 1;
        }
    }
    return counts;
}

// getSummary() 
// Returns a sentence like "6 notes: 3 personal, 2 work, 1 study."
function getSummary() {
    const counts = countByCategory();
    const total = notes.length;
    
    // Handle singular vs plural for the word "note"
    const noteWord = total === 1 ? "note" : "notes";
    
    let summaryParts = [];
    for (let category in counts) {
        summaryParts.push(`${counts[category]} ${category}`);
    }
    
    return `${total} ${noteWord}: ${summaryParts.join(", ")}.`;
}

// isDuplicate(text)
// Returns true if a note with the same text already exists (ignoring case and extra spaces).
function isDuplicate(text) {
    const cleanText = text.trim().toLowerCase();
    return notes.some(note => note.text.trim().toLowerCase() === cleanText);
}

// addNote(text, category)
// Adds a note if valid (1-200 chars, not duplicate, valid category). Returns true/false.
function addNote(text, category) {
    //  Check length
    if (text.length < 1 || text.length > 200) {
        console.log("Failed to add: Text must be between 1 and 200 characters.");
        return false;
    }
    
    // Check for duplicates
    if (isDuplicate(text)) {
        console.log("Failed to add: This note already exists (duplicate).");
        return false;
    }
    
    // Check valid category
    const validCategories = ["personal", "work", "study"];
    if (!validCategories.includes(category.toLowerCase())) {
        console.log("Failed to add: Category must be 'personal', 'work', or 'study'.");
        return false;
    }

    // If all checks pass, add the note
    const newId = notes.length > 0 ? notes[notes.length - 1].id + 1 : 1;
    notes.push({ 
        id: newId, 
        text: text, 
        category: category.toLowerCase() 
    });
    console.log(`Success: Added "${text}" to ${category}.`);
    return true;
}


//TESTING SECTIONS 

console.log("--- Testing searchNotes ---");
// Normal case:
console.log("Search 'milk':", searchNotes("milk")); 
// Expected: Array with the "Buy milk and bread" note object.

// Edge case (no results):
console.log("Search 'banana':", searchNotes("banana")); 
// Expected: Empty array [].

console.log("\n--- Testing longestNote ---");
// Normal case:
console.log("Longest note:", longestNote()); 
// Expected: The note object "Finish the Day 3 assignment" (or whichever is longest).

console.log("\n--- Testing countByCategory ---");
// Normal case:
console.log("Category counts:", countByCategory()); 
// Expected: { personal: 3, study: 1, work: 2 }

console.log("\n--- Testing getSummary ---");
// Normal case:
console.log("Summary:", getSummary()); 
// Expected: "6 notes: 3 personal, 1 study, 2 work." (Order may vary slightly)

console.log("\n--- Testing isDuplicate ---");
// Normal case (true):
console.log("Is 'Buy milk and bread' a duplicate?", isDuplicate("  buy MILK and bread  ")); 
// Expected: true (ignores case and extra spaces)

// Edge case (false):
console.log("Is 'New unique note' a duplicate?", isDuplicate("New unique note")); 
// Expected: false

console.log("\n--- Testing addNote ---");
// Normal case (Valid):
console.log("Adding valid note:", addNote("Go for a run", "personal")); 
// Expected: true

// Edge case (Duplicate):
console.log("Adding duplicate note:", addNote("Finish the Day 3 assignment", "study")); 
// Expected: false

// Edge case (Invalid category):
console.log("Adding with bad category:", addNote("Buy groceries", "shopping")); 
// Expected: false

// Edge case (Too long):
console.log("Adding too long note:", addNote("A".repeat(201), "work")); 
// Expected: false

console.log("\n--- Testing Edge Cases (Instructor Next Step) ---");

// 1. Test longestNote with an EMPTY array
const originalNotes = [...notes]; // Save your original 6 notes
notes = []; // Temporarily empty the array
console.log("Longest note (empty array):", longestNote()); 
// Expected output: null

// 2. Test getSummary with a SINGLE note
notes = [{ id: 99, text: "Just one note", category: "work" }]; // Temporarily set to 1 note
console.log("Summary (single note):", getSummary()); 
// Expected output: "1 note: 1 work." (Notice it says "note", not "notes")

// Restore your original data so the rest of your script doesn't break
notes = originalNotes;
console.log("Original notes array restored.");