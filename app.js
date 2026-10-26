// ==========================================
// 1. MOTORE DEI BOTTONI IN BASSO (TAB)
// ==========================================
function cambiaTab(tabId, bottoneCliccato) {
    const schermate = document.querySelectorAll('.tab-content');
    schermate.forEach(schermata => {
        schermata.classList.remove('active');
    });

    const bottoni = document.querySelectorAll('.nav-btn');
    bottoni.forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    bottoneCliccato.classList.add('active');
}

// ==========================================
// LETTORE CSV CORAZZATO (Usato per Risultati e Statistiche)
// ==========================================
function leggiCSV(testo) {
    testo = testo.replace(/\r/g, '');
    let righe = [];
    let rigaAttuale = [];
    let valoreAttuale = "";
    let dentroVirgolette = false;

    for (let i = 0; i < testo.length; i++) {
        let char = testo[i];
        if (char === '"') {
            if (dentroVirgolette && testo[i + 1] === '"') {
                valoreAttuale += '"'; i++;
            } else {
                dentroVirgolette = !dentroVirgolette;
            }
        } else if (char === ',' && !dentroVirgolette) {
            rigaAttuale.push(valoreAttuale);
            valoreAttuale = "";
        } else if (char === '\n' && !dentroVirgolette) {
            rigaAttuale.push(valoreAttuale);
            righe.push(rigaAttuale);
            rigaAttuale = [];
            valoreAttuale = "";
        } else {
            valoreAttuale += char;
        }
    }
    if (rigaAttuale.length > 0 || valoreAttuale !== "") {
        rigaAttuale.push(valoreAttuale);
        righe.push(rigaAttuale);
    }
    return righe;
}

// ==========================================
// 2. COLLEGAMENTO DATABASE: CLASSIFICA
// ==========================================
const urlClassifica = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQSgZ0b-6wzTnNRq37OxOvEbVjyW-vNbuxR-sg6rToRvPAcg1NBtVr_54dTh5tmmCbHWDGPWsakZti0/pub?gid=0&single=true&output=csv`;

async function caricaClassifica() {
    try {
        const response = await fetch(urlClassifica);
        const data = await response.text();
        const righe = data.split('\n');
        const container = document.querySelector('.standings-container');
        
        let htmlClassifica = `
            <div class="standings-header">
                <div class="col-pos">#</div>
                <div class="col-team">Squadra</div>
                <div class="col-pt">Pt</div>
                <div class="col-gf">GF</div>
                <div class="col-gs">GS</div>
                <div class="col-dr">DR</div>
            </div>`;

        for (let i = 1; i < righe.length; i++) {
            if (righe[i].trim() === '') continue;
            const colonne = righe[i].split(',');
            const pos = colonne[0];
            const squadra = colonne[1];
            const pt = colonne[2];
            const gf = colonne[3];
            const gs = colonne[4];
            const dr = colonne[5];
            
            const nomeLogo = squadra.trim().toLowerCase().replace(/\s+/g, '') + '_logo.png';
            
            // --- REGOLA SPECIALE DIMENSIONI CLASSIFICA ---
            let sizeClassifica = "25px";
            if (nomeLogo === "sslazo_logo.png" || nomeLogo === "realmadrink_logo.png" || nomeLogo === "teambarazzo_logo.png") {
                sizeClassifica = "50px"; 
            }

            htmlClassifica += `
                <div class="standings-row">
                    <div class="col-pos">${pos}</div>
                    <div class="col-team" style="display: flex; align-items: center; gap: 8px;">
                        <img src="img/${nomeLogo}?v=7" alt="Stemma" style="width: ${sizeClassifica}; height: ${sizeClassifica}; object-fit: contain;">
                        ${squadra.trim()}
                    </div>
                    <div class="col-pt">${pt}</div>
                    <div class="col-gf">${gf}</div>
                    <div class="col-gs">${gs}</div>
                    <div class="col-dr">${dr}</div>
                </div>`;
        }
        if(container) container.innerHTML = htmlClassifica;
    } catch (error) {
        console.error("Errore classifica:", error);
    }
}
caricaClassifica();

// ==========================================
// 3. COLLEGAMENTO DATABASE: RISULTATI
// ==========================================
const urlRisultati = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSgZ0b-6wzTnNRq37OxOvEbVjyW-vNbuxR-sg6rToRvPAcg1NBtVr_54dTh5tmmCbHWDGPWsakZti0/pub?gid=1987827721&single=true&output=csv";

let tutteLePartite = [];
let giornateDisponibili = [];
let indiceGiornataAttuale = 0;

async function caricaRisultati() {
    try {
        const response = await fetch(urlRisultati);
        const data = await response.text();
        const righe = leggiCSV(data);
        
        tutteLePartite = [];
        giornateDisponibili = [];
        
        for (let i = 1; i < righe.length; i++) {
            if (!righe[i] || righe[i].length < 2) continue;
            const colonne = righe[i];
            
            const partita = {
                giornata: colonne[0] ? colonne[0].trim() : "",
                dataOra: colonne[1] ? colonne[1].trim() : "",
                sqCasa: colonne[2] ? colonne[2].trim() : "",
                golCasa: colonne[3] ? colonne[3].trim() : "",
                sqTrasf: colonne[4] ? colonne[4].trim() : "",
                golTrasf: colonne[5] ? colonne[5].trim() : "",
                stato: colonne[6] ? colonne[6].trim() : "",
                ptCasa: colonne[7] ? colonne[7].trim() : "",
                evCasa: colonne[8] ? colonne[8].trim() : "",
                ptTrasf: colonne[9] ? colonne[9].trim() : "",
                evTrasf: colonne[10] ? colonne[10].trim() : ""
            };
            
            if (partita.giornata === "") continue;

            tutteLePartite.push(partita);
            if (!giornateDisponibili.includes(partita.giornata)) {
                giornateDisponibili.push(partita.giornata);
            }
        }
        
        const selector = document.getElementById('giornata-selector');
        if(selector) {
            selector.innerHTML = "";
            giornateDisponibili.forEach((g, index) => {
                let option = document.createElement('option');
                option.value = index;
                option.text = g;
                selector.appendChild(option);
            });
            indiceGiornataAttuale = giornateDisponibili.length - 1;
            selector.value = indiceGiornataAttuale;
        }
        mostraGiornata(indiceGiornataAttuale);
    } catch (error) {
        console.error("Errore risultati:", error);
    }
}

function mostraGiornata(indice) {
    if(giornateDisponibili.length === 0) return;
    const nomeGiornata = giornateDisponibili[indice];
    const partiteGiornata = tutteLePartite.filter(p => p.giornata === nomeGiornata);
    
    const container = document.querySelector('#risultati .match-list');
    let htmlRisultati = "";
    
    partiteGiornata.forEach((p, i) => {
        const logoCasa = p.sqCasa.trim().toLowerCase().replace(/\s+/g, '') + '_logo.png';
        const logoTrasf = p.sqTrasf.trim().toLowerCase().replace(/\s+/g, '') + '_logo.png';

        // --- REGOLA SPECIALE DIMENSIONI RISULTATI (Squadra in Casa) ---
        let sizeCasa = "35px"; 
        if (logoCasa === "sslazo_logo.png" || logoCasa === "realmadrink_logo.png" || logoCasa === "teambarazzo_logo.png") { 
            sizeCasa = "70px"; 
        }

        // --- REGOLA SPECIALE DIMENSIONI RISULTATI (Squadra in Trasferta) ---
        let sizeTrasf = "35px";
        if (logoTrasf === "sslazo_logo.png" || logoTrasf === "realmadrink_logo.png" || logoTrasf === "teambarazzo_logo.png") { 
            sizeTrasf = "70px"; 
        }

        htmlRisultati += `
            <div class="match-row" onclick="apriDettagli(${indice}, ${i})">
                <div class="team team-home">
                    <img src="img/${logoCasa}?v=7" alt="Casa" style="width: ${sizeCasa}; height: ${sizeCasa}; object-fit: contain;">
                    <div class="team-info">
                        <span class="team-name">${p.sqCasa.trim()}</span>
                        <span class="team-score">${p.golCasa}</span>
                    </div>
                </div>
                <div class="match-center">
                    <i class="fa-solid fa-tv match-icon"></i>
                    <span class="match-status">${p.stato}</span>
                    <span class="match-date">${p.dataOra}</span>
                </div>
                <div class="team team-away">
                    <div class="team-info">
                        <span class="team-name">${p.sqTrasf.trim()}</span>
                        <span class="team-score">${p.golTrasf}</span>
                    </div>
                    <img src="img/${logoTrasf}?v=7" alt="Trasferta" style="width: ${sizeTrasf}; height: ${sizeTrasf}; object-fit: contain;">
                </div>
            </div>`;
    });
    
    if(container) container.innerHTML = htmlRisultati;
    const selector = document.getElementById('giornata-selector');
    if(selector) selector.value = indice;
}
caricaRisultati();

// ==========================================
// 4. FUNZIONI MODALE E FILTRI (RISULTATI)
// ==========================================
function filtraGiornata() {
    const selector = document.getElementById('giornata-selector');
    indiceGiornataAttuale = parseInt(selector.value);
    mostraGiornata(indiceGiornataAttuale);
}

function apriDettagli(indiceGiornata, indicePartita) {
    const nomeGiornata = giornateDisponibili[indiceGiornata];
    const partiteGiornata = tutteLePartite.filter(p => p.giornata === nomeGiornata);
    const p = partiteGiornata[indicePartita];
    
    document.getElementById('modal-title').innerText = `${p.sqCasa} - ${p.sqTrasf}`;
    document.getElementById('modal-pt-casa').innerText = p.ptCasa ? p.ptCasa : "-";
    document.getElementById('modal-pt-trasf').innerText = p.ptTrasf ? p.ptTrasf : "-";
    
    const formattaEventi = (testo) => {
        if (!testo) return "";
        return testo.split('\n').map(e => `<p style="margin:5px 0;">${e.trim()}</p>`).join('');
    };
    
    document.getElementById('modal-eventi-casa').innerHTML = formattaEventi(p.evCasa);
    document.getElementById('modal-eventi-trasf').innerHTML = formattaEventi(p.evTrasf);
    document.getElementById('match-modal').style.display = 'block';
}

function chiudiModale() {
    document.getElementById('match-modal').style.display = 'none';
}

let touchstartX = 0;
let touchendX = 0;
const risultatiSection = document.getElementById('risultati');

if(risultatiSection) {
    risultatiSection.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    });
    risultatiSection.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        gestisciSwipe();
    });
}

function gestisciSwipe() {
    if (touchendX < touchstartX - 50) {
        if (indiceGiornataAttuale < giornateDisponibili.length - 1) {
            indiceGiornataAttuale++;
            mostraGiornata(indiceGiornataAttuale);
        }
    }
    if (touchendX > touchstartX + 50) {
        if (indiceGiornataAttuale > 0) {
            indiceGiornataAttuale--;
            mostraGiornata(indiceGiornataAttuale);
        }
    }
}

// ==========================================
// 5. COLLEGAMENTO DATABASE: STATISTICHE
// ==========================================
const urlStatistiche = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSgZ0b-6wzTnNRq37OxOvEbVjyW-vNbuxR-sg6rToRvPAcg1NBtVr_54dTh5tmmCbHWDGPWsakZti0/pub?gid=2118793780&single=true&output=csv"; 

async function caricaStatistiche() {
    try {
        const response = await fetch(urlStatistiche);
        const data = await response.text();
        const righe = leggiCSV(data);
        const container = document.getElementById('stats-container');
        let htmlStats = "";

        if (righe.length > 0) {
            const headers = righe[0];

            for (let c = 0; c < headers.length; c++) {
                const titoloCategoria = headers[c] ? headers[c].trim() : "";
                if (!titoloCategoria || titoloCategoria.toLowerCase().includes('squadra')) continue; 

                let hasSquadraCol = (c + 1 < headers.length && headers[c+1] && headers[c+1].trim().toLowerCase().includes('squadra'));

                htmlStats += `
                    <div class="stat-card">
                        <div class="stat-header">${titoloCategoria}</div>`;

                for (let r = 1; r < righe.length; r++) {
                    if (!righe[r] || righe[r].length <= c) continue;
                    
                    let cellaStat = righe[r][c] ? righe[r][c].trim() : "";
                    if (cellaStat === "") continue;

                    let nome = cellaStat;
                    let numero = "";
                    const match = cellaStat.match(/^(.*?)\s+(\d+(?:\.\d+)?)$/);
                    if (match) {
                        nome = match[1];
                        numero = match[2];
                    }

                    let squadra = "";
                    if (hasSquadraCol && righe[r].length > c + 1) {
                        squadra = righe[r][c+1] ? righe[r][c+1].trim() : "";
                    }

                    let logoHtml = "";
                    if (squadra !== "") {
                        const nomeLogo = squadra.toLowerCase().replace(/\s+/g, '') + '_logo.png';
                        
                        // 1. Impostiamo la misura base per tutti (25px)
                        let logoWidth = "25px";
                        let logoHeight = "25px";

                        // 2. Regola speciale: LA VIRGOLETTA ORA E' CORRETTA
                        if (nomeLogo === "sslazo_logo.png" || nomeLogo === "realmadrink_logo.png" || nomeLogo === "teambarazzo_logo.png") {
                            logoWidth = "50px";
                            logoHeight = "50px";
                        }

                        // 3. Generiamo l'immagine con le misure dinamiche
                        logoHtml = `<img src="img/${nomeLogo}?v=7" alt="${squadra}" style="width: ${logoWidth}; height: ${logoHeight}; object-fit: contain;">`;
                    }

                    // Impaginazione: Giocatore + Logo (Sinistra) -------- Numero (Destra)
                    htmlStats += `
                        <div class="stat-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f9f9f9;">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                <span class="stat-player" style="font-weight: 600; color: #444; font-size: 1rem;">${nome}</span>
                                ${logoHtml}
                            </div>
                            <span class="stat-value" style="font-weight: 800; color: #8b0000; font-size: 1.1rem;">${numero}</span>
                        </div>`;
                }
                htmlStats += `</div>`;
                
                if (hasSquadraCol) {
                    c++;
                }
            }
        }
        if(container) container.innerHTML = htmlStats;
    } catch (error) {
        console.error("Errore statistiche:", error);
    }
}
caricaStatistiche();