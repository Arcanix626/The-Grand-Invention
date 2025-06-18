// Default lists for Magic Night and Karaoke Night - these will still be local to each browser
// If you want these lists also to be remote, it would require a different setup (like Firebase/Google Apps Script backend).
const defaultMagicList = [
    "bernardo canelas", "sebastian avila", "alejandro rea", "lucas mendez",
    "paul krpan", "adrian rojas", "happy", "reo", "fiquito"
];

const defaultKaraokeList = [
    "alejandra pacheco", "ricardo dacosta", "fabricio fernandez", "gabriel fernandez",
    "alejandra barrientos", "isabella saldivias", "valeria mercado", "marcelo ortuño",
    "fraciely rubesa", "mariana quiroga", "bernardo canelas"
];

// Global variables for the active lists, initialized from localStorage for Magic/Karaoke
let magicList;
let karaokeList;

const ADMIN_CODE = "3434"; // Code to view confirmed list (now in Google Sheet)
const CLEAR_CODE = "2130621"; // Code to clear local data (no longer clears 'confirmedList' in Sheets)
const ADD_KARAOKE_CODE = "21621"; // Code to add person to local karaoke list
const ADD_MAGIC_CODE = "621"; // Code to add person to local magic list

// === GOOGLE FORM CONFIGURATION ===
// IMPORTANT: Replace this with the actual URL of your Google Form
const GOOGLE_FORM_URL = "https://forms.gle/SWFB8JLdkXcTbpKZ6"; // <-- REPLACE THIS!
// =================================

// Helper functions for localStorage management (for Magic and Karaoke lists)
function getMagicList() {
    const listString = localStorage.getItem("storedMagicList");
    try {
        return listString ? JSON.parse(listString) : defaultMagicList;
    } catch (e) {
        console.error("Error parsing storedMagicList from localStorage:", e);
        return defaultMagicList;
    }
}

function saveMagicList(list) {
    localStorage.setItem("storedMagicList", JSON.stringify(list));
}

function getKaraokeList() {
    const listString = localStorage.getItem("storedKaraokeList");
    try {
        return listString ? JSON.parse(listString) : defaultKaraokeList;
    } catch (e) {
        console.error("Error parsing storedKaraokeList from localStorage:", e);
        return defaultKaraokeList;
    }
}

function saveKaraokeList(list) {
    localStorage.setItem("storedKaraokeList", JSON.stringify(list));
}


// --- Functions for Guest Interaction (Adapted for Google Form) ---

// Function to open the Google Form when "Confirma tu asistencia" button is clicked
function openGoogleForm() {
    window.open(GOOGLE_FORM_URL, '_blank'); // Opens the Google Form in a new tab
    const nameInput = document.getElementById("nameInput");
    // Optionally, store the name locally if user types it, for convenience
    if (nameInput.value) {
        localStorage.setItem("lastVisitedName", nameInput.value.toLowerCase());
    }
    // You might also show a message that the form has opened.
    const detailsDiv = document.getElementById("invitation-details");
    detailsDiv.innerHTML = "<p style='color: #4CAF50;'>¡Gracias! Se ha abierto el formulario de confirmación en una nueva pestaña.</p>";
    detailsDiv.style.display = 'block';
    document.getElementById("event-confirmation-section").style.display = 'none'; // Hide event buttons
}

// checkAccess is no longer used for confirmation, but can be adapted for existing guests
function checkAccess() {
    const nameInput = document.getElementById("nameInput");
    let name = nameInput.value.toLowerCase().trim();
    const detailsDiv = document.getElementById("invitation-details");
    const confirmationPrompt = document.getElementById("confirmation-prompt");
    const magicConfirmBtn = document.getElementById("magicConfirmBtn");
    const karaokeConfirmBtn = document.getElementById("karaokeConfirmBtn");

    // Clear previous messages
    detailsDiv.innerHTML = "";
    confirmationPrompt.style.display = 'none';
    magicConfirmBtn.style.display = 'none';
    karaokeConfirmBtn.style.display = 'none';

    if (name) {
        localStorage.setItem("lastVisitedName", name); // Save for next visit

        // Check if name is in any of the local lists
        const inMagicList = magicList.includes(name);
        const inKaraokeList = karaokeList.includes(name);
        const inBoth = inMagicList && inKaraokeList;
        const inEither = inMagicList || inKaraokeList;

        if (inBoth) {
            detailsDiv.innerHTML = `<p>¡Hola ${name.charAt(0).toUpperCase() + name.slice(1)}! Estás invitado a la Noche Mágica y Noche de Karaoke.</p>`;
            confirmationPrompt.style.display = 'block';
            magicConfirmBtn.style.display = 'inline-block';
            karaokeConfirmBtn.style.display = 'inline-block';
        } else if (inMagicList) {
            detailsDiv.innerHTML = `<p>¡Hola ${name.charAt(0).toUpperCase() + name.slice(1)}! Estás invitado a la Noche Mágica.</p>`;
            confirmationPrompt.style.display = 'block';
            magicConfirmBtn.style.display = 'inline-block';
        } else if (inKaraokeList) {
            detailsDiv.innerHTML = `<p>¡Hola ${name.charAt(0).toUpperCase() + name.slice(1)}! Estás invitado a la Noche de Karaoke.</p>`;
            confirmationPrompt.style.display = 'block';
            karaokeConfirmBtn.style.display = 'inline-block';
        } else {
            detailsDiv.innerHTML = `<p>Lo sentimos, ${name.charAt(0).toUpperCase() + name.slice(1)}, tu nombre no se encontró en la lista de invitados para ninguno de los eventos principales.</p>`;
        }
    } else {
        detailsDiv.innerHTML = "<p style='color: #ff6347;'>Por favor, introduce tu nombre completo.</p>";
    }
    detailsDiv.style.display = 'block';
}


// Function to confirm attendance for specific events (Magic/Karaoke)
function confirmEvent(eventType) {
    const nameInput = document.getElementById("nameInput");
    let name = nameInput.value.toLowerCase().trim();
    const detailsDiv = document.getElementById("invitation-details");

    if (!name) {
        detailsDiv.innerHTML = "<p style='color: #ff6347;'>Por favor, introduce tu nombre para confirmar el evento.</p>";
        detailsDiv.style.display = 'block';
        return;
    }

    let message = "";
    if (eventType === 'magic') {
        message = `<p style='color: #4CAF50;'>¡Confirmada tu asistencia a la Noche Mágica, ${name.charAt(0).toUpperCase() + name.slice(1)}! Te esperamos.</p>`;
    } else if (eventType === 'karaoke') {
        message = `<p style='color: #4CAF50;'>¡Confirmada tu asistencia a la Noche de Karaoke, ${name.charAt(0).toUpperCase() + name.slice(1)}! ¡Prepara tu voz!</p>`;
    }

    detailsDiv.innerHTML = message;
    detailsDiv.style.display = 'block';
    // Hide buttons after confirmation
    document.getElementById("event-confirmation-section").style.display = 'none';
}


// --- Functions for Admin Access (Adapted for Google Sheet) ---

function authenticateAndShowGuests() {
    const adminCodeInput = document.getElementById("adminCodeInput");
    const adminMessageDiv = document.getElementById("adminMessage");
    const adminConfirmedGuestsListDiv = document.getElementById("adminConfirmedGuestsList");
    const enteredCode = adminCodeInput.value;

    adminMessageDiv.innerHTML = ""; // Clear previous messages
    adminConfirmedGuestsListDiv.innerHTML = ""; // Clear previous list

    if (enteredCode === ADMIN_CODE) {
        adminMessageDiv.innerHTML = "<p style='color: #4CAF50;'>Acceso concedido. La lista de invitados confirmados está disponible en tu Google Sheet.</p>";
        adminConfirmedGuestsListDiv.innerHTML = "<p>Por favor, revisa tu Google Drive para acceder al 'MiCumpleanosGuestList' Google Sheet.</p>";
        // Optionally, provide a direct link to the Google Sheet if you know it
        // adminConfirmedGuestsListDiv.innerHTML += `<p><a href="YOUR_GOOGLE_SHEET_URL_HERE" target="_blank">Abrir Lista de Google Sheet</a></p>`;
    } else if (enteredCode === CLEAR_CODE) {
        // This clear code will now only clear local lists, NOT the Google Sheet data.
        if (confirm("¿Estás seguro de que quieres borrar TODAS las listas de invitados (Magic y Karaoke) de ESTE DISPOSITIVO? Esta acción es irreversible para los datos locales.")) {
            localStorage.removeItem("storedMagicList");
            localStorage.removeItem("storedKaraokeList");
            magicList = defaultMagicList; // Reset global variables to default
            karaokeList = defaultKaraokeList;
            adminMessageDiv.innerHTML = "<p style='color: #4CAF50;'>Listas locales (Magic y Karaoke) borradas y restablecidas a los valores predeterminados de este dispositivo.</p>";
        } else {
            adminMessageDiv.innerHTML = "<p style='color: #f0e68c;'>Operación de borrado cancelada.</p>";
        }
    } else if (enteredCode === ADD_KARAOKE_CODE) {
        const nameToAdd = prompt("Introduce el nombre completo (en minúsculas) para añadir a la lista de Karaoke:");
        if (nameToAdd) {
            let currentKaraokeList = getKaraokeList();
            if (!currentKaraokeList.includes(nameToAdd)) {
                currentKaraokeList.push(nameToAdd);
                saveKaraokeList(currentKaraokeList);
                karaokeList = currentKaraokeList; // Update the global variable
                adminMessageDiv.innerHTML = `<p style='color: #4CAF50;'>'${nameToAdd.charAt(0).toUpperCase() + nameToAdd.slice(1)}' añadido a la lista de Karaoke.</p>`;
            } else {
                adminMessageDiv.innerHTML = `<p style='color: #f0e68c;'>'${nameToAdd.charAt(0).toUpperCase() + nameToAdd.slice(1)}' ya está en la lista de Karaoke.</p>`;
            }
        } else {
            adminMessageDiv.innerHTML = "<p style='color: #ff6347;'>El nombre a añadir no puede estar vacío.</p>";
        }
    } else if (enteredCode === ADD_MAGIC_CODE) {
        const nameToAdd = prompt("Introduce el nombre completo (en minúsculas) para añadir a la lista de Magic Night:");
        if (nameToAdd) {
            let currentMagicList = getMagicList();
            if (!currentMagicList.includes(nameToAdd)) {
                currentMagicList.push(nameToAdd);
                saveMagicList(currentMagicList);
                magicList = currentMagicList; // Update the global variable
                adminMessageDiv.innerHTML = `<p style='color: #4CAF50;'>'${nameToAdd.charAt(0).toUpperCase() + nameToAdd.slice(1)}' añadido a la lista de Magic Night.</p>`;
            } else {
                adminMessageDiv.innerHTML = `<p style='color: #f0e68c;'>'${nameToAdd.charAt(0).toUpperCase() + nameToAdd.slice(1)}' ya está en la lista de Magic Night.</p>`;
            }
        } else {
            adminMessageDiv.innerHTML = "<p style='color: #ff6347;'>El nombre a añadir no puede estar vacío.</p>";
        }
    } else {
        adminMessageDiv.innerHTML = "<p style='color: #ff6347;'>Código incorrecto. Acceso denegado.</p>";
    }
    adminCodeInput.value = ""; // Clear the code input after attempt
}


// Load last visited name and initialize global lists on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global lists from localStorage or defaults
    magicList = getMagicList();
    karaokeList = getKaraokeList();

    const lastVisitedName = localStorage.getItem("lastVisitedName");
    if (lastVisitedName) {
        document.getElementById("nameInput").value = lastVisitedName;
        // checkAccess(); // Do not call checkAccess automatically to avoid opening form on load
    }
});
