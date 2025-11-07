// === VARIABILI GLOBALI ===
// Carica configurazione salvata o usa valori di default
let config = JSON.parse(localStorage.getItem('config')) 
// Carica diete salvate o crea oggetto vuoto
let diets = JSON.parse(localStorage.getItem('diets')) || {
  person1: {},
  person2: {}
};
let selectedDays = [];
let shoppingItems = [];
let manualItems = [];
let finalListItems = []; // Store final list items for editing

// Salva automaticamente la configurazione
function saveConfigToLocalStorage() {
  localStorage.setItem('config', JSON.stringify(config));
}

// Salva automaticamente le diete
function saveDietsToLocalStorage() {
  localStorage.setItem('diets', JSON.stringify(diets));
}

// Ogni volta che aggiorni config o diets, chiama una di queste due funzioni

// === FUNZIONE CAMBIO TAB ===
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'config') {
        renderConfig();
    } else if (tabId === 'diet') {
        updateDietSelects();
        loadPersonDiet();
    } else if (tabId === 'shopping') {
        updateShoppingSelects();
        setupManualFoodSearch();
        loadSavedList(); // Carica la lista quando si apre la tab spesa
    }
}

// === INIZIALIZZAZIONE ===
document.addEventListener('DOMContentLoaded', () => {
    renderConfig();
    updateDietSelects();
    setupManualFoodSearch();
    loadSavedList(); // Carica la lista salvata all'avvio
    
    // Update person names in UI after config is loaded
    if (typeof updatePersonNamesInUI === 'function') {
        updatePersonNamesInUI();
    }
});

document.addEventListener('DOMContentLoaded', () => {
  loadConfigFromLocalStorage();
  updatePersonNamesInUI();
});
