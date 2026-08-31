$content = [System.IO.File]::ReadAllText("c:\Users\asus\OneDrive\Documentos\Recetario byAde\styles.css", [System.Text.Encoding]::UTF8)
$content = $content -replace '(?s)\.book\.is-cover \.right-page\s*\{[^}]+\}', '.book.is-cover .right-page {
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
    content: '''';
    position: absolute;
    top: 15px; left: 15px; right: 15px; bottom: 15px;
    border: 2px dashed rgba(140, 91, 101, 0.4);
    border-radius: 5px 10px 10px 5px;
    pointer-events: none;
    z-index: 10;
}'

$content = $content -replace '(?s)\.page\s*\{[^\}]*min-height:\s*75vh;[^\}]*padding:\s*30px 20px;[^\}]*\}', '.page { width: 100%; flex: none; min-height: 75vh; padding: 30px 20px 90px 20px; border-radius: 15px !important; border: none !important; }'
$content = $content -replace '(?s)\.left-nav \{ left: 20px !important; \}', ".left-nav { left: 20px !important; }
    .page-number { left: 50% !important; right: auto !important; transform: translateX(-50%); bottom: 25px !important; }"

$content = $content -replace '(?s)\.open-toolbar-btn\s*\{[^\}]*padding:\s*6px 16px;[^\}]*\}', '.open-toolbar-btn { position: fixed; top: 15px; left: 50%; transform: translateX(-50%); background: var(--toolbar-bg); border: 1px solid var(--toolbar-border); color: var(--text-color); font-family: var(--font-ui); width: 42px; height: 42px; border-radius: 50%; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.12); z-index: 1001; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); font-size: 1.2rem; }'

$content = $content -replace '(?s)\.open-toolbar-btn \{ width: auto; font-size: 0\.9rem; padding: 6px 12px; \}', '.open-toolbar-btn { top: 10px; }'

[System.IO.File]::WriteAllText("c:\Users\asus\OneDrive\Documentos\Recetario byAde\styles.css", $content, [System.Text.Encoding]::UTF8)


$script = [System.IO.File]::ReadAllText("c:\Users\asus\OneDrive\Documentos\Recetario byAde\script.js", [System.Text.Encoding]::UTF8)

$script = $script -replace "backgroundColor = '#d98a9d'", "backgroundColor = '#fcf1f3'"
$script = $script -replace "borderLeft = '12px solid #b56b7f'", "borderLeft = '14px solid #e6b8c2'"
$script = $script -replace "backgroundImage = 'repeating-linear-gradient\(45deg, rgba\(255,255,255,0\.05\) 0px, rgba\(255,255,255,0\.05\) 2px, transparent 2px, transparent 6px\)'", "backgroundImage = 'radial-gradient(rgba(217, 138, 157, 0.15) 2px, transparent 2px)';
                frontFace.style.backgroundSize = '20px 20px';
                if(typeof backFace !== 'undefined') backFace.style.backgroundSize = '20px 20px';"

$script = $script -replace '(?s)<h2 style="font-family: ''Dancing Script'', cursive; font-size: 2\.8rem; color: #8c5b65; text-align: center; border-bottom: 2px dashed rgba\(217, 138, 157, 0\.5\); padding-bottom: 10px; margin-bottom: 20px;">Índice de Recetas</h2>', '<h2 style="font-family: ''Dancing Script'', cursive; font-size: 2.8rem; color: #8c5b65; text-align: center; border-bottom: 2px dashed rgba(217, 138, 157, 0.5); padding-bottom: 10px; margin-bottom: 20px; line-height: 1.4; padding-top: 15px;">Índice de Recetas</h2>'

[System.IO.File]::WriteAllText("c:\Users\asus\OneDrive\Documentos\Recetario byAde\script.js", $script, [System.Text.Encoding]::UTF8)
