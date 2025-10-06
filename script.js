// =========================
// REVISAR SESIÓN ACTIVA AL CARGAR LA PÁGINA
// =========================
window.addEventListener('load', () => {
  if (localStorage.getItem('sessionActive') === 'true') {
    window.location.href = 'index.html';
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelector('.main-wrapper').style.opacity = '1';
    });
  }
});

// =========================
// TOGGLE FORMULARIOS
// =========================
function toggleForms() {
  document.getElementById("loginBox").classList.toggle("d-none");
  document.getElementById("registerBox").classList.toggle("d-none");
}

// =========================
// HASH SHA-256
// =========================
async function sha256(str) {
  const buffer = new TextEncoder("utf-8").encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// =========================
// REGISTRO
// =========================
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.registerEmail.value.trim();
  const password = e.target.registerPassword.value;

  if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
    alert("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
    return;
  }

  // Leer usuarios actuales desde localStorage
  let users = JSON.parse(localStorage.getItem("users") || "{}");

  if (users[email]) {
    alert("El usuario ya existe.");
    return;
  }

  const hashed = await sha256(password);
  users[email] = hashed;

  // Guardar de vuelta en localStorage
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registro exitoso. Ahora puedes iniciar sesión.");
  toggleForms();
});

// =========================
// LOGIN
// =========================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.loginEmail.value.trim();
  const password = e.target.loginPassword.value;

  // Leer usuarios actuales desde localStorage
  let users = JSON.parse(localStorage.getItem("users") || "{}");
  const hashed = await sha256(password);

  if (users[email] && users[email] === hashed) {
    localStorage.setItem("sessionActive", "true");
    localStorage.setItem("sessionUser", email);
    window.location.href = "index.html";
  } else {
    alert("Credenciales incorrectas.");
  }
});

// =========================
// PARTICULAS
// =========================
tsParticles.load("particles-js", {
  background: { color: "#000" },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: ["grab", "attract"] },
      onClick: { enable: true, mode: "push" },
      resize: true
    },
    modes: {
      grab: { distance: 180, line_linked: { opacity: 0.7 } },
      attract: { distance: 140, duration: 0.3, factor: 1.3, speed: 0.8 },
      push: { quantity: 4 }
    }
  },
  particles: {
    number: { value: 90, density: { enable: true, area: 800 } },
    color: { value: "#00ffff" },
    shape: { type: "circle" },
    opacity: { value: 0.4, random: true },
    size: { value: 3, random: true },
    links: { enable: true, distance: 130, color: "#00ffff", opacity: 0.3, width: 1 },
    move: { enable: true, speed: 1.2, direction: "none", random: false, straight: false, outModes: { default: "out" } }
  },
  detectRetina: true
});



