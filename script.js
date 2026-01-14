// --- VARIABLES GLOBALES ---
let isTriphasé = false;
let currentMeasure = null;

// --- DOM ELEMENTS ---
const uInput = document.getElementById('u-val');
const iInput = document.getElementById('i-val');
const rInput = document.getElementById('r-val');
const pInput = document.getElementById('p-val');
const cableOutput = document.getElementById('cable-result');
const phaseToggle = document.getElementById('phase-toggle');

const inputs = [uInput, iInput, rInput, pInput];

// --- INIT ---
phaseToggle.addEventListener('change', () => {
    isTriphasé = phaseToggle.checked;
    // Remet U par défaut si vide ou standard
    if (!uInput.value || uInput.value == 230 || uInput.value == 400) {
        uInput.value = isTriphasé ? 400 : 230;
    }
    // Relance le calcul si possible
    if (iInput.value) calculate('i-val');
    else if (rInput.value) calculate('r-val');
});

// Valeur par défaut
uInput.value = 230; 

// --- CALCULATEUR INTELLIGENT ---
inputs.forEach(input => {
    input.addEventListener('input', (e) => calculate(e.target.id));
});

function calculate(sourceId) {
    let u = parseFloat(uInput.value);
    let i = parseFloat(iInput.value);
    let r = parseFloat(rInput.value);
    let p = parseFloat(pInput.value);
    const rac3 = 1.732;

    // SCÉNARIO 1 : Entrée de RÉSISTANCE (R)
    // Comme U est fixe, on calcule I = U / R, puis P
    if (sourceId === 'r-val' && r && u) {
        i = u / r;
        iInput.value = i.toFixed(2);
        
        if (isTriphasé) pInput.value = (u * i * rac3).toFixed(2);
        else pInput.value = (u * i).toFixed(2);
    }

    // SCÉNARIO 2 : Entrée d'INTENSITÉ (I) ou TENSION (U)
    // On calcule P et R
    else if ((sourceId === 'i-val' || sourceId === 'u-val') && u && i) {
        if (isTriphasé) pInput.value = (u * i * rac3).toFixed(2);
        else pInput.value = (u * i).toFixed(2);
        
        rInput.value = (u / i).toFixed(2);
    }

    // SCÉNARIO 3 : Entrée de PUISSANCE (P)
    // On calcule I puis R
    else if (sourceId === 'p-val' && p && u) {
        if (isTriphasé) i = p / (u * rac3);
        else i = p / u;
        
        iInput.value = i.toFixed(2);
        rInput.value = (u / i).toFixed(2);
    }

    // Mise à jour de la section de câble si on a une Intensité (I)
    let finalI = parseFloat(iInput.value);
    if(finalI) updateCableSection(finalI);
    else cableOutput.innerText = "---";
}

function updateCableSection(amp) {
    let section = "---";
    // Valeurs approximatives standards domestiques (Disjoncteur max -> Section)
    if (amp <= 10) section = "1.5 mm²";
    else if (amp <= 16) section = "1.5 mm² (ou 2.5)";
    else if (amp <= 20) section = "2.5 mm²";
    else if (amp <= 32) section = "6 mm²";
    else if (amp <= 40) section = "10 mm²";
    else if (amp <= 63) section = "16 mm²";
    else section = "> 16 mm² (Étude requise)";

    cableOutput.innerText = section;
}

function resetCalculator() {
    inputs.forEach(inp => inp.value = '');
    uInput.value = isTriphasé ? 400 : 230;
    cableOutput.innerText = "---";
}

// --- NAVIGATION ---
function showSection(id) {
    // Cache tout
    document.querySelectorAll('main > section').forEach(sec => {
        sec.classList.remove('active-section');
        sec.classList.add('hidden-section');
    });
    // Reset boutons
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active-btn');
    });

    // Active la cible
    document.getElementById(id).classList.remove('hidden-section');
    document.getElementById(id).classList.add('active-section');

    // Active le bouton
    if(id === 'calculator') document.getElementById('btn-calc').classList.add('active-btn');
    else if(id === 'guide') document.getElementById('btn-guide').classList.add('active-btn');
    else if(id === 'formulas') document.getElementById('btn-form').classList.add('active-btn');
}

// --- MULTIMÈTRE ---
const positions = {
    red: {
        tension: { top: 85, left: 70 },     
        resistance: { top: 85, left: 30 }, 
        intensite: { top: 25, left: 25 }   
    },
    yellow: {
        tension: { top: 75, left: 22 },     
        resistance: { top: 48, left: 12 },  
        intensite: { top: 12, left: 50 }   
    }
};

const images = {
    red: 'assets/red_multimeter.png',
    yellow: 'assets/yellow_multimeter.png'
};

const explanations = {
    tension: "La tension (Volts) est la 'pression' du courant. Elle permet de vérifier si une prise fonctionne (230V) ou si un fusible est grillé (0V aux bornes).",
    intensite: "L'intensité (Ampères) est le débit du courant. Elle sert à vérifier la consommation d'un appareil (ex: chauffage) ou équilibrer les phases.",
    resistance: "La résistance (Ohms) teste la continuité. Utile pour savoir si un fil est coupé, une bobine moteur est bonne, ou tester une résistance de chauffe-eau."
};

function selectMeasurement(type) {
    currentMeasure = type;
    document.getElementById('guide-display').classList.remove('hidden-section');
    document.getElementById('guide-display').classList.add('active-section');
    
    // Reset info panel
    document.getElementById('measure-info').classList.add('hidden');
    
    updateGuideContent();
    updateMultimeterView();
}

function toggleInfo() {
    const panel = document.getElementById('measure-info');
    panel.classList.toggle('hidden');
}

function updateGuideContent() {
    const title = document.getElementById('measure-title');
    const warning = document.getElementById('safety-warning');
    const desc = document.getElementById('measure-desc');
    const infoText = document.getElementById('info-text');

    // Texte explicatif bouton "?"
    if (explanations[currentMeasure]) {
        infoText.innerText = explanations[currentMeasure];
    }

    if (currentMeasure === 'tension') {
        title.innerText = "Mesure de Tension (Volt)";
        warning.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> ATTENTION : Mesure SOUS TENSION !";
        warning.className = "warning-box bg-danger";
        desc.innerText = "Branchez en dérivation (parallèle). Calibre V~ (Alternatif) supérieur à 230V.";
    } else if (currentMeasure === 'intensite') {
        title.innerText = "Mesure d'Intensité (Ampère)";
        warning.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> ATTENTION : Pince Ampèremétrique !";
        warning.className = "warning-box bg-danger";
        desc.innerText = "N'enserrez qu'un seul fil (Phase) avec la pince. Si vous prenez le câble entier, le résultat sera 0.";
    } else if (currentMeasure === 'resistance') {
        title.innerText = "Mesure de Résistance (Ohm)";
        warning.innerHTML = "<i class='fa-solid fa-check'></i> IMPORTANT : HORS TENSION !";
        warning.className = "warning-box bg-safe";
        desc.innerText = "Coupez le courant. Isolez l'élément à tester pour ne pas mesurer le reste du circuit.";
    }
}

function updateMultimeterView() {
    if (!currentMeasure) return;
    const select = document.getElementById('multimeter-select');
    const model = select.value;
    const imgElement = document.getElementById('multimeter-img');
    const ring = document.getElementById('selector-ring');
    
    imgElement.src = images[model];
    const coords = positions[model][currentMeasure];
    
    if (coords) {
        ring.style.display = 'block';
        ring.style.top = coords.top + '%';
        ring.style.left = coords.left + '%';
    } else {
        ring.style.display = 'none';
    }
}
