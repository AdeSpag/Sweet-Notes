// ESTADO DEL LIBRO (Páginas dinámicas)
let pagesData = [];
let currentSpreadIndex = 0; // Índice de la página doble actual (0, 1, 2...)

// ELEMENTOS DEL DOM
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
    const saved = localStorage.getItem('mi_diario_recetas');
    if (saved) {
        pagesData = JSON.parse(saved);
    } else {
        // Inicializar con una página doble en blanco (Portada / Receta 1)
        pagesData = [
            {
                left: `<h1 style="text-align: center; font-family: 'Dancing Script', cursive; font-size: 48px;"><br><br><br>Mi Recetario<br>Personal</h1><p style="text-align: center;">By Ade ♡</p>`,
                right: `<h2>Ingredientes...</h2><ul><li>...</li></ul>`
            }
        ];
    }
    renderSpread(currentSpreadIndex);
}

// RENDERIZAR LA PÁGINA ACTUAL
function renderSpread(index) {
    const spread = pagesData[index];
    
    // Inyectar HTML
    pageLeft.innerHTML = spread.left || '';
    pageRight.innerHTML = spread.right || '';
    
    // Actualizar números de página
    numLeft.textContent = (index * 2) + 1;
    numRight.textContent = (index * 2) + 2;
    
    // Visibilidad del botón "Anterior"
    btnPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
}

// GUARDAR DATOS
function saveBookData() {
    // Actualizar la data actual antes de guardar
    pagesData[currentSpreadIndex].left = pageLeft.innerHTML;
    pagesData[currentSpreadIndex].right = pageRight.innerHTML;
    
    localStorage.setItem('mi_diario_recetas', JSON.stringify(pagesData));
    
    // Mostrar indicador
    saveIndicator.classList.add('show');
    setTimeout(() => saveIndicator.classList.remove('show'), 2000);
}

// AUTO-GUARDADO AL ESCRIBIR
let saveTimeout;
[pageLeft, pageRight].forEach(page => {
    page.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveBookData, 1000);
    });
});

// NAVEGACIÓN - PÁGINA ANTERIOR
btnPrev.addEventListener('click', () => {
    if (currentSpreadIndex > 0) {
        saveBookData(); // Guardar antes de cambiar
        triggerFlipAnimation(() => {
            currentSpreadIndex--;
            renderSpread(currentSpreadIndex);
        });
    }
});

// NAVEGACIÓN - PÁGINA SIGUIENTE / NUEVA
btnNext.addEventListener('click', () => {
    saveBookData(); // Guardar antes de cambiar
    triggerFlipAnimation(() => {
        currentSpreadIndex++;
        
        // Si no existe la página siguiente, la creamos (Libro infinito)
        if (currentSpreadIndex >= pagesData.length) {
            pagesData.push({ left: '', right: '' });
        }
        
        renderSpread(currentSpreadIndex);
        saveBookData(); // Guardar la nueva página en localStorage
    });
});

// EFECTO VISUAL DE CAMBIO DE PÁGINA
function triggerFlipAnimation(callback) {
    bookElement.classList.add('flip-animation');
    // A la mitad de la animación cambiamos el contenido
    setTimeout(callback, 200); 
    // Al final removemos la clase
    setTimeout(() => {
        bookElement.classList.remove('flip-animation');
    }, 400);
}

// BARRA DE HERRAMIENTAS (Editor de texto estilo Word)
const toolBtns = document.querySelectorAll('.tool-btn');
toolBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.getAttribute('data-command');
        document.execCommand(command, false, null);
        // Devolver foco al editor
        pageLeft.focus(); 
    });
});

// Selector de Fuente
const fontSelect = document.getElementById('fontName');
fontSelect.addEventListener('change', (e) => {
    document.execCommand('fontName', false, e.target.value);
});

// Selector de Tamaño
const sizeSelect = document.getElementById('fontSize');
sizeSelect.addEventListener('change', (e) => {
    document.execCommand('fontSize', false, e.target.value);
});

// INICIAR LA APP
loadBookData();
