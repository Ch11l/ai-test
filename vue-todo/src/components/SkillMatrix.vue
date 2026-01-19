<script setup>
import { ref } from 'vue'

const skills = ref([
  { name: 'Vue.js架构', level: 92 },
  { name: 'UI/UX设计', level: 85 },
  { name: 'Node.js后端', level: 78 },
  { name: 'WebGL渲染', level: 65 }
])
</script>

<template>
  <div class="skills-container cyber-card">
    <h3 class="skills-title">能力同步率 <span class="mono">SYCHRONIZATION</span></h3>
    
    <div class="skill-list">
      <div v-for="skill in skills" :key="skill.name" class="skill-item">
        <div class="skill-info">
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-val mono">{{ skill.level }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: skill.level + '%' }">
            <div class="glow-point"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-container {
  padding: 2rem;
  margin-bottom: 2rem;
}

.skills-title {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: var(--text-highlight);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.mono {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--primary-color);
  margin-left: 0.5rem;
}

.skill-item {
  margin-bottom: 1.2rem;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
  position: relative;
  box-shadow: 0 0 10px var(--primary-glow);
}

.glow-point {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px white;
  opacity: 0.8;
}
</style>
