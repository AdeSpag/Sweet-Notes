// ESTADO DEL LIBRO
let pagesData = [];
let currentSpreadIndex = 0;
let isFlipping = false; 

const pageLeft = document.getElementById('page-left');
const pageRight = document.getElementById('page-right');
const numLeft = document.getElementById('num-left');
const numRight = document.getElementById('num-right');
const btnPrev = document.getElementById('prev-page');
const btnNext = document.getElementById('next-page');
const bookElement = document.getElementById('book-element');
const saveIndicator = document.getElementById('save-indicator');

// CARGAR DATOS
function loadBookData() {
    try {
        const saved = localStorage.getItem('mi_diario_recetas');
        if (saved) {
            pagesData = JSON.parse(saved);
            if (!Array.isArray(pagesData) || pagesData.length === 0) throw new Error("Datos corruptos");
            
            pagesData[0] = {
                left: '', 
                right: `<br><br><br><h1 style="font-family: 'Dancing Script', cursive; font-size: 4rem; margin-bottom: 10px; color: #FDF9F1;">Sweet Notes</h1><h2 style="font-family: 'Lora', serif; font-size: 1.5rem; font-weight: 300; color: #FDF9F1;">Mi Recetario Personal ♡</h2>`
            };
        } else {
            initDefault();
        }
    } catch (error) {
        initDefault();
    }
    renderSpread(currentSpreadIndex);
}

function initDefault() {
    pagesData = [
        {
            left: '', 
            right: `<br><br><br><h1 style="font-family: 'Dancing Script', cursive; font-size: 4rem; margin-bottom: 10px; color: #FDF9F1;">Sweet Notes</h1><h2 style="font-family: 'Lora', serif; font-size: 1.5rem; font-weight: 300; color: #FDF9F1;">Mi Recetario Personal ♡</h2>`
        },
        {
            left: `<h2 style="font-family: 'Special Elite', monospace; color: #8c5b65;">Mi Primera Receta</h2><br><ul><li>Ingrediente 1</li><li>Ingrediente 2</li></ul>`,
            right: ``
        }
    ];
}

function fixOldPolaroids(html) {
    if (!html) return html;
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.querySelectorAll('.polaroid-wrapper').forEach(wrapper => {
        if (wrapper.style.position !== 'absolute') {
            wrapper.style.position = 'absolute';
            wrapper.style.left = '10%';
            wrapper.style.top = '10%';
        }
        const photo = wrapper.querySelector('.taped-photo');
        if (photo) {
            if (!photo.querySelector('.delete-photo-btn')) {
                const btn = document.createElement('button');
                btn.className = 'delete-photo-btn';
                btn.title = 'Eliminar foto';
                btn.innerHTML = '×';
                photo.prepend(btn);
            }
            if (!photo.querySelector('.resizer')) {
                const resizer = document.createElement('div');
                resizer.className = 'resizer';
                resizer.title = 'Arrastrar para redimensionar';
                photo.appendChild(resizer);
            }
            const img = photo.querySelector('img');
            if (img) img.setAttribute('draggable', 'false');
        }
    });
    return temp.innerHTML;
}

function renderSpread(index) {
    if (!pagesData[index]) return;
    const spread = pagesData[index];
    
    // El toggle es crucial para el layout central (aplica transform translateX en CSS)
    bookElement.classList.toggle('is-cover', index === 0);

    pageLeft.innerHTML = fixOldPolaroids(spread.left || '');
    pageRight.innerHTML = fixOldPolaroids(spread.right || '');
    
    numLeft.textContent = (index * 2) + 1;
    numRight.textContent = (index * 2) + 2;
    
    btnPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
}

function saveBookData() {
    if (isFlipping) return; 
    pagesData[currentSpreadIndex].left = pageLeft.innerHTML;
    pagesData[currentSpreadIndex].right = pageRight.innerHTML;
    localStorage.setItem('mi_diario_recetas', JSON.stringify(pagesData));
    
    saveIndicator.classList.add('show');
    setTimeout(() => saveIndicator.classList.remove('show'), 2000);
}

let saveTimeout;
[pageLeft, pageRight].forEach(page => {
    page.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveBookData, 1000);
    });
});

// ==========================================
// DRAG & DROP
// ==========================================
let isDragging = false, dragEl = null, dragOffsetX = 0, dragOffsetY = 0;
let isResizing = false, currentResizingPhoto = null, startX = 0, startWidth = 0;

document.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('resizer')) {
        isResizing = true;
        currentResizingPhoto = e.target.closest('.taped-photo');
        startX = e.clientX;
        startWidth = parseInt(window.getComputedStyle(currentResizingPhoto).width, 10);
        e.preventDefault();
        return;
    }
    if (e.target.classList.contains('delete-photo-btn')) {
        const polaroidWrapper = e.target.closest('.polaroid-wrapper');
        if (polaroidWrapper) { polaroidWrapper.remove(); saveBookData(); }
        return;
    }

    const polaroid = e.target.closest('.polaroid-wrapper');
    if (polaroid && !e.target.closest('.toolbar')) {
        isDragging = true; dragEl = polaroid;
        document.querySelectorAll('.polaroid-wrapper').forEach(p => p.style.zIndex = '50');
        polaroid.style.zIndex = '100';
        const rect = polaroid.getBoundingClientRect();
        const parentRect = polaroid.closest('.page-content').getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        e.preventDefault(); 
    }
});

document.addEventListener('mousemove', (e) => {
    if (isResizing && currentResizingPhoto) {
        const newWidth = startWidth + (e.clientX - startX);
        if (newWidth > 80 && newWidth < 800) currentResizingPhoto.style.width = newWidth + 'px';
        return;
    }
    if (isDragging && dragEl) {
        const parentRect = dragEl.closest('.page-content').getBoundingClientRect();
        let newLeft = e.clientX - parentRect.left - dragOffsetX;
        let newTop = e.clientY - parentRect.top - dragOffsetY;
        dragEl.style.left = newLeft + 'px';
        dragEl.style.top = newTop + 'px';
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing || isDragging) {
        isResizing = false; isDragging = false; currentResizingPhoto = null; dragEl = null;
        saveBookData();
    }
});

document.addEventListener('dblclick', (e) => {
    if (e.target.closest('.toolbar') || e.target.closest('.nav-btn')) return;
    const polaroidWrapper = e.target.closest('.polaroid-wrapper');
    if (polaroidWrapper) { polaroidWrapper.remove(); saveBookData(); }
});


// ==========================================
// ANIMACIÓN 3D PERFECTA SIN "POP" (PRE-CARGA)
// ==========================================
function turnPage3D(direction) {
    if (isFlipping) return;
    if (window.innerWidth <= 950) {
        executePageChange(direction);
        return;
    }
    
    isFlipping = true;
    saveBookData(); 

    try {
        const flipper3D = document.createElement('div');
        flipper3D.className = 'flipper-3d turn-' + direction;
        
        const frontFace = document.createElement('div');
        frontFace.className = 'flipper-page front';
        
        const backFace = document.createElement('div');
        backFace.className = 'flipper-page back';

        if (direction === 'next') {
            // FRONT: lo que vemos ahora a la derecha
            frontFace.innerHTML = pageRight.innerHTML;
            
            // BACK: lo que será la página izquierda
            const nextSpread = pagesData[currentSpreadIndex + 1] || {left: '', right: ''};
            backFace.innerHTML = fixOldPolaroids(nextSpread.left || '');
            
            if (currentSpreadIndex === 0) {
                // Si abrimos la tapa, el frente debe ser la tapa
                frontFace.style.backgroundColor = '#d98a9d';
                frontFace.style.backgroundImage = 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px)';
                frontFace.style.borderLeft = '12px solid #b56b7f';
                
                // MÁGIA: Quitamos is-cover ahora. El libro (wrapper) empieza a deslizarse a la derecha mientras la hoja gira
                bookElement.classList.remove('is-cover');
            }

            // MÁGIA: Pre-cargamos la página izquierda real inmediatamente para que esté lista debajo del flipper
            pageLeft.innerHTML = backFace.innerHTML;
            
            flipper3D.appendChild(frontFace);
            flipper3D.appendChild(backFace);
            bookElement.appendChild(flipper3D);
            
            // Ocultamos la derecha original para no duplicar el frontFace
            pageRight.style.visibility = 'hidden'; 
            
            // Forzar reflow y activar animación
            void flipper3D.offsetWidth;
            flipper3D.classList.add('active');
            
        } else {
            // PREV: la página izquierda actual voltea a la derecha
            frontFace.innerHTML = pageLeft.innerHTML;
            
            // BACK: lo que será la página derecha (o la tapa)
            const prevSpread = pagesData[currentSpreadIndex - 1] || {left: '', right: ''};
            backFace.innerHTML = fixOldPolaroids(prevSpread.right || '');
            
            if (currentSpreadIndex - 1 === 0) {
                // Si cerramos hacia la tapa, el backface es la tapa
                backFace.style.backgroundColor = '#d98a9d';
                backFace.style.backgroundImage = 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px)';
                backFace.style.borderLeft = '12px solid #b56b7f';
                
                // MÁGIA: Agregamos is-cover ahora. El libro empieza a deslizarse al centro mientras se cierra
                bookElement.classList.add('is-cover');
            }

            // MÁGIA: Pre-cargamos la página derecha real inmediatamente debajo del flipper
            pageRight.innerHTML = backFace.innerHTML;

            flipper3D.appendChild(frontFace);
            flipper3D.appendChild(backFace);
            bookElement.appendChild(flipper3D);
            
            pageLeft.style.visibility = 'hidden';
            
            void flipper3D.offsetWidth;
            flipper3D.classList.add('active');
        }

        setTimeout(() => {
            pageRight.style.visibility = 'visible';
            pageLeft.style.visibility = 'visible';
            executePageChange(direction);
            if (flipper3D.parentNode) flipper3D.remove();
            isFlipping = false;
        }, 800);
        
    } catch (e) {
        isFlipping = false;
        pageRight.style.visibility = 'visible';
        pageLeft.style.visibility = 'visible';
        console.error("Flip error: ", e);
    }
}

function executePageChange(direction) {
    if (direction === 'next') {
        currentSpreadIndex++;
        if (currentSpreadIndex >= pagesData.length) {
            pagesData.push({ left: '', right: '' });
        }
    } else {
        currentSpreadIndex--;
    }
    renderSpread(currentSpreadIndex);
    saveBookData();
}

btnPrev.addEventListener('click', () => turnPage3D('prev'));
btnNext.addEventListener('click', () => turnPage3D('next'));


// ==========================================
// BARRA DE HERRAMIENTAS
// ==========================================
const toolBtns = document.querySelectorAll('.tool-btn[data-command]');
toolBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.getAttribute('data-command');
        document.execCommand(command, false, null);
    });
});

document.getElementById('fontName').addEventListener('change', (e) => { document.execCommand('fontName', false, e.target.value); });
document.getElementById('fontSize').addEventListener('change', (e) => { document.execCommand('fontSize', false, e.target.value); });

document.getElementById('btn-heart').addEventListener('click', (e) => {
    e.preventDefault();
    document.execCommand('insertHTML', false, '♡');
});

const colorSwatches = document.querySelectorAll('.color-swatch');
colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        e.preventDefault();
        const color = swatch.getAttribute('data-color');
        document.execCommand('foreColor', false, color);
    });
});

// SUBIR FOTOS
const addPhotoBtn = document.getElementById('add-photo-btn');
const imageUpload = document.getElementById('image-upload');

addPhotoBtn.addEventListener('click', () => { imageUpload.click(); });

imageUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            const polaroidHtml = `
                <div class="polaroid-wrapper" contenteditable="false" style="position: absolute; left: 20%; top: 20%; z-index: 50;">
                    <div class="taped-photo" style="width: 250px;">
                        <button class="delete-photo-btn" title="Eliminar foto">×</button>
                        <div class="tape"></div>
                        <img src="${base64Image}" alt="Receta terminada" draggable="false">
                        <div class="resizer" title="Arrastrar para redimensionar"></div>
                    </div>
                </div>
            `;
            document.execCommand('insertHTML', false, polaroidHtml);
            saveBookData();
        };
        reader.readAsDataURL(file);
    }
    this.value = '';
});

// INICIAR
loadBookData();
