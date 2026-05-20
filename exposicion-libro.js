/* =======================================================
   EXPOSICION LIBRO - INTERACCIÓN SÍNCRONA Y ALINEACIONES
   ======================================================= */
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const EXPOSITION_CONFIG = {
  title: 'Uniendo Sedes A Través Del Paisaje Sonoro',
  subtitle: 'Fotografía Documental',
  location: 'Calle Córdoba, Medellín',
  year: '2024',
  description: '¿Cómo se dibuja el ruido, el movimiento o la memoria de una calle? La intervención gráfica de Manuela Arenas y Ana María Giraldo para el proyecto "Uniendo sedes a través del paisaje sonoro" le da cuerpo a lo invisible. Al intervenir las capturas del semillero de fotografía, trazan líneas y ritmos visuales que reaccionan a la densidad acústica del centro de Medellín. Los pitos, las voces y el tranvía se transforman en una grafía que dialoga con las imágenes, convirtiendo cada panel en una partitura visual que nos invita a detenernos y dejarnos atravesar por la orquesta viva que habita entre las sedes.',
  pdf: 'EXPOSICIONES/Calle Córdoba/exposición fotográfica .pdf'
};

const canvasLeft = document.getElementById('canvasLeft');
const canvasRight = document.getElementById('canvasRight');
const canvasFlipFront = document.getElementById('canvasFlipFront');
const canvasFlipBack = document.getElementById('canvasFlipBack');
const flipPage = document.getElementById('flipPage');
const coverEditorial = document.getElementById('coverEditorial');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageLabel = document.getElementById('pageLabel');
const pageDots = document.getElementById('pageDots');

let pdfDoc = null;
let totalPages = 0;
let currentSpread = 0; 
let maxSpreads = 0;
let isFlipping = false;
const pageCache = {};

async function init() {
  // Rellenar datos del diseño editorial inicial
  document.getElementById('editorialTitle').textContent = EXPOSITION_CONFIG.title;
  document.getElementById('editorialSubtitle').textContent = EXPOSITION_CONFIG.subtitle;
  document.getElementById('editorialDescription').textContent = EXPOSITION_CONFIG.description;
  document.getElementById('editorialLocation').innerHTML = `<strong>Lugar:</strong> ${EXPOSITION_CONFIG.location}`;
  document.getElementById('editorialYear').innerHTML = `<strong>Año:</strong> ${EXPOSITION_CONFIG.year}`;

  try {
    pdfDoc = await pdfjsLib.getDocument(EXPOSITION_CONFIG.pdf).promise;
    totalPages = pdfDoc.numPages;
    // Spread 0 = Editorial (Izquierda) + PDF pág 1 (Derecha)
    maxSpreads = 1 + Math.ceil((totalPages - 1) / 2);
    
    buildPageDots();
    await renderSpread(0, 'none');
    
    setTimeout(() => {
      document.getElementById('loadingScreen').classList.add('hidden');
    }, 600);
  } catch (error) {
    console.error('Error cargando catálogo:', error);
    pageLabel.textContent = 'Error de carga';
  }
}

function getSpreadPages(spreadIndex) {
  if (spreadIndex === 0) return { left: null, right: 1 };
  const basePage = (spreadIndex - 1) * 2 + 2;
  return { left: basePage, right: basePage + 1 <= totalPages ? basePage + 1 : null };
}

async function renderPageToCanvas(pageNum, canvas, alignment = 'center') {
  const ctx = canvas.getContext('2d', { alpha: false });
  canvas.style.objectPosition = alignment === 'left' ? 'left center' : alignment === 'right' ? 'right center' : 'center center';
  
  if (pageNum === null || pageNum > totalPages) {
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, canvas.width || 1, canvas.height || 1);
    return;
  }

  if (pageCache[pageNum]) {
    canvas.width = pageCache[pageNum].width;
    canvas.height = pageCache[pageNum].height;
    ctx.drawImage(pageCache[pageNum], 0, 0);
    return;
  }

  const page = await pdfDoc.getPage(pageNum);
  const dpr = window.devicePixelRatio || 1;
  const qualityScale = dpr * 2.5; 
  
  const cssWidth = window.innerWidth / 2;
  const unscaledViewport = page.getViewport({ scale: 1 });
  const fitScale = cssWidth / unscaledViewport.width;
  
  const viewport = page.getViewport({ scale: fitScale * qualityScale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  await page.render({ canvasContext: ctx, viewport: viewport }).promise;

  const offscreen = document.createElement('canvas');
  offscreen.width = canvas.width; offscreen.height = canvas.height;
  offscreen.getContext('2d').drawImage(canvas, 0, 0);
  pageCache[pageNum] = offscreen;
}

async function renderSpread(targetSpread, direction) {
  if (isFlipping) return;
  isFlipping = true;

  const oldPages = getSpreadPages(currentSpread);
  const newPages = getSpreadPages(targetSpread);
  currentSpread = targetSpread;

  if (direction === 'next') {
    // Preparar el bloque que se pliega
    await renderPageToCanvas(oldPages.right, canvasFlipFront, 'left'); 
    await renderPageToCanvas(newPages.left, canvasFlipBack, 'right');   

    // Actualizar fondo derecho antes del movimiento
    await renderPageToCanvas(newPages.right, canvasRight, 'left');

    flipPage.className = 'flip-page right-side';
    flipPage.style.display = 'block';
    void flipPage.offsetWidth; 
    flipPage.classList.add('flipping');

    setTimeout(() => {
      renderPageToCanvas(newPages.left, canvasLeft, 'right');
      flipPage.style.display = 'none';
      flipPage.classList.remove('flipping');
      isFlipping = false;
      updateControls();
    }, 650); 

  } else if (direction === 'prev') {
    await renderPageToCanvas(oldPages.left, canvasFlipFront, 'right');
    await renderPageToCanvas(newPages.right, canvasFlipBack, 'left');

    await renderPageToCanvas(newPages.left, canvasLeft, 'right');

    flipPage.className = 'flip-page left-side';
    flipPage.style.display = 'block';
    void flipPage.offsetWidth;
    flipPage.classList.add('flipping');

    setTimeout(() => {
      renderPageToCanvas(newPages.right, canvasRight, 'left');
      flipPage.style.display = 'none';
      flipPage.classList.remove('flipping');
      isFlipping = false;
      updateControls();
    }, 650);

  } else {
    await renderPageToCanvas(newPages.left, canvasLeft, 'right');
    await renderPageToCanvas(newPages.right, canvasRight, 'left');
    isFlipping = false;
    updateControls();
  }
}

function nextPage() {
  if (currentSpread < maxSpreads - 1 && !isFlipping) renderSpread(currentSpread + 1, 'next');
}

function prevPage() {
  if (currentSpread > 0 && !isFlipping) renderSpread(currentSpread - 1, 'prev');
}

nextBtn.addEventListener('click', nextPage);
prevBtn.addEventListener('click', prevPage);
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') nextPage();
  if (e.key === 'ArrowLeft') prevPage();
});

function updateControls() {
  prevBtn.disabled = currentSpread === 0;
  nextBtn.disabled = currentSpread === maxSpreads - 1;

  if (currentSpread === 0) {
    coverEditorial.classList.add('visible');
    pageLabel.textContent = 'Presentación';
  } else {
    coverEditorial.classList.remove('visible');
    const p = getSpreadPages(currentSpread);
    pageLabel.textContent = p.right ? `Págs. ${p.left} - ${p.right}` : `Pág. ${p.left}`;
  }

  document.querySelectorAll('.book-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSpread);
  });
}

function buildPageDots() {
  pageDots.innerHTML = '';
  for (let i = 0; i < maxSpreads; i++) {
    const d = document.createElement('div');
    d.className = 'book-dot';
    pageDots.appendChild(d);
  }
}

document.getElementById('fullscreenBtn').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.log(err));
  } else {
    document.exitFullscreen();
  }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  window.open(EXPOSITION_CONFIG.pdf, '_blank');
});

init();