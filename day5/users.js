// ==========================================
// --- 1. SELECT ELEMENTS ---
// ==========================================
const loadUsersBtn = document.querySelector('#load-users');
const filterInput = document.querySelector('#filter-input');
const statusMsg = document.querySelector('#status');
const usersList = document.querySelector('#users-list');

// ==========================================
// --- 2. STATE ---
// ==========================================
let allUsers = []; // This will hold the full list of users from the API

// ==========================================
// --- 3. RENDER FUNCTION ---
// Draws the provided list of users into the <ul>
// ==========================================
function renderUsers(list) {
    usersList.textContent = ''; // Clear current list

    // Handle empty results (Assignment Step 4)
    if (list.length === 0 && allUsers.length > 0) {
        const li = document.createElement('li');
        li.textContent = 'No users match your filter';
        usersList.appendChild(li);
        return;
    }

    // Loop through the list and create a list item for each user
    list.forEach(user => {
        const li = document.createElement('li');
        
        // Build the content using createElement and textContent
        const nameEl = document.createElement('strong');
        nameEl.textContent = user.name;
        
        const emailEl = document.createElement('span');
        emailEl.textContent = ` | ${user.email}`;
        
        const companyEl = document.createElement('span');
        companyEl.textContent = ` | ${user.company.name}`;

        li.appendChild(nameEl);
        li.appendChild(emailEl);
        li.appendChild(companyEl);
        
        usersList.appendChild(li);
    });
}

// ==========================================
// --- 4. LOAD USERS FUNCTION (Async/Await) ---
// ==========================================
async function loadUsers() {
    // Disable the button and update the status
    loadUsersBtn.disabled = true;
    statusMsg.textContent = 'Loading users...';
    usersList.textContent = ''; // Clear the list

    try {
        // Fetch the data from the API
        const response = await fetch('https://jsonplaceholder.typicode.com/users');

        // Check if the response is OK (status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON data
        const data = await response.json();
 const myUser = {
            name: "Irene Dzingai",
            email: "irene.dzingai@gmail.com",
            company: { name: "A Royal Priesthood" }
        };

        // Add your user to the front of the array using unshift()
        // unshift adds to the beginning; push adds to the end
        data.unshift(myUser);

        // Store it in our state variable
        allUsers = data;

        // Update the status and render the full list
        statusMsg.textContent = `Successfully loaded ${data.length} users.`;
        renderUsers(allUsers);

    } catch (error) {
        // Handle any errors that occurred
        statusMsg.textContent = `Error: ${error.message}. Please try again later.`;
        console.error('Failed to fetch users:', error);

    } finally {
        // This always runs, whether the fetch succeeded or failed
        loadUsersBtn.disabled = false;
    }
}

// ==========================================
// --- 5. EVENT LISTENERS ---
// ==========================================

// Load Users button click
loadUsersBtn.addEventListener('click', loadUsers);

// Filter input (Assignment Step 4: listen for the input event, filter, and re-render)
filterInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    // Filter the master list based on the search term
    const filtered = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm)
    );

    // Re-render the filtered list
    renderUsers(filtered);
});