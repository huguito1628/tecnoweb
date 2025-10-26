let users = []; // ✅ Sin ejemplos

const ADMIN_PASSWORD_HASH = "a754049ffb01baaea795203c823895120373619b79ac87fee9351ad3dea41064";
let adminUnlocked = false;
let dataVisible = false;

const userList = document.getElementById("userList");
const addUserBtn = document.getElementById("addUserBtn");
const showDataBtn = document.getElementById("showDataBtn");
const noResults = document.getElementById("noResultsMessage");

async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function safeImageError(img) {
  if (!img.dataset.fallback) {
    img.dataset.fallback = "true";
    img.src = "images/default-user.jpg";
  }
}

function renderUsers() {
  userList.innerHTML = "";
  if (users.length === 0) {
    noResults.classList.remove("d-none");
    return;
  }
  noResults.classList.add("d-none");

  users.forEach(u => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="user-card p-3 d-flex flex-column align-items-center text-center">
        <img src="${u.foto || 'images/default-user.jpg'}" class="profile-image mb-3" alt="${u.nombre}">
        <h5 class="text-white mb-1">${u.nombre}</h5>
        <p class="text-secondary mb-1">${u.cargo}</p>
        <span class="badge ${u.estado === 'Activo' ? 'bg-success' : 'bg-secondary'} mb-2">${u.estado}</span>
        <div class="w-100 mt-2">
          <p class="sensitive ${!dataVisible ? 'locked' : ''}"><i class="bi bi-telephone"></i> ${dataVisible ? u.telefono : '•••••••••'}</p>
          <p class="sensitive ${!dataVisible ? 'locked' : ''}"><i class="bi bi-envelope"></i> ${dataVisible ? u.correo : '•••••••••'}</p>
          <p class="sensitive ${!dataVisible ? 'locked' : ''}"><i class="bi bi-person-vcard"></i> ${dataVisible ? u.dni : '•••••••••'}</p>
        </div>
      </div>`;
    userList.appendChild(col);
    const img = col.querySelector("img");
    img.onerror = () => safeImageError(img);
  });
}

document.getElementById("unlockSensitiveBtn").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("adminPassModal"));
  document.getElementById("adminPassword").value = "";
  modal.show();
});

document.getElementById("confirmPasswordBtn").addEventListener("click", async () => {
  const pass = document.getElementById("adminPassword").value;
  const hash = await sha256Hex(pass);
  if (hash === ADMIN_PASSWORD_HASH) {
    adminUnlocked = true;
    bootstrap.Modal.getInstance(document.getElementById("adminPassModal")).hide();
    addUserBtn.classList.remove("d-none");
    showDataBtn.classList.remove("d-none");
    alert("✅ Modo administrador activado. Ahora puedes agregar usuarios o ver datos.");
  } else {
    alert("❌ Contraseña incorrecta.");
  }
});

showDataBtn.addEventListener("click", () => {
  if (!adminUnlocked) {
    alert("⚠️ Debes autenticarte como administrador para ver los datos.");
    return;
  }
  dataVisible = !dataVisible;
  showDataBtn.innerHTML = dataVisible
    ? '<i class="bi bi-eye-slash"></i> Ocultar Datos'
    : '<i class="bi bi-eye"></i> Mostrar Datos';
  renderUsers();
});

addUserBtn.addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("addUserModal"));
  modal.show();
});

document.getElementById("addUserForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newUser = {
    nombre: newNombre.value.trim(),
    cargo: newCargo.value,
    estado: newEstado.value,
    telefono: newTelefono.value.trim(),
    correo: newCorreo.value.trim(),
    dni: newDNI.value.trim(),
    foto: newFoto.value.trim()
  };
  users.push(newUser);
  renderUsers();
  bootstrap.Modal.getInstance(document.getElementById("addUserModal")).hide();
  e.target.reset();
  alert("✅ Usuario agregado correctamente.");
});

const sidebar = document.getElementById("sidebar");
document.getElementById("menuToggle").addEventListener("click", () => sidebar.classList.add("show-sidebar"));
document.getElementById("closeSidebar").addEventListener("click", () => sidebar.classList.remove("show-sidebar"));

renderUsers();

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('sessionActive');
      localStorage.removeItem('sessionUser');
      window.location.href = 'auth.html';
    });
  }
});
