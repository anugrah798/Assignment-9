// (1) API URL
const BASE_URL = "https://telephone-api-crud.vercel.app/api/phones";

// (2) Variables
let selectedId = null;

// (3) DOM Elements
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const list = document.getElementById("list");
const msg = document.getElementById("msg");
const updateBtn = document.getElementById("updateBtn");

// (4) Load contacts on page load
window.onload = fetchContacts;

// (5) Show message
function showMsg(text, color = "black") {
    msg.textContent = text;
    msg.style.color = color;
    setTimeout(() => (msg.textContent = ""), 2000);
}

// (6) 🔁 REPLACE OLD VALIDATE FUNCTION HERE
function validate(name, phone) {
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[0-9+\-]{7,15}$/;

    if (!name || !phone) {
        showMsg("All fields required", "red");
        return false;
    }

    if (!nameRegex.test(name)) {
        showMsg("Name should contain only letters", "red");
        return false;
    }

    if (!phoneRegex.test(phone)) {
        showMsg("Phone must be valid numbers only", "red");
        return false;
    }

    return true;
}

// (7) 🔒 INPUT RESTRICTION (ADD THIS AFTER VALIDATE)
nameInput.addEventListener("input", () => {
    nameInput.value = nameInput.value.replace(/[^A-Za-z\s]/g, "");
});

phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/[^0-9+\-]/g, "");
});

// (8) GET all contacts
async function fetchContacts() {
    try {
        const res = await fetch(BASE_URL);
        const data = await res.json();
        display(data);
    } catch {
        showMsg("Error fetching contacts", "red");
    }
}

// (9) Display contacts
function display(data) {
    list.innerHTML = "";

    data.forEach(c => {
        list.innerHTML += `
      <div class="card">
        <div>
          <strong>${c.name}</strong><br>
          ${c.phoneNumber}
        </div>
        <div>
          <button class="edit" onclick="editContact('${c._id}')">Edit</button>
          <button class="delete" onclick="deleteContact('${c._id}')">Delete</button>
        </div>
      </div>
    `;
    });
}

// (10) ADD contact
document.getElementById("addBtn").onclick = async () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!validate(name, phone)) return;

    await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneNumber: phone })
    });

    showMsg("Added", "green");
    clearFields();
    fetchContacts();
};

// (11) EDIT (GET by ID)
async function editContact(id) {
    selectedId = id;

    const res = await fetch(`${BASE_URL}/${id}`);
    const data = await res.json();

    nameInput.value = data.name;
    phoneInput.value = data.phoneNumber;

    updateBtn.disabled = false;
}

// (12) UPDATE (PUT)
updateBtn.onclick = async () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!validate(name, phone)) return;

    await fetch(`${BASE_URL}/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneNumber: phone })
    });

    showMsg("Updated", "green");
    clearFields();
    fetchContacts();
};

// (13) DELETE
async function deleteContact(id) {
    if (!confirm("Are you sure?")) return;

    await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE"
    });

    showMsg("Deleted", "red");
    fetchContacts();
}

// (14) SEARCH
document.getElementById("search").addEventListener("input", async e => {
    const text = e.target.value.toLowerCase();

    const res = await fetch(BASE_URL);
    const data = await res.json();

    const filtered = data.filter(c =>
        c.name.toLowerCase().includes(text) ||
        c.phoneNumber.includes(text)
    );

    display(filtered);
});

// (15) ENTER KEY SUPPORT
phoneInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        document.getElementById("addBtn").click();
    }
});

// (16) CLEAR INPUTS
function clearFields() {
    nameInput.value = "";
    phoneInput.value = "";
    updateBtn.disabled = true;
}