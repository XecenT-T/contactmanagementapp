
const API_BASE = "/api";

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const showLogin = document.getElementById("show-login");
const showRegister = document.getElementById("show-register");
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const logoutBtn = document.getElementById("logout-btn");
const addContactForm = document.getElementById("add-contact-form");
const contactsList = document.getElementById("contacts-list");
const messageDiv = document.getElementById("message");

function showMessage(msg, color = "red") {
    messageDiv.textContent = msg;
    messageDiv.className = `text-center text-sm text-${color}-600`;
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
        if (!res.ok) {
            let data = {};
            try {
                data = await res.json();
            } catch {}
            throw new Error(data.message || "Registration failed");
        }
        showMessage("Registration successful! Please login.", "green");
        registerForm.reset();
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    } catch (err) {
        showMessage(err.message);
    }
};

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
        if (!res.ok) {
            let data = {};
            try {
                data = await res.json();
            } catch {}
            throw new Error(data.message || "Login failed");
        }
        const token = await res.json();
        setToken(token);
        setAuthUI(true);
        fetchContacts();
    } catch (err) {
        showMessage(err.message);
    }
};


logoutBtn.onclick = () => {
    clearToken();
    setAuthUI(false);
    contactsList.innerHTML = "";
};

async function fetchContacts() {
    try {
        const res = await fetch(`${API_BASE}/contacts`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error("Failed to fetch contacts");
        const contacts = await res.json();
        renderContacts(contacts);
    } catch (err) {
        showMessage(err.message);
    }
}

function renderContacts(contacts) {
    contactsList.innerHTML = "";
    if (contacts.length === 0) {
        contactsList.innerHTML = '<li class="text-gray-500 text-center">No contacts found.</li>';
        return;
    }
    contacts.forEach(contact => {
        const li = document.createElement("li");
        li.className = "flex items-center justify-between bg-slate-100 rounded px-3 py-2";
        li.innerHTML = `
            <div>
                <span class="font-semibold">${contact.name}</span>
                <span class="ml-2 text-gray-600">${contact.phone}</span>
            </div>
            <div class="flex gap-2">
                <button class="edit-btn text-blue-600 underline text-sm">Edit</button>
                <button class="delete-btn text-red-600 underline text-sm">Delete</button>
            </div>
        `;
        
        li.querySelector(".edit-btn").onclick = () => editContactPrompt(contact);
       
        li.querySelector(".delete-btn").onclick = () => deleteContact(contact.name);
        contactsList.appendChild(li);
    });
}


addContactForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById("contact-name").value;
    const phone = document.getElementById("contact-phone").value;
    try {
        const res = await fetch(`${API_BASE}/contacts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({ name, phone })
        });
        if (!res.ok) {
            let data = {};
            try {
                data = await res.json();
            } catch {}
            throw new Error(data.message || "Failed to add contact");
        }
        addContactForm.reset();
        fetchContacts();
    } catch (err) {
        showMessage(err.message);
    }
};


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
        if (!res.ok) {
            let d = {};
            try {
                d = await res.json();
            } catch {}
            throw new Error(d.message || "Failed to update contact");
        }
        fetchContacts();
    } catch (err) {
        showMessage(err.message);
    }
}


async function deleteContact(name) {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
        const res = await fetch(`${API_BASE}/contacts/${encodeURIComponent(name)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (!res.ok) {
            let d = {};
            try {
                d = await res.json();
            } catch {}
            throw new Error(d.message || "Failed to delete contact");
        }
        fetchContacts();
    } catch (err) {
        showMessage(err.message);
    }
}


window.onload = () => {
    if (getToken()) {
        setAuthUI(true);
        fetchContacts();
    } else {
        setAuthUI(false);
    }
}; 