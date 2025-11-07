function toggleDay(day) {
    const btn = event.target;
    if (selectedDays.includes(day)) {
        selectedDays = selectedDays.filter(d => d !== day);
        btn.classList.remove('selected');
    } else {
        selectedDays.push(day);
        btn.classList.add('selected');
    }
    
    // Automatically generate shopping list when a day is selected/deselected
    updateShoppingListFromSelection();
}

function updateShoppingListFromSelection() {
    const includePerson1 = document.getElementById('includePerson1').checked;
    const includePerson2 = document.getElementById('includePerson2').checked;
    
    if (selectedDays.length > 0 && (includePerson1 || includePerson2)) {
        generateShoppingList();
    } else {
        // Clear the list if no days are selected or no persons are selected
        shoppingItems = [];
        renderShoppingList();
    }
}

function generateShoppingList() {
    if (selectedDays.length === 0) {
        alert('Seleziona almeno un giorno!');
        return;
    }

    shoppingItems = [];
    const includePerson1 = document.getElementById('includePerson1').checked;
    const includePerson2 = document.getElementById('includePerson2').checked;

    const personsToInclude = [];
    if (includePerson1) personsToInclude.push('person1');
    if (includePerson2) personsToInclude.push('person2');

    if (personsToInclude.length === 0) {
        // Don't show alert when called automatically, just clear the list
        shoppingItems = [];
        renderShoppingList();
        return;
    }

    personsToInclude.forEach(person => {
        selectedDays.forEach(day => {
            if (diets[person][day]) {
                Object.values(diets[person][day]).forEach(mealItems => {
                    mealItems.forEach(item => {
                        const existing = shoppingItems.find(i => 
                            i.food === item.food && i.department === item.department
                        );
                        if (existing) {
                            existing.quantities.push(item.quantity);
                        } else {
                            shoppingItems.push({
                                food: item.food,
                                department: item.department,
                                quantities: [item.quantity],
                                unit: item.unit,
                                checked: true
                            });
                        }
                    });
                });
            }
        });
    });

    renderShoppingList();
    // Rimuovi queste righe che nascondevano le sezioni
    // document.getElementById('shoppingListSection').style.display = 'block';
    // document.getElementById('finalListSection').style.display = 'none';
}

function renderShoppingList() {
    const container = document.getElementById('shoppingList');
    container.innerHTML = shoppingItems.map((item, idx) => {
        const totalQuantity = item.quantities.reduce((sum, q) => {
            const num = parseFloat(q);
            return sum + (isNaN(num) ? 0 : num);
        }, 0);
        
        return `
            <div class="list-item ${item.checked ? '' : 'unchecked'}">
                <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleItem(${idx})">
                <span><strong>${item.food}</strong> - ${totalQuantity} (${item.department})</span>
            </div>
        `;
    }).join('');
}

function toggleItem(idx) {
    shoppingItems[idx].checked = !shoppingItems[idx].checked;
    renderShoppingList();
}

function updateShoppingSelects() {
    const foodSelect = document.getElementById('manualFoodSelect');
    if (foodSelect) {
        foodSelect.innerHTML = config.foods.map(f => `<option value="${f.name}">${f.name}</option>`).join('');
    }
    
    const deptSelect = document.getElementById('manualDeptSelect');
    deptSelect.innerHTML = config.departments.map(d => `<option value="${d}">${d}</option>`).join('');
}

function setupManualFoodSearch() {
    const input = document.getElementById('manualFoodInput');
    const suggestionBox = document.getElementById('manualFoodSuggestions');
    const deptSelect = document.getElementById('manualDeptSelect');

    if (!input || !suggestionBox) return;

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase();
        const results = config.foods
            .filter(f => f.name.toLowerCase().includes(query))
            .sort((a, b) => a.name.localeCompare(b.name));

        if (!query || results.length === 0) {
            suggestionBox.style.display = 'none';
            return;
        }

        suggestionBox.innerHTML = results
            .map(f => `<div class="suggestion-item" onclick="selectManualFoodSuggestion('${f.name}', '${f.department}')">${f.name}</div>`)
            .join('');

        suggestionBox.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (input && suggestionBox && !input.contains(e.target) && !suggestionBox.contains(e.target)) {
            hideManualFoodSuggestions();
        }
    });
}

function selectManualFoodSuggestion(name, dept) {
    const input = document.getElementById('manualFoodInput');
    const deptSelect = document.getElementById('manualDeptSelect');
    
    if (input) input.value = name;
    if (deptSelect && dept) {
        deptSelect.value = dept;
    }
    hideManualFoodSuggestions();
}

function hideManualFoodSuggestions() {
    const box = document.getElementById('manualFoodSuggestions');
    if (box) box.style.display = 'none';
}

function addManualItem() {
    const food = document.getElementById('manualFoodInput').value.trim();
    const quantity = document.getElementById('manualQuantity').value.trim();
    const unit = document.getElementById('manualUnit').value.trim();
    const dept = document.getElementById('manualDeptSelect').value;

    if (!quantity) {
        alert('Inserisci una quantità!');
        return;
    }

    // Add to manualItems instead of shoppingItems (so it doesn't appear in the checkbox list)
    const existing = manualItems.find(i => i.food === food && i.department === dept);
    if (existing) {
        existing.quantities.push(quantity);
    } else {
        manualItems.push({
            food: food,
            department: dept,
            quantities: [quantity],
            unit: unit
        });
    }

    document.getElementById('manualQuantity').value = '';
    document.getElementById('manualFoodInput').value = '';
    hideManualFoodSuggestions();
    
    // Add directly to final list if it exists, otherwise generate it
    if (finalListItems.length > 0) {
        // Add to existing final list
        const existingFinal = finalListItems.find(i => i.food === food && i.department === dept);
        if (existingFinal) {
            existingFinal.quantities.push(quantity);
        } else {
            const maxId = finalListItems.length > 0 ? Math.max(...finalListItems.map(i => i.id || 0)) : -1;
            finalListItems.push({
                food: food,
                department: dept,
                quantities: [quantity],
                unit: unit,
                id: maxId + 1
            });
        }
        renderFinalList();
    } else {
        // Generate new final list
        generateFinalList(true);
    }
}

async function generateFinalList(suppressAlert = false) {
    // Get checked items from shoppingItems and all manual items
    const checkedItems = shoppingItems.filter(item => item.checked);
    
    // Merge items with the same food and department from checked items and manual items
    const newItems = [];
    const allItems = [...checkedItems, ...manualItems];
    
    allItems.forEach(item => {
        const existing = newItems.find(i => 
            i.food === item.food && i.department === item.department
        );
        if (existing) {
            // Merge quantities
            existing.quantities.push(...item.quantities);
        } else {
            // Create a copy to avoid modifying the original
            newItems.push({
                food: item.food,
                department: item.department,
                quantities: [...item.quantities],
                unit: item.unit
            });
        }
    });
    
    if (newItems.length === 0) {
        if (!suppressAlert) {
            alert('Non hai selezionato nessun alimento!');
        }
        return;
    }

    // Add new items to existing final list (don't overwrite)
    // Get the maximum ID from existing items
    const maxId = finalListItems.length > 0 ? Math.max(...finalListItems.map(i => i.id || 0)) : -1;
    let nextId = maxId;
    
    newItems.forEach(newItem => {
        // Check if item already exists in final list
        const existingFinal = finalListItems.find(i => 
            i.food === newItem.food && i.department === newItem.department
        );
        
        if (existingFinal) {
            // Merge quantities with existing item
            existingFinal.quantities.push(...newItem.quantities);
        } else {
            // Add as new item
            finalListItems.push({
                ...newItem,
                id: ++nextId
            });
        }
    });

    renderFinalList();
    // Rimuovi questa riga
    // document.getElementById('finalListSection').style.display = 'block';
}

function renderFinalList() {
    if (finalListItems.length === 0) {
        document.getElementById('finalList').innerHTML = '';
        localStorage.removeItem('savedShoppingList');
        localStorage.removeItem('finalListData');
        return;
    }

    const byDept = {};
    finalListItems.forEach(item => {
        if (!byDept[item.department]) byDept[item.department] = [];
        byDept[item.department].push(item);
    });

    let html = '';
    Object.keys(byDept).sort().forEach(dept => {
        html += `<div class="department-group">
            <h3>🏪 ${dept}</h3>`;
        byDept[dept].forEach(item => {
            const totalQuantity = item.quantities.reduce((sum, q) => {
                const num = parseFloat(q);
                return sum + (isNaN(num) ? 0 : num);
            }, 0);
            
            html += `<div class="list-item" data-item-id="${item.id}">
                <span><strong>${item.food}</strong> - <span class="editable-quantity" onclick="editFinalItemQuantity(${item.id})" title="Clicca per modificare">${totalQuantity}</span>${item.unit ? ' ' + item.unit : ''}</span>
                <div>
                    <button class="edit-btn" onclick="editFinalItem(${item.id})" title="Modifica">✏️</button>
                    <button class="delete-btn" onclick="deleteFinalItem(${item.id})" title="Rimuovi">🗑️</button>
                </div>
            </div>`;
        });
        html += `</div>`;
    });

    // Save both HTML and data
    localStorage.setItem('savedShoppingList', html);
    localStorage.setItem('finalListData', JSON.stringify(finalListItems));
    
    document.getElementById('finalList').innerHTML = html;
}

function editFinalItem(itemId) {
    const item = finalListItems.find(i => i.id === itemId);
    if (!item) return;

    const newFood = prompt('Modifica alimento:', item.food);
    if (newFood === null) return; // User cancelled
    
    const newDept = prompt('Modifica reparto:', item.department);
    if (newDept === null) return;

    item.food = newFood.trim();
    item.department = newDept.trim();
    
    renderFinalList();
}

function editFinalItemQuantity(itemId) {
    const item = finalListItems.find(i => i.id === itemId);
    if (!item) return;

    const currentTotal = item.quantities.reduce((sum, q) => {
        const num = parseFloat(q);
        return sum + (isNaN(num) ? 0 : num);
    }, 0);
    
    const newQuantity = prompt('Modifica quantità totale:', currentTotal);
    if (newQuantity === null || newQuantity.trim() === '') return;
    
    // Replace all quantities with a single new quantity
    item.quantities = [newQuantity.trim()];
    
    renderFinalList();
}

function deleteFinalItem(itemId) {
    if (!confirm('Sei sicuro di voler rimuovere questo alimento dalla lista?')) return;
    
    finalListItems = finalListItems.filter(i => i.id !== itemId);
    
    renderFinalList();
}

function loadSavedList() {
    const savedData = localStorage.getItem('finalListData');
    if (savedData) {
        try {
            finalListItems = JSON.parse(savedData);
            renderFinalList();
        } catch (e) {
            // Fallback to old HTML format
            const savedList = localStorage.getItem('savedShoppingList');
            if (savedList) {
                document.getElementById('finalList').innerHTML = savedList;
            }
        }
    } else {
        // Fallback to old HTML format
        const savedList = localStorage.getItem('savedShoppingList');
        if (savedList) {
            document.getElementById('finalList').innerHTML = savedList;
        }
    }
}

function clearSavedList() {
    localStorage.removeItem('savedShoppingList');
    localStorage.removeItem('finalListData');
    manualItems = []; // Clear manual items
    finalListItems = []; // Clear final list items
    // Rimuovi questa riga
    // document.getElementById('finalListSection').style.display = 'none';
    document.getElementById('finalList').innerHTML = '';
}

function printList() {
    window.print();
}

// Export functions
async function exportToImage() {
    const finalListElement = document.getElementById('finalList');
    
    if (!finalListElement || finalListElement.innerHTML.trim() === '') {
        alert('La lista è vuota!');
        return;
    }

    // Check if html2canvas is available
    if (typeof html2canvas === 'undefined') {
        alert('Libreria immagine non caricata. Controlla la connessione internet.');
        return;
    }

    try {
        const canvas = await html2canvas(finalListElement, {
            backgroundColor: '#ffffff',
            scale: 2
        });

        // Convert canvas to blob and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'lista_spesa.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
    } catch (error) {
        console.error('Errore durante l\'esportazione immagine:', error);
        alert('Errore durante l\'esportazione immagine. Riprova.');
    }
}

function exportToText() {
    if (finalListItems.length === 0) {
        alert('La lista è vuota!');
        return;
    }

    let text = 'LISTA DELLA SPESA\n';
    text += '==================\n\n';

    // Group by department
    const byDept = {};
    finalListItems.forEach(item => {
        if (!byDept[item.department]) byDept[item.department] = [];
        byDept[item.department].push(item);
    });

    // Sort departments and generate text
    Object.keys(byDept).sort().forEach(dept => {
        text += `🏪 ${dept}\n`;
        text += '-'.repeat(20) + '\n';
        
        byDept[dept].forEach(item => {
            const totalQuantity = item.quantities.reduce((sum, q) => {
                const num = parseFloat(q);
                return sum + (isNaN(num) ? 0 : num);
            }, 0);
            
            text += `  • ${item.food} - ${totalQuantity}${item.unit ? ' ' + item.unit : ''}\n`;
        });
        
        text += '\n';
    });

    // Create and download text file
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lista_spesa.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}