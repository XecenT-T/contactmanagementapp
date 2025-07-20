const API_BASE = "/api";

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const showLogin = document.getElementById("show-login");
const showRegister = document.getElementById("show-register");
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const logoutBtn = document.getElementById("logout-btn");
const contactsList = document.getElementById("contacts-list");
const messageDiv = document.getElementById("message");
const searchBar = document.getElementById("search-bar");
const openAddModalBtn = document.getElementById("open-add-modal");
const addModal = document.getElementById("add-modal");
const closeAddModalBtn = document.getElementById("close-add-modal");
const addContactModalBtn = document.getElementById("add-contact-modal-btn");
const modalContactName = document.getElementById("modal-contact-name");
const modalContactPhone = document.getElementById("modal-contact-phone");
const downloadVcfBtn = document.getElementById("download-vcf");
const importVcfBtn = document.getElementById("import-vcf-btn");
const importVcfInput = document.getElementById("import-vcf-input");

let allContacts = [];
let filteredContacts = [];

function showMessage(msg, color = "red") {
    messageDiv.textContent = msg;
    messageDiv.className = `text-center text-sm text-${color}-400`;
    setTimeout(() => { messageDiv.textContent = ""; }, 3000);
}

function setAuthUI(loggedIn) {
    if (loggedIn) {
        authSection.classList.add("hidden");
        appSection.classList.remove("hidden");
    } else {
        authSection.classList.remove("hidden");
        appSection.classList.add("hidden");
    }
}

function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    localStorage.setItem("token", token);
}

function clearToken() {
    localStorage.removeItem("token");
}

// Switch forms
showLogin.onclick = (e) => {
    e.preventDefault();
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
};
showRegister.onclick = (e) => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
};

// Register
registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    try {
        const res = await fetch(`${API_BASE}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });
        if (!res.ok) throw new Error((await res.json()).message || "Registration failed");
        showMessage("Registration successful! Please login.", "green");
        registerForm.reset();
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    } catch (err) {
        showMessage(err.message);
    }
};

// Login
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
        const res = await fetch(`${API_BASE}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error((await res.json()).message || "Login failed");
        const token = await res.json();
        setToken(token);
        setAuthUI(true);
        fetchContacts();
    } catch (err) {
        showMessage(err.message);
    }
};

// Logout
logoutBtn.onclick = () => {
    clearToken();
    setAuthUI(false);
    contactsList.innerHTML = "";
};

// Modal logic
openAddModalBtn.onclick = () => {
    addModal.classList.remove("hidden");
    modalContactName.value = "";
    modalContactPhone.value = "";
    modalContactName.focus();
};
closeAddModalBtn.onclick = () => {
    addModal.classList.add("hidden");
};
addModal.onclick = (e) => {
    if (e.target === addModal) addModal.classList.add("hidden");
};

// Add contact from modal
addContactModalBtn.onclick = async (e) => {
    e.preventDefault();
    const name = modalContactName.value.trim();
    const phone = modalContactPhone.value.trim();
    if (!name || !phone) return showMessage("Please enter both name and phone.");
    try {
        const res = await fetch(`${API_BASE}/contacts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({ name, phone })
        });
        if (!res.ok) throw new Error((await res.json()).message || "Failed to add contact");
        addModal.classList.add("hidden");
        fetchContacts();
    } catch (err) {
        showMessage(err.message);
    }
};

// Fetch contacts
async function fetchContacts() {
    try {
        const res = await fetch(`${API_BASE}/contacts`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error("Failed to fetch contacts");
        allContacts = await res.json();
        filterAndRenderContacts();
        downloadVcfBtn.classList.remove("hidden");
    } catch (err) {
        showMessage(err.message);
    }
}

// Search logic
searchBar.oninput = () => filterAndRenderContacts();

function filterAndRenderContacts() {
    const query = searchBar.value.trim().toLowerCase();
    filteredContacts = query
        ? allContacts.filter(c => c.name.toLowerCase().includes(query) || c.phone.toLowerCase().includes(query))
        : allContacts;
    renderContacts(filteredContacts);
}

// Render contacts
function renderContacts(contacts) {
    contactsList.innerHTML = "";
    if (contacts.length === 0) {
        contactsList.innerHTML = '<li class="text-gray-500 text-center">No contacts found.</li>';
        return;
    }
    contacts.forEach(contact => {
        const li = document.createElement("li");
        li.className = "flex items-center justify-between bg-slate-900/60 rounded px-3 py-2 text-white";
        li.innerHTML = `
            <div>
                <span class="font-semibold">${contact.name}</span>
                <span class="ml-2 text-gray-300">${contact.phone}</span>
            </div>
            <div class="flex gap-2">
                <button class="edit-btn text-blue-400 underline text-sm">Edit</button>
                <button class="delete-btn text-red-400 underline text-sm">Delete</button>
            </div>
        `;
        li.querySelector(".edit-btn").onclick = () => editContactPrompt(contact);
        li.querySelector(".delete-btn").onclick = () => deleteContact(contact.name);
        contactsList.appendChild(li);
    });
}

// Edit contact
function editContactPrompt(contact) {
    const newName = prompt("Edit name:", contact.name);
    if (newName === null) return;
    const newPhone = prompt("Edit phone:", contact.phone);
    if (newPhone === null) return;
    updateContact(contact.name, { name: newName, phone: newPhone });
}

async function updateContact(oldName, data) {
    try {
        const res = await fetch(`${API_BASE}/contacts/${encodeURIComponent(oldName)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error((await res.json()).message || "Failed to update contact");
        fetchContacts();
    } catch (err) {
        showMessage(err.message);
    }
}

// Delete contact
async function deleteContact(name) {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
        const res = await fetch(`${API_BASE}/contacts/${encodeURIComponent(name)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error((await res.json()).message || "Failed to delete contact");
        fetchContacts();
    } catch (err) {
        showMessage(err.message);
    }
}

// Download contacts as VCF
downloadVcfBtn.onclick = () => {
    if (!allContacts || allContacts.length === 0) {
        showMessage("No contacts to download.");
        return;
    }
    const vcfData = allContacts.map(c => 
`BEGIN:VCARD
VERSION:3.0
FN:${c.name}
TEL;TYPE=CELL:${c.phone}
END:VCARD`).join("\n");

    const blob = new Blob([vcfData], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Import Contacts logic
importVcfBtn.onclick = () => {
    importVcfInput.value = ""; // reset file input
    importVcfInput.click();
};

importVcfInput.onchange = async function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function (e) {
        const text = e.target.result;
        // Parse vCard: look for BEGIN:VCARD ... END:VCARD blocks
        const cards = text.split(/END:VCARD/i).map(c => c.trim()).filter(Boolean);
        let imported = 0, failed = 0;
        for (let card of cards) {
            card += "\nEND:VCARD"; // add back END:VCARD
            const nameMatch = card.match(/FN:(.+)/i);
            const phoneMatch = card.match(/TEL[^:]*:([\d+\- ]+)/i);
            const name = nameMatch ? nameMatch[1].trim() : null;
            const phone = phoneMatch ? phoneMatch[1].replace(/\s+/g, "") : null;
            if (name && phone) {
                try {
                    const res = await fetch(`${API_BASE}/contacts`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getToken()}`
                        },
                        body: JSON.stringify({ name, phone })
                    });
                    if (res.ok) imported++;
                    else failed++;
                } catch {
                    failed++;
                }
            } else {
                failed++;
            }
        }
        showMessage(`Imported: ${imported}, Failed: ${failed}`, failed ? "red" : "green");
        fetchContacts();
    };
    reader.readAsText(file);
};

// On page load
window.onload = () => {
    if (getToken()) {
        setAuthUI(true);
        fetchContacts();
    } else {
        setAuthUI(false);
    }
};
