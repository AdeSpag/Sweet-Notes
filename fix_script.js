const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');

// Update cover colors in script.js
content = content.replace(/backgroundColor = '#d98a9d'/g, "backgroundColor = '#fcf1f3'");
content = content.replace(/backgroundImage = 'repeating-linear-gradient\\(45deg, rgba\\(255,255,255,0\\.05\\) 0px, rgba\\(255,255,255,0\\.05\\) 2px, transparent 2px, transparent 6px\\)'/g, "backgroundImage = 'radial-gradient(rgba(217, 138, 157, 0.15) 2px, transparent 2px)'");
content = content.replace(/borderLeft = '12px solid #b56b7f'/g, "borderLeft = '14px solid #e6b8c2'");
content = content.replace(/frontFace\.style\.backgroundImage = 'radial-gradient/g, "frontFace.style.backgroundSize = '20px 20px';\\n                frontFace.style.backgroundImage = 'radial-gradient");
content = content.replace(/backFace\.style\.backgroundImage = 'radial-gradient/g, "backFace.style.backgroundSize = '20px 20px';\\n                backFace.style.backgroundImage = 'radial-gradient");

// Update index title to prevent clipping
content = content.replace(
    /<h2 style="font-family: 'Dancing Script', cursive; font-size: 2\.8rem; color: #8c5b65; text-align: center; border-bottom: 2px dashed rgba\(217, 138, 157, 0\.5\); padding-bottom: 10px; margin-bottom: 20px;">Índice de Recetas<\/h2>/,
    '<h2 style="font-family: \\'Dancing Script\\', cursive; font-size: 2.8rem; color: #8c5b65; text-align: center; border-bottom: 2px dashed rgba(217, 138, 157, 0.5); padding-bottom: 10px; margin-bottom: 20px; line-height: 1.4; padding-top: 15px;">Índice de Recetas</h2>'
);

fs.writeFileSync('script.js', content, 'utf8');
console.log('script.js updated!');
