/**
 * Casa Tomada — Lógica de Animación Mural, Hilos, Stickers y Visor de GIF
 */

/* ── LOADER SCREEN ── */
function initLoader() {
  const loaderScreen = document.getElementById('loaderScreen');
  const loaderCanvas = document.getElementById('loaderCanvas');
  const loaderProgressFill = document.getElementById('loaderProgressFill');
  const loaderBtn = document.getElementById('loaderBtn');
  
  if (!loaderCanvas) return;

  const ctx = loaderCanvas.getContext('2d');
  let width, height;
  
  function resizeCanvas() {
    width = loaderCanvas.width = window.innerWidth;
    height = loaderCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Hilos animados en el loader
  const loaderThreads = [];
  const numThreads = 12;
  for (let i = 0; i < numThreads; i++) {
    loaderThreads.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      history: []
    });
  }

  let progress = 0;
  const minLoadTime = 2000; // 2 segundos mínimo
  const startTime = Date.now();

  function animateLoaderThreads() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
    ctx.fillRect(0, 0, width, height);
    
    loaderThreads.forEach(t => {
      t.history.push({ x: t.x, y: t.y });
      if (t.history.length > 80) t.history.shift();
      
      t.x += t.vx;
      t.y += t.vy;
      t.vx += (Math.random() - 0.5) * 0.15;
      t.vy += (Math.random() - 0.5) * 0.15;
      
      const speed = Math.sqrt(t.vx * t.vx + t.vy * t.vy);
      if (speed > 1.2) {
        t.vx = (t.vx / speed) * 1.2;
        t.vy = (t.vy / speed) * 1.2;
      }
      
      if (t.x < 0 || t.x > width) t.vx *= -1;
      if (t.y < 0 || t.y > height) t.vy *= -1;

      ctx.beginPath();
      ctx.moveTo(t.history[0].x, t.history[0].y);
      for (let i = 1; i < t.history.length; i++) {
        ctx.lineTo(t.history[i].x, t.history[i].y);
      }
      ctx.strokeStyle = 'rgba(180, 30, 30, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Actualizar progreso hasta que el loader esté listo
    const elapsed = Date.now() - startTime;
    if (elapsed < minLoadTime) {
      progress = Math.min((elapsed / minLoadTime) * 100, 95);
      loaderProgressFill.style.width = progress + '%';
    } else {
      loaderProgressFill.style.width = '100%';
    }

    requestAnimationFrame(animateLoaderThreads);
  }
  animateLoaderThreads();

  // Manejador del botón "Explorar Casa"
  if (loaderBtn) {
    loaderBtn.addEventListener('click', () => {
      revealPage(loaderScreen);
    });
  }
}

function revealPage(loaderScreen) {
  const loaderBtn = document.getElementById('loaderBtn');
  loaderBtn.classList.add('active');
  
  // Crear overlay de revelación interactiva
  const revealOverlay = document.createElement('div');
  revealOverlay.className = 'reveal-overlay';
  revealOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: #0a0a0a;
    z-index: 9998;
    animation: revealAnimation 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  `;
  
  document.body.appendChild(revealOverlay);

  // Agregar animación de revelación al CSS dinámicamente
  const style = document.createElement('style');
  style.textContent = `
    @keyframes revealAnimation {
      0% {
        clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        opacity: 1;
      }
      100% {
        clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
        opacity: 0;
      }
    }
    
    @keyframes loaderExit {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(1.1);
      }
    }
  `;
  document.head.appendChild(style);

  // Animar el loader screen
  loaderScreen.style.animation = 'loaderExit 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';
  
  // Remover elementos después de la animación
  setTimeout(() => {
    loaderScreen.classList.add('hidden');
    revealOverlay.remove();
    if (loaderScreen.parentNode) {
      loaderScreen.remove();
    }
    startMainAnimation();
  }, 1200);
}

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
});

function startMainAnimation() {
      
  /* ── 1. PARALLAX COORDINADO (ILUSTRACIONES, TEXTOS E HILOS) ── */
  const parallaxElements = document.querySelectorAll('.mural-item, .mural-text, .mural-thread-connector');
  window.addEventListener('scroll', () => {
    let scrolled = window.scrollY;
    parallaxElements.forEach(el => {
      let speed = el.getAttribute('data-speed') || 0.15;
      el.style.setProperty('--scroll-offset', `${scrolled * speed}px`);
    });
  });

  /* ── 2. HILOS GENERATIVOS EN CANVAS ── */
  const canvas = document.getElementById('muralCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const threads = [];
  const numThreads = 25;
  for(let i = 0; i < numThreads; i++) {
    threads.push({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
      history: []
    });
  }

  function animateThreads() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    ctx.fillRect(0, 0, width, height);
    threads.forEach(t => {
      t.history.push({x: t.x, y: t.y});
      if(t.history.length > 150) t.history.shift();
      t.x += t.vx; t.y += t.vy;
      t.vx += (Math.random() - 0.5) * 0.2;
      t.vy += (Math.random() - 0.5) * 0.2;
      const speed = Math.sqrt(t.vx * t.vx + t.vy * t.vy);
      if(speed > 1.5) { t.vx = (t.vx / speed) * 1.5; t.vy = (t.vy / speed) * 1.5; }
      if(t.x < 0 || t.x > width) t.vx *= -1;
      if(t.y < 0 || t.y > height) t.vy *= -1;

      ctx.beginPath();
      ctx.moveTo(t.history[0].x, t.history[0].y);
      for(let i = 1; i < t.history.length; i++) ctx.lineTo(t.history[i].x, t.history[i].y);
      ctx.strokeStyle = 'rgba(180, 30, 30, 0.4)'; ctx.lineWidth = 1.2; ctx.stroke();
    });
    requestAnimationFrame(animateThreads);
  }
  animateThreads();

  /* ── 3. MOTOR AUTOMÁTICO DE STICKERS (CADA 1S) ── */
  const stickers = document.querySelectorAll('.item-5 .sticker-img');
  if (stickers.length > 0) {
    let activeIndex = 0;
    setInterval(() => {
      stickers[activeIndex].classList.remove('active');
      activeIndex = (activeIndex + 1) % stickers.length;
      stickers[activeIndex].classList.add('active');
    }, 1000);
  }

  /* ── 4. VISOR DE GIF ASOCIADO AL ITEM 3 ── */
  const item3 = document.querySelector('.mural-item.item-3'); 
  const gifOverlay = document.getElementById('gifOverlay');
  const gifClose = document.getElementById('gifClose');
  
  if (item3) {
    item3.addEventListener('click', () => {
      gifOverlay.classList.add('open');
      document.body.style.overflow = 'hidden'; // Evita que se haga scroll atrás
    });
  }

  // Cerrar desde la X
  gifClose?.addEventListener('click', () => {
    gifOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });

  // Cerrar al hacer clic en el fondo negro (fuera del GIF)
  gifOverlay?.addEventListener('click', (e) => {
    if (e.target === gifOverlay) {
      gifOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}
