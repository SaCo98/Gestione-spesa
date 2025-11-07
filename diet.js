// === DIETA ===

// Stato corrente della persona selezionata
let currentPerson = "person1";

// Stato delle sezioni aperte/chiuse
let collapsedSections = new Set();

// === GESTIONE PERSONE ===
function selectPersonCard(el) {
  document.querySelectorAll(".person-card").forEach(card => card.classList.remove("active"));
  el.classList.add("active");
  currentPerson = el.dataset.person;
  loadPersonDiet();
}

// === SELEZIONE DEL GIORNO ===
let selectedDay = "Lunedì"; // Giorno predefinito

document.addEventListener("DOMContentLoaded", () => {
  const dayButtons = document.querySelectorAll("#diet .day-btn");

  dayButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Rimuove la selezione da tutti i pulsanti nella sezione dieta
      dayButtons.forEach(b => b.classList.remove("active"));
      // Imposta attivo quello cliccato
      btn.classList.add("active");
      // Aggiorna variabile globale
      selectedDay = btn.dataset.day;
    });
  });
});


// === SELEZIONE DEL PASTO ===
let selectedMeal = "Colazione"; // Pasto predefinito

document.addEventListener("DOMContentLoaded", () => {
  const mealButtons = document.querySelectorAll("#diet .meal-btn");

  mealButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Rimuove selezione da tutti i pulsanti nella sezione dieta
      mealButtons.forEach(b => b.classList.remove("active"));
      // Imposta attivo quello cliccato
      btn.classList.add("active");
      // Aggiorna variabile globale
      selectedMeal = btn.dataset.meal;
    });
  });
});



// === RENDER DIETA (con sezioni comprimibili) ===
function loadPersonDiet() {
  const person = currentPerson;
  const dietContainer = document.getElementById('dietContainer') || document.getElementById('currentDiet');

  if (!diets[person]) diets[person] = {};

  // 🔹 Ordine fisso della settimana
  const orderedDays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

  // 🔹 Ordine fisso dei pasti
  const orderedMeals = ["Colazione", "Spuntino", "Pranzo", "Merenda", "Cena"];

  // 🔹 Filtra solo i giorni presenti nella dieta, ma ordinandoli correttamente
  const sortedDays = orderedDays.filter(day => Object.keys(diets[person]).includes(day));

  let html = '';
  for (const day of sortedDays) {
    const meals = diets[person][day];
    const dayId = `day-${day.replace(/\s+/g, '-')}`;
    const isCollapsed = collapsedSections.has(dayId);
    const icon = isCollapsed ? '▶️' : '🔽';
    
    html += `
      <div class="collapsible-day">
        <h3 class="collapsible-header" onclick="toggleCollapse('${dayId}')">
          ${icon} ${day}
        </h3>
        <div id="${dayId}" class="collapsible-content ${isCollapsed ? 'collapsed' : ''}">
    `;
    
    // 🔹 Filtra e ordina i pasti secondo l'ordine fisso
    const sortedMeals = orderedMeals.filter(meal => meals[meal] && meals[meal].length > 0);
    
    for (const meal of sortedMeals) {
      const items = meals[meal];
      const mealId = `${dayId}-meal-${meal.replace(/\s+/g, '-')}`;
      const isMealCollapsed = collapsedSections.has(mealId);
      const mealIcon = isMealCollapsed ? '▶️' : '🔽';
      
      html += `
        <div class="collapsible-meal">
          <h4 class="collapsible-header" onclick="toggleCollapse('${mealId}')">
            ${mealIcon} ${meal}
          </h4>
          <div id="${mealId}" class="collapsible-content inner ${isMealCollapsed ? 'collapsed' : ''}">
            <ul>
              ${items.map((item, idx) => `
                <li class="list-item">
                  <span>${item.food} - ${item.quantity}${item.unit ? ' ' + item.unit : ''}</span>
                  <div>
                    <button class="edit-btn" title="Modifica" onclick="editMealItem('${person}','${day}','${meal}',${idx})">✏️</button>
                    <button class="delete-btn" title="Rimuovi" onclick="removeMealItem('${person}','${day}','${meal}',${idx})">🗑️</button>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    }
    html += `</div></div>`;
  }

  dietContainer.innerHTML = html || '<p>Nessun alimento inserito.</p>';
}


// === COLLASSA / ESPANDI ===
function toggleCollapse(id) {
  const section = document.getElementById(id);
  const header = section.previousElementSibling;
  if (!section) return;
  
  section.classList.toggle('collapsed');
  
  // Salva lo stato
  if (section.classList.contains('collapsed')) {
    collapsedSections.add(id);
    header.textContent = header.textContent.replace('🔽', '▶️');
  } else {
    collapsedSections.delete(id);
    header.textContent = header.textContent.replace('▶️', '🔽');
  }
}

// === AGGIUNTA NUOVO ALIMENTO ===
function addMealToDiet() {
  const person = currentPerson;
  const day = selectedDay;
  const meal = selectedMeal;
  const foodName = document.getElementById('foodSearchInput').value.trim();
  const quantity = document.getElementById('quantityInput').value.trim();
  const unit = document.getElementById('unitSelect').value;
  const dept = document.getElementById('deptInput').value;

  if (!foodName || !quantity) {
    alert('Inserisci alimento e quantità!');
    return;
  }

  const foodObj = config.foods.find(f => f.name.toLowerCase() === foodName.toLowerCase());
  if (!foodObj) {
    alert('Seleziona un alimento valido dalla lista!');
    return;
  }

  if (!diets[person]) diets[person] = {};
  if (!diets[person][day]) diets[person][day] = {};
  if (!diets[person][day][meal]) diets[person][day][meal] = [];

  diets[person][day][meal].push({
    food: foodObj.name,
    quantity: quantity,
    unit: unit || '',
    department: dept || foodObj.department || 'Altro'
  });

  document.getElementById('foodSearchInput').value = '';
  document.getElementById('quantityInput').value = '';
  document.getElementById('unitSelect').value = '-';
  document.getElementById('deptInput').value = '';
  hideFoodSuggestions();
  loadPersonDiet();
  saveDietsToLocalStorage();
}

// === RIMOZIONE ALIMENTO ===
function removeMealItem(person, day, meal, idx) {
  diets[person][day][meal].splice(idx, 1);
  loadPersonDiet();
  saveDietsToLocalStorage();
}

// === SUGGERIMENTI ALIMENTI ===
function setupFoodSearch() {
  const input = document.getElementById('foodSearchInput');
  const suggestionBox = document.getElementById('foodSuggestions');
  const deptInput = document.getElementById('deptInput');

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase();
    const results = config.foods
      .filter(f => f.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!query || results.length === 0) {
      suggestionBox.style.display = 'none';
      deptInput.value = '';
      return;
    }

    suggestionBox.innerHTML = results
      .map(f => `<div class="suggestion-item" onclick="selectFoodSuggestion('${f.name}', '${f.department}')">${f.name}</div>`)
      .join('');

    suggestionBox.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestionBox.contains(e.target)) {
      hideFoodSuggestions();
    }
  });
}

function selectFoodSuggestion(name, dept) {
  document.getElementById('foodSearchInput').value = name;
  document.getElementById('deptInput').value = dept || '';
  hideFoodSuggestions();
}

function hideFoodSuggestions() {
  const box = document.getElementById('foodSuggestions');
  if (box) box.style.display = 'none';
}

// === SALVATAGGIO LOCALE ===
function saveDietsToLocalStorage() {
  localStorage.setItem('diets', JSON.stringify(diets));
}

// === INIZIALIZZAZIONE ===
window.addEventListener('DOMContentLoaded', () => {
  setupFoodSearch();
  // Inizializza tutte le sezioni come compresse
  const orderedDays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
  orderedDays.forEach(day => {
    collapsedSections.add(`day-${day.replace(/\s+/g, '-')}`);
  });
  loadPersonDiet();
});

function resetDiet() {
  if (!confirm("⚠️ Sei sicuro di voler cancellare completamente la dieta di tutte le persone?")) return;

  // Verifica se esiste la variabile globale diets, altrimenti la inizializza
  if (typeof diets === "undefined") {
    diets = {};
  }

  // Ripristina struttura base vuota
  diets = {
    person1: {},
    person2: {}
  };

  // Aggiorna localStorage
  localStorage.setItem("diets", JSON.stringify(diets));
  
  // Reset dello stato delle sezioni
  collapsedSections.clear();
  const orderedDays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
  orderedDays.forEach(day => {
    collapsedSections.add(`day-${day.replace(/\s+/g, '-')}`);
  });
  
  // Aggiorna la visualizzazione
  loadPersonDiet();
  alert("✅ Dieta completamente resettata!");
}

// === MODIFICA ALIMENTO ===
function editMealItem(person, day, meal, idx) {
  const item = diets[person][day][meal][idx];
  
  // Popola i campi con i valori attuali
  document.getElementById('foodSearchInput').value = item.food;
  document.getElementById('quantityInput').value = item.quantity;
  document.getElementById('unitSelect').value = item.unit || '-';
  document.getElementById('deptInput').value = item.department;
  
  // Imposta il giorno e il pasto corretti
  selectedDay = day;
  selectedMeal = meal;
  
  // Aggiorna i pulsanti attivi
  document.querySelectorAll('#diet .day-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.day === day);
  });
  document.querySelectorAll('#diet .meal-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.meal === meal);
  });
  
  // Rimuovi l'elemento originale (verrà reinserito quando si clicca "Aggiungi")
  diets[person][day][meal].splice(idx, 1);
  loadPersonDiet();
  saveDietsToLocalStorage();
  
  // Scroll al form
  document.querySelector('#diet .section').scrollIntoView({ behavior: 'smooth' });
}