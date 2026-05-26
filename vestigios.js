// ─── VESTIGIOS — JS ───────────────────────────────────────────────

// Fade-in on scroll con IntersectionObserver
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  }
);

fadeEls.forEach((el) => observer.observe(el));


// Botón volver: si hay historial, navega atrás;
// si no (acceso directo), va al index
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (document.referrer && document.referrer !== window.location.href) {
      history.back();
    } else {
      window.location.href = backBtn.getAttribute('href') || '../index.html';
    }
  });
}


// Cursor personalizado: pequeña cruz roja que sigue el mouse
// (sutil, solo en desktop)
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip táctil

  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 6px; height: 6px;
    background: #8b1a1a;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: opacity .3s;
    opacity: 0;
  `;
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
}

initCursor();


// Smooth scroll al click en la flecha del hero
const heroScroll = document.querySelector('.hero-scroll');
if (heroScroll) {
  heroScroll.style.cursor = 'pointer';
  heroScroll.addEventListener('click', () => {
    const target = document.querySelector('.thread');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
}