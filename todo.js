// Select DOM elememts
const input = document.getElementById('todos-input')
const addBtn = document.getElementById('add-btn') 
const todoList = document.getElementById('todo-list');
const highPriorityList = document.getElementById('high-priority');
const lowPriorityList = document.getElementById('low-priority');
const inProgressList = document.getElementById('in-progress');
const doneList = document.getElementById('done');
const dropZones = document.querySelectorAll('.drop-zone');



//Try to load saved todos from Local Stroage (if any)
const saved = localStorage.getItem('todos');
const todos = saved ? JSON.parse(saved) : [];

// Store the index of the item being dragged
let draggedItemIndex = null;

function saveTodos() {
    //Save todo to the local storage
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Create a Dom node for a todo object and append it to the list  
function createTodoNode(todo, index) {
    const li = document.createElement('li');
    li.className = 'todo-item'; // Add the new class for styling
    li.draggable = true;

    // --- DRAG & DROP EVENTS ---
    li.addEventListener('dragstart', (e) => {
        // Store the index of the todo being dragged
        draggedItemIndex = index;
        // Add a visual cue (requires CSS class .dragging)
        setTimeout(() => li.classList.add('dragging'), 0);
    });

    li.addEventListener('dragend', () => {
        // Remove visual cue
        li.classList.remove('dragging');
    });
    // --- END DRAG & DROP ---

    // Checkboc to toggle completion
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!todo.completed;
    checkbox.addEventListener('change', () => {
        todo.completed = checkbox.checked;

        // Visual feedback strikethrough when completed
        textSpan.style.textDecoration = todo.completed ? 'line-through' : "";
        textSpan.style.color = todo.completed ? 'grey' : 'black'; // Added color change
        saveTodos();
    })

    //Text of the todo
    const textSpan = document.createElement('span');
    textSpan.textContent = todo.text;
    textSpan.style.margin = '0 8px';
    if (todo.completed) {
        textSpan.style.textDecoration = 'line-through';
        textSpan.style.color = 'grey';
    }
    //Add double click event to edit todo
    textSpan.addEventListener('dblclick', () => {
        const newText = prompt('Edit todo:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            todo.text = newText.trim()
            textSpan.textContent = todo.text;
            saveTodos();
        }
    })

    //Delete button to remove todo
    const delBtn = document.createElement('button')
    delBtn.textContent = 'Delete'
    delBtn.addEventListener('click', () => {
        todos.splice(index, 1);
        render(); // Re-render to update indices
        saveTodos();
    })

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(delBtn);
    return li
}

// Render the todos from the todo list
function render() {
    // Clear all lists before re-rendering
    todoList.innerHTML = '';
    highPriorityList.innerHTML = '';
    lowPriorityList.innerHTML = '';
    inProgressList.innerHTML = '';
    doneList.innerHTML = '';

    // Recreate each item in the todo list
    todos.forEach((todo, index) => {
        const node = createTodoNode(todo, index);
        if (todo.status === 'high-priority') {
            highPriorityList.appendChild(node);
        } else if (todo.status === 'low-priority') {
            lowPriorityList.appendChild(node);
        } else if (todo.status === 'in-progress') {
            inProgressList.appendChild(node);
        } else if (todo.status === 'done') {
            doneList.appendChild(node);
        } else { // Default to the main todo list
            todoList.appendChild(node);
        }
    });
}

function addTodo() {
    const text = input.value.trim();
    if (!text) {
        return
    }

    //Push new todo object
    todos.push({ text, completed: false, status: 'todo' });
    input.value = '';
    render()
    saveTodos()
}

addBtn.addEventListener('click', addTodo);
input.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        addTodo();
    }
})

// --- Drag and drop feature ---

// Function to handle the drop logic
function handleDrop(e) {
    e.preventDefault();
    const dropZone = e.currentTarget;
    const newStatus = dropZone.dataset.status;

    // Check if we are dragging a valid item
    if (draggedItemIndex === null || !newStatus) return;

    // Update the status of the dragged todo
    todos[draggedItemIndex].status = newStatus;

    // Save and re-render everything
    saveTodos();
    render();

    // Reset the dragged item index
    draggedItemIndex = null;
}

// Add dragover listeners to both containers to allow dropping
dropZones.forEach(zone => {
    zone.addEventListener('dragover', e => e.preventDefault());
    zone.addEventListener('drop', handleDrop);
});

// Initial render on page load
render();