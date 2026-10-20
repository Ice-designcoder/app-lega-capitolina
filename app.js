function cambiaTab(tabId, bottoneCliccato) {
    // 1. Prendo tutte le schermate e le nascondo (tolgo la classe 'active')
    const schermate = document.querySelectorAll('.tab-content');
    schermate.forEach(schermata => {
        schermata.classList.remove('active');
    });

    // 2. Prendo tutti i bottoni in basso e li "spengo" (tolgo il colore rosso)
    const bottoni = document.querySelectorAll('.nav-btn');
    bottoni.forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Mostro solo la schermata che l'utente ha richiesto
    document.getElementById(tabId).classList.add('active');

    // 4. "Accendo" di rosso solo il bottone appena cliccato
    bottoneCliccato.classList.add('active');
}

// --- COLLEGAMENTO AL DATABASE (FOGLIO GOOGLE) ---

// INCOLLA IL TUO LINK QUI SOTTO (mantenendo le virgolette " " all'inizio e alla fine)
const urlClassifica = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSgZ0b-6wzTnNRq37OxOvEbVjyW-vNbuxR-sg6rToRvPAcg1NBtVr_54dTh5tmmCbHWDGPWsakZti0/pub?gid=0&single=true&output=csv";

async function caricaClassifica() {
    try {
        // Va a leggere il file CSV dal tuo Foglio Google
        const response = await fetch(urlClassifica);
        const data = await response.text();
        
        // Divide il testo riga per riga
        const righe = data.split('\n');
        
        // Trova il contenitore della classifica nell'HTML
        const container = document.querySelector('.standings-container');
        
        // Prepariamo l'intestazione fissa della tabella
        let htmlClassifica = `
            <div class="standings-header">
                <div class="col-pos">#</div>
                <div class="col-team">Squadra</div>
                <div class="col-pt">Pt</div>
                <div class="col-gf">GF</div>
                <div class="col-gs">GS</div>
                <div class="col-dr">DR</div>
            </div>`;

        // Partiamo dalla riga 1 (la riga 0 è l'intestazione A1, B1, ecc.)
        for (let i = 1; i < righe.length; i++) {
            if (righe[i].trim() === '') continue; // Salta eventuali righe vuote
            
            // Divide i valori della riga usando la virgola
            const colonne = righe[i].split(',');
            
            const pos = colonne[0];
            const squadra = colonne[1];
            const pt = colonne[2];
            const gf = colonne[3];
            const gs = colonne[4];
            const dr = colonne[5];
            
            // Magia: crea il nome del file del logo in automatico! 
            // "Team Barazzo" diventa "teambarazzo_logo.png"
            const nomeLogo = squadra.trim().toLowerCase().replace(/\s+/g, '') + '_logo.png';

            // Costruisce la riga in HTML usando i dati veri
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
        
        // Sostituisce la classifica finta con quella vera appena generata
        container.innerHTML = htmlClassifica;
        
    } catch (error) {
        console.error("Errore nel caricamento della classifica:", error);
    }
}

// Avvia il caricamento dei dati non appena si apre l'app
caricaClassifica();

// --- COLLEGAMENTO AL DATABASE (RISULTATI) ---

// INCOLLA IL TUO LINK QUI SOTTO (quello nuovo del foglio Risultati)
const urlRisultati = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSgZ0b-6wzTnNRq37OxOvEbVjyW-vNbuxR-sg6rToRvPAcg1NBtVr_54dTh5tmmCbHWDGPWsakZti0/pub?gid=1987827721&single=true&output=csv";

async function caricaRisultati() {
    try {
        const response = await fetch(urlRisultati);
        const data = await response.text();
        const righe = data.split('\n');
        
        const container = document.querySelector('#risultati .match-list');
        const headerGiornata = document.querySelector('#risultati .matchday-header');
        
        let htmlRisultati = "";
        
        // Partiamo dalla riga 1 per saltare le intestazioni (A1, B1...)
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
            
            // Aggiorna l'intestazione della giornata alla prima riga valida
            if(i === 1) {
                headerGiornata.innerText = giornata;
            }

            // Stessa magia per i loghi automatici!
            const logoCasa = sqCasa.trim().toLowerCase().replace(/\s+/g, '') + '_logo.png';
            const logoTrasf = sqTrasf.trim().toLowerCase().replace(/\s+/g, '') + '_logo.png';

            htmlRisultati += `
                <div class="match-row">
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

// Avviamo anche i risultati all'apertura dell'app
caricaRisultati();

// Funzione per aprire il modale cliccando sulla partita
function apriDettagli(casa, trasf) {
    document.getElementById('modal-title').innerText = `${casa} vs ${trasf}`;
    document.getElementById('match-modal').style.display = 'block';
    
    // Nelle prossime fasi collegheremo un terzo foglio Google per pescare le formazioni reali
}

// Funzione per chiudere il modale
function chiudiModale() {
    document.getElementById('match-modal').style.display = 'none';
}

// Quando generi l'HTML dei risultati nel fetch, aggiorna il div iniziale della riga così:
// htmlRisultati += `<div class="match-row" onclick="apriDettagli('${sqCasa.trim()}', '${sqTrasf.trim()}')"> ...`;