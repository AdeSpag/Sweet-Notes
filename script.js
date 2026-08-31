// ESTADO DEL LIBRO (Páginas dinámicas)
let pagesData = [];
let currentSpreadIndex = 0;

// ELEMENTOS DEL DOM
const pageLeft = document.getElementById('page-left');
const pageRight = document.getElementById('page-right');
const numLeft = document.getElementById('num-left');
const numRight = document.getElementById('num-right');
const btnPrev = document.getElementById('prev-page');
const btnNext = document.getElementById('next-page');
const bookElement = document.getElementById('book-element');
const saveIndicator = document.getElementById('save-indicator');

// CARGAR DATOS CON PROTECCIÓN ANTI-CRASH
function loadBookData() {
    try {
        const saved = localStorage.getItem('mi_diario_recetas');
        if (saved) {
            pagesData = JSON.parse(saved);
            // Validar que realmente sea la estructura correcta y no caché vieja rota
            if (!Array.isArray(pagesData) || pagesData.length === 0) {
                throw new Error("Datos corruptos");
            }
        } else {
            initDefault();
        }
    } catch (error) {
        console.error("Error al cargar el diario, reseteando...", error);
        initDefault();
    }
    
    renderSpread(currentSpreadIndex);
}

// INICIALIZA EL LIBRO VACÍO POR PRIMERA VEZ
function initDefault() {
    pagesData = [
        {
            left: `<div style="text-align: center; font-family: 'Dancing Script', cursive; font-size: 48px; color: #8c5b65;"><br><br>Mi Recetario<br>Personal</div><div style="text-align: center; font-family: 'Lora', serif; margin-top:20px;">By Ade ♡</div>`,
            right: `<h2 style="font-family: 'Special Elite', monospace;">Ingredientes Secretos...</h2><br><ul><li>Mucho amor</li><li>Una pizca de paciencia</li></ul>`
        }
    ];
}

// RENDERIZAR LA PÁGINA ACTUAL
function renderSpread(index) {
    if (!pagesData[index]) return; // Seguridad extra
    
    const spread = pagesData[index];
    
    // Inyectar HTML
    pageLeft.innerHTML = spread.left || '';
    pageRight.innerHTML = spread.right || '';
    
    // Actualizar números de página
    numLeft.textContent = (index * 2) + 1;
    numRight.textContent = (index * 2) + 2;
    
    // Ocultar botón "Anterior" si estamos en la primera hoja
    btnPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
}

// GUARDAR DATOS EN MEMORIA
function saveBookData() {
    // Actualizar la data en la variable
    pagesData[currentSpreadIndex].left = pageLeft.innerHTML;
    pagesData[currentSpreadIndex].right = pageRight.innerHTML;
    
    // Guardar en el navegador
    localStorage.setItem('mi_diario_recetas', JSON.stringify(pagesData));
    
    // Mostrar indicador "Guardando..."
    saveIndicator.classList.add('show');
    setTimeout(() => saveIndicator.classList.remove('show'), 2000);
}

// AUTO-GUARDADO AL ESCRIBIR (con delay para no trabar el navegador)
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
        saveBookData();
        triggerFlipAnimation(() => {
            currentSpreadIndex--;
            renderSpread(currentSpreadIndex);
        });
    }
});

// NAVEGACIÓN - PÁGINA SIGUIENTE / NUEVA
btnNext.addEventListener('click', () => {
    saveBookData();
    triggerFlipAnimation(() => {
        currentSpreadIndex++;
        
        // Si no existe la página siguiente, la creamos (Libro infinito)
        if (currentSpreadIndex >= pagesData.length) {
            pagesData.push({ left: '', right: '' });
        }
        
        renderSpread(currentSpreadIndex);
        saveBookData(); // Guardar la creación de la hoja nueva
    });
});

// EFECTO VISUAL DE CAMBIO DE PÁGINA
function triggerFlipAnimation(callback) {
    bookElement.classList.add('flip-animation');
    // A la mitad de la animación cambiamos el contenido (200ms)
    setTimeout(callback, 200); 
    // Al final removemos la clase
    setTimeout(() => {
        bookElement.classList.remove('flip-animation');
    }, 400);
}

// BARRA DE HERRAMIENTAS (Editor estilo Word)
const toolBtns = document.querySelectorAll('.tool-btn');
toolBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.getAttribute('data-command');
        document.execCommand(command, false, null);
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

// INICIAR LA APP AL ABRIR LA PÁGINA
loadBookData();
