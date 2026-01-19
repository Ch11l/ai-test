<script setup>
import { ref } from 'vue'

const projects = ref([
  {
    id: '01',
    title: '量子任务管理系统',
    category: 'Vue3 / Vite / Pinia',
    description: '一个基于时间流视角的任务管理平台，支持多维度的任务追踪与数据可视化。核心功能包括拖拽看板、即时通讯和AI辅助决策。',
    status: '已部署'
  },
  {
    id: '02',
    title: '星际电商前台',
    category: 'React / Next.js',
    description: '高并发电商解决方案，采用最新的服务端渲染技术，首屏加载速度提升 400%。整合了虚拟货币支付网关。',
    status: '开发中'
  },
  {
    id: '03',
    title: '神经网络仪表盘',
    category: 'D3.js / WebGL',
    description: '专为大型数据集设计的可视化分析工具，支持百万级数据点的实时渲染与在大屏上的流畅交互。',
    status: '原型阶段'
  }
])
</script>

<template>
  <div class="gallery-container">
    <div class="gallery-header">
      <h2 class="section-title">核心项目交付 <span class="highlight">// DEPLOYMENTS</span></h2>
      <div class="line-deco"></div>
    </div>

    <div class="projects-grid">
      <div v-for="project in projects" :key="project.id" class="project-card cyber-card">
        <div class="card-header">
          <span class="id-tag">PRJ_{{ project.id }}</span>
          <span class="status-badge" :class="project.status === '已部署' ? 'active' : 'pending'">
            {{ project.status }}
          </span>
        </div>
        
        <h3 class="title">{{ project.title }}</h3>
        <p class="tech-stack">{{ project.category }}</p>
        <p class="description">{{ project.description }}</p>
        
        <div class="card-footer">
          <button class="view-btn">查看详情</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-container {
  width: 100%;
  padding: 1rem;
}

.gallery-header {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-title {
  font-size: 1.5rem;
  color: var(--text-main);
  font-weight: 700;
}

.highlight {
  font-size: 0.9rem;
  color: var(--primary-color);
  font-family: var(--font-mono);
  opacity: 0.8;
  font-weight: normal;
}

.line-deco {
  height: 1px;
  flex-grow: 1;
  background: linear-gradient(90deg, var(--primary-color), transparent);
}

.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.project-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

.project-card:hover {
  border-left-color: var(--primary-color);
  background: linear-gradient(90deg, rgba(0, 243, 255, 0.05), transparent);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.id-tag {
  color: var(--text-muted);
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  border: 1px solid var(--text-muted);
}

.status-badge.active {
  border-color: var(--accent-color);
  color: var(--accent-color);
  box-shadow: 0 0 5px rgba(10, 255, 96, 0.2);
}

.status-badge.pending {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.title {
  font-size: 1.25rem;
  color: var(--text-highlight);
}

.tech-stack {
  font-size: 0.85rem;
  color: var(--primary-color);
  font-family: var(--font-mono);
}

.description {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  flex-grow: 1;
}

.view-btn {
  background: transparent;
  border: 1px solid var(--text-muted);
  color: var(--text-main);
  padding: 0.5rem 1rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.view-btn:hover {
  background: var(--primary-dim);
  border-color: var(--primary-color);
  color: var(--primary-color);
}
</style>
