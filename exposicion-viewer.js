/* ==========================================
   EXPOSICION VIEWER - LÓGICA CORREGIDA
   ========================================== */
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const EXPOSICIONES = {
  1: {
    title: 'Calle Córdoba',
    subtitle: 'Fotográfica',
    location: 'Calle Córdoba',
    year: '2024',
    description: 'Una experiencia visual que captura la esencia de los espacios urbanos. Fotografía documental que explora la interacción entre arquitectura y vida cotidiana.',
    pdf: 'EXPOSICIONES/Calle Córdoba/exposición fotográfica .pdf',
    type: 'pdf'
  },
  2: {
    title: 'Entergalactic',
    subtitle: 'Instalación Interactiva',
    location: 'Espacio Alternativo',
    year: '2024',
    description: 'Inspirada en el capítulo “Bright, Lite and White” de Entergalactic, la instalación explora el conflicto entre la presión de encajar en una estética perfecta y homogénea, y la necesidad de conservar la autenticidad personal y creativa. La pieza está compuesta por dos paneles translúcidos que representan dos sistemas o individuos que, aunque diferentes, comienzan a conectarse y transformarse mutuamente. Los trazos orgánicos negros simbolizan las emociones, la creatividad y las huellas humanas que atraviesan la rigidez de lo impuesto. Detrás de ellos, un juego performático de luces activa constantemente la obra: la luz blanca representa la neutralidad o el vacío, mientras que los colores vibrantes que irrumpen son destellos de identidad pura.',
    images: [
      'EXPOSICIONES/Entergalactic/file_000000005600720e83a916ce99907fc4.png',
      'EXPOSICIONES/Entergalactic/file_00000000755c720e80ef7811fbccdb10.png',
      'EXPOSICIONES/Entergalactic/file_000000009eb4720eb07f94246ede9bd3.png',
      'EXPOSICIONES/Entergalactic/file_00000000f534720e965275837444e5bb.png',
      //'EXPOSICIONES/Entergalactic/image_dd4b8d.jpg',
      //'EXPOSICIONES/Entergalactic/image_dd482e.jpg',
      //'EXPOSICIONES/Entergalactic/image_dd4c49.png',
      //'EXPOSICIONES/Entergalactic/image_dcd486.jpg',
      //'EXPOSICIONES/Entergalactic/image_dc6a57.jpg',
      //'EXPOSICIONES/Entergalactic/image_dcd424.png'
    ],
    type: 'image'
  }
};

const urlParams = new URLSearchParams(window.location.search);
const expId = urlParams.get('id') || 2; 
const currentExp = EXPOSICIONES[expId];

const headerTitle = document.getElementById('headerTitle');
const headerSubtitle = document.getElementById('headerSubtitle');
const loadingScreen = document.getElementById('loadingScreen');
const loadingSubtitle = document.getElementById('loadingSubtitle');
const loadingBar = document.getElementById('loadingBar');

const mainCanvas = document.getElementById('mainCanvas');
const mainImage = document.getElementById('mainImage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageLabel = document.getElementById('pageLabel');
const totalPagesEl = document.getElementById('totalPages');
const progressBar = document.getElementById('progressBar');
const pageDots = document.getElementById('pageDots');

const infoToggleBtn = document.getElementById('infoToggleBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const infoModal = document.getElementById('infoModal');
const closeModalBtn = document.getElementById('closeModalBtn');

let totalItems = 0;
let currentIndex = 0;
let pdfDoc = null;

async function init() {
  if (!currentExp) {
    headerTitle.textContent = 'Exposición no encontrada';
    loadingScreen.classList.add('hidden');
    return;
  }

  headerTitle.textContent = currentExp.title;
  headerSubtitle.textContent = currentExp.subtitle;

  document.getElementById('modalTitle').textContent = currentExp.title;
  document.getElementById('modalLocation').textContent = currentExp.location;
  document.getElementById('modalYear').textContent = currentExp.year;
  document.getElementById('modalDesc').textContent = currentExp.description;

  if (currentExp.type === 'image') {
    totalItems = currentExp.images.length;
    totalPagesEl.textContent = totalItems;
    buildDots();
    
    await loadImage(0);
    
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 500);

  } else if (currentExp.type === 'pdf') {
    try {
      pdfDoc = await pdfjsLib.getDocument(currentExp.pdf).promise;
      totalItems = pdfDoc.numPages;
      totalPagesEl.textContent = totalItems;
      buildDots();
      await renderPdfPage(1);
      loadingScreen.classList.add('hidden');
    } catch (error) {
      console.error(error);
      loadingSubtitle.textContent = 'Error cargando documento';
    }
  }
}

function loadImage(index) {
  return new Promise((resolve) => {
    const imgUrl = currentExp.images[index];
    loadingBar.style.width = '50%';
    
    const tempImg = new Image();
    tempImg.onload = () => {
      mainCanvas.style.display = 'none';
      mainImage.src = imgUrl;
      mainImage.style.display = 'block';
      loadingBar.style.width = '100%';
      updateUI();
      resolve();
    };
    tempImg.src = imgUrl;
  });
}

async function renderPdfPage(pageNum) {
  loadingBar.style.width = '30%';
  mainImage.style.display = 'none';
  mainCanvas.style.display = 'block';

  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2 });
  
  mainCanvas.width = viewport.width;
  mainCanvas.height = viewport.height;
  
  const ctx = mainCanvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: viewport }).promise;
  
  loadingBar.style.width = '100%';
  updateUI();
}

async function showItem(index) {
  if (index < 0 || index >= totalItems) return;
  currentIndex = index;
  
  if (currentExp.type === 'image') {
    await loadImage(currentIndex);
  } else {
    await renderPdfPage(currentIndex + 1);
  }
}

function updateUI() {
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === totalItems - 1;
  
  pageLabel.textContent = `Página ${currentIndex + 1}`;
  progressBar.style.width = `${((currentIndex + 1) / totalItems) * 100}%`;

  document.querySelectorAll('.exp-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentIndex);
  });
}

function buildDots() {
  pageDots.innerHTML = '';
  for (let i = 0; i < totalItems; i++) {
    const d = document.createElement('div');
    d.className = 'exp-dot';
    d.addEventListener('click', () => showItem(i));
    pageDots.appendChild(d);
  }
}

prevBtn.addEventListener('click', () => showItem(currentIndex - 1));
nextBtn.addEventListener('click', () => showItem(currentIndex + 1));
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') showItem(currentIndex + 1);
  if (e.key === 'ArrowLeft') showItem(currentIndex - 1);
});

infoToggleBtn.addEventListener('click', () => infoModal.classList.add('open'));
closeModalBtn.addEventListener('click', () => infoModal.classList.remove('open'));
infoModal.addEventListener('click', (e) => {
  if (e.target === infoModal) infoModal.classList.remove('open');
});

// ENTRAR Y SALIR DE PANTALLA COMPLETA
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.log(err));
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
});

let touchStartX = 0;
const canvasWrap = document.getElementById('canvasWrap');

canvasWrap.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

canvasWrap.addEventListener('touchend', (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX - touchEndX;

  if (diff > 50) showItem(currentIndex + 1);
  if (diff < -50) showItem(currentIndex - 1);
});

init();