// --- VARIABLES GLOBALES ---
let isTriphasé = false;
let currentMeasure = null;

// --- DOM ELEMENTS ---
const uInput = document.getElementById('u-val');
const iInput = document.getElementById('i-val');
const rInput = document.getElementById('r-val');
const pInput = document.getElementById('p-val');
const phaseToggle = document.getElementById('phase-toggle');

// --- INIT ---
phaseToggle.addEventListener('change', () => {
    isTriphasé = phaseToggle.checked;
    // Mise à jour de la tension par défaut
    if (!uInput.value || uInput.value == 230 || uInput.value == 400) {
        uInput.value = isTriphasé ? 400 : 230;
    }
    calculate();
});

// Initialisation par défaut
uInput.value = 230; 

// --- LOGIQUE CALCULATEUR ---
const inputs = [uInput, iInput, rInput, pInput];
inputs.forEach(input => {
    input.addEventListener('input', calculate);
});

function calculate() {
    let u = parseFloat(uInput.value);
    let i = parseFloat(iInput.value);
    let r = parseFloat(rInput.value);
    let p = parseFloat(pInput.value);

    // Compter les valeurs entrées
    let filled = 0;
    if (u) filled++;
    if (i) filled++;
    if (r) filled++;
    if (p) filled++;

    if (filled < 2) return; // Besoin de 2 valeurs min

    // Facteur racine de 3 pour le triphasé (approx 1.732)
    const rac3 = 1.732; 

    // CALCULS (Simplifiés CosPhi = 1 pour l'exercice)
    // Cas Mono : P = U*I, U = R*I
    // Cas Tri : P = U * I * rac3 (U est la tension composée 400V)

    // Si on a U et I
    if (u && i && !p && !r) {
        if (isTriphasé) pInput.value = (u * i * rac3).toFixed(2);
        else pInput.value = (u * i).toFixed(2);
        
        // R est calculé généralement en mono sur la phase
        // En tri, c'est plus complexe (Z), on simplifie U/I
        rInput.value = (u / i).toFixed(2);
    }
    // Si on a P et U
    else if (p && u && !i && !r) {
        let iCalc;
        if (isTriphasé) iCalc = p / (u * rac3);
        else iCalc = p / u;
        
        iInput.value = iCalc.toFixed(2);
        rInput.value = (u / iCalc).toFixed(2);
    }
    // Si on a R et I (Loi d'ohm U = R*I est valable)
    else if (r && i && !u && !p) {
        let uCalc = r * i;
        uInput.value = uCalc.toFixed(2);
        
        if (isTriphasé) pInput.value = (uCalc * i * rac3).toFixed(2);
        else pInput.value = (uCalc * i).toFixed(2);
    }
}

function resetCalculator() {
    inputs.forEach(inp => inp.value = '');
    uInput.value = isTriphasé ? 400 : 230;
}

// --- NAVIGATION ---
function showSection(id) {
    document.getElementById('calculator').classList.remove('active-section');
    document.getElementById('calculator').classList.add('hidden-section');
    document.getElementById('guide').classList.remove('active-section');
    document.getElementById('guide').classList.add('hidden-section');
    
    document.getElementById('btn-calc').classList.remove('active-btn');
    document.getElementById('btn-guide').classList.remove('active-btn');

    const target = document.getElementById(id);
    target.classList.remove('hidden-section');
    target.classList.add('active-section');

    if(id === 'calculator') document.getElementById('btn-calc').classList.add('active-btn');
    else document.getElementById('btn-guide').classList.add('active-btn');
}

// --- LOGIQUE MULTIMÈTRE ---

// Configuration des coordonnées (TOP %, LEFT %) pour le cercle rouge
const positions = {
    red: {
        tension: { top: 88, left: 35 },     // Position V~ (estimée en bas à droite)
        resistance: { top: 75, left: 20 },  // Position Ohm (estimée bas gauche)
        intensite: { top: 20, left: 20 }    // Position 66A~ (estimée haut gauche)
    },
    yellow: {
        tension: { top: 50, left: 50 },     // A ajuster selon ta photo jaune
        resistance: { top: 60, left: 60 },
        intensite: { top: 40, left: 40 }
    }
};

const images = {
    red: 'assets/red_multimeter.png',
    yellow: 'assets/yellow_multimeter.png'
};

function selectMeasurement(type) {
    currentMeasure = type;
    document.getElementById('guide-display').classList.remove('hidden-section');
    document.getElementById('guide-display').classList.add('active-section');
    
    updateGuideContent();
    updateMultimeterView();
}

function updateGuideContent() {
    const title = document.getElementById('measure-title');
    const warning = document.getElementById('safety-warning');
    const desc = document.getElementById('measure-desc');

    if (currentMeasure === 'tension') {
        title.innerText = "Mesure de Tension (Volt)";
        warning.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> ATTENTION : Mesure SOUS TENSION !";
        warning.className = "warning-box bg-danger";
        desc.innerText = "Branchez le voltmètre en parallèle (dérivation). En Triphasé : Mesure entre phases (400V). En Mono : Entre Phase et Neutre (230V).";
    } else if (currentMeasure === 'intensite') {
        title.innerText = "Mesure d'Intensité (Ampère)";
        warning.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> ATTENTION : Mesure SOUS TENSION avec Pince !";
        warning.className = "warning-box bg-danger";
        desc.innerText = "Utilisez impérativement une pince ampèremétrique. N'enserrez qu'UN SEUL fil (Phase) à la fois dans la pince.";
    } else if (currentMeasure === 'resistance') {
        title.innerText = "Mesure de Résistance (Ohm)";
        warning.innerHTML = "<i class='fa-solid fa-check'></i> IMPORTANT : Mesure HORS TENSION !";
        warning.className = "warning-box bg-safe";
        desc.innerText = "Coupez le courant avant de mesurer. Débranchez le composant si possible. Branchez en parallèle sur le composant isolé.";
    }
}

function updateMultimeterView() {
    if (!currentMeasure) return;

    const select = document.getElementById('multimeter-select');
    const model = select.value; // 'red' ou 'yellow'
    const imgElement = document.getElementById('multimeter-img');
    const ring = document.getElementById('selector-ring');

    // Changer l'image
    imgElement.src = images[model];

    // Positionner le cercle
    const coords = positions[model][currentMeasure];
    
    if (coords) {
        ring.style.display = 'block';
        ring.style.top = coords.top + '%';
        ring.style.left = coords.left + '%';
    } else {
        ring.style.display = 'none';
    }
}
