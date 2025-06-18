// Default lists - these will be used if nothing is stored in localStorage
const defaultMagicList = [
    "bernardo canelas", "sebastian avila", "alejandro rea", "lucas mendez",
    "paul krpan", "adrian rojas", "happy", "reo", "fiquito"
];

const defaultKaraokeList = [
    "alejandra pacheco", "ricardo dacosta", "fabricio fernandez", "gabriel fernandez",
    "alejandra barrientos", "isabella saldivias", "valeria mercado", "marcelo ortuño",
    "fraciely rubesa", "mariana quiroga", "bernardo canelas"
];

// Global variables for the active lists, initialized from localStorage
let magicList;
let karaokeList;

const ADMIN_CODE = "3434"; // Code to view confirmed list
const CLEAR_CODE = "2130621"; // Code to clear confirmed data
const ADD_KARAOKE_CODE = "21621"; // NEW: Code to add person to karaoke list

// Helper functions for localStorage management
function getConfirmedList() {
    const listString = localStorage.getItem("confirmedList");
    try {
        return listString ? JSON.parse(listString) : [];
    } catch (e) {
        console.error("Error parsing confirmedList from localStorage:", e);
        return [];
    }
}

function saveConfirmedList(list) {
    localStorage.setItem("confirmedList", JSON.stringify(list));
}

function getMagicList() {
    const listString = localStorage.getItem("storedMagicList");
    try {
        return listString ? JSON.parse(listString) : [...defaultMagicList];
    } catch (e) {
        console.error("Error parsing storedMagicList from localStorage:", e);
        return [...defaultMagicList];
    }
}

function saveMagicList(list) {
    localStorage.setItem("storedMagicList", JSON.stringify(list));
}

function getKaraokeList() {
    const listString = localStorage.getItem("storedKaraokeList");
    try {
        return listString ? JSON.parse(listString) : [...defaultKaraokeList];
    } catch (e) {
        console.error("Error parsing storedKaraokeList from localStorage:", e);
        return [...defaultKaraokeList];
    }
}

function saveKaraokeList(list) {
    localStorage.setItem("storedKaraokeList", JSON.stringify(list));
}

// Function to confirm specific event attendance
function confirmEvent(eventName) {
    const nameInput = document.getElementById("nameInput");
    const inputName = nameInput.value.trim().toLowerCase();

    if (!inputName) {
        alert("Please enter your name first!");
        return;
    }

    let confirmedList = getConfirmedList();
    let userEntry = confirmedList.find(entry => entry.name === inputName);

    if (userEntry) {
        if (!userEntry.eventsConfirmed.includes(eventName)) {
            userEntry.eventsConfirmed.push(eventName);
        }
    } else {
        userEntry = { name: inputName, eventsConfirmed: [eventName, 'grand_invention'] };
        confirmedList.push(userEntry);
    }

    saveConfirmedList(confirmedList);
    alert(`Confirmed for ${eventName.charAt(0).toUpperCase() + eventName.slice(1)} Night!`);

    // Hide the confirmed button
    if (eventName === 'magic') {
        document.getElementById("magicConfirmBtn").style.display = 'none';
    } else if (eventName === 'karaoke') {
        document.getElementById("karaokeConfirmBtn").style.display = 'none';
    }
    checkAccess();
}

function checkAccess() {
    const nameInput = document.getElementById("nameInput");
    const inputName = nameInput.value.trim().toLowerCase();
    const invitationDetails = document.getElementById("invitation-details");
    const confirmationPrompt = document.getElementById("confirmation-prompt");
    const magicConfirmBtn = document.getElementById("magicConfirmBtn");
    const karaokeConfirmBtn = document.getElementById("karaokeConfirmBtn");

    confirmationPrompt.style.display = 'none';
    magicConfirmBtn.style.display = 'none';
    karaokeConfirmBtn.style.display = 'none';


    if (!inputName) {
        invitationDetails.innerHTML = "<p style='color: #ff6347;'>Please enter your name.</p>";
        return;
    }

    let confirmedList = getConfirmedList();
    let userEntry = confirmedList.find(entry => entry.name === inputName);

    // Use the global (localStorage-backed) lists
    const invitedToMagic = magicList.includes(inputName);
    const invitedToKaraoke = karaokeList.includes(inputName);
    const invitedToGrandInvention = true; // Everyone is invited to the main event

    if (!userEntry) {
        userEntry = { name: inputName, eventsConfirmed: ['grand_invention'] };
        confirmedList.push(userEntry);
    } else {
        if (!userEntry.eventsConfirmed.includes('grand_invention')) {
            userEntry.eventsConfirmed.push('grand_invention');
        }
    }
    saveConfirmedList(confirmedList);

    // Displaying invitation details correctly based on all invites
    let eventListItems = [];
    let welcomeMessage = "<strong>Te esperó, trae lo que quieras compartir para tomar:</strong>"; // Default message

    if (invitedToMagic) {
        eventListItems.push('<li>✨ Thursday (Magic Night)9Pm Depa Chogo</li>');
        welcomeMessage = "<strong>Welcome! See you soon:</strong>"; // Change message if invited to specific events
    }
    if (invitedToKaraoke) {
        eventListItems.push('<li>🎤 Friday (Karaoke Night)9:30PM Stolz </li>');
        welcomeMessage = "<strong>Welcome! See you soon:</strong>"; // Change message if invited to specific events
    }
    // Grand Invention is always invited and always last
    eventListItems.push('<li>🔥 Saturday (The Grand Invention) 34° Chogo Cumpleaños Ubicación</li>');

    invitationDetails.innerHTML = welcomeMessage + "<ul>" + eventListItems.join('') + "</ul>";

    // Show confirmation buttons if applicable and not already confirmed
    const userConfirmedEvents = userEntry ? userEntry.eventsConfirmed : [];
    let showConfirmationPrompt = false;

    if (invitedToMagic && !userConfirmedEvents.includes('magic')) {
        magicConfirmBtn.style.display = 'block';
        showConfirmationPrompt = true;
    }

    if (invitedToKaraoke && !userConfirmedEvents.includes('karaoke')) {
        karaokeConfirmBtn.style.display = 'block';
        showConfirmationPrompt = true;
    }

    if (showConfirmationPrompt) {
        confirmationPrompt.style.display = 'block';
    }

    localStorage.setItem("lastVisitedName", inputName);
}

// Authenticate and show guest list for admin
function authenticateAndShowGuests() {
    const adminCodeInput = document.getElementById("adminCodeInput");
    const adminMessageDiv = document.getElementById("adminMessage");
    const adminConfirmedGuestsListDiv = document.getElementById("adminConfirmedGuestsList");
    const enteredCode = adminCodeInput.value.trim();

    adminMessageDiv.innerHTML = "";
    adminConfirmedGuestsListDiv.innerHTML = "";

    if (enteredCode === ADMIN_CODE) {
        let confirmedGuests = getConfirmedList();

        if (confirmedGuests.length > 0) {
            confirmedGuests.sort((a, b) => a.name.localeCompare(b.name));

            let listHTML = "<h3>Confirmed Attendees:</h3><ul>";
            confirmedGuests.forEach(guest => {
                const events = guest.eventsConfirmed.map(event => {
                    if (event === 'magic') return 'Magic Night ✨';
                    if (event === 'karaoke') return 'Karaoke Night 🎤';
                    if (event === 'grand_invention') return 'Grand Invention 🔥';
                    return event;
                }).join(', ');
                listHTML += `<li><strong>${guest.name.charAt(0).toUpperCase() + guest.name.slice(1)}</strong>: ${events}</li>`;
            });
            listHTML += "</ul>";
            adminConfirmedGuestsListDiv.innerHTML = listHTML;
        } else {
            adminConfirmedGuestsListDiv.innerHTML = "<p>No attendees confirmed yet.</p>";
        }
        adminCodeInput.value = "";
    } else if (enteredCode === CLEAR_CODE) {
        localStorage.removeItem("confirmedList");
        localStorage.removeItem("lastVisitedName");
        // Also clear the stored magic/karaoke lists to revert to default
        localStorage.removeItem("storedMagicList");
        localStorage.removeItem("storedKaraokeList");
        // Re-initialize lists after clearing
        magicList = getMagicList();
        karaokeList = getKaraokeList();


        adminMessageDiv.innerHTML = "<p style='color: #4CAF50;'>All data (confirmed guests & invitation lists) cleared successfully! Refresh page to see effect.</p>";
        adminConfirmedGuestsListDiv.innerHTML = "<p>All confirmed data has been removed.</p>";
        adminCodeInput.value = "";
    } else if (enteredCode.startsWith(ADD_KARAOKE_CODE)) { // NEW: Handle adding to karaoke list
        const parts = enteredCode.split(' ');
        if (parts.length < 2) {
            adminMessageDiv.innerHTML = "<p style='color: #ff6347;'>Invalid format. Use: 21621 [Name]</p>";
        } else {
            const nameToAdd = parts.slice(1).join(' ').trim().toLowerCase();
            if (nameToAdd) {
                let currentKaraokeList = getKaraokeList();
                if (!currentKaraokeList.includes(nameToAdd)) {
                    currentKaraokeList.push(nameToAdd);
                    saveKaraokeList(currentKaraokeList);
                    karaokeList = currentKaraokeList; // Update the global variable
                    adminMessageDiv.innerHTML = `<p style='color: #4CAF50;'>'${nameToAdd.charAt(0).toUpperCase() + nameToAdd.slice(1)}' added to Karaoke Night list.</p>`;
                } else {
                    adminMessageDiv.innerHTML = `<p style='color: #f0e68c;'>'${nameToAdd.charAt(0).toUpperCase() + nameToAdd.slice(1)}' is already on the Karaoke Night list.</p>`;
                }
            } else {
                adminMessageDiv.innerHTML = "<p style='color: #ff6347;'>Name to add cannot be empty.</p>";
            }
        }
        adminCodeInput.value = "";
    }
    else {
        adminMessageDiv.innerHTML = "<p style='color: #ff6347;'>Incorrect code. Access denied.</p>";
        adminCodeInput.value = "";
    }
}

// Load last visited name and initialize global lists on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global lists from localStorage or defaults
    magicList = getMagicList();
    karaokeList = getKaraokeList();

    const lastVisitedName = localStorage.getItem("lastVisitedName");
    if (lastVisitedName) {
        document.getElementById("nameInput").value = lastVisitedName;
        checkAccess();
    }
});