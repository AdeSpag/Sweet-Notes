let pagesData = [];
let recipesIndex = [];
let currentSpreadIndex = 0;
let mobileSide = 'right'; // Controla si en móvil se ve la izquierda o la derecha
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
        const savedIdx = localStorage.getItem('sweet_notes_index');
        
        if (savedIdx) {
            recipesIndex = JSON.parse(savedIdx);
        }
        
        if (saved) {
            pagesData = JSON.parse(saved);
            if (!Array.isArray(pagesData) || pagesData.length === 0) throw new Error("Datos corruptos");
            
            // Aseguramos que siempre exista la página del índice (Spread 1)
            if (pagesData.length < 2) {
                pagesData.push({ left: '', right: '' });
            }
            
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
            left: '', // Espacio reservado estrictamente para el índice
            right: `<h2 style="font-family: 'Special Elite', monospace; color: #8c5b65; font-size: 2.2rem;">Galletitas de Avena</h2><br><ul><li>1 Taza de Avena</li><li>2 Cucharadas de miel</li></ul>`
        }
    ];
    recipesIndex = [
        { title: 'Galletitas de Avena', spreadIndex: 1, side: 'right' }
    ];
    localStorage.setItem('sweet_notes_index', JSON.stringify(recipesIndex));
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

function editRecipeLink(event, idx) {
    event.stopPropagation(); // Evitar saltar a la página al hacer clic en editar
    const recipe = recipesIndex[idx];
    const currentPageNum = (recipe.spreadIndex * 2) + (recipe.side === 'left' ? 1 : 2);
    
    const newPage = prompt(`¿A qué número de página querés que dirija "${recipe.title}"?`, currentPageNum);
    if (!newPage || isNaN(parseInt(newPage))) return;
    
    const pageNum = parseInt(newPage);
    if (pageNum < 3) {
        alert("Las páginas 1 y 2 están reservadas para la portada y este índice. Elegí a partir de la 3.");
        return;
    }
    
    // Calcular nuevo spread y lado
    const logicNum = pageNum - 1; 
    recipe.spreadIndex = Math.floor(logicNum / 2);
    recipe.side = (logicNum % 2 === 0) ? 'left' : 'right';
    
    // Crear páginas en blanco si eligen un número mayor al que existe
    while (pagesData.length <= recipe.spreadIndex) {
        pagesData.push({ left: '', right: '' });
    }
    
    localStorage.setItem('sweet_notes_index', JSON.stringify(recipesIndex));
    saveBookData();
    
    // Refrescar el índice visualmente
    if (currentSpreadIndex === 1) pageLeft.innerHTML = generateIndexHTML();
}

function deleteRecipeLink(event, idx) {
    event.stopPropagation();
    if (confirm(`¿Quitar "${recipesIndex[idx].title}" del índice?\n(Tranquila, no borrará la receta de la hoja, solo quitará el link de esta lista)`)) {
        recipesIndex.splice(idx, 1);
        localStorage.setItem('sweet_notes_index', JSON.stringify(recipesIndex));
        if (currentSpreadIndex === 1) pageLeft.innerHTML = generateIndexHTML();
    }
}

function generateIndexHTML() {
    let listHTML = '';
    recipesIndex.forEach((recipe, idx) => {
        const pageNum = (recipe.spreadIndex * 2) + (recipe.side === 'left' ? 1 : 2);
        listHTML += `
            <li class="index-item" onclick="jumpToSpread(${recipe.spreadIndex}, '${recipe.side}')" title="Ir a la página ${pageNum}">
                <div class="index-link-area">
                    <span class="index-title">${idx + 1}. ${recipe.title}</span>
                    <span class="index-page-num">Pág. ${pageNum}</span>
                </div>
                <div class="index-actions">
                    <button class="index-action-btn" onclick="editRecipeLink(event, ${idx})" title="Modificar número de página">✏️</button>
                    <button class="index-action-btn" onclick="deleteRecipeLink(event, ${idx})" title="Borrar link">❌</button>
                </div>
            </li>
        `;
    });
    
    return `
        <div class="index-container" contenteditable="false">
            <h2 style="font-family: 'Dancing Script', cursive; font-size: 2.8rem; color: #8c5b65; text-align: center; border-bottom: 2px dashed rgba(217, 138, 157, 0.5); padding-bottom: 10px; margin-bottom: 20px; line-height: 1.4; padding-top: 15px;">Índice de Recetas</h2>
            <ul class="index-list">
                ${listHTML}
            </ul>
            <button class="add-recipe-btn" onclick="addNewRecipe()" title="Agregar nueva receta manual o automáticamente" contenteditable="false">
                <span style="font-size: 1.5rem; font-weight: bold;">+</span> Agregar nueva receta
            </button>
        </div>
    `;
}

function renderSpread(index) {
    if (!pagesData[index]) return;
    const spread = pagesData[index];
    
    bookElement.classList.toggle('is-cover', index === 0);

    // Inyectamos el Índice dinámico SÓLO en la página izquierda del spread 1
    if (index === 1) {
        pageLeft.contentEditable = "false";
        pageLeft.innerHTML = generateIndexHTML();
    } else {
        pageLeft.contentEditable = "true";
        pageLeft.innerHTML = fixOldPolaroids(spread.left || '');
    }
    
    // La página derecha siempre es editable
    pageRight.contentEditable = "true";
    pageRight.innerHTML = fixOldPolaroids(spread.right || '');
    
    numLeft.textContent = (index * 2) + 1;
    numRight.textContent = (index * 2) + 2;
    
    // Control de vista de Single Page (Móvil)
    if (window.innerWidth <= 950) {
        if (index === 0) mobileSide = 'right'; // La tapa siempre es la derecha
        bookElement.classList.toggle('show-mobile-left', mobileSide === 'left');
        bookElement.classList.toggle('show-mobile-right', mobileSide === 'right');
    } else {
        bookElement.classList.remove('show-mobile-left', 'show-mobile-right');
    }
    
    btnPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
}

// Escuchar cambios de tamaño de pantalla para adaptar la vista al instante
window.addEventListener('resize', () => {
    if (window.innerWidth > 950) {
        bookElement.classList.remove('show-mobile-left', 'show-mobile-right');
    } else {
        renderSpread(currentSpreadIndex);
    }
});

function saveBookData() {
    if (isFlipping) return; 
    
    if (currentSpreadIndex === 1) {
        // En el índice (Spread 1), la página izquierda (Pág 3) es auto-generada
        // No guardamos su HTML en el array para no romperlo
        pagesData[currentSpreadIndex].left = '';
    } else {
        pagesData[currentSpreadIndex].left = pageLeft.innerHTML;
    }
    
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
// DRAG & DROP UNIFICADO (MOUSE + TOUCH MÓVIL)
// ==========================================
let isDragging = false, dragEl = null, dragOffsetX = 0, dragOffsetY = 0;
let isResizing = false, currentResizingPhoto = null, startX = 0, startWidth = 0;

function getClientX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
function getClientY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

function handlePointerDown(e) {
    // Si toca la barra de herramientas, ignorar
    if (e.target.closest('.toolbar') || e.target.closest('.nav-btn')) return;

    if (e.target.classList.contains('resizer')) {
        isResizing = true;
        currentResizingPhoto = e.target.closest('.taped-photo');
        startX = getClientX(e);
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
        
        dragOffsetX = getClientX(e) - rect.left;
        dragOffsetY = getClientY(e) - rect.top;
        
        // Solo prevenir por defecto en ratón, en touch interfiere con scroll si no es intencional,
        // pero necesitamos detener el scroll para arrastrar.
        if (!e.touches) e.preventDefault(); 
    }
}

function handlePointerMove(e) {
    if (isResizing && currentResizingPhoto) {
        const newWidth = startWidth + (getClientX(e) - startX);
        if (newWidth > 80 && newWidth < 800) currentResizingPhoto.style.width = newWidth + 'px';
        if (e.touches) e.preventDefault(); // Evitar scroll al redimensionar en móvil
        return;
    }
    if (isDragging && dragEl) {
        const parentRect = dragEl.closest('.page-content').getBoundingClientRect();
        let newLeft = getClientX(e) - parentRect.left - dragOffsetX;
        let newTop = getClientY(e) - parentRect.top - dragOffsetY;
        dragEl.style.left = newLeft + 'px';
        dragEl.style.top = newTop + 'px';
        if (e.touches) e.preventDefault(); // Evitar scroll al arrastrar en móvil
    }
}

function handlePointerUp() {
    if (isResizing || isDragging) {
        isResizing = false; isDragging = false; currentResizingPhoto = null; dragEl = null;
        saveBookData();
    }
}

// Attach events for Mouse
document.addEventListener('mousedown', handlePointerDown);
document.addEventListener('mousemove', handlePointerMove);
document.addEventListener('mouseup', handlePointerUp);

// Attach events for Touch (Móvil)
document.addEventListener('touchstart', handlePointerDown, { passive: false });
document.addEventListener('touchmove', handlePointerMove, { passive: false });
document.addEventListener('touchend', handlePointerUp);

document.addEventListener('dblclick', (e) => {
    if (e.target.closest('.toolbar') || e.target.closest('.nav-btn')) return;
    const polaroidWrapper = e.target.closest('.polaroid-wrapper');
    if (polaroidWrapper) { polaroidWrapper.remove(); saveBookData(); }
});


// ==========================================
// ÍNDICE Y SALTO DE PÁGINAS
// ==========================================
function addNewRecipe() {
    const name = prompt("✨ Nombre de tu nueva receta:");
    if (!name) return;
    
    const pageInput = prompt("¿En qué número de página está?\n(Dejá en blanco si querés crear una hoja nueva al final automáticamente)");
    
    let targetSpreadIndex, targetSide;
    
    if (!pageInput || isNaN(parseInt(pageInput))) {
        // Crear nueva hoja automáticamente al final
        pagesData.push({
            left: `<h2 style="font-family: 'Special Elite', monospace; color: #8c5b65; font-size: 2rem;">${name}</h2><br><p>Ingredientes...</p>`,
            right: ``
        });
        targetSpreadIndex = pagesData.length - 1;
        targetSide = 'left';
    } else {
        const pageNum = parseInt(pageInput);
        if (pageNum < 3) {
            alert("Las páginas 1 y 2 están reservadas para la portada y este índice. Elegí a partir de la 3.");
            return;
        }
        
        // Calcular en base al número visual ingresado
        const logicNum = pageNum - 1; 
        targetSpreadIndex = Math.floor(logicNum / 2);
        targetSide = (logicNum % 2 === 0) ? 'left' : 'right';
        
        // Rellenar con páginas en blanco si eligen un número que todavía no existe
        while (pagesData.length <= targetSpreadIndex) {
            pagesData.push({ left: '', right: '' });
        }
    }
    
    recipesIndex.push({
        title: name,
        spreadIndex: targetSpreadIndex,
        side: targetSide
    });
    
    saveBookData();
    localStorage.setItem('sweet_notes_index', JSON.stringify(recipesIndex));
    
    // Saltar a la receta elegida
    jumpToSpread(targetSpreadIndex, targetSide);
}

function jumpToSpread(targetIndex, targetSide = 'left') {
    if (isFlipping) return;
    
    if (window.innerWidth <= 950) {
        if (currentSpreadIndex === targetIndex && mobileSide === targetSide) return;
        saveBookData();
        currentSpreadIndex = targetIndex;
        mobileSide = targetSide; 
        renderSpread(currentSpreadIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    if (targetIndex === currentSpreadIndex) return; // En PC ya estamos en el spread correcto

    isFlipping = true;
    saveBookData();
    
    const direction = targetIndex > currentSpreadIndex ? 'next' : 'prev';
    
    try {
        const flipper3D = document.createElement('div');
        flipper3D.className = 'flipper-3d turn-' + direction;
        
        const frontFace = document.createElement('div');
        frontFace.className = 'flipper-page front';
        
        const backFace = document.createElement('div');
        backFace.className = 'flipper-page back';
        
        if (direction === 'next') {
            frontFace.innerHTML = pageRight.innerHTML;
            const nextSpread = pagesData[targetIndex] || {left: '', right: ''};
            
            // Si targetIndex es 1, la izquierda es el índice autogenerado
            if (targetIndex === 1) {
                backFace.innerHTML = generateIndexHTML();
            } else {
                backFace.innerHTML = fixOldPolaroids(nextSpread.left || '');
            }
            
            if (currentSpreadIndex === 0) {
                frontFace.style.backgroundColor = '#fcf1f3';
                frontFace.style.backgroundImage = 'radial-gradient(rgba(217, 138, 157, 0.15) 2px, transparent 2px)';
                frontFace.style.backgroundSize = '20px 20px';
                if(typeof backFace !== 'undefined') backFace.style.backgroundSize = '20px 20px';;
                frontFace.style.borderLeft = '14px solid #e6b8c2';
                bookElement.classList.remove('is-cover');
            }
            
            pageLeft.innerHTML = backFace.innerHTML;
            
            flipper3D.appendChild(frontFace);
            flipper3D.appendChild(backFace);
            bookElement.appendChild(flipper3D);
            pageRight.style.visibility = 'hidden'; 
            void flipper3D.offsetWidth;
            flipper3D.classList.add('active');
            
        } else {
            frontFace.innerHTML = pageLeft.innerHTML;
            const prevSpread = pagesData[targetIndex] || {left: '', right: ''};
            backFace.innerHTML = fixOldPolaroids(prevSpread.right || '');
            
            if (targetIndex === 0) {
                backFace.style.backgroundColor = '#fcf1f3';
                backFace.style.backgroundImage = 'radial-gradient(rgba(217, 138, 157, 0.15) 2px, transparent 2px)';
                frontFace.style.backgroundSize = '20px 20px';
                if(typeof backFace !== 'undefined') backFace.style.backgroundSize = '20px 20px';;
                backFace.style.borderLeft = '14px solid #e6b8c2';
                bookElement.classList.add('is-cover');
            }
            
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
            
            currentSpreadIndex = targetIndex;
            renderSpread(currentSpreadIndex);
            
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

// ==========================================
// ANIMACIÓN 3D FLUIDA
// ==========================================
function turnPage3D(direction) {
    if (isFlipping) return;
    
    // LÓGICA DE NAVEGACIÓN MÓVIL (SINGLE PAGE)
    if (window.innerWidth <= 950) {
        saveBookData();
        if (direction === 'next') {
            if (currentSpreadIndex === 0) {
                currentSpreadIndex = 1; mobileSide = 'left';
            } else if (mobileSide === 'left') {
                mobileSide = 'right';
            } else {
                currentSpreadIndex++; mobileSide = 'left';
            }
        } else {
            if (currentSpreadIndex === 1 && mobileSide === 'left') {
                currentSpreadIndex = 0; mobileSide = 'right';
            } else if (mobileSide === 'right' && currentSpreadIndex > 0) {
                mobileSide = 'left';
            } else {
                currentSpreadIndex--; mobileSide = 'right';
            }
        }
        
        // Agregar nueva hoja si llegamos al final
        if (currentSpreadIndex >= pagesData.length) {
            pagesData.push({ left: '', right: '' });
        }
        
        renderSpread(currentSpreadIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    
    // LÓGICA DESKTOP (Intacta)
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
            frontFace.innerHTML = pageRight.innerHTML;
            const nextSpread = pagesData[currentSpreadIndex + 1] || {left: '', right: ''};
            backFace.innerHTML = fixOldPolaroids(nextSpread.left || '');
            
            if (currentSpreadIndex === 0) {
                frontFace.style.backgroundColor = '#fcf1f3';
                frontFace.style.backgroundImage = 'radial-gradient(rgba(217, 138, 157, 0.15) 2px, transparent 2px)';
                frontFace.style.backgroundSize = '20px 20px';
                if(typeof backFace !== 'undefined') backFace.style.backgroundSize = '20px 20px';;
                frontFace.style.borderLeft = '14px solid #e6b8c2';
                bookElement.classList.remove('is-cover');
            }

            pageLeft.innerHTML = backFace.innerHTML;
            flipper3D.appendChild(frontFace);
            flipper3D.appendChild(backFace);
            bookElement.appendChild(flipper3D);
            pageRight.style.visibility = 'hidden'; 
            void flipper3D.offsetWidth;
            flipper3D.classList.add('active');
            
        } else {
            frontFace.innerHTML = pageLeft.innerHTML;
            const prevSpread = pagesData[currentSpreadIndex - 1] || {left: '', right: ''};
            backFace.innerHTML = fixOldPolaroids(prevSpread.right || '');
            
            if (currentSpreadIndex - 1 === 0) {
                backFace.style.backgroundColor = '#fcf1f3';
                backFace.style.backgroundImage = 'radial-gradient(rgba(217, 138, 157, 0.15) 2px, transparent 2px)';
                frontFace.style.backgroundSize = '20px 20px';
                if(typeof backFace !== 'undefined') backFace.style.backgroundSize = '20px 20px';;
                backFace.style.borderLeft = '14px solid #e6b8c2';
                bookElement.classList.add('is-cover');
            }

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

// TOOLBAR COLAPSABLE
const mainToolbar = document.getElementById('main-toolbar');
const closeToolbarBtn = document.getElementById('close-toolbar-btn');
const openToolbarBtn = document.getElementById('open-toolbar-btn');

function toggleToolbar(collapse) {
    if (collapse) {
        mainToolbar.classList.add('collapsed');
        openToolbarBtn.classList.remove('hidden');
        localStorage.setItem('sweet_notes_toolbar_collapsed', 'true');
    } else {
        mainToolbar.classList.remove('collapsed');
        openToolbarBtn.classList.add('hidden');
        localStorage.setItem('sweet_notes_toolbar_collapsed', 'false');
    }
}

closeToolbarBtn.addEventListener('click', () => toggleToolbar(true));
openToolbarBtn.addEventListener('click', () => toggleToolbar(false));

// Restaurar estado de la barra
if (localStorage.getItem('sweet_notes_toolbar_collapsed') === 'true') {
    toggleToolbar(true);
}

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
                <div class="polaroid-wrapper" contenteditable="false" style="position: absolute; left: 10%; top: 10%; z-index: 50;">
                    <div class="taped-photo" style="width: 200px;">
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
