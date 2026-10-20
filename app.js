// 1. FUNZIONE PER CAMBIARE LE SCHERMATE DAL MENU IN BASSO
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

// 2. COLLEGAMENTO DATABASE: CLASSIFICA
const urlClassifica = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSgZ0b-6wzTnNRq37OxOvEbVjyW-vNbuxR-sg6rToRvPAcg1NBtVr_54dTh5tmmCbHWDGPWsakZti0/pub?gid=0&single=true&output=csv"; // <--- RIMETTI IL LINK QUI

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

            htmlClassifica += `
                <div class="standings-row">
                    <div class="col-pos">${pos}</div>
                    <div class="col-team">
                        <img src="img/${nomeLogo}" class="team-logo-small" alt="Stemma">
                        ${squadra.trim()}
                    </div>
                    <div class="col-pt">${pt}</div>
                    <div class="col-gf">${gf}</div>
                    <div class="col-gs">${gs}</div>
                    <div class="col-dr">${dr}</div>
                </div>`;
        }
        container.innerHTML = htmlClassifica;
    } catch (error) {
        console.error("Errore nel caricamento della classifica:", error);
    }
}
caricaClassifica();

// 3. COLLEGAMENTO DATABASE: RISULTATI
const urlRisultati = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSgZ0b-6wzTnNRq37OxOvEbVjyW-vNbuxR-sg6rToRvPAcg1NBtVr_54dTh5tmmCbHWDGPWsakZti0/pub?gid=1987827721&single=true&output=csv"; // <--- RIMETTI IL LINK QUI

async function caricaRisultati() {
    try {
        const response = await fetch(urlRisultati);
        const data = await response.text();
        const righe = data.split('\n');
        
        const container = document.querySelector('#risultati .match-list');
        let htmlRisultati = "";
        
        for (let i = 1; i < righe.length; i++) {
            if (righe[i].trim() === '') continue;
            const colonne = righe[i].split(',');
            const giornata = colonne[0];
            const dataOra = colonne[1];
            const sqCasa = colonne[2];
            const golCasa = colonne[3];
            const sqTrasf = colonne[4];
            const golTrasf = colonne[5];
            const stato = colonne[6];

            const logoCasa = sqCasa.trim().toLowerCase().replace(/\s+/g, '') + '_logo.png';
            const logoTrasf = sqTrasf.trim().toLowerCase().replace(/\s+/g, '') + '_logo.png';

            // QUI ABBIAMO AGGIUNTO L'ONCLICK SULLA RIGA PER APRIRE I DETTAGLI
            htmlRisultati += `
                <div class="match-row" onclick="apriDettagli('${sqCasa.trim()}', '${sqTrasf.trim()}')">
                    <div class="team team-home">
                        <img src="img/${logoCasa}" class="team-logo" alt="Casa">
                        <div class="team-info">
                            <span class="team-name">${sqCasa.trim()}</span>
                            <span class="team-score">${golCasa}</span>
                        </div>
                    </div>
                    <div class="match-center">
                        <i class="fa-solid fa-tv match-icon"></i>
                        <span class="match-status">${stato}</span>
                        <span class="match-date">${dataOra}</span>
                    </div>
                    <div class="team team-away">
                        <div class="team-info">
                            <span class="team-name">${sqTrasf.trim()}</span>
                            <span class="team-score">${golTrasf}</span>
                        </div>
                        <img src="img/${logoTrasf}" class="team-logo" alt="Trasferta">
                    </div>
                </div>`;
        }
        container.innerHTML = htmlRisultati;
    } catch (error) {
        console.error("Errore nel caricamento dei risultati:", error);
    }
}
caricaRisultati();

// 4. FUNZIONI PER I DETTAGLI PARTITA (MODALE) E FILTRO GIORNATA
function apriDettagli(casa, trasf) {
    // Quando clicchi una partita, aggiorna il titolo del popup e lo fa apparire
    document.getElementById('modal-title').innerText = `${casa} - ${trasf}`;
    document.getElementById('match-modal').style.display = 'block';
}

function chiudiModale() {
    // Nasconde il popup quando clicchi sulla "X"
    document.getElementById('match-modal').style.display = 'none';
}

function filtraGiornata() {
    // Questa funzione la prepareremo dopo per far funzionare il menu a tendina
    const selector = document.getElementById('giornata-selector');
    console.log("Hai selezionato la giornata: " + selector.value);
}