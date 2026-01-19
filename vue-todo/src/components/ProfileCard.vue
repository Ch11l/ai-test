<script setup>
defineProps({
  name: {
    type: String,
    default: 'ALEX.DESIGN'
  },
  role: {
    type: String,
    default: '视觉架构师 // 运维专家'
  },
  bio: {
    type: String,
    default: '在虚空中构建数字结构。咖啡因摄入：临界值。系统状态：最优。'
  }
})
</script>

<template>
  <div class="profile-card cyber-card">
    <div class="hologram-overlay"></div>
    <div class="profile-header">
      <div class="avatar-container">
        <img src="https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg" alt="头像" class="avatar" />
        <div class="scan-ring"></div>
      </div>
      <h2 class="name">{{ name }}</h2>
      <p class="role">[{{ role }}]</p>
    </div>

    <div class="bio-section">
      <p>> {{ bio }}</p>
    </div>

    <div class="social-links">
      <button class="cyber-icon-btn" aria-label="Github源代码">代码仓库</button>
      <button class="cyber-icon-btn" aria-label="Twitter社交">社交信号</button>
    </div>

    <div class="action-footer">
      <button class="primary-btn">建立神经链接</button>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  width: 100%;
  max-width: 350px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: fit-content;
}

.hologram-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 243, 255, 0.05) 3px
  );
  pointer-events: none;
  z-index: 1;
}

.profile-header {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.avatar-container {
  width: 120px;
  height: 120px;
  position: relative;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--text-muted);
  filter: grayscale(80%) sepia(20%) hue-rotate(180deg);
  transition: all 0.5s ease;
}

.avatar-container:hover .avatar {
  filter: grayscale(0%);
}

.scan-ring {
  position: absolute;
  top: -5px; left: -5px; right: -5px; bottom: -5px;
  border-radius: 50%;
  border: 1px dashed var(--primary-color);
  animation: spin 10s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.name {
  font-size: 1.8rem;
  color: var(--text-main);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  margin-bottom: 0.5rem;
}

.role {
  color: var(--secondary-color);
  font-family: var(--font-header);
  font-size: 0.9rem;
  font-weight: bold;
}

.bio-section {
  position: relative;
  z-index: 2;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 2rem;
  text-align: left;
  width: 100%;
  font-family: monospace;
}

.social-links {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cyber-icon-btn {
  background: transparent;
  border: 1px solid var(--text-muted);
  color: var(--text-muted);
  padding: 0.5rem 1rem;
  font-family: var(--font-header);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cyber-icon-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: 0 0 10px var(--primary-dim);
}

.primary-btn {
  position: relative;
  z-index: 2;
  background: var(--primary-color);
  color: #000;
  border: none;
  padding: 1rem 2rem;
  font-family: var(--font-header);
  font-weight: 900;
  letter-spacing: 1px;
  cursor: pointer;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  transition: all 0.3s;
}

.primary-btn:hover {
  background: white;
  box-shadow: 0 0 20px var(--primary-color);
}
</style>
