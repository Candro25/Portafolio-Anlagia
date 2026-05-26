document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar ──
  const nav      = document.getElementById('nav');
  const highlight = document.getElementById('highlight');
  const navLinks  = document.querySelectorAll('.nav-link');
  let lastScrollY = window.scrollY;
  
  // Detectar si es dispositivo táctil
  const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
  };

  function moveHighlight(el) {
    if (isTouchDevice()) return; // No usar highlight en dispositivos táctiles
    
    const base   = nav.querySelector('.nav-inner').getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    highlight.style.width   = elRect.width  + 'px';
    highlight.style.height  = elRect.height + 'px';
    highlight.style.left    = (elRect.left - base.left) + 'px';
    highlight.style.top     = (elRect.top  - base.top)  + 'px';
    highlight.style.opacity = '1';
  }

  // Solo agregar listeners de mouse si NO es dispositivo táctil
  if (!isTouchDevice()) {
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => moveHighlight(link));
    });
    nav.addEventListener('mouseleave', () => { highlight.style.opacity = '0'; });
  } else {
    // En dispositivos táctiles, usar active state
    navLinks.forEach(link => {
      link.addEventListener('touchstart', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }, { passive: false });

      link.addEventListener('click', (e) => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

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
    updateIndexActive();
  });

  // ── Espíritu ──
  const spirit = document.getElementById('navSpirit');
  if (spirit && !isTouchDevice()) {
    nav.addEventListener('mouseenter', () => spirit.classList.add('spirit-awake'));
    nav.addEventListener('mouseleave', () => spirit.classList.remove('spirit-awake'));
  }

  // ── Índice activo según scroll ──
  const catSections = document.querySelectorAll('.otros-cat-section');
  const indexLinks  = document.querySelectorAll('.otros-index-link, .otros-index-link-m');
  let isClickingIndexLink = false;

  function updateIndexActive() {
    let current = '';
    catSections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= window.innerHeight * 0.4) {
        current = sec.id;
      }
    });
    indexLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.target === current) link.classList.add('active');
    });
  }

  // Soporte para click/touch en links del índice
  indexLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      isClickingIndexLink = true;
      const target = link.dataset.target;
      const section = document.getElementById(target);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          isClickingIndexLink = false;
          updateIndexActive();
        }, 800);
      }
    });

    link.addEventListener('touchend', (e) => {
      e.preventDefault();
      isClickingIndexLink = true;
      const target = link.dataset.target;
      const section = document.getElementById(target);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          isClickingIndexLink = false;
          updateIndexActive();
        }, 800);
      }
    }, { passive: false });
  });

  // ── Reveal secciones y items al scroll ──
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Reveal de los items dentro de la sección con desfase
        const items = e.target.querySelectorAll('.otros-item');
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add('visible'), i * 100);
        });
        sectionObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  catSections.forEach(sec => sectionObs.observe(sec));

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

  // ==========================================
  //  MOTOR UNIVERSAL DE MODALES 3D
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
    
    // Touch swipe variables
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    openModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; 
      updateGalleryPositions();
      addSwipeListeners();
    });

    openModalBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; 
      updateGalleryPositions();
      addSwipeListeners();
    }, { passive: false });

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      resetTiltEffect();
      removeSwipeListeners();
    };

    closeModalBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    
    // Cerrar con ESC en desktop
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);

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

    const handlePrevClick = () => {
      currentIndex = (currentIndex - 1 + totalItems) % totalItems;
      updateGalleryPositions();
    };

    const handleNextClick = () => {
      currentIndex = (currentIndex + 1) % totalItems;
      updateGalleryPositions();
    };

    prevBtn?.addEventListener('click', handlePrevClick);
    nextBtn?.addEventListener('click', handleNextClick);
    
    // Touch support para botones
    prevBtn?.addEventListener('touchend', (e) => {
      e.preventDefault();
      handlePrevClick();
    }, { passive: false });
    
    nextBtn?.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleNextClick();
    }, { passive: false });

    galleryItems.forEach((item) => {
      item.addEventListener('click', () => {
        if (!item.classList.contains('position-center') && !item.classList.contains('position-hidden')) {
          currentIndex = parseInt(item.getAttribute('data-index'));
          updateGalleryPositions();
        }
      });
      
      item.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!item.classList.contains('position-center') && !item.classList.contains('position-hidden')) {
          currentIndex = parseInt(item.getAttribute('data-index'));
          updateGalleryPositions();
        }
      }, { passive: false });
    });

    function handleSwipe() {
      const xDiff = touchEndX - touchStartX;
      const yDiff = Math.abs(touchEndY - touchStartY);
      
      // Detectar swipe solo si es principalmente horizontal
      if (Math.abs(xDiff) > 50 && yDiff < 100) {
        if (xDiff > 0) {
          // Swipe derecha = anterior
          handlePrevClick();
        } else {
          // Swipe izquierda = siguiente
          handleNextClick();
        }
      }
    }

    function addSwipeListeners() {
      const container = modal.querySelector('.gallery-3d-container');
      if (!container) return;
      
      container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
      }, { passive: true });
    }

    function removeSwipeListeners() {
      const container = modal.querySelector('.gallery-3d-container');
      if (!container) return;
      // Los event listeners se removerán automáticamente cuando se reconstruya
    }

    function initTiltOnActive() {
      const activeCard = modal.querySelector('.gallery-3d-item.position-center .notebook-card');
      if (!activeCard) return;

      // Deshabilitar tilt en dispositivos táctiles (mobile/tablet)
      const isTouchDevice = () => {
        return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
      };

      if (isTouchDevice()) {
        // En dispositivos táctiles, no usar mousemove
        return;
      }

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

  // Inicializar TODOS los modales que existen
  initGalleryModal('open-libretas', 'libretasModal');
  initGalleryModal('open-juego-1', 'modal-juego-1');
  initGalleryModal('open-juego-2', 'modal-juego-2');
  initGalleryModal('open-juego-3', 'modal-juego-3');
  initGalleryModal('open-juego-4', 'modal-juego-4');
  initGalleryModal('open-juego-5', 'modal-juego-5');

});