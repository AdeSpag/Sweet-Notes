// Datos por defecto (se usan si no hay nada guardado en el navegador)
const defaultRecipes = {
    "carrot-cake": {
        title: "Carrot Cake Perfecta",
        ingredientsHtml: `
            <div class="ingredient-category">
                <div class="ingredient-category-title">Secos</div>
                <ul class="ingredients-list">
                    <li>2 tazas de harina 0000</li>
                    <li>2 cucharaditas de polvo de hornear</li>
                    <li>1.5 cucharaditas de canela en polvo</li>
                    <li>Pizca de nuez moscada</li>
                    <li>Pizca de sal</li>
                </ul>
            </div>
            <div class="ingredient-category">
                <div class="ingredient-category-title">Húmedos</div>
                <ul class="ingredients-list">
                    <li>4 huevos</li>
                    <li>1.5 tazas de azúcar rubia</li>
                    <li>1 taza de aceite neutro</li>
                    <li>3 tazas de zanahoria rallada finita</li>
                    <li>1/2 taza de nueces picadas</li>
                </ul>
            </div>
        `,
        stepsHtml: `
            <li>Precalentar el horno a 180°C y enmantecar un molde.</li>
            <li>En un bowl grande, tamizar y mezclar todos los ingredientes secos.</li>
            <li>En otro bowl, batir los huevos con el azúcar y el aceite hasta integrar.</li>
            <li>Unir las dos preparaciones con movimientos envolventes.</li>
            <li>Agregar la zanahoria y las nueces. Hornear por 40-45 min.</li>
        `,
        notes: "La última vez quedó muy dulce, usar menos azúcar. Rallar la zanahoria bien finita.",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
        caption: "¡Deliciosa! 🍰"
    },
    "milanesas": {
        title: "Milanesas de Mamá",
        ingredientsHtml: `
            <div class="ingredient-category">
                <div class="ingredient-category-title">Carnes</div>
                <ul class="ingredients-list">
                    <li>1 kg de nalga o cuadril cortada fina</li>
                </ul>
            </div>
            <div class="ingredient-category">
                <div class="ingredient-category-title">Rebozado</div>
                <ul class="ingredients-list">
                    <li>500g de pan rallado</li>
                    <li>3 huevos</li>
                    <li>2 dientes de ajo picados</li>
                    <li>Un puñado de perejil fresco picado</li>
                    <li>Sal y pimienta a gusto</li>
                    <li>Un chorrito de leche</li>
                </ul>
            </div>
        `,
        stepsHtml: `
            <li>Preparar la huevada mezclando huevos, ajo, perejil, sal, pimienta y leche.</li>
            <li>Pasar cada filete de carne por la mezcla de huevo.</li>
            <li>Empanar en el pan rallado, haciendo buena presión con las manos.</li>
            <li>Llevar a la heladera 30 mins (secreto para que no se despegue).</li>
            <li>Freír en abundante aceite caliente o cocinar al horno.</li>
        `,
        notes: "Probar agregar panko al pan rallado para que queden mucho más crocantes ✨",
        image: "https://images.unsplash.com/photo-1627042633145-b780d842ba45?w=400&q=80",
        caption: "Con puré ♡"
    }
};

// Elementos del DOM
const titleEl = document.getElementById('recipe-title');
const ingredientsContainer = document.getElementById('ingredients-container');
const stepsContainer = document.getElementById('steps-container');
const notesEl = document.getElementById('recipe-notes');
const imageEl = document.getElementById('recipe-image');
const captionEl = document.getElementById('recipe-caption');
const tabButtons = document.querySelectorAll('.tab-btn');
const toastEl = document.getElementById('toast');

let currentRecipeKey = 'carrot-cake';

// Renderizar una receta (desde LocalStorage o por defecto)
function loadRecipe(recipeKey) {
    currentRecipeKey = recipeKey;
    const savedDataStr = localStorage.getItem('mi_recetario_' + recipeKey);
    
    if (savedDataStr) {
        // Cargar datos modificados por el usuario
        const savedData = JSON.parse(savedDataStr);
        titleEl.textContent = savedData.title;
        ingredientsContainer.innerHTML = savedData.ingredientsHtml;
        stepsContainer.innerHTML = savedData.stepsHtml;
        notesEl.textContent = savedData.notes;
        captionEl.textContent = savedData.caption;
        imageEl.style.backgroundImage = `url('${savedData.image}')`;
    } else {
        // Cargar datos por defecto
        const data = defaultRecipes[recipeKey];
        titleEl.textContent = data.title;
        ingredientsContainer.innerHTML = data.ingredientsHtml;
        stepsContainer.innerHTML = data.stepsHtml;
        notesEl.textContent = data.notes;
        captionEl.textContent = data.caption;
        imageEl.style.backgroundImage = `url('${data.image}')`;
    }
}

// Guardar el estado actual en LocalStorage
function saveCurrentRecipe() {
    const dataToSave = {
        title: titleEl.textContent,
        ingredientsHtml: ingredientsContainer.innerHTML,
        stepsHtml: stepsContainer.innerHTML,
        notes: notesEl.textContent,
        caption: captionEl.textContent,
        // Mantenemos la imagen original por ahora (se podría hacer dinámica también)
        image: defaultRecipes[currentRecipeKey].image
    };
    
    localStorage.setItem('mi_recetario_' + currentRecipeKey, JSON.stringify(dataToSave));
    showToast();
}

// Mostrar mensajito de guardado
let toastTimeout;
function showToast() {
    toastEl.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastEl.classList.remove('show');
    }, 2000);
}

// Configurar Autoguardado al editar (Debounced para no guardar en cada tecla instantáneamente)
let saveTimeout;
const bookContainer = document.querySelector('.book');
bookContainer.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveCurrentRecipe, 800); // Guarda 800ms después de que dejas de teclear
});

// Event Listeners para las pestañas
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadRecipe(btn.dataset.recipe);
    });
});

// Inicializar con la primera receta
loadRecipe('carrot-cake');
