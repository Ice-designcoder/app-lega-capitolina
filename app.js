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

// --- 3. COLLEGAMENTO DATABASE: RISULTATI (CON SWIPE E TENDINA) ---
const urlRisultati = "INCOLLA_QUI_IL_TUO_LINK_RISULTATI"; // <--- RIMETTI IL LINK CSV QUI

let tutteLePartite = [];
let giornateDisponibili = [];
let indiceGiornataAttuale = 0;

async function caricaRisultati() {
    try {
        const response = await fetch(urlRisultati);
        const data = await response.text();
        const righe = data.split('\n');
        
        tutteLePartite = [];
        giornateDisponibili = [];
        
        for (let i = 1; i < righe.length; i++) {
            if (righe[i].trim() === '') continue;
            const colonne = righe[i].split(',');
            
            const partita = {
                giornata: colonne[0],
                dataOra: colonne[1],
                sqCasa: colonne[2],
                golCasa: colonne[3],
                sqTrasf: colonne[4],
                golTrasf: colonne[5],
                stato: colonne[6],
                ptCasa: colonne[7] || "",
                evCasa: colonne[8] || "",
                ptTrasf: colonne[9] || "",
                evTrasf: colonne[10] || ""
            };
            
            tutteLePartite.push(partita);
            
            // Crea un array con i nomi di tutte le giornate, senza doppioni
            if (!giornateDisponibili.includes(partita.giornata)) {
                giornateDisponibili.push(partita.giornata);
            }
        }
        
        // Costruisce la tendina in automatico
        const selector = document.getElementById('giornata-selector');
        selector.innerHTML = "";
        giornateDisponibili.forEach((g, index) => {
            let option = document.createElement('option');
            option.value = index;
            option.text = g;
            selector.appendChild(option);
        });
        
        // Imposta l'ultima giornata giocata come predefinita
        indiceGiornataAttuale = giornateDisponibili.length - 1;
        selector.value = indiceGiornataAttuale;
        
        mostraGiornata(indiceGiornataAttuale);
        
    } catch (error) {
        console.error("Errore nel caricamento dei risultati:", error);
    }
}

function mostraGiornata(indice) {
    const nomeGiornata = giornateDisponibili[indice];
    const partiteGiornata = tutteLePartite.filter(p => p.giornata === nomeGiornata);
    
    const container = document.querySelector('#risultati .match-list');
    let htmlRisultati = "";
    
    partiteGiornata.forEach((p, i) => {
        const logoCasa = p.sqCasa.trim().toLowerCase().replace(/\s+/g, '') + '_logo.png';
        const logoTrasf = p.sqTrasf.trim().toLowerCase().replace(/\s+/g, '') + '_logo.png';

        // Passiamo l'indice (i) per far sapere al modale quale partita è stata cliccata
        htmlRisultati += `
            <div class="match-row" onclick="apriDettagli(${indice}, ${i})">
                <div class="team team-home">
                    <img src="img/${logoCasa}" class="team-logo" alt="Casa">
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
                    <img src="img/${logoTrasf}" class="team-logo" alt="Trasferta">
                </div>
            </div>`;
    });
    
    container.innerHTML = htmlRisultati;
    document.getElementById('giornata-selector').value = indice;
}

// 4. FUNZIONI MODALE, TENDINA E SWIPE (SCORRIMENTO)
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
    
    // Converte la lista separata da virgole in paragrafi HTML
    const formattaEventi = (testo) => testo.split(',').map(e => `<p style="margin:5px 0;">${e.trim()}</p>`).join('');
    
    document.getElementById('modal-eventi-casa').innerHTML = formattaEventi(p.evCasa);
    document.getElementById('modal-eventi-trasf').innerHTML = formattaEventi(p.evTrasf);
    
    document.getElementById('match-modal').style.display = 'block';
}

function chiudiModale() {
    document.getElementById('match-modal').style.display = 'none';
}

// L'intelligenza per lo Swipe col dito
let touchstartX = 0;
let touchendX = 0;

const risultatiSection = document.getElementById('risultati');

risultatiSection.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
});

risultatiSection.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    gestisciSwipe();
});

function gestisciSwipe() {
    if (touchendX < touchstartX - 50) {
        // Swipe verso sinistra (Giornata Successiva)
        if (indiceGiornataAttuale < giornateDisponibili.length - 1) {
            indiceGiornataAttuale++;
            mostraGiornata(indiceGiornataAttuale);
        }
    }
    if (touchendX > touchstartX + 50) {
        // Swipe verso destra (Giornata Precedente)
        if (indiceGiornataAttuale > 0) {
            indiceGiornataAttuale--;
            mostraGiornata(indiceGiornataAttuale);
        }
    }
}

caricaRisultati();
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