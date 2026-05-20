document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar (mismo comportamiento que index) ──
  const nav       = document.getElementById('nav');
  const highlight  = document.getElementById('highlight');
  const navLinks   = document.querySelectorAll('.nav-link');
  let lastScrollY  = window.scrollY;

  function moveHighlight(el) {
    const base   = nav.querySelector('.nav-inner').getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    highlight.style.width   = elRect.width  + 'px';
    highlight.style.height  = elRect.height + 'px';
    highlight.style.left    = (elRect.left - base.left) + 'px';
    highlight.style.top     = (elRect.top  - base.top)  + 'px';
    highlight.style.opacity = '1';
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => moveHighlight(link));
  });
  nav.addEventListener('mouseleave', () => { highlight.style.opacity = '0'; });

  window.addEventListener('scroll', () => {
    const curr = window.scrollY;
    if (curr <= 60) {
      nav.classList.remove('scroll-up', 'scroll-down');
    } else if (curr > lastScrollY) {
      nav.classList.remove('scroll-up');
      nav.classList.add('scroll-down');
    } else {
      nav.classList.remove('scroll-down');
      nav.classList.add('scroll-up');
    }
    lastScrollY = curr;
  });

  // ── Espíritu navbar ──
  const spirit = document.getElementById('navSpirit');
  if (spirit) {
    nav.addEventListener('mouseenter', () => spirit.classList.add('spirit-awake'));
    nav.addEventListener('mouseleave', () => spirit.classList.remove('spirit-awake'));
  }

  // ── Reveal al scroll ──
  const items = document.querySelectorAll('.ilus-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(item => obs.observe(item));

  // ── Filtros ──
  const filterBtns = document.querySelectorAll('.filter-btn');
  const countEl    = document.getElementById('ilusCount');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visible  = 0;

      items.forEach(item => {
        item.style.position = '';
        item.style.visibility = '';
        
        const tags = item.dataset.tags || '';
        if (filter === 'all' || tags.includes('reciente')) {
          item.classList.remove('hidden');
          visible++;
        } else {
          item.classList.add('hidden');
        }
      });

      if (countEl) {
        countEl.textContent = visible + (visible === 1 ? ' proyecto' : ' proyectos');
      }
    });
  });

  // ── Footer letras interactivas ──
  const footerPhrase = document.getElementById('footerPhrase');
  if (footerPhrase) {
    const words = footerPhrase.innerText.split(' ');
    footerPhrase.innerHTML = '';
    words.forEach(word => {
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

  // ── Footer formulario ──
  const footerForm = document.getElementById('footerForm');
  if (footerForm) {
    footerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn   = footerForm.querySelector('.form-submit');
      const text  = btn.querySelector('.submit-text');
      const arrow = btn.querySelector('.submit-arrow');
      text.textContent  = '¡Enviado!';
      arrow.textContent = '✓';
      btn.style.background = '#3d7a5a';
      setTimeout(() => {
        text.textContent  = 'Enviar mensaje';
        arrow.textContent = '→';
        btn.style.background = '';
        footerForm.reset();
      }, 3000);
    });
  }

  // ── Título letras interactivas ──
  const ilusTitle = document.getElementById('ilusTitle');
  if (ilusTitle) {
    const text = ilusTitle.innerText;
    ilusTitle.innerHTML = '';
    text.split('').forEach(char => {
      const span = document.createElement('span');
      span.classList.add('ilus-title-char');
      span.textContent = char === ' ' ? '\u00A0' : char;
      ilusTitle.appendChild(span);
    });
  }

  // ── Botón volver arriba ──
  const backTop = document.getElementById('backTop');
  let lastScrollYBack = window.scrollY;

  window.addEventListener('scroll', () => {
    const curr = window.scrollY;
    if (curr > 400 && curr < lastScrollYBack) {
      backTop.classList.add('visible');
    } else {
      backTop.classList.remove('visible');
    }
    lastScrollYBack = curr;
  });

  backTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ==========================================
  //  MOTOR UNIVERSAL DE MODALES 3D (TEXTILES)
  // ==========================================
  
  function initGalleryModal(openBtnId, modalId) {
    const openModalBtn = document.getElementById(openBtnId);
    const modal = document.getElementById(modalId);
    if (!modal || !openModalBtn) return;

    const closeModalBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    const prevBtn = modal.querySelector('.prev');
    const nextBtn = modal.querySelector('.next');
    const counter = modal.querySelector('.nav-counter');
    const galleryItems = modal.querySelectorAll('.gallery-3d-item');
    
    let currentIndex = 0;
    const totalItems = galleryItems.length;
    const positions = ['position-center', 'position-right', 'position-left', 'position-hidden'];

    // Abrir modal
    openModalBtn.addEventListener('click', () => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; 
      updateGalleryPositions();
    });

    // Cerrar modal
    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      resetTiltEffect();
    };

    closeModalBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    function updateGalleryPositions() {
      galleryItems.forEach((item, index) => {
        item.classList.remove(...positions);
        
        let relativePos = (index - currentIndex + totalItems) % totalItems;
        
        if (relativePos === 0) {
          item.classList.add('position-center');
        } else if (relativePos === 1) {
          item.classList.add('position-right');
        } else if (relativePos === totalItems - 1 && totalItems > 2) {
          item.classList.add('position-left');
        } else {
          item.classList.add('position-hidden'); 
        }
      });

      if (counter) counter.textContent = `${currentIndex + 1} / ${totalItems}`;
      resetTiltEffect();
      initTiltOnActive();
    }

    prevBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + totalItems) % totalItems;
      updateGalleryPositions();
    });

    nextBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % totalItems;
      updateGalleryPositions();
    });

    galleryItems.forEach((item) => {
      item.addEventListener('click', () => {
        if (!item.classList.contains('position-center') && !item.classList.contains('position-hidden')) {
          currentIndex = parseInt(item.getAttribute('data-index'));
          updateGalleryPositions();
        }
      });
    });

    // --- EFECTO TILT 3D INTERACTIVO ---
    function initTiltOnActive() {
      const activeCard = modal.querySelector('.gallery-3d-item.position-center .notebook-card');
      if (!activeCard) return;

      activeCard.addEventListener('mousemove', (e) => {
        const rect = activeCard.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top; 
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((centerY - y) / centerY) * 20;
        const rotateY = ((x - centerX) / centerX) * 20;

        activeCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      });

      activeCard.addEventListener('mouseleave', () => {
        activeCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      });
    }

    function resetTiltEffect() {
      const allCards = modal.querySelectorAll('.notebook-card');
      allCards.forEach(card => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
      });
    }
  }

  // Inicializar TODOS los modales de textiles que existen
  initGalleryModal('open-textil-1', 'modal-textil-1');
  initGalleryModal('open-textil-2', 'modal-textil-2');
  initGalleryModal('open-textil-3', 'modal-textil-3');
  initGalleryModal('open-textil-4', 'modal-textil-4');
  initGalleryModal('open-textil-5', 'modal-textil-5');
  initGalleryModal('open-textil-6', 'modal-textil-6');

});