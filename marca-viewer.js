pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let totalPages = 0;
let spread = 0;
let maxSpreads = 0;
let isFlipping = false;
let pdfAspectRatio = 0.707; 
let isInitialized = false; 
const pageCache = {};

// Captura de elementos
const leftSlot    = document.getElementById('leftSlot');
const rightSlot   = document.getElementById('rightSlot');
const leftCanvas  = document.getElementById('leftCanvas');
const rightCanvas = document.getElementById('rightCanvas');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');
const pageLabel   = document.getElementById('pageLabel');
const pageDots    = document.getElementById('pageDots');
const loadingEl   = document.getElementById('loadingScreen');
const marcaTitle  = document.getElementById('marcaTitle');
const marcaDesc   = document.getElementById('marcaDesc');
const mainStage   = document.getElementById('mainStage');
const marcaVideo  = document.getElementById('marcaVideo');
const bookScene   = document.querySelector('.book-scene');
const book        = document.getElementById('book');

// Captura de elementos internos nuevos
const bookInnerTitle = document.getElementById('bookInnerTitle');
const bookInnerDesc  = document.getElementById('bookInnerDesc');

const urlParams = new URLSearchParams(window.location.search);
const marcaId = urlParams.get('id') || '1';

const configuracionMarcas = {
  '1': { 
    titulo: 'Buñuelos y Más', 
    descripcion: 'Proyecto de rediseño integral enfocado en transformar la identidad visual de Buñuelos y Más en un sistema contemporáneo, funcional y memorable. A partir de una síntesis formal basada en curvas orgánicas y una paleta cromática de amarillos y naranjas, la nueva propuesta resuelve problemas compositivos previos, logrando una marca coherente y adaptable a múltiples puntos de contacto físicos y digitales.',
    pdf: 'MARCA/Bunuelos y mas/bunuelos.pdf'
  },
  '2': { 
    titulo: 'Neolegendarios', 
    descripcion: 'NeO Legendarioz: la colección de streetwear de Adidas Originals, Alcolirykoz y Toxicómano Callejero. Una fusión perfecta de carácter, música y arte urbano bajo una misma premisa: llevar la esencia de la calle hecha memoria, verso y tinta.',
    pdf: 'MARCA/Neolegendarios/neo.pdf', 
    video: 'MARCA/Neolegendarios/neo.mp4' 
  },
  '3': { 
    titulo: 'Que Parche Medellín', 
    descripcion: '"Qué parche MEDELLÍN" es una propuesta de marca ciudad basada en el lema "Una identidad que se parcha con la gente", cuyo concepto humaniza a la ciudad para reflejar su cultura callejera, arte urbano y parlache paisa. Su objetivo es posicionar a Medellín como un destino cultural auténtico y conectar emocionalmente con locales y turistas mediante una identidad visual juvenil y colorida (llena de doodles de personajes típicos), articulada a través de una campaña de un año que combina redes sociales, publicidad en el metro y rutas guiadas por zonas clave.',
    pdf: 'MARCA/parche/parche.pdf' 
  },
  '4': { 
    titulo: 'Eif', 
    descripcion: 'EIF es el encuentro anual de Investigación–Creación y Transferencia de Bellas Artes. Es un espacio de conexión, colaboración y exploración entre saberes, disciplinas y personas. La marca representa movimiento, participación y creación colectiva. Una celebración del arte, la ciencia y la imaginación.',
    pdf: 'MARCA/Eif/eif.pdf' 
  }
};

const configActual = configuracionMarcas[marcaId] || configuracionMarcas['1'];

// Sincronizamos la información en ambas posiciones (lateral e interna)
marcaTitle.textContent = configActual.titulo;
marcaDesc.textContent = configActual.descripcion;
bookInnerTitle.textContent = configActual.titulo;
bookInnerDesc.textContent = configActual.descripcion;

if (configActual.video) {
  mainStage.classList.add('has-video');
  marcaVideo.src = configActual.video;
}

// ── ALGORITMO DE AJUSTE DE TAMAÑO FULL-SCREEN DINÁMICO ──
function resizeBook() {
  if (!pdfDoc) return;

  let stageH = bookScene.clientHeight;
  
  // SI HAY VIDEO: Le restamos espacio al alto para que el título e inner-desc quepan perfectamente arriba de la revista
  if (mainStage.classList.contains('has-video')) {
    stageH -= 100; 
  }

  const stageW = bookScene.clientWidth - 140; 
  const spreadRatio = pdfAspectRatio * 2;

  let bookH = stageH;
  let bookW = bookH * spreadRatio;

  if (bookW > stageW) {
    bookW = stageW;
    bookH = bookW / spreadRatio;
  }

  const slotW = bookW / 2;

  leftSlot.style.width = `${slotW}px`;
  leftSlot.style.height = `${bookH}px`;
  rightSlot.style.width = `${slotW}px`;
  rightSlot.style.height = `${bookH}px`;

  if (pdfDoc && isInitialized) {
    showSpread(spread);
  }
}

window.addEventListener('resize', () => {
  clearTimeout(window.resizeTimer);
  window.resizeTimer = setTimeout(resizeBook, 150);
});

// ── RENDERIZADO ADAPTATIVO ──
async function renderPageToCanvas(pageNum, canvas) {
  const targetWidth = leftSlot.clientWidth || 300;
  const targetHeight = leftSlot.clientHeight || 420;

  if (pageNum < 1 || pageNum > totalPages) {
    const ctx = canvas.getContext('2d');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.fillStyle = '#141416'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const page = await pdfDoc.getPage(pageNum);
  const unscaledViewport = page.getViewport({ scale: 1 });
  const optimalScale = (targetWidth / unscaledViewport.width) * window.devicePixelRatio * 1.3;
  const viewport = page.getViewport({ scale: optimalScale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: canvas.getContext('2d'),
    viewport: viewport
  }).promise;
}

function cloneCanvas(oldCanvas) {
  const newCanvas = document.createElement('canvas');
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;
  const ctx = newCanvas.getContext('2d');
  ctx.drawImage(oldCanvas, 0, 0);
  return newCanvas;
}

// ── CONTROL DE LA REVISTA Y ANIMACIÓN 3D ──
function buildDots() {
  pageDots.innerHTML = '';
  for (let i = 0; i < maxSpreads; i++) {
    const d = document.createElement('div');
    d.className = 'page-dot';
    d.addEventListener('click', () => { if (i !== spread && !isFlipping) goToSpread(i); });
    pageDots.appendChild(d);
  }
}

function updateDots() {
  document.querySelectorAll('.page-dot').forEach((d, i) => {
    d.classList.toggle('active', i === spread);
  });
}

async function showSpread(s) {
  spread = s;
  const leftPage  = spread === 0 ? 0 : spread * 2 - 1;
  const rightPage = spread === 0 ? 1 : spread * 2;

  await Promise.all([
    renderPageToCanvas(leftPage, leftCanvas),
    renderPageToCanvas(rightPage, rightCanvas)
  ]);

  updateLabels(leftPage, rightPage);
  leftSlot.style.opacity = spread === 0 ? '0' : '1';
}

function updateLabels(leftPageNum, rightPageNum) {
  if (spread === 0) pageLabel.textContent = 'PORTADA';
  else if (spread === maxSpreads - 1 && rightPageNum > totalPages) pageLabel.textContent = 'CONTRAPORTADA';
  else pageLabel.textContent = `PÁGINAS ${leftPageNum} - ${rightPageNum}`;
  updateDots();
  updateButtons();
}

async function turnPage(dir) {
  if (isFlipping) return;
  const nextSpread = spread + dir;
  if (nextSpread < 0 || nextSpread >= maxSpreads) return;

  isFlipping = true;
  updateButtons();

  const currentLeftClone = cloneCanvas(leftCanvas);
  const currentRightClone = cloneCanvas(rightCanvas);

  const flipper = document.createElement('div');
  flipper.className = `book-flipper ${dir === 1 ? 'flip-next' : 'flip-prev'}`;
  
  const front = document.createElement('div');
  front.className = 'flipper-face flipper-front';
  const back = document.createElement('div');
  back.className = 'flipper-face flipper-back';

  flipper.appendChild(front);
  flipper.appendChild(back);
  book.appendChild(flipper);

  const leftPageNum  = nextSpread === 0 ? 0 : nextSpread * 2 - 1;
  const rightPageNum = nextSpread === 0 ? 1 : nextSpread * 2;

  const nextLeftCanvas = document.createElement('canvas');
  const nextRightCanvas = document.createElement('canvas');
  
  await Promise.all([
    renderPageToCanvas(leftPageNum, nextLeftCanvas),
    renderPageToCanvas(rightPageNum, nextRightCanvas)
  ]);

  if (dir === 1) {
    front.appendChild(currentRightClone);
    back.appendChild(cloneCanvas(nextLeftCanvas));
    rightCanvas.getContext('2d').clearRect(0, 0, rightCanvas.width, rightCanvas.height);
    rightCanvas.width = nextRightCanvas.width;
    rightCanvas.height = nextRightCanvas.height;
    rightCanvas.getContext('2d').drawImage(nextRightCanvas, 0, 0);
  } else {
    front.appendChild(currentLeftClone);
    back.appendChild(cloneCanvas(nextRightCanvas));
    leftCanvas.getContext('2d').clearRect(0, 0, leftCanvas.width, leftCanvas.height);
    leftCanvas.width = nextLeftCanvas.width;
    leftCanvas.height = nextLeftCanvas.height;
    leftCanvas.getContext('2d').drawImage(nextLeftCanvas, 0, 0);
    leftSlot.style.opacity = nextSpread === 0 ? '0' : '1';
  }

  flipper.offsetWidth; 
  flipper.classList.add('flipping');

  spread = nextSpread;
  updateLabels(leftPageNum, rightPageNum);

  setTimeout(() => {
    if (dir === 1) {
      leftCanvas.getContext('2d').clearRect(0, 0, leftCanvas.width, leftCanvas.height);
      leftCanvas.width = nextLeftCanvas.width;
      leftCanvas.height = nextLeftCanvas.height;
      leftCanvas.getContext('2d').drawImage(nextLeftCanvas, 0, 0);
      leftSlot.style.opacity = spread === 0 ? '0' : '1';
    } else {
      rightCanvas.getContext('2d').clearRect(0, 0, rightCanvas.width, rightCanvas.height);
      rightCanvas.width = nextRightCanvas.width;
      rightCanvas.height = nextRightCanvas.height;
      rightCanvas.getContext('2d').drawImage(nextRightCanvas, 0, 0);
    }
    flipper.remove();
    isFlipping = false;
    updateButtons();
  }, 800);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') turnPage(1);
  if (e.key === 'ArrowLeft')  turnPage(-1);
});

prevBtn.addEventListener('click', () => turnPage(-1));
nextBtn.addEventListener('click', () => turnPage(1));

// ── TOUCH SUPPORT (SWIPE) ──
let touchStartX = 0;
let touchEndX = 0;

function handleGesture() {
  if (touchEndX < touchStartX - 50) {
    // Swiped left → next page
    turnPage(1);
  }
  if (touchEndX > touchStartX + 50) {
    // Swiped right → prev page
    turnPage(-1);
  }
}

book.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, false);

book.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleGesture();
}, false);

// Touch support for buttons on mobile
[prevBtn, nextBtn].forEach(btn => {
  btn.addEventListener('touchstart', function() {
    this.style.transform = 'scale(0.95)';
  });
  
  btn.addEventListener('touchend', function() {
    this.style.transform = 'scale(1)';
  });
});

function goToSpread(s) { showSpread(s); }

function updateButtons() {
  prevBtn.disabled = spread === 0 || isFlipping;
  nextBtn.disabled = spread >= maxSpreads - 1 || isFlipping;
}

// ── MOTOR DE INICIALIZACIÓN ──
async function init() {
  try {
    const pdfUrl = configActual.pdf;
    console.log("Iniciando carga de PDF:", pdfUrl);
    
    pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
    totalPages = pdfDoc.numPages;
    maxSpreads = 1 + Math.ceil((totalPages - 1) / 2);

    const firstPage = await pdfDoc.getPage(1);
    const view = firstPage.getViewport({ scale: 1 });
    pdfAspectRatio = view.width / view.height;

    resizeBook(); 
    buildDots();
    await showSpread(0); 

    isInitialized = true; 

    setTimeout(() => {
      loadingEl.classList.add('hidden');
    }, 600);

  } catch (err) {
    console.error('Error detectado:', err);
    loadingEl.classList.add('hidden');
    
    const bookContainer = document.getElementById('book');
    bookContainer.style.background = "transparent";
    bookContainer.style.boxShadow = "none";
    bookContainer.innerHTML = `
      <div style="text-align: center; color: var(--brand-color); padding: 2rem;">
        <h3 style="font-size:1.1rem; margin-bottom:10px;">⚠️ Error de Sistema</h3>
        <p style="color: var(--text-muted); font-size:0.85rem; line-height:1.5;">
          <strong>Mensaje del navegador:</strong> ${err.message}
        </p>
      </div>
    `;
  }
}

init();