/* ======================================================
   ABBA JHIRE CORPORATION LOGIN SYSTEM
   Seguridad según OWASP Top 10
   Fondo con partículas dinámicas e interactivas
====================================================== */
// =========================
// CONFIGURACIÓN DE PARTÍCULAS INTERACTIVAS CON ATRACCIÓN REAL AL MOUSE
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
      grab: {
        distance: 180,
        line_linked: { opacity: 0.7 }
      },
      attract: {
        distance: 140,
        duration: 0.3,
        factor: 1.3,
        speed: 0.8
      },
      push: { quantity: 4 }
    }
  },
  particles: {
    number: { value: 90, density: { enable: true, area: 800 } },
    color: { value: "#00ffff" },
    shape: { type: "circle" },
    opacity: { value: 0.4, random: true },
    size: { value: 3, random: true },
    links: {
      enable: true,
      distance: 130,
      color: "#00ffff",
      opacity: 0.3,
      width: 1
    },
    move: {
      enable: true,
      speed: 1.2,
      direction: "none",
      random: false,
      straight: false,
      outModes: { default: "out" }
    }
  },
  detectRetina: true
});




// =========================
// SISTEMA DE LOGIN SEGURO
// =========================
const users = JSON.parse(localStorage.getItem("users") || "{}");

function sha256(str) {
  const buffer = new TextEncoder("utf-8").encode(str);
  return crypto.subtle.digest("SHA-256", buffer).then(hash =>
    Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

function toggleForms() {
  document.getElementById("loginBox").classList.toggle("d-none");
  document.getElementById("registerBox").classList.toggle("d-none");
}

// =========================
// REGISTRO DE USUARIO
// =========================
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.registerEmail.value.trim();
  const password = e.target.registerPassword.value;

  if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
    alert("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
    return;
  }

  if (users[email]) {
    alert("El usuario ya existe.");
    return;
  }

  const hashed = await sha256(password);
  users[email] = hashed;
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registro exitoso. Ahora puedes iniciar sesión.");
  toggleForms();
});

// =========================
// LOGIN SEGURO
// =========================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.loginEmail.value.trim();
  const password = e.target.loginPassword.value;
  const hashed = await sha256(password);

  if (users[email] && users[email] === hashed) {
    alert("Inicio de sesión exitoso. Bienvenido a Abba Jhire Corporation.");
    // Redirigir a dashboard (opcional)
    // window.location.href = "dashboard.html";
  } else {
    alert("Credenciales incorrectas.");
  }
});
