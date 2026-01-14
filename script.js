// --- CONFIGURATION ---
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
    if (!uInput.value || uInput.value == 230 || uInput.value == 400) {
        uInput.value = isTriphasé ? 400 : 230;
    }
    if (iInput.value) calculate('i-val');
    else if (rInput.value) calculate('r-val');
});

uInput.value = 230; 

inputs.forEach(input => {
    input.addEventListener('input', (e) => calculate(e.target.id));
});

// --- CALCULATEUR ---
function calculate(sourceId) {
    let u = parseFloat(uInput.value);
    let i = parseFloat(iInput.value);
    let r = parseFloat(rInput.value);
    let p = parseFloat(pInput.value);
    const rac3 = 1.732;

    if (sourceId === 'r-val' && r && u) {
        i = u / r;
        iInput.value = i.toFixed(2);
        if (isTriphasé) pInput.value = (u * i * rac3).toFixed(2);
        else pInput.value = (u * i).toFixed(2);
    } 
    else if ((sourceId === 'i-val' || sourceId === 'u-val') && u && i) {
        if (isTriphasé) pInput.value = (u * i * rac3).toFixed(2);
        else pInput.value = (u * i).toFixed(2);
        rInput.value = (u / i).toFixed(2);
    } 
    else if (sourceId === 'p-val' && p && u) {
        if (isTriphasé) i = p / (u * rac3);
        else i = p / u;
        iInput.value = i.toFixed(2);
        rInput.value = (u / i).toFixed(2);
    }

    let finalI = parseFloat(iInput.value);
    if(finalI) updateCableSection(finalI);
    else cableOutput.innerText = "---";
}

function updateCableSection(amp) {
    let section = "---";
    if (amp <= 10) section = "1.5 mm²";
    else if (amp <= 16) section = "1.5 mm² / 2.5 mm²";
    else if (amp <= 20) section = "2.5 mm²";
    else if (amp <= 25) section = "4 mm²";
    else if (amp <= 32) section = "6 mm²";
    else if (amp <= 40) section = "10 mm²";
    else if (amp <= 63) section = "16 mm²";
    else section = "> 16 mm²";

    cableOutput.innerText = section;
}

function resetCalculator() {
    inputs.forEach(inp => inp.value = '');
    uInput.value = isTriphasé ? 400 : 230;
    cableOutput.innerText = "---";
}

// --- NAVIGATION ---
function showSection(id) {
    document.querySelectorAll('main > section').forEach(sec => {
        sec.classList.remove('active-section');
        sec.classList.add('hidden-section');
    });
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active-btn'));

    document.getElementById(id).classList.remove('hidden-section');
    document.getElementById(id).classList.add('active-section');

    if(id === 'calculator') document.getElementById('btn-calc').classList.add('active-btn');
    else if(id === 'guide') document.getElementById('btn-guide').classList.add('active-btn');
    else if(id === 'formulas') document.getElementById('btn-form').classList.add('active-btn');
}

// --- GUIDE MULTIMÈTRE ---
const positions = {
    red: { 
        tension: { top: 80, left: 35 }, 
        resistance: { top: 85, left: 30 }, 
        intensite: { top: 25, left: 25 },
        capacite: { top: 75, left: 80 } // Position approximative symbole condo
    },
    yellow: { 
        tension: { top: 75, left: 22 }, 
        resistance: { top: 48, left: 12 }, 
        intensite: { top: 12, left: 50 },
        capacite: { top: 48, left: 12 } // Souvent partagé avec Ohm sur les pinces
    }
};
const images = { red: 'assets/red_multimeter.png', yellow: 'assets/yellow_multimeter.png' };

const explanations = {
    tension: "Vérification de présence de tension. 230V entre Phase/Neutre. 400V entre Phases.",
    intensite: "Mesure du débit de courant (Ampérage). Toujours avec la pince autour d'UN SEUL fil.",
    resistance: "Test de continuité (Bip) ou valeur ohmique. Toujours HORS TENSION.",
    capacite: "Mesure de la capacité (µF) des condensateurs. Déchargez le condensateur avant mesure !"
};

// Liste des composants
const componentOptions = {
    tension: [
        {val: 'prise', label: 'Prise de courant'},
        {val: 'moteur', label: 'Moteur / Bornier'},
        {val: 'contact', label: 'Contacteur / Disjoncteur'}
    ],
    resistance: [
        {val: 'contact', label: 'Contact sec / Thermostat'},
        {val: 'moteur', label: 'Enroulement Moteur'},
        {val: 'resistance', label: 'Résistance de chauffe'}
    ],
    intensite: [
        {val: 'moteur', label: 'Moteur'},
        {val: 'tableau', label: 'Départ Tableau'}
    ],
    capacite: [
        {val: 'demarrage', label: 'Condensateur Démarrage'},
        {val: 'permanent', label: 'Condensateur Permanent'},
        {val: 'carte', label: 'Composant électronique'}
    ]
};

function selectMeasurement(type) {
    currentMeasure = type;
    document.getElementById('guide-display').classList.remove('hidden-section');
    document.getElementById('guide-display').classList.add('active-section');
    document.getElementById('measure-info').classList.add('hidden');
    document.getElementById('help-gallery').innerHTML = ""; 
    
    updateGuideContent();
    updateComponentSelector();
    updateMultimeterView();
}

function updateComponentSelector() {
    const selectorArea = document.getElementById('component-selector-area');
    const select = document.getElementById('component-select');
    select.innerHTML = "<option value=''>-- Choisir pour voir les photos --</option>";

    const opts = componentOptions[currentMeasure];
    if (opts) {
        selectorArea.classList.remove('hidden-section');
        opts.forEach(opt => {
            let option = document.createElement("option");
            option.value = opt.val;
            option.innerText = opt.label;
            select.appendChild(option);
        });
    } else {
        selectorArea.classList.add('hidden-section');
    }
}

// AFFICHE LES IMAGES QUAND ON CHOISIT DANS LA LISTE
function showComponentImages() {
    const comp = document.getElementById('component-select').value;
    const gallery = document.getElementById('help-gallery');
    gallery.innerHTML = ""; 

    if (!comp) return;

    for (let i = 1; i <= 6; i++) {
        // Nom : capacite_demarrage_1.jpg
        let imageName = `${currentMeasure}_${comp}_${i}.jpg`;
        let imagePath = `assets/${imageName}`;

        let div = document.createElement('div');
        div.innerHTML = `<img src="${imagePath}" class="gallery-img" alt="Aide ${i}" onerror="this.remove()">`;
        gallery.appendChild(div);
    }
}

function toggleInfo() {
    document.getElementById('measure-info').classList.toggle('hidden');
}

function updateGuideContent() {
    const title = document.getElementById('measure-title');
    const warning = document.getElementById('safety-warning');
    const desc = document.getElementById('measure-desc');
    const infoText = document.getElementById('info-text');

    if (explanations[currentMeasure]) infoText.innerText = explanations[currentMeasure];

    if (currentMeasure === 'tension') {
        title.innerText = "Tension (Volt)";
        warning.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> ATTENTION : SOUS TENSION !";
        warning.className = "warning-box bg-danger";
        desc.innerText = "Branchez en parallèle. Calibre V~ > 230V.";
    } else if (currentMeasure === 'intensite') {
        title.innerText = "Intensité (Ampère)";
        warning.innerHTML = "<i class='fa-solid fa-bolt'></i> Avec Pince Ampermétrique";
        warning.className = "warning-box bg-danger";
        desc.innerText = "Pincez uniquement la phase.";
    } else if (currentMeasure === 'resistance') {
        title.innerText = "Résistance / Continuité";
        warning.innerHTML = "<i class='fa-solid fa-check'></i> IMPORTANT : HORS TENSION !";
        warning.className = "warning-box bg-safe";
        desc.innerText = "Coupez le courant avant de mesurer.";
    } else if (currentMeasure === 'capacite') {
        title.innerText = "Condensateur (Capacité)";
        warning.innerHTML = "<i class='fa-solid fa-car-battery'></i> DANGER : DÉCHARGER AVANT !";
        warning.className = "warning-box bg-danger";
        desc.innerText = "Court-circuitez les bornes du condo avec un tournevis isolé avant de mesurer.";
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
