// =========================
// MOSTRAR USUARIO Y VERIFICAR SESIÓN
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const sessionActive = localStorage.getItem("sessionActive");
  const sessionUser = localStorage.getItem("sessionUser");

  if (sessionActive !== "true" || !sessionUser) {
    window.location.href = "auth.html";
  } else {
    let username = sessionUser.split("@")[0];
    username = username.charAt(0).toUpperCase() + username.slice(1);
    document.getElementById("userEmail").textContent = username;
  }
});

// =========================
// CERRAR SESIÓN
// =========================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("sessionActive");
  localStorage.removeItem("sessionUser");
  window.location.href = "auth.html";
});

// =========================
// TOGGLE SIDEBAR RESPONSIVO
// =========================
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const closeSidebar = document.getElementById("closeSidebar");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("show-sidebar");
});

closeSidebar.addEventListener("click", () => {
  sidebar.classList.remove("show-sidebar");
});
