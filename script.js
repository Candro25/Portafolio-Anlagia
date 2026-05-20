// --- 0. LOADER ---
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hide');
    setTimeout(() => { loader.style.display = 'none'; }, 650);
  }, 2200);
});

document.addEventListener('DOMContentLoaded', () => {

// --- 1. SMART SCROLL NAVBAR ---
const nav      = document.getElementById('nav');
const highlight = document.getElementById('highlight');
const navLinks  = document.querySelectorAll('.nav-link');
let lastScrollY = window.scrollY;

// Pill hover — calculada relativa al nav-inner, no al nav entero
function moveHighlight(el) {
  const navInner = nav.querySelector('.nav-inner');
  const baseRect  = navInner.getBoundingClientRect();
  const elRect    = el.getBoundingClientRect();
  highlight.style.width   = elRect.width  + 'px';
  highlight.style.height  = elRect.height + 'px';
  highlight.style.left    = (elRect.left - baseRect.left) + 'px';
  highlight.style.top     = (elRect.top  - baseRect.top)  + 'px';
  highlight.style.opacity = '1';
}

navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => moveHighlight(link));
  link.addEventListener('click', () => {
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

nav.addEventListener('mouseleave', () => { highlight.style.opacity = '0'; });

// Smart scroll
window.addEventListener('scroll', () => {
  const curr = window.scrollY;
  if (curr <= 60) {
    nav.classList.remove('scroll-up', 'scroll-down');
  } else if (curr > lastScrollY) {
    nav.classList.replace('scroll-up', 'scroll-down') || nav.classList.add('scroll-down');
  } else {
    nav.classList.replace('scroll-down', 'scroll-up') || nav.classList.add('scroll-up');
  }
  lastScrollY = curr;
  updateActiveLink();
});

function updateActiveLink() {
    const sections = ['about', 'portafolio', 'conectemos'];
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

// --- FIN NAVBAR --- //
// (deja aquí tu código de efectos magnéticos y demás secciones sin cambios)
    // --- 2. EFECTO MAGNÉTICO (Botones Vivos) ---
    const magnetics = document.querySelectorAll('.magnetic');

    magnetics.forEach((elem) => {
        elem.addEventListener('mousemove', (e) => {
            const position = elem.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            
            // Ajusta el "0.3" para que el efecto sea más o menos fuerte
            elem.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        elem.addEventListener('mouseleave', () => {
            // Regresa a su posición original con animación suave
            elem.style.transform = 'translate(0px, 0px)';
        });
    });

});

// --- 3. HERO — audio + parallax ---
const heroVideo = document.getElementById('heroVideo');
const audioBtn  = document.getElementById('audioBtn');

if (audioBtn && heroVideo) {
  audioBtn.addEventListener('click', () => {
    const muted = heroVideo.muted;
    heroVideo.muted = !muted;
    audioBtn.querySelector('.icon-muted').style.display = muted ? 'none'  : '';
    audioBtn.querySelector('.icon-sound').style.display = muted ? ''      : 'none';
  });
}

// Parallax suave del texto al mover el mouse
const heroSection   = document.querySelector('.hero');
const heroTextBlock = document.querySelector('.hero-text-block');

if (heroSection && heroTextBlock) {
  heroSection.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx; // -1 a 1
    const dy = (e.clientY - cy) / cy;
    heroTextBlock.style.transform = `translate(${dx * -10}px, ${dy * -6}px)`;
  });
  heroSection.addEventListener('mouseleave', () => {
    heroTextBlock.style.transform = 'translate(0,0)';
  });
}
  // --- 4. ABOUT — reveal + tilt 3D foto ---
const aboutPhoto = document.querySelector('.about-photo-wrap');
const aboutText  = document.querySelector('.about-text-col');
const photoTilt  = document.getElementById('photoTilt');

// Reveal al scroll
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.18 });

if (aboutPhoto) revealObs.observe(aboutPhoto);
if (aboutText)  revealObs.observe(aboutText);

// Tilt 3D suave en la foto
if (photoTilt) {
  photoTilt.addEventListener('mousemove', (e) => {
    const rect = photoTilt.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2); // -1 a 1
    const dy   = (e.clientY - cy) / (rect.height / 2);

    const rotX =  dy * -10; // inclinación vertical
    const rotY =  dx *  10; // inclinación horizontal

    photoTilt.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;

    // Brillo sigue el mouse
    const shineX = ((e.clientX - rect.left) / rect.width)  * 100;
    const shineY = ((e.clientY - rect.top)  / rect.height) * 100;
    photoTilt.querySelector('.about-photo-shine').style.background =
      `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.15) 0%, transparent 65%)`;
  });

  photoTilt.addEventListener('mouseleave', () => {
    photoTilt.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    photoTilt.style.transition = 'transform 0.55s cubic-bezier(0.25,1,0.5,1)';
    setTimeout(() => { photoTilt.style.transition = 'transform 0.08s linear'; }, 550);
  });
}

// --- 5. PORTFOLIO TABS + OTROS DROPDOWN ---
const tabBtns      = document.querySelectorAll('.tab-btn');
const tabPanels    = document.querySelectorAll('.tab-panel');
const tabLine      = document.getElementById('tabLine');
const tabOtrosWrap = document.getElementById('tabOtrosWrap');
const tabOtrosBtn  = document.getElementById('tabOtrosBtn');
const otrosSubBtns = document.querySelectorAll('.otros-sub-btn');

function moveTabLine(btn) {
  const wrapRect = document.querySelector('.tabs-wrap').getBoundingClientRect();
  const btnRect  = btn.getBoundingClientRect();
  tabLine.style.left  = (btnRect.left - wrapRect.left) + 'px';
  tabLine.style.width = btnRect.width + 'px';
}

const firstTab = document.querySelector('.tab-btn.active');
if (firstTab) moveTabLine(firstTab);

function openOtrosDropdown()  { tabOtrosWrap?.classList.add('open'); }
function closeOtrosDropdown() { tabOtrosWrap?.classList.remove('open'); }

// Hover solo en dispositivos que lo soportan
if (window.matchMedia('(hover: hover)').matches) {
  tabOtrosWrap?.addEventListener('mouseenter', openOtrosDropdown);
  tabOtrosWrap?.addEventListener('mouseleave', closeOtrosDropdown);
}

// Click/touch siempre
tabOtrosBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = tabOtrosWrap.classList.contains('open');
  if (isOpen) {
    closeOtrosDropdown();
    activateTab('otros');
    filterOtros('all');
  } else {
    openOtrosDropdown();
  }
});

// Cerrar al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!tabOtrosWrap?.contains(e.target)) closeOtrosDropdown();
});

function activateTab(tabId) {
  tabBtns.forEach(b => b.classList.remove('active'));
  tabPanels.forEach(p => p.classList.remove('active'));
  const btn   = document.querySelector(`[data-tab="${tabId}"]`);
  const panel = document.getElementById(`tab-${tabId}`);
  if (btn)   { btn.classList.add('active'); moveTabLine(btn); }
  if (panel) { panel.classList.add('active'); revealGalleryItems(panel); }
}

tabBtns.forEach(btn => {
  if (btn === tabOtrosBtn) return;
  btn.addEventListener('click', () => {
    closeOtrosDropdown();
    activateTab(btn.dataset.tab);
  });
});

function filterOtros(sub) {
  const items = document.querySelectorAll('#otrosGrid .gallery-item');
  
  if (sub === 'all') {
    // Mostrar solo la primera imagen de cada subcategoría
    const seen = {};
    items.forEach(item => {
      const itemSub = item.dataset.sub;
      if (!seen[itemSub]) {
        seen[itemSub] = true;
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  } else {
    // Mostrar solo las de esa subcategoría
    items.forEach(item => {
      item.style.display = item.dataset.sub === sub ? '' : 'none';
    });
  }
  revealGalleryItems(document.getElementById('tab-otros'));
}

otrosSubBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    otrosSubBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    closeOtrosDropdown();
    activateTab('otros');
    filterOtros(btn.dataset.sub);
  });
});

function revealGalleryItems(panel) {
  if (!panel) return;
  const items = panel.querySelectorAll('.gallery-item');
  items.forEach((item, i) => {
    setTimeout(() => {
      item.classList.add('visible');
      item.style.transition =
        `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s,
         transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`;
    }, i * 80);
  });
}

const portfolioObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const activePanel = document.querySelector('.tab-panel.active');
      if (activePanel) revealGalleryItems(activePanel);
      portfolioObs.disconnect();
    }
  });
}, { threshold: 0.1 });

const portfolioSection = document.querySelector('.portfolio-section');
if (portfolioSection) portfolioObs.observe(portfolioSection);

// --- 6. FOOTER — letras interactivas + formulario ---

// Letras interactivas
const footerPhrase = document.getElementById('footerPhrase');
if (footerPhrase) {
  const words = footerPhrase.innerText.split(' ');
  footerPhrase.innerHTML = '';

  words.forEach((word, wi) => {
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('footer-word');

    word.split('').forEach(char => {
      const span = document.createElement('span');
      span.classList.add('footer-char');
      span.textContent = char;
      wordSpan.appendChild(span);
    });

    footerPhrase.appendChild(wordSpan);
  });
}

// Formulario — envío asíncrono y feedback visual
const footerForm = document.getElementById('footerForm');

if (footerForm) {
  footerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const btn  = footerForm.querySelector('.form-submit');
    const text = btn.querySelector('.submit-text');
    const arrow = btn.querySelector('.submit-arrow');

    // Opcional: Feedback visual de que está procesando
    const originalText = text.textContent;
    text.textContent = 'Enviando...';

    // Captura automática de todos los campos con atributo 'name'
    const formData = new FormData(footerForm);

    try {
      // Petición POST al endpoint de Formspree
      const response = await fetch('https://formspree.io/f/mpqnwqzb', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Tu animación original de éxito
        text.textContent  = '¡Enviado!';
        arrow.textContent = '✓';
        btn.style.background = '#3d7a5a';
        btn.style.transform  = 'translateY(-2px)';

        // Resetear después de 3 segundos
        setTimeout(() => {
          text.textContent  = 'Enviar mensaje';
          arrow.textContent = '→';
          btn.style.background = '';
          btn.style.transform  = '';
          footerForm.reset();
        }, 3000);
      } else {
        // Si hay un error del lado del servidor (ej. formato inválido)
        text.textContent = 'Hubo un error';
        setTimeout(() => text.textContent = originalText, 3000);
      }
    } catch (error) {
      // Si falla la conexión a internet
      console.error('Error al enviar:', error);
      text.textContent = 'Error de conexión';
      setTimeout(() => text.textContent = originalText, 3000);
    }
  });
}




// Modal Hoja de Vida
const cvBtn = document.getElementById('cvBtn');
const cvOverlay = document.getElementById('cvOverlay');
const cvClose = document.getElementById('cvClose');

// Abrir el modal
cvBtn?.addEventListener('click', () => {
  cvOverlay.classList.add('open');
});

// Cerrar desde la 'X'
cvClose?.addEventListener('click', () => {
  cvOverlay.classList.remove('open');
});

// Cerrar haciendo clic fuera del modal
cvOverlay?.addEventListener('click', (e) => {
  if (e.target === cvOverlay) {
    cvOverlay.classList.remove('open');
  }
});

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cvOverlay?.classList.contains('open')) {
    cvOverlay.classList.remove('open');
  }
});