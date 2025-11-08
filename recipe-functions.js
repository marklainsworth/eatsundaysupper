let isMetric = false,
    isItalian = false,
    currentScale = 1;

// Removed Cantucci hardcoding — only keeping numeric base
const baseData = {
  yieldBaseNumber: 36
};

// ---------------- UNIT TOGGLE ----------------
function toggleUnits() {
  isMetric = !isMetric;
  const btn = document.getElementById("unitBtn"),
        usUnits = document.querySelectorAll(".unit.us, .amount.us"),
        metricUnits = document.querySelectorAll(".unit.metric, .amount.metric");

  if (isMetric) {
    btn.textContent = "US";
    usUnits.forEach(e => e.style.display = "none");
    metricUnits.forEach(e => e.style.display = "inline");
  } else {
    btn.textContent = "Metric";
    usUnits.forEach(e => e.style.display = "inline");
    metricUnits.forEach(e => e.style.display = "none");
  }
}

// ---------------- LANGUAGE TOGGLE ----------------
function toggleLanguage() {
  isItalian = !isItalian;
  const btn = document.getElementById("langBtn");
  const isIt = isItalian;
  const t = baseData.yieldBaseNumber * currentScale;

  btn.textContent = isIt ? "🇺🇸" : "🇮🇹";

  // Change all text based on data-en / data-it
  document.querySelectorAll("[data-en]").forEach(el => {
    const newText = isIt ? el.getAttribute("data-it") : el.getAttribute("data-en");
    if (newText) el.textContent = newText;
  });

  // Update yield line with correct language + scaling
  const yieldEl = document.getElementById("yield");
  if (yieldEl) yieldEl.textContent = isIt ? `${t} Pezzi` : `${t} Pieces`;
}

// ---------------- SCALE RECIPE ----------------
function scaleRecipe() {
  const scale = parseFloat(document.getElementById("scaleSelect").value);
  currentScale = scale;

  const yieldBase = baseData.yieldBaseNumber || 36;
  const newYield = Math.round(yieldBase * scale);
  document.getElementById("yield").textContent = isItalian ? `${newYield} Pezzi` : `${newYield} Pieces`;

  document.querySelectorAll("#ingredientsList .ingredient-row").forEach(row => {
    const usValue = parseFloat(row.getAttribute("data-us"));
    const metricValue = parseFloat(row.getAttribute("data-metric"));
    if (!isNaN(usValue)) row.querySelector(".amount.us").textContent = formatNumber(usValue * scale);
    if (!isNaN(metricValue)) row.querySelector(".amount.metric").textContent = formatNumber(metricValue * scale);
  });
}

// ---------------- FRACTION FORMATTER ----------------
function formatNumber(value) {
  if (value === 0.25) return "¼";
  if (value === 0.33 || value === 0.333) return "⅓";
  if (value === 0.5) return "½";
  if (value === 0.66 || value === 0.667) return "⅔";
  if (value === 0.75) return "¾";

  const intPart = Math.floor(value);
  const frac = value - intPart;
  if (Math.abs(frac - 0.25) < 0.01 && intPart > 0) return intPart + "¼";
  if (Math.abs(frac - 0.33) < 0.01 && intPart > 0) return intPart + "⅓";
  if (Math.abs(frac - 0.5) < 0.01 && intPart > 0) return intPart + "½";
  if (Math.abs(frac - 0.67) < 0.01 && intPart > 0) return intPart + "⅔";
  if (Math.abs(frac - 0.75) < 0.01 && intPart > 0) return intPart + "¾";

  return value % 1 !== 0 ? (Math.round(value * 10) / 10).toString() : value.toString();
}

// ---------------- SAVE AS RECIPE CARD ----------------
function saveAsRecipeCard() {
  const w = window.open("", "_blank", "width=900,height=800");
  if (!w) return showNotification("Please allow pop-ups");

  const title = document.getElementById("recipeTitle").textContent,
        yieldVal = document.getElementById("yield").textContent,
        difficulty = document.getElementById("difficulty").textContent,
        prep = document.getElementById("prepTime").textContent,
        cook = document.getElementById("cookTime").textContent,
        ingredients = document.getElementById("ingredientsList").innerHTML,
        instructions = document.querySelector(".instructions-list").innerHTML,
        notes = document.querySelector(".notes-section").innerHTML,
        footer = document.querySelector(".recipe-footer").innerHTML,
        labels = document.querySelectorAll(".lang-label");

  w.document.write(`<!DOCTYPE html>
  <html><head><meta charset="UTF-8"><title>${title}</title>
  <style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6;color:#333;padding:40px}
  .recipe-container{max-width:800px;margin:0 auto;position:relative}
  .logo-badge{position:absolute;top:0;right:0;width:100px;height:auto}
  .recipe-title{font-family:Georgia,"Times New Roman",serif;font-size:2.2em;margin-bottom:20px;color:#2c2c2c;padding-right:120px}
  .recipe-meta{display:flex;gap:30px;margin-bottom:15px;padding-bottom:15px;border-bottom:1px solid #e0e0e0;flex-wrap:wrap}
  .meta-item{font-size:.95em}
  .difficulty{display:inline-block;padding:4px 12px;border-radius:4px;font-size:.85em;font-weight:600}
  .difficulty.easy{background:#e8f5e9;color:#2e7d32}
  .difficulty.medium{background:#fff3e0;color:#e65100}
  .difficulty.hard{background:#ffebee;color:#c62828}
  .yield{font-size:1.1em;margin-bottom:25px;color:#666}
  .section-title{font-family:Georgia,"Times New Roman",serif;font-size:1.4em;margin:30px 0 20px 0;color:#2c2c2c}
  .ingredients-header{display:grid;grid-template-columns:1fr 60px;padding-bottom:10px;border-bottom:2px solid #4a7c59;margin-bottom:10px}
  .header-title{font-weight:600;color:#4a7c59;font-size:.95em}
  .ingredients-list{list-style:none;margin-bottom:30px}
  .ingredient-row{display:grid;grid-template-columns:1fr 60px;align-items:center;padding:12px 0;border-bottom:1px solid #f0f0f0}
  .ingredient-row:last-child{border-bottom:none}
  .ingredient-content{font-size:1em}
  .measurement{font-weight:600;color:#4a7c59}
  .measurement .metric{display:${isMetric ? "inline" : "none"}}
  .measurement .us{display:${isMetric ? "none" : "inline"}}
  .link-cell{text-align:center}
  .ingredient-link{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#f0f0f0;color:#4a7c59;text-decoration:none}
  .ingredient-link svg{width:14px;height:14px}
  .instructions-list{counter-reset:step-counter;list-style:none}
  .instructions-list li{counter-increment:step-counter;margin-bottom:20px;padding-left:45px;position:relative;line-height:1.7}
  .instructions-list li::before{content:counter(step-counter);position:absolute;left:0;top:0;width:32px;height:32px;background:#4a7c59;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:.9em}
  .notes-section{margin-top:40px;padding:20px;background:#f9f9f9;border-left:4px solid #4a7c59;border-radius:4px}
  .notes-section h3{font-family:Georgia,"Times New Roman",serif;font-size:1.1em;margin-bottom:10px;color:#2c2c2c}
  .notes-section p{color:#666;line-height:1.7;font-size:.95em}
  .recipe-footer{margin-top:40px;padding-top:30px;border-top:1px solid #e0e0e0;text-align:center}
  .footer-website{font-size:1em;font-weight:600;color:#4a7c59;margin-bottom:8px}
  .footer-social{font-size:.9em;color:#666;display:flex;align-items:center;justify-content:center;gap:12px}
  .social-icon{width:20px;height:20px;color:#4a7c59}
  .social-text{font-size:.9em;color:#666}
  @media print{body{padding:20px}.logo-badge{width:80px}.link-cell{display:none}}
  </style></head>
  <body>
  <div class="recipe-container">
    <img class="logo-badge" src="https://images.squarespace-cdn.com/content/61fd89b45ec78c52f2d9e346/3e2ae630-6dd2-4bd3-a3d6-c3f6beced096/Test4.png?content-type=image%2Fpng">
    <h1 class="recipe-title">${title}</h1>
    <div class="recipe-meta">
      <div class="meta-item"><strong>${labels[0].textContent}</strong> ${prep}</div>
      <div class="meta-item"><strong>${labels[1].textContent}</strong> ${cook}</div>
      <div class="meta-item"><span class="difficulty ${difficulty.toLowerCase()}">${difficulty}</span></div>
    </div>
    <div class="yield"><strong>${labels[2].textContent}</strong> ${yieldVal}</div>
    <h2 class="section-title">${labels[3].textContent}</h2>
    <div class="ingredients-header">
      <div class="header-title">Ingredient</div>
      <div class="header-title" style="text-align:center">Links</div>
    </div>
    <ul class="ingredients-list">${ingredients}</ul>
    <h2 class="section-title">${labels[4].textContent}</h2>
    <ol class="instructions-list">${instructions}</ol>
    <div class="notes-section">${notes}</div>
    <div class="recipe-footer">${footer}</div>
  </div>
  <script>window.onload=function(){window.focus();setTimeout(()=>window.print(),500)}</script>
  </body></html>`);
  w.document.close();
}

// ---------------- SHARE MENU & NOTIFICATIONS ----------------
function toggleShareMenu() {
  document.getElementById("shareMenu").classList.toggle("active");
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  showNotification("Link copied!");
  toggleShareMenu();
}

function shareToFacebook() {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
  toggleShareMenu();
}

function shareToPinterest() {
  window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(document.querySelector(".recipe-title").textContent)}`, "_blank");
  toggleShareMenu();
}

function shareToEmail() {
  window.location.href = `mailto:?subject=${encodeURIComponent(document.querySelector(".recipe-title").textContent)}&body=${encodeURIComponent("Check out this recipe: " + window.location.href)}`;
  toggleShareMenu();
}

function showNotification(msg) {
  const n = document.getElementById("notification");
  n.textContent = msg;
  n.classList.add("show");
  setTimeout(() => n.classList.remove("show"), 3000);
}

document.addEventListener("click", e => {
  const btn = document.getElementById("shareBtn"),
        menu = document.getElementById("shareMenu");
  if (!btn.contains(e.target) && menu.classList.contains("active")) menu.classList.remove("active");
});
