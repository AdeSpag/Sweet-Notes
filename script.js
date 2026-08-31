// ==========================================
// CONFIGURACIÓN DE LA NUBE (FIREBASE)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Tu código de Firebase (Configurado automáticamente)
const firebaseConfig = {
    apiKey: "AIzaSyAsWmqjtwOg8O8vkiQK3BEtjWGHpRhgQfc",
    authDomain: "sweet-notes-75b49.firebaseapp.com",
    databaseURL: "https://sweet-notes-75b49-default-rtdb.firebaseio.com",
    projectId: "sweet-notes-75b49",
    storageBucket: "sweet-notes-75b49.firebasestorage.app",
    messagingSenderId: "174424553344",
    appId: "1:174424553344:web:74ec0ef2b362ab08f57365",
    measurementId: "G-GRXGLGKBFS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ESTADO DEL LIBRO
let pagesData = [];
let currentSpreadIndex = 0;
let mobileSide = 'right'; 
let isFlipping = false; 

const pageLeft = document.getElementById('page-left');
const pageRight = document.getElementById('page-right');
const numLeft = document.getElementById('num-left');
const numRight = document.getElementById('num-right');
const btnPrev = document.getElementById('prev-page');
const btnNext = document.getElementById('next-page');
const bookElement = document.getElementById('book-element');
const saveIndicator = document.getElementById('save-indicator');

// CARGAR DATOS DESDE LA NUBE
async function loadBookData() {
    try {
        const querySnapshot = await getDocs(collection(db, "sweetnotes_pages"));
        
        if (!querySnapshot.empty) {
            pagesData = [];
            querySnapshot.forEach((doc) => {
                const index = parseInt(doc.id);
                pagesData[index] = doc.data();
            });
            // Rellenar huecos si los hay
            for(let i=0; i<pagesData.length; i++) {
                if(!pagesData[i]) pagesData[i] = {left: '', right: ''};
            }
        } else {
            initDefault();
        }
    } catch (error) {
        console.warn("Aún no has conectado Firebase o hay un error. Cargando datos por defecto.", error);
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
    
    bookElement.classList.toggle('is-cover', index === 0);

    pageLeft.innerHTML = fixOldPolaroids(spread.left || '');
    pageRight.innerHTML = fixOldPolaroids(spread.right || '');
    
    numLeft.textContent = (index * 2) + 1;
    numRight.textContent = (index * 2) + 2;
    
    // Control de vista de Single Page (Móvil)
    if (window.innerWidth <= 950) {
        if (index === 0) mobileSide = 'right'; // La tapa siempre es la derecha
        bookElement.classList.toggle('show-mobile-left', mobileSide === 'left');
        bookElement.classList.toggle('show-mobile-right', mobileSide === 'right');
    } else {
        // Limpiamos las clases si estamos en Desktop
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

async function saveBookData() {
    if (isFlipping) return; 
    pagesData[currentSpreadIndex].left = pageLeft.innerHTML;
    pagesData[currentSpreadIndex].right = pageRight.innerHTML;
    
    try {
        // Guardar la hoja actual en Firestore (el ID del documento es el número de la hoja)
        await setDoc(doc(db, "sweetnotes_pages", currentSpreadIndex.toString()), {
            left: pagesData[currentSpreadIndex].left,
            right: pagesData[currentSpreadIndex].right
        });
        
        saveIndicator.classList.add('show');
        setTimeout(() => saveIndicator.classList.remove('show'), 2000);
    } catch (e) {
        console.error("Error al guardar en la nube:", e);
    }
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
// ANIMACIÓN 3D PERFECTA SIN "POP"
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
                frontFace.style.backgroundColor = '#d98a9d';
                frontFace.style.backgroundImage = 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px)';
                frontFace.style.borderLeft = '12px solid #b56b7f';
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
                backFace.style.backgroundColor = '#d98a9d';
                backFace.style.backgroundImage = 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px)';
                backFace.style.borderLeft = '12px solid #b56b7f';
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
const toggleToolbarBtn = document.getElementById('toggle-toolbar-btn');
const toolbarElement = document.querySelector('.toolbar');
toggleToolbarBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toolbarElement.classList.toggle('collapsed');
});

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
