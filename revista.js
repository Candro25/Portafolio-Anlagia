pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ⚠️ Ajusta esta ruta según donde tengas el PDF
const PDF_URL = 'ESENCIA_REVISTAS.pdf';

const BASE_W = 280;
const BASE_H = 396;

let pdfDoc     = null;
let totalPages = 0;
let spread     = 0;
let maxSpreads = 0;
let isFlipping = false;
const pageCache = {};

const leftSlot    = document.getElementById('leftSlot');
const rightSlot   = document.getElementById('rightSlot');
const leftCanvas  = document.getElementById('leftCanvas');
const rightCanvas = document.getElementById('rightCanvas');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');
const pageLabel   = document.getElementById('pageLabel');
const pageDots    = document.getElementById('pageDots');
const loadingEl   = document.getElementById('loadingScreen');
const book        = document.getElementById('book');

// Renderiza una página del PDF en un canvas
async function renderPageToCanvas(pageNum, canvas) {
  if (pageNum < 1 || pageNum > totalPages) {
    const ctx = canvas.getContext('2d');
    canvas.width  = BASE_W * 2;
    canvas.height = BASE_H * 2;
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  if (pageCache[pageNum]) {
    const src = pageCache[pageNum];
    canvas.width  = src.width;
    canvas.height = src.height;
    canvas.getContext('2d').drawImage(src, 0, 0);
    return;
  }

  const page     = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2 });
  canvas.width   = viewport.width;
  canvas.height  = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

  // Guarda en caché
  const off = document.createElement('canvas');
  off.width  = canvas.width;
  off.height = canvas.height;
  off.getContext('2d').drawImage(canvas, 0, 0);
  pageCache[pageNum] = off;
}

// Qué páginas van en cada spread
function spreadPages(s) {
  if (s === 0) return { left: 0, right: 1 }; // portada sola a la derecha
  const base = (s - 1) * 2 + 2;
  return { left: base, right: base + 1 };
}

// Muestra un spread sin animación
async function showSpread(s) {
  const { left, right } = spreadPages(s);
  leftSlot.style.opacity = s === 0 ? '0' : '1';
  if (s !== 0) await renderPageToCanvas(left, leftCanvas);
  await renderPageToCanvas(right, rightCanvas);
  updateUI(s);
}

// Animación pasar página hacia adelante
async function animateForward(curRight, toLeft, toRight) {
  const layer = document.createElement('div');
  layer.className = 'flip-layer';
  layer.style.width  = rightSlot.offsetWidth  + 'px';
  layer.style.height = rightSlot.offsetHeight + 'px';
  layer.style.left   = rightSlot.offsetLeft   + 'px';
  layer.style.top    = '0';
  layer.style.transformOrigin = 'left center';

  const frontCanvas = document.createElement('canvas');
  await renderPageToCanvas(curRight, frontCanvas);
  layer.appendChild(frontCanvas);

  const backDiv    = document.createElement('div');
  backDiv.className = 'back-face';
  const backCanvas = document.createElement('canvas');
  await renderPageToCanvas(toLeft, backCanvas);
  backDiv.appendChild(backCanvas);
  layer.appendChild(backDiv);

  book.appendChild(layer);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    layer.style.transform = 'rotateY(-180deg)';
  }));

  await wait(780);
  layer.remove();
}

// Animación pasar página hacia atrás
async function animateBackward(curLeft, toLeft, toRight) {
  const layer = document.createElement('div');
  layer.className = 'flip-layer';
  layer.style.width  = leftSlot.offsetWidth  + 'px';
  layer.style.height = leftSlot.offsetHeight + 'px';
  layer.style.left   = leftSlot.offsetLeft   + 'px';
  layer.style.top    = '0';
  layer.style.transformOrigin = 'right center';
  layer.style.transform = 'rotateY(180deg)';

  const frontCanvas = document.createElement('canvas');
  await renderPageToCanvas(curLeft, frontCanvas);
  layer.appendChild(frontCanvas);

  const backDiv    = document.createElement('div');
  backDiv.className = 'back-face';
  const backCanvas = document.createElement('canvas');
  await renderPageToCanvas(toRight, backCanvas);
  backDiv.appendChild(backCanvas);
  layer.appendChild(backDiv);

  book.appendChild(layer);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    layer.style.transform = 'rotateY(0deg)';
  }));

  await wait(780);
  layer.remove();
}

// Pasar página con animación
async function turnPage(direction) {
  if (isFlipping) return;
  const next = spread + direction;
  if (next < 0 || next >= maxSpreads) return;

  isFlipping = true;
  prevBtn.disabled = true;
  nextBtn.disabled = true;

  const { left: curLeft, right: curRight } = spreadPages(spread);
  const { left: nLeft,   right: nRight   } = spreadPages(next);

  if (direction === 1) {
    await animateForward(curRight, nLeft, nRight);
  } else {
    if (spread > 0) await animateBackward(curLeft, nLeft, nRight);
  }

  spread = next;
  await showSpread(spread);
  isFlipping = false;
  updateButtons();
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

// Puntos de navegación
function buildDots() {
  pageDots.innerHTML = '';
  for (let i = 0; i < maxSpreads; i++) {
    const d = document.createElement('div');
    d.className = 'page-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', async () => {
      if (isFlipping || i === spread) return;
      spread = i;
      await showSpread(spread);
      updateButtons();
    });
    pageDots.appendChild(d);
  }
}

function updateUI(s) {
  if (s === 0) {
    pageLabel.textContent = 'Portada';
  } else {
    const { left, right } = spreadPages(s);
    pageLabel.textContent = right > totalPages
      ? `Página ${left}`
      : `Páginas ${left} — ${right}`;
  }
  document.querySelectorAll('.page-dot').forEach((d, i) => {
    d.classList.toggle('active', i === s);
  });
  leftSlot.style.opacity = s === 0 ? '0' : '1';
}

function updateButtons() {
  prevBtn.disabled = spread === 0 || isFlipping;
  nextBtn.disabled = spread >= maxSpreads - 1 || isFlipping;
}

// Teclado
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') turnPage(1);
  if (e.key === 'ArrowLeft')  turnPage(-1);
});

prevBtn.addEventListener('click', () => turnPage(-1));
nextBtn.addEventListener('click', () => turnPage(1));

// Init
async function init() {
  try {
    pdfDoc     = await pdfjsLib.getDocument(PDF_URL).promise;
    totalPages = pdfDoc.numPages;
    maxSpreads = 1 + Math.ceil((totalPages - 1) / 2);

    buildDots();
    await showSpread(0);
    updateButtons();

    // Pre-carga las primeras páginas
    for (let i = 1; i <= Math.min(4, totalPages); i++) {
      const tmp = document.createElement('canvas');
      renderPageToCanvas(i, tmp);
    }
    
    // Asegurar tiempo mínimo de loader para que se vea bien
    const minLoadTime = 1500;
    const startTime = performance.now();
    const elapsedTime = performance.now() - startTime;
    if (elapsedTime < minLoadTime) {
      await wait(minLoadTime - elapsedTime);
    }
  } catch (err) {
    console.error('Error cargando el PDF:', err);
    pageLabel.textContent = 'Error al cargar la revista';
  }

  // Ocultar loader con animación elegante
  loadingEl.classList.add('hidden');
  setTimeout(() => {
    if (loadingEl && loadingEl.parentNode) {
      loadingEl.remove();
    }
  }, 600);
}

init();