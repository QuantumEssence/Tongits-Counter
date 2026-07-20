// Session Management
let sessionList = ['Default Game'];
let currentSession = 'Default Game';

// State Management
let state = {
    settings: {
        events: {
            tongits: 150,
            sunog: 100,
            kind4: 50,
            draw: 20,
            first3: 10
        },
        playerCount: 3
    },
    players: [],
    history: []
};

// History for Undo
let undoStack = [];

// DOM Elements
const playerGrid = document.getElementById('player-grid');
const btnUndo = document.getElementById('btn-undo');
const btnNextRound = document.getElementById('btn-next-round');
const btnMenu = document.getElementById('btn-menu');
const btnHistory = document.getElementById('btn-history');

const modalSettings = document.getElementById('modal-settings');
const modalHistory = document.getElementById('modal-history');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnCloseHistory = document.getElementById('btn-close-history');
const historyContainer = document.getElementById('history-container');
const btnApplyPlayers = document.getElementById('btn-apply-players');
const selectPlayerCount = document.getElementById('select-player-count');
const playerNamesInputs = document.getElementById('player-names-inputs');

// Settings Inputs
const inputTongits = document.getElementById('val-tongits');
const inputSunog = document.getElementById('val-sunog');
const inputKind4 = document.getElementById('val-4kind');
const inputDraw = document.getElementById('val-draw');
const inputFirst3 = document.getElementById('val-first3');

const selectGameSession = document.getElementById('select-game-session');
const inputNewGameName = document.getElementById('input-new-game-name');
const btnCreateGame = document.getElementById('btn-create-game');

const btnExport = document.getElementById('btn-export');
const btnImport = document.getElementById('btn-import');
const fileImport = document.getElementById('file-import');

// Initialization
function init() {
    loadSessionsList();
    loadState(currentSession);
    if (state.players.length === 0) {
        setupDefaultPlayers();
    }
    renderGrid();
    setupEventListeners();
    updateUndoButton();
    renderSessionList();
}

function setupDefaultPlayers() {
    state.players = [];
    for (let i = 0; i < state.settings.playerCount; i++) {
        state.players.push({
            id: i,
            name: `Player ${i + 1}`,
            totalScore: 0,
            roundScore: 0
        });
    }
}

// Render Logic
function renderGrid() {
    playerGrid.className = `player-grid players-${state.settings.playerCount}`;
    playerGrid.innerHTML = '';

    state.players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = 'player-card';
        
        // Helper to check disabled state
        const isDis = (val) => val === 0 ? 'disabled' : '';

        card.innerHTML = `
            <div class="player-header">
                <div class="player-name">${player.name}</div>
                <div class="player-total">${player.totalScore}</div>
            </div>
            <div class="round-score-container">
                <div class="round-label">Round Points</div>
                <div class="round-score">${player.roundScore}</div>
            </div>
            <div class="event-buttons">
                <button class="event-btn tongits" data-player="${index}" data-event="tongits" ${isDis(state.settings.events.tongits)}>
                    Tongits <span class="event-val">+${state.settings.events.tongits}</span>
                </button>
                <button class="event-btn sunog" data-player="${index}" data-event="sunog" ${isDis(state.settings.events.sunog)}>
                    Sunog <span class="event-val">+${state.settings.events.sunog}</span>
                </button>
                <button class="event-btn kind4" data-player="${index}" data-event="kind4" ${isDis(state.settings.events.kind4)}>
                    4 of a Kind <span class="event-val">+${state.settings.events.kind4}</span>
                </button>
                <button class="event-btn draw" data-player="${index}" data-event="draw" ${isDis(state.settings.events.draw)}>
                    Draw/Chlg <span class="event-val">+${state.settings.events.draw}</span>
                </button>
                <button class="event-btn first3" data-player="${index}" data-event="first3" ${isDis(state.settings.events.first3)}>
                    First 3 <span class="event-val">+${state.settings.events.first3}</span>
                </button>
            </div>
        `;
        playerGrid.appendChild(card);
    });

    // Attach event listeners to newly created buttons
    document.querySelectorAll('.event-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const playerIdx = parseInt(e.currentTarget.getAttribute('data-player'));
            const eventType = e.currentTarget.getAttribute('data-event');
            addPoints(playerIdx, eventType);
        });
    });
}

function renderSettingsPlayerInputs() {
    playerNamesInputs.innerHTML = '';
    const count = parseInt(selectPlayerCount.value);
    for (let i = 0; i < count; i++) {
        const currentName = state.players[i] ? state.players[i].name : `Player ${i + 1}`;
        playerNamesInputs.innerHTML += `
            <div class="input-group">
                <label>Player ${i + 1}</label>
                <input type="text" class="input-player-name" data-index="${i}" value="${currentName}" style="text-align: left; width: 150px;">
            </div>
        `;
    }
}

// Game Logic
function saveToUndoStack() {
    undoStack.push(JSON.parse(JSON.stringify(state)));
    if (undoStack.length > 20) undoStack.shift(); // Keep last 20 states
    updateUndoButton();
}

function updateUndoButton() {
    btnUndo.disabled = undoStack.length === 0;
    btnUndo.style.opacity = undoStack.length === 0 ? '0.5' : '1';
}

function addPoints(playerIdx, eventType) {
    saveToUndoStack();
    const points = state.settings.events[eventType];
    state.players[playerIdx].roundScore += points;
    renderGrid();
    saveState();
}

function nextRound() {
    saveToUndoStack();
    state.players.forEach(p => {
        p.totalScore += p.roundScore;
        p.roundScore = 0;
    });
    // Log history
    state.history.push({
        timestamp: new Date().toISOString(),
        players: JSON.parse(JSON.stringify(state.players))
    });
    renderGrid();
    saveState();
}

function undo() {
    if (undoStack.length > 0) {
        state = undoStack.pop();
        updateSettingsUI();
        renderGrid();
        saveState();
        updateUndoButton();
    }
}

// Persistence
function loadSessionsList() {
    const list = localStorage.getItem('tongitsSessionsList');
    if (list) {
        sessionList = JSON.parse(list);
    }
    const curr = localStorage.getItem('tongitsCurrentSession');
    if (curr && sessionList.includes(curr)) {
        currentSession = curr;
    }
}

function saveSessionsList() {
    localStorage.setItem('tongitsSessionsList', JSON.stringify(sessionList));
    localStorage.setItem('tongitsCurrentSession', currentSession);
}

function saveState() {
    localStorage.setItem('tongitsState_' + currentSession, JSON.stringify(state));
}

function loadState(sessionName) {
    const saved = localStorage.getItem('tongitsState_' + sessionName);
    if (saved) {
        try {
            state = JSON.parse(saved);
            // Ensure backwards compatibility with newly added events
            if (state.settings.events.tongits === undefined) state.settings.events.tongits = 150;
            updateSettingsUI();
        } catch (e) {
            console.error("Failed to load state", e);
        }
    } else {
        // Reset to default new state for this session
        state = {
            settings: {
                events: { tongits: 150, sunog: 100, kind4: 50, draw: 20, first3: 10 },
                playerCount: 3
            },
            players: [],
            history: []
        };
        setupDefaultPlayers();
    }
    undoStack = [];
    updateUndoButton();
}

function updateSettingsUI() {
    inputTongits.value = state.settings.events.tongits;
    inputSunog.value = state.settings.events.sunog;
    inputKind4.value = state.settings.events.kind4;
    inputDraw.value = state.settings.events.draw;
    inputFirst3.value = state.settings.events.first3;
    selectPlayerCount.value = state.settings.playerCount;
}

function renderSessionList() {
    selectGameSession.innerHTML = '';
    sessionList.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        if (s === currentSession) opt.selected = true;
        selectGameSession.appendChild(opt);
    });
}

function saveSettingsAndClose() {
    state.settings.events.tongits = parseInt(inputTongits.value) || 0;
    state.settings.events.sunog = parseInt(inputSunog.value) || 0;
    state.settings.events.kind4 = parseInt(inputKind4.value) || 0;
    state.settings.events.draw = parseInt(inputDraw.value) || 0;
    state.settings.events.first3 = parseInt(inputFirst3.value) || 0;
    
    saveState();
    renderGrid();
    modalSettings.classList.add('hidden');
}

function renderHistory() {
    historyContainer.innerHTML = '';
    if (state.history.length === 0) {
        historyContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); margin-top: 20px;">No rounds played yet.</div>';
        return;
    }

    state.history.forEach((round, idx) => {
        let playersHtml = '';
        round.players.forEach(p => {
            playersHtml += `
                <div class="history-round-player">
                    <span>${p.name}</span>
                    <span>Total: ${p.totalScore} (+${p.roundScore})</span>
                </div>
            `;
        });

        historyContainer.innerHTML = `
            <div class="history-round">
                <div class="history-round-header">Round ${idx + 1}</div>
                ${playersHtml}
            </div>
        ` + historyContainer.innerHTML; // Prepend to show latest first
    });
}

// Event Listeners
function setupEventListeners() {
    btnMenu.addEventListener('click', () => {
        updateSettingsUI();
        renderSettingsPlayerInputs();
        modalSettings.classList.remove('hidden');
    });
    
    btnHistory.addEventListener('click', () => {
        renderHistory();
        modalHistory.classList.remove('hidden');
    });

    btnCloseSettings.addEventListener('click', saveSettingsAndClose);
    
    btnCloseHistory.addEventListener('click', () => {
        modalHistory.classList.add('hidden');
    });

    // Close modals on clicking outside
    modalSettings.addEventListener('click', (e) => {
        if (e.target === modalSettings) saveSettingsAndClose();
    });
    
    modalHistory.addEventListener('click', (e) => {
        if (e.target === modalHistory) modalHistory.classList.add('hidden');
    });

    btnCreateGame.addEventListener('click', () => {
        const name = inputNewGameName.value.trim();
        if (name && !sessionList.includes(name)) {
            sessionList.push(name);
            currentSession = name;
            inputNewGameName.value = '';
            saveSessionsList();
            loadState(currentSession);
            renderSessionList();
            renderSettingsPlayerInputs();
        }
    });

    selectGameSession.addEventListener('change', () => {
        currentSession = selectGameSession.value;
        saveSessionsList();
        loadState(currentSession);
        renderSettingsPlayerInputs();
        updateSettingsUI();
    });

    selectPlayerCount.addEventListener('change', renderSettingsPlayerInputs);

    btnApplyPlayers.addEventListener('click', () => {
        if(confirm("This will reset the current game and scores. Continue?")) {
            saveToUndoStack();
            state.settings.playerCount = parseInt(selectPlayerCount.value);
            setupDefaultPlayers();
            
            // Apply custom names
            document.querySelectorAll('.input-player-name').forEach(input => {
                const idx = parseInt(input.getAttribute('data-index'));
                if (state.players[idx]) {
                    state.players[idx].name = input.value || `Player ${idx + 1}`;
                }
            });

            state.history = [];
            saveState();
            renderGrid();
            modalSettings.classList.add('hidden');
        }
    });

    btnNextRound.addEventListener('click', () => {
        if(confirm("End this round and tally scores?")) {
            nextRound();
        }
    });

    btnUndo.addEventListener('click', undo);

    // Import / Export
    btnExport.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "tongits_game_" + new Date().getTime() + ".txt");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    btnImport.addEventListener('click', () => {
        fileImport.click();
    });

    fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedState = JSON.parse(e.target.result);
                if (importedState && importedState.players && importedState.settings) {
                    saveToUndoStack();
                    state = importedState;
                    saveState();
                    updateSettingsUI();
                    renderGrid();
                    modalSettings.classList.add('hidden');
                    alert("Game loaded successfully!");
                }
            } catch (err) {
                alert("Invalid file format.");
            }
        };
        reader.readAsText(file);
    });
}

// Start
init();
