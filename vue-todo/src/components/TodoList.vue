<script setup>
import { ref } from 'vue'

const newTodo = ref('')
const todos = ref([
  { id: 1, text: 'Initialize System Core', completed: true },
  { id: 2, text: 'Hack the Mainframe', completed: false },
  { id: 3, text: 'Deploy Cyber-Security Protocols', completed: false },
])

let nextId = 4

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.unshift({
      id: nextId++,
      text: newTodo.value,
      completed: false
    })
    newTodo.value = ''
  }
}

const removeTodo = (id) => {
  todos.value = todos.value.filter(t => t.id !== id)
}

const toggleComplete = (todo) => {
  todo.completed = !todo.completed
}
</script>

<template>
  <div class="todo-interface cyber-card">
    <div class="interface-header">
      <h3>Task_Matrix // V.3.0</h3>
      <div class="status-indicator">
        <span class="dot"></span> ONLINE
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-group">
      <span class="prompt">></span>
      <input 
        v-model="newTodo" 
        @keyup.enter="addTodo" 
        placeholder="INPUT NEW MARKER..." 
        type="text" 
        class="cyber-input"
      />
      <button @click="addTodo" class="cyber-btn-add">EXECUTE</button>
    </div>

    <!-- List -->
    <ul class="task-list">
      <li 
        v-for="todo in todos" 
        :key="todo.id" 
        class="task-item"
        :class="{ completed: todo.completed }"
      >
        <div class="checkbox-wrapper" @click="toggleComplete(todo)">
          <div class="checkbox-inner"></div>
        </div>
        <span class="task-text">{{ todo.text }}</span>
        <button class="delete-btn" @click="removeTodo(todo.id)">X</button>
      </li>
    </ul>

    <div class="sys-footer">
      <span>NODES: {{ todos.length }}</span>
      <span>PENDING: {{ todos.filter(t => !t.completed).length }}</span>
    </div>
  </div>
</template>

<style scoped>
.todo-interface {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  margin-top: 2rem;
}

.interface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--primary-dim);
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.status-indicator {
  font-size: 0.8rem;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  box-shadow: var(--primary-glow);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Input */
.input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
}

.prompt {
  color: var(--accent-color);
  font-weight: bold;
  font-size: 1.2rem;
}

.cyber-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--primary-dim);
  color: var(--text-main);
  font-family: var(--font-body);
  font-size: 1.1rem;
  padding: 0.5rem;
  outline: none;
  transition: all 0.3s;
}

.cyber-input:focus {
  border-bottom-color: var(--primary-color);
  box-shadow: 0 4px 10px -4px rgba(0, 243, 255, 0.3);
}

.cyber-btn-add {
  background: var(--primary-dim);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  padding: 0.5rem 1.5rem;
  font-family: var(--font-header);
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 1px;
}

.cyber-btn-add:hover {
  background: var(--primary-color);
  color: #000;
  box-shadow: var(--primary-glow);
}

/* List */
.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-left-color: var(--secondary-color);
  transform: translateX(5px);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-item.completed .checkbox-inner {
  background: var(--primary-color);
  box-shadow: var(--primary-glow);
}

/* Custom Checkbox */
.checkbox-wrapper {
  width: 20px;
  height: 20px;
  border: 2px solid var(--text-muted);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.checkbox-inner {
  width: 10px;
  height: 10px;
  background: transparent;
  transition: all 0.2s;
}

.task-text {
  flex: 1;
  font-size: 1.1rem;
}

.delete-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-weight: bold;
  font-family: monospace;
}

.delete-btn:hover {
  color: var(--accent-color);
  text-shadow: 0 0 5px var(--accent-color);
}

.sys-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px dotted var(--text-muted);
  display: flex;
  justify-content: space-between;
  font-family: var(--font-header);
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
