const fs = require('fs');

let content = fs.readFileSync('styles.css', 'utf8');

// Fix 1: open-toolbar-btn to be a circle
content = content.replace(
    /\.open-toolbar-btn\s*\{[^}]+\}/,
    '.open-toolbar-btn { position: fixed; top: 15px; left: 50%; transform: translateX(-50%); background: var(--toolbar-bg); border: 1px solid var(--toolbar-border); color: var(--text-color); font-family: var(--font-ui); width: 42px; height: 42px; border-radius: 50%; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.12); z-index: 1001; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); font-size: 1.2rem; }'
);

// Fix 1.1: media query for open-toolbar-btn
content = content.replace(
    /\.open-toolbar-btn\s*\{\s*width:\s*auto;\s*font-size:\s*0\.9rem;\s*padding:\s*6px 12px;\s*\}/,
    '.open-toolbar-btn { top: 10px; }'
);

// Fix 2: Cover redesign
const oldCoverCss = /.book\.is-cover \.right-page\s*\{\s*background-color:\s*#d98a9d;\s*background-image:\s*repeating-linear-gradient\(45deg,\s*rgba\(255,255,255,0\.05\)\s*0px,\s*rgba\(255,255,255,0\.05\)\s*2px,\s*transparent\s*2px,\s*transparent\s*6px\);\s*color:\s*#FDF9F1;\s*border-radius:\s*5px 15px 15px 5px;\s*box-shadow:\s*15px 25px 45px rgba\(0,0,0,0\.25\),\s*inset\s*15px\s*0\s*25px\s*rgba\(0,0,0,0\.15\);\s*border-left:\s*12px solid #b56b7f;\s*display:\s*flex;\s*flex-direction:\s*column;\s*justify-content:\s*center;\s*align-items:\s*center;\s*text-align:\s*center;\s*\}/;

const newCoverCss = \.book.is-cover .right-page {
    background-color: #fcf1f3;
    background-image: radial-gradient(rgba(217, 138, 157, 0.15) 2px, transparent 2px);
    background-size: 20px 20px;
    color: #8c5b65 !important;
    border-radius: 5px 15px 15px 5px;
    box-shadow: 15px 25px 45px rgba(0,0,0,0.25), inset 15px 0 25px rgba(0,0,0,0.15);
    border-left: 14px solid #e6b8c2;
    display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;
    position: relative;
}
.book.is-cover .right-page * {
    color: #8c5b65 !important;
    text-shadow: none !important;
}
.book.is-cover .right-page::before {
    content: '';
    position: absolute;
    top: 15px; left: 15px; right: 15px; bottom: 15px;
    border: 2px dashed rgba(140, 91, 101, 0.4);
    border-radius: 5px 10px 10px 5px;
    pointer-events: none;
    z-index: 10;
}\;

content = content.replace(oldCoverCss, newCoverCss);

// Fix 3: Mobile page navigation overlapping issue
const oldPageMobile = /\.page\s*\{\s*width:\s*100%;\s*flex:\s*none;\s*min-height:\s*75vh;\s*padding:\s*30px 20px;\s*border-radius:\s*15px !important;\s*border:\s*none !important;\s*\}/;
const newPageMobile = '.page { width: 100%; flex: none; min-height: 75vh; padding: 30px 20px 90px 20px; border-radius: 15px !important; border: none !important; }';
content = content.replace(oldPageMobile, newPageMobile);

// And move page number
content = content.replace(
    /\.left-nav \{ left: 20px !important; \}/,
    '.left-nav { left: 20px !important; }\\n    .page-number { left: 50% !important; right: auto !important; transform: translateX(-50%); bottom: 25px !important; }'
);

fs.writeFileSync('styles.css', content, 'utf8');

console.log('Styles updated!');
