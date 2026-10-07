// 1. Select all the elements we need
const textarea = document.getElementById('note-text');
const charCountDisplay = document.getElementById('char-count');
const wordCountDisplay = document.getElementById('word-count');
const clearBtn = document.getElementById('clear-btn');
const themeToggle = document.getElementById('theme-toggle');

// 2. The function that updates the counts and warning classes
function updateCounts() {
    const text = textarea.value;
    const charCount = text.length;
    
    // Calculate words: split by spaces, filter out empty strings
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Update the text content
    charCountDisplay.textContent = `${charCount} / 200 characters`;
    wordCountDisplay.textContent = `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`;

    // Handle Warning and Over classes for characters
    if (charCount > 200) {
        charCountDisplay.classList.add('over');
        charCountDisplay.classList.remove('warning');
    } else if (charCount > 180) {
        charCountDisplay.classList.add('warning');
        charCountDisplay.classList.remove('over');
    } else {
        charCountDisplay.classList.remove('warning', 'over');
    }
}

// 3. Function to save draft to localStorage
function saveDraft() {
    localStorage.setItem('quickNotesDraft', textarea.value);
}

// 4. Function to clear everything
function clearAll() {
    textarea.value = '';
    localStorage.removeItem('quickNotesDraft');
    updateCounts(); // Reset the counters
}

// 5. Theme Toggle Logic
function toggleTheme() {
    document.body.classList.toggle('dark');
    
    // Update button text and save preference
    if (document.body.classList.contains('dark')) {
        themeToggle.textContent = 'Light Mode';
        localStorage.setItem('quickNotesTheme', 'dark');
    } else {
        themeToggle.textContent = 'Dark Mode';
        localStorage.setItem('quickNotesTheme', 'light');
    }
}

// ==========================================
// --- EVENT LISTENERS ---
// ==========================================

// Update counts and save draft on every input event
textarea.addEventListener('input', () => {
    updateCounts();
    saveDraft();
});

// Clear button click
clearBtn.addEventListener('click', clearAll);

// Escape key inside the textarea clears it
textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        clearAll();
    }
});

// Theme toggle button click
themeToggle.addEventListener('click', toggleTheme);


// ==========================================
// --- INITIALIZATION (ON PAGE LOAD) ---
// ==========================================

// 1. Restore saved theme
const savedTheme = localStorage.getItem('quickNotesTheme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = 'Light Mode';
}

// 2. Restore saved draft
const savedDraft = localStorage.getItem('quickNotesDraft');
if (savedDraft) {
    textarea.value = savedDraft;
}

// 3. Run updateCounts once on load to set initial numbers
updateCounts();