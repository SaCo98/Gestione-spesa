// --- CONFIGURAZIONE --- //

let foodSearchTerm = "";
let deptSearchTerm = "";

function loadConfigFromLocalStorage() {
    const savedConfig = localStorage.getItem('config');
    if (savedConfig) {
        config = JSON.parse(savedConfig);
        // Ensure personNames exists (for backward compatibility)
        if (!config.personNames) {
            config.personNames = {
                person1: { name: 'Sara', emoji: '👩' },
                person2: { name: 'Luca', emoji: '👨' }
            };
            saveConfigToLocalStorage();
        } else {
            // Migrate old format (string) to new format (object)
            if (typeof config.personNames.person1 === 'string') {
                config.personNames = {
                    person1: { name: config.personNames.person1 || 'Sara', emoji: '👩' },
                    person2: { name: config.personNames.person2 || 'Luca', emoji: '👨' }
                };
                saveConfigToLocalStorage();
            }
        }
    } else {
        // Valori predefiniti
        config = {
            foods: [
                { name: 'Pollo', department: 'Macelleria' },
                { name: 'Riso', department: 'Pasta e Riso' },
                { name: 'Pasta', department: 'Pasta e Riso' },
                { name: 'Pomodori', department: 'Ortofrutta' },
                { name: 'Mele', department: 'Ortofrutta' },
                { name: 'Latte', department: 'Latticini' },
                { name: 'Uova', department: 'Latticini' },
                { name: 'Pane', department: 'Panetteria' },
                { name: 'Insalata', department: 'Ortofrutta' },
                { name: 'Carote', department: 'Ortofrutta' }
            ],
            departments: [
                'Ortofrutta',
                'Macelleria',
                'Panetteria',
                'Latticini',
                'Pasta e Riso',
                'Surgelati'
            ],
            personNames: {
                person1: { name: 'Sara', emoji: '👩' },
                person2: { name: 'Luca', emoji: '👨' }
            }
        };
        saveConfigToLocalStorage();
    }

    sortConfigData();
    renderConfig();
}

function saveConfigToLocalStorage() {
    sortConfigData();
    localStorage.setItem('config', JSON.stringify(config));
}

// 🔤 Ordina alimenti e reparti in ordine alfabetico
function sortConfigData() {
    config.foods.sort((a, b) => a.name.localeCompare(b.name));
    config.departments.sort((a, b) => a.localeCompare(b));
}

// --- AGGIUNTA / RIMOZIONE --- //

function addFood() {
    const food = document.getElementById('newFood').value.trim();
    const dept = document.getElementById('foodDeptSelect').value;

    if (food && dept && !config.foods.some(f => f.name.toLowerCase() === food.toLowerCase())) {
        config.foods.push({ name: food, department: dept });
        saveConfigToLocalStorage();
        renderConfig();
        document.getElementById('newFood').value = '';
    }
}

function removeFood(index) {
    config.foods.splice(index, 1);
    saveConfigToLocalStorage();
    renderConfig();
}

function addDepartment() {
    const dept = document.getElementById('newDept').value.trim();
    if (dept && !config.departments.some(d => d.toLowerCase() === dept.toLowerCase())) {
        config.departments.push(dept);
        saveConfigToLocalStorage();
        renderConfig();
        document.getElementById('newDept').value = '';
    }
}

function removeDepartment(index) {
    config.departments.splice(index, 1);
    saveConfigToLocalStorage();
    renderConfig();
}

// --- RICERCA --- //

function onFoodSearch(event) {
    foodSearchTerm = event.target.value.toLowerCase();
    renderConfig();
}

function onDeptSearch(event) {
    deptSearchTerm = event.target.value.toLowerCase();
    renderConfig();
}

// --- RENDER --- //

function renderConfig() {
    sortConfigData();

    const foodList = document.getElementById('foodList');
    const filteredFoods = config.foods.filter(f =>
        f.name.toLowerCase().includes(foodSearchTerm) ||
        f.department.toLowerCase().includes(foodSearchTerm)
    );

    foodList.innerHTML = filteredFoods.length
        ? filteredFoods.map((f, i) => `
            <div class="list-row">
                <span><strong>${f.name}</strong> <em>(${f.department})</em></span>
                <button onclick="removeFood(${config.foods.indexOf(f)})" class="btn-danger small-btn">🗑️</button>
            </div>
        `).join('')
        : `<p class="empty-msg">Nessun alimento trovato</p>`;

    const deptList = document.getElementById('deptList');
    const filteredDepts = config.departments.filter(d =>
        d.toLowerCase().includes(deptSearchTerm)
    );

    deptList.innerHTML = filteredDepts.length
        ? filteredDepts.map((d, i) => `
            <div class="list-row">
                <span>${d}</span>
                <button onclick="removeDepartment(${config.departments.indexOf(d)})" class="btn-danger small-btn">🗑️</button>
            </div>
        `).join('')
        : `<p class="empty-msg">Nessun reparto trovato</p>`;

    // Load person names in config inputs
    loadPersonNamesInConfig();

    // Aggiorna select reparto
    const deptSelect = document.getElementById('foodDeptSelect');
    if (deptSelect) {
        deptSelect.innerHTML = config.departments
            .map(d => `<option value="${d}">${d}</option>`)
            .join('');
    }

    // Aggiorna JSON di anteprima
    document.getElementById('configJson').value = JSON.stringify(config, null, 2);
}

// --- VARIE --- //

function downloadConfig() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'configurazione.json';
    a.click();
}

function loadConfig(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        config = JSON.parse(e.target.result);
        saveConfigToLocalStorage();
        renderConfig();
        alert('Configurazione caricata con successo!');
    };
    reader.readAsText(file);
}

function saveConfigFromJson() {
    try {
        config = JSON.parse(document.getElementById('configJson').value);
        saveConfigToLocalStorage();
        renderConfig();
        alert('Configurazione aggiornata!');
    } catch (e) {
        alert('Errore nel JSON: ' + e.message);
    }
}

function resetLocalData() {
    if (confirm('Sei sicuro di voler cancellare tutti i dati salvati localmente?')) {
        localStorage.clear();
        alert('Dati locali cancellati! Ricarica la pagina per ripristinare i valori predefiniti.');
    }
}

document.addEventListener('DOMContentLoaded', loadConfigFromLocalStorage);

// === GESTIONE PERSONE ===
let persons = JSON.parse(localStorage.getItem('persons')) || {
  person1: { name: "Persona 1", emoji: "👨" },
  person2: { name: "Persona 2", emoji: "👩" }
};

function renderPersonList(filter = '') {
  const list = document.getElementById('personList');
  if (!list) return;

  const filtered = Object.entries(persons)
    .filter(([_, p]) => p.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a[1].name.localeCompare(b[1].name));

  list.innerHTML = filtered.map(([key, p]) => `
    <div class="person-item">
      <div><span>${p.emoji}</span>${p.name}</div>
      <div>
        <button class="btn-small" onclick="editPerson('${key}')">✏️</button>
        <button class="btn-small btn-danger" onclick="deletePerson('${key}')">🗑️</button>
      </div>
    </div>
  `).join('') || '<p>Nessuna persona trovata.</p>';

  localStorage.setItem('persons', JSON.stringify(persons));
  if (typeof renderPersonCards === 'function') renderPersonCards();
}

function addPerson() {
  const name = document.getElementById('newPersonName').value.trim();
  const emoji = document.getElementById('newPersonEmoji').value.trim() || '🙂';
  if (!name) {
    alert("Inserisci un nome per la persona!");
    return;
  }
  const key = `person${Date.now()}`;
  persons[key] = { name, emoji };
  document.getElementById('newPersonName').value = '';
  document.getElementById('newPersonEmoji').value = '';
  renderPersonList();
}

function editPerson(key) {
  const newName = prompt("Modifica nome:", persons[key].name);
  if (newName === null) return;
  const newEmoji = prompt("Modifica emoji:", persons[key].emoji) || persons[key].emoji;
  persons[key] = { name: newName || persons[key].name, emoji: newEmoji };
  renderPersonList();
}

function deletePerson(key) {
  if (confirm("Vuoi davvero eliminare questa persona?")) {
    delete persons[key];
    renderPersonList();
  }
}

function onPersonSearch(e) {
  renderPersonList(e.target.value);
}

// --- GESTIONE NOMI PERSONE --- //

function updatePersonName(person, name) {
    if (!config.personNames) {
        config.personNames = {
            person1: { name: 'Sara', emoji: '👩' },
            person2: { name: 'Luca', emoji: '👨' }
        };
    }
    if (!config.personNames[person]) {
        config.personNames[person] = { name: name.trim(), emoji: person === 'person1' ? '👩' : '👨' };
    } else {
        config.personNames[person].name = name.trim();
    }
    // Auto-save when name changes
    saveConfigToLocalStorage();
    updatePersonNamesInUI();
}

function updatePersonEmoji(person, emoji) {
    if (!config.personNames) {
        config.personNames = {
            person1: { name: 'Sara', emoji: '👩' },
            person2: { name: 'Luca', emoji: '👨' }
        };
    }
    if (!config.personNames[person]) {
        config.personNames[person] = { name: person === 'person1' ? 'Sara' : 'Luca', emoji: emoji.trim() };
    } else {
        config.personNames[person].emoji = emoji.trim();
    }
    // Auto-save when emoji changes
    saveConfigToLocalStorage();
    updatePersonNamesInUI();
}

function savePersonNames() {
    const person1Name = document.getElementById('person1Name').value.trim();
    const person1Emoji = document.getElementById('person1Emoji').value.trim();
    const person2Name = document.getElementById('person2Name').value.trim();
    const person2Emoji = document.getElementById('person2Emoji').value.trim();

    if (!person1Name || !person2Name) {
        alert('Inserisci entrambi i nomi!');
        return;
    }

    if (!config.personNames) {
        config.personNames = {};
    }

    config.personNames.person1 = {
        name: person1Name,
        emoji: person1Emoji || '👩'
    };
    config.personNames.person2 = {
        name: person2Name,
        emoji: person2Emoji || '👨'
    };

    saveConfigToLocalStorage();
    updatePersonNamesInUI();
    alert('Nomi e emoji salvati con successo!');
}

function updatePersonNamesInUI() {
    if (!config.personNames) return;

    // Helper to get name and emoji (handle both old string format and new object format)
    const getPersonData = (person) => {
        const data = config.personNames[person];
        if (typeof data === 'string') {
            return { name: data, emoji: person === 'person1' ? '👩' : '👨' };
        }
        return { name: data?.name || (person === 'person1' ? 'Sara' : 'Luca'), emoji: data?.emoji || (person === 'person1' ? '👩' : '👨') };
    };

    const person1 = getPersonData('person1');
    const person2 = getPersonData('person2');

    // Update dashboard
    const comparePerson1 = document.querySelector('#comparePerson1')?.parentElement?.querySelector('h3');
    if (comparePerson1) {
        comparePerson1.textContent = `${person1.emoji} ${person1.name}`;
    }

    const comparePerson2 = document.querySelector('#comparePerson2')?.parentElement?.querySelector('h3');
    if (comparePerson2) {
        comparePerson2.textContent = `${person2.emoji} ${person2.name}`;
    }

    // Update diet section person cards
    const personCard1 = document.querySelector('[data-person="person1"]');
    if (personCard1) {
        personCard1.textContent = `${person1.emoji} ${person1.name}`;
    }

    const personCard2 = document.querySelector('[data-person="person2"]');
    if (personCard2) {
        personCard2.textContent = `${person2.emoji} ${person2.name}`;
    }

    // Update shopping section checkboxes
    const shoppingPerson1 = document.querySelector('#includePerson1')?.parentElement;
    if (shoppingPerson1) {
        const isChecked = document.getElementById('includePerson1')?.checked || false;
        shoppingPerson1.innerHTML = `<input type="checkbox" id="includePerson1" ${isChecked ? 'checked' : ''} onchange="updateShoppingListFromSelection()"> ${person1.emoji} ${person1.name}`;
    }

    const shoppingPerson2 = document.querySelector('#includePerson2')?.parentElement;
    if (shoppingPerson2) {
        const isChecked = document.getElementById('includePerson2')?.checked || false;
        shoppingPerson2.innerHTML = `<input type="checkbox" id="includePerson2" ${isChecked ? 'checked' : ''} onchange="updateShoppingListFromSelection()"> ${person2.emoji} ${person2.name}`;
    }
}

function loadPersonNamesInConfig() {
    if (!config.personNames) {
        config.personNames = {
            person1: { name: 'Sara', emoji: '👩' },
            person2: { name: 'Luca', emoji: '👨' }
        };
    }

    // Helper to get name and emoji (handle both old string format and new object format)
    const getPersonData = (person) => {
        const data = config.personNames[person];
        if (typeof data === 'string') {
            return { name: data, emoji: person === 'person1' ? '👩' : '👨' };
        }
        return { name: data?.name || (person === 'person1' ? 'Sara' : 'Luca'), emoji: data?.emoji || (person === 'person1' ? '👩' : '👨') };
    };

    const person1 = getPersonData('person1');
    const person2 = getPersonData('person2');

    const person1NameInput = document.getElementById('person1Name');
    const person1EmojiSelect = document.getElementById('person1Emoji');
    const person2NameInput = document.getElementById('person2Name');
    const person2EmojiSelect = document.getElementById('person2Emoji');

    if (person1NameInput) {
        person1NameInput.value = person1.name;
    }
    if (person1EmojiSelect) {
        person1EmojiSelect.value = person1.emoji;
        // If emoji is not in the list, add it as a custom option
        if (!Array.from(person1EmojiSelect.options).some(opt => opt.value === person1.emoji)) {
            const option = document.createElement('option');
            option.value = person1.emoji;
            option.textContent = `${person1.emoji} Personalizzato`;
            person1EmojiSelect.appendChild(option);
        }
    }
    if (person2NameInput) {
        person2NameInput.value = person2.name;
    }
    if (person2EmojiSelect) {
        person2EmojiSelect.value = person2.emoji;
        // If emoji is not in the list, add it as a custom option
        if (!Array.from(person2EmojiSelect.options).some(opt => opt.value === person2.emoji)) {
            const option = document.createElement('option');
            option.value = person2.emoji;
            option.textContent = `${person2.emoji} Personalizzato`;
            person2EmojiSelect.appendChild(option);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
  renderPersonList();
});

