const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const numParticles = 1000;

let state = "hold";
let holdTime = 180;
let frameCount = 0;

// Уравнение на сърце
function heartEquation(t) {
  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x, y };
}

// Създаваме частици
for (let i = 0; i < numParticles; i++) {
  let angle = Math.random() * Math.PI * 2;
  let { x, y } = heartEquation(angle);
  let scale = 18;
  let px = canvas.width / 2 + x * scale + (Math.random() - 0.5) * 20;
  let py = canvas.height / 2 - y * scale + (Math.random() - 0.5) * 20;

  particles.push({
    x: px,
    y: py,
    size: Math.random() * 2 + 1,
    alpha: Math.random() * 0.8 + 0.2,
    speedX: (Math.random() - 0.5) * 2,
    speedY: (Math.random() - 0.5) * 2
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 0, ${p.alpha})`;
    ctx.fill();

    if (state === "disperse") {
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha += (Math.random() - 0.5) * 0.05;
      if (p.alpha < 0.2) p.alpha = 0.2;
      if (p.alpha > 1) p.alpha = 1;
    }
  });

  if (state === "hold") {
    frameCount++;
    if (frameCount > holdTime) {
      state = "disperse";
      setTimeout(showPhotos, 1000);
    }
  }

  requestAnimationFrame(animate);
}

animate();

// Показване на снимките една по една
function showPhotos() {
  const images = document.querySelectorAll(".collage img");
  const gallery = document.getElementById("gallery");
  gallery.classList.remove("hidden");

  images.forEach((img, i) => {
    setTimeout(() => {
      img.style.animation = "popIn 1.5s forwards"; // плавно с bounce
    }, i * 750); // всяка следваща снимка изскача след 0.75 сек
  });

  // Финален текст след 2 секунди от последната снимка
  const finalText = document.createElement("div");
  finalText.id = "finalText";
  finalText.innerText = "Обожавам те прасчо и нямам търпение да си те видя утре!";
  finalText.style.opacity = "0";
  finalText.style.position = "fixed";
  finalText.style.top = "50%";
  finalText.style.left = "50%";
  finalText.style.transform = "translate(-50%, -50%)";
  finalText.style.fontSize = "3em";
  finalText.style.color = "#ffffff"; // бляскаво бяло
  finalText.style.textAlign = "center";
  finalText.style.zIndex = "10";
  finalText.style.fontFamily = "'Satisfy', cursive"; // ако имаш добавен Google Font Satisfy
  finalText.style.textShadow = "0 0 5px #fff, 0 0 10px #fff;"; // блясък
  finalText.style.transition = "opacity 2s ease";
  gallery.appendChild(finalText);

  const lastImageIndex = images.length - 1;
  const lastImageDelay = lastImageIndex * 750; // закъснение до последната снимка
  const lastImageDuration = 1500; // продължителност на анимацията на последната снимка
  const extraDelay = 1500; // 2 секунди след последната снимка

  setTimeout(() => {
    finalText.classList.add("show"); // тригерира fade-in и bounce
    finalText.style.transform = "translate(-50%, -50%) scale(1)";
    finalText.style.opacity = "1";
  }, lastImageDelay + lastImageDuration + extraDelay);
}

// Автоматично пускане на музика след първи клик или скрол
const music = document.getElementById("bgMusic");
music.volume = 0.2; // леко приглушен звук

function playMusic() {
  music.play().catch(() => {
    console.log("Автоматичното пускане на музика е блокирано.");
  });
  window.removeEventListener('click', playMusic);
  window.removeEventListener('scroll', playMusic);
}

window.addEventListener('click', playMusic);
window.addEventListener('scroll', playMusic);

// След като се разпръсне сърцето, показваме снимките
window.addEventListener("load", () => {
  setTimeout(showPhotos, 6000); // примерно 6 сек държим сърцето
});
