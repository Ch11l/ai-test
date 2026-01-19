<script setup>
import ProfileCard from './components/ProfileCard.vue'
import SkillMatrix from './components/SkillMatrix.vue'
import ProjectGallery from './components/ProjectGallery.vue'

const profile = {
  name: "ALEX_K",
  role: "全栈架构师 // LVL_99",
  bio: "系统完整性已验证。准备执行指令。协议：极致优化生命周期。",
}
</script>

<template>
  <div class="app-container">
    <div class="background-grid"></div>
    
    <header class="main-header">
      <h1 class="cyber-glitch" data-text="个人数字枢纽">123456</h1>
      <p class="subtitle">神经链接已建立 // 欢迎访问</p>
    </header>

    <main class="dashboard-layout">
      <aside class="sidebar">
        <ProfileCard 
          :name="profile.name"
          :role="profile.role"
          :bio="profile.bio"
        />
        
        <SkillMatrix />
      </aside>

      <section class="main-panel">
        <ProjectGallery />
      </section>
    </main>

    <footer class="app-footer">
      <p>系统版本 4.2.0 // 版权所有 2026</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.main-header {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  z-index: 10;
}

h1 {
  font-size: 3.5rem;
  letter-spacing: 2px;
  color: var(--primary-color);
  text-shadow: 0 0 15px var(--primary-glow);
  margin-bottom: 0.8rem;
  font-weight: 900;
}

.subtitle {
  color: var(--secondary-color);
  letter-spacing: 6px;
  font-size: 0.9rem;
  font-family: var(--font-mono);
  text-transform: uppercase;
}

.dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  align-items: center;
  position: relative;
  z-index: 10;
}

@media (min-width: 1024px) {
  .dashboard-layout {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 4rem;
  }

  .sidebar {
    width: 350px;
    flex-shrink: 0;
    position: sticky;
    top: 2rem;
  }

  .main-panel {
    flex-grow: 1;
    width: 100%;
    max-width: 750px;
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 400px;
}

.main-panel {
  width: 100%;
}

.app-footer {
  margin-top: auto;
  padding-top: 4rem;
  padding-bottom: 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  opacity: 0.6;
}

/* Background Grid Effect */
.background-grid {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(var(--bg-surface) 1px, transparent 1px),
    linear-gradient(90deg, var(--bg-surface) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center center;
  opacity: 0.1;
  z-index: 0;
  pointer-events: none;
}
</style>
