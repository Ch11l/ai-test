<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { marked } from 'marked'

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

// 状态
const userInput = ref('')
const messages = ref([])
const isLoading = ref(false)
const messagesContainer = ref(null)

// API 基础地址（开发环境用 localhost，生产环境用相对路径）
const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 渲染 Markdown
const renderMarkdown = (text) => {
  return marked(text)
}

// 发送消息
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message || isLoading.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: message
  })
  userInput.value = ''
  scrollToBottom()

  // 添加 AI 消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: ''
  })
  
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    })

    if (!response.ok) {
      throw new Error('请求失败')
    }

    // 读取流式响应
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              messages.value[aiMessageIndex].content += content
              scrollToBottom()
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    console.error('发送失败:', error)
    messages.value[aiMessageIndex].content = '抱歉，发生了错误，请稍后重试。'
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 处理按键
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="chat-container">
    <!-- 头部 -->
    <header class="chat-header">
      <div class="logo">
        <span class="logo-icon">🤖</span>
        <span class="logo-text">张驰的智能助手</span>
      </div>
    </header>

    <!-- 消息区域 -->
    <main ref="messagesContainer" class="messages-area">
      <!-- 欢迎信息 -->
      <div v-if="messages.length === 0" class="welcome-section">
        <div class="welcome-icon">✨</div>
        <h1 class="welcome-title">今天有什么可以帮到你?</h1>
        <p class="welcome-subtitle">基于 DeepSeek 大模型，为你提供智能对话服务</p>
      </div>

      <!-- 消息列表 -->
      <div v-for="(msg, index) in messages" :key="index" 
           :class="['message', msg.role]">
        <div class="message-avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="message-content">
          <div v-if="msg.role === 'assistant'" 
               v-html="renderMarkdown(msg.content || '思考中...')"
               class="markdown-body">
          </div>
          <div v-else class="user-text">{{ msg.content }}</div>
        </div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="isLoading && messages[messages.length - 1]?.content === ''" 
           class="loading-indicator">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </main>

    <!-- 输入区域 -->
    <footer class="input-area">
      <div class="input-wrapper">
        <textarea
          v-model="userInput"
          @keydown="handleKeydown"
          placeholder="给 DeepSeek 发送消息..."
          rows="1"
          class="message-input"
        ></textarea>
        <button 
          @click="sendMessage" 
          :disabled="!userInput.trim() || isLoading"
          class="send-button"
        >
          <span class="send-icon">↑</span>
        </button>
      </div>
      <p class="input-hint">按 Enter 发送，Shift + Enter 换行</p>
    </footer>
  </div>
</template>

<style scoped>
.chat-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

/* 头部 */
.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-surface);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 消息区域 */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}

/* 欢迎信息 */
.welcome-section {
  text-align: center;
  padding: 4rem 1rem;
}

.welcome-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* 消息 */
.message {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  background: var(--bg-surface);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.user-text {
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.message.user .message-content {
  background: var(--primary-color);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border-top-left-radius: 0.25rem;
  max-width: 80%;
}

.message.user .user-text {
  color: white;
}

.message.assistant .message-content {
  background: var(--bg-surface);
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border-top-left-radius: 0.25rem;
}

/* Markdown 样式 */
.markdown-body {
  color: var(--text-primary);
  line-height: 1.7;
}

.markdown-body :deep(p) {
  margin: 0 0 0.75rem 0;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(code) {
  background: var(--bg-primary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  gap: 4px;
  padding: 0.5rem;
  margin-left: 52px;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 输入区域 */
.input-area {
  padding: 1rem 2rem 1.5rem;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 1.5rem;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  padding: 0.5rem 0;
  max-height: 150px;
  font-family: inherit;
}

.message-input::placeholder {
  color: var(--text-muted);
}

.message-input:focus {
  outline: none;
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: scale(1.05);
}

.send-button:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

.send-icon {
  font-size: 1.25rem;
  font-weight: bold;
}

.input-hint {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

/* 响应式 */
@media (max-width: 640px) {
  .messages-area {
    padding: 1rem;
  }
  
  .input-area {
    padding: 1rem;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
}
</style>
