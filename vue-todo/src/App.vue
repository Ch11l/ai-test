<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
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
const deepThinking = ref(false)  // 深度思考模式
let abortController = null // 控制请求中断

// API 基础地址（开发环境用 localhost，生产环境用相对路径）
const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
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
    content: '',
    thinking: '',
    isThinking: false,
    thinkingTime: 0 // 思考耗时
  })
  
  isLoading.value = true
  // 创建新的 AbortController
  abortController = new AbortController()
  
  // 思考计时器
  const startTime = Date.now()
  let thinkingInterval
  
  if (deepThinking.value) {
    messages.value[aiMessageIndex].isThinking = true
    thinkingInterval = setInterval(() => {
      // 只有在真正处于思考状态时才更新时间
      if (messages.value[aiMessageIndex].isThinking) {
        messages.value[aiMessageIndex].thinkingTime = Math.floor((Date.now() - startTime) / 1000)
      }
    }, 1000)
  }

  try {
    // 构造历史消息上下文
    // 截断策略：仅保留最后 20 条消息
    const MAX_HISTORY = 20;
    const allHistory = messages.value.slice(0, aiMessageIndex);
    const recentHistory = allHistory.slice(-MAX_HISTORY);
    
    const history = recentHistory.map(m => ({
      role: m.role,
      content: m.content || (m.thinking ? '' : '') 
    }))

    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        messages: history, 
        model: 'deepseek-v3.2', 
        enable_thinking: deepThinking.value 
      }),
      signal: abortController.signal
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

      let inThinkBlock = false

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            const reasoning = parsed.choices?.[0]?.delta?.reasoning_content

            // 1. 处理 reasoning_content
            if (reasoning) {
              messages.value[aiMessageIndex].thinking += reasoning
              messages.value[aiMessageIndex].isThinking = true
              continue
            }
            
            // 2. 处理 content 字段
            if (content) {
              if (content.includes('<think>')) {
                inThinkBlock = true
                messages.value[aiMessageIndex].isThinking = true
                const cleanContent = content.replace('<think>', '')
                if (cleanContent) messages.value[aiMessageIndex].thinking += cleanContent
                continue
              }
              
              if (content.includes('</think>')) {
                inThinkBlock = false
                messages.value[aiMessageIndex].isThinking = false
                const cleanContent = content.replace('</think>', '')
                if (cleanContent) messages.value[aiMessageIndex].thinking += cleanContent
                continue
              }

              if (inThinkBlock) {
                messages.value[aiMessageIndex].thinking += content
              } else {
                messages.value[aiMessageIndex].isThinking = false
                messages.value[aiMessageIndex].content += content
              }
              scrollToBottom()
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      messages.value[aiMessageIndex].content += '' 
      messages.value[aiMessageIndex].stopped = true 
    } else {
      console.error('发送失败:', error)
      messages.value[aiMessageIndex].content = '抱歉，发生了错误，请稍后重试。'
    }
  } finally {
    isLoading.value = false
    messages.value[aiMessageIndex].isThinking = false
    if (thinkingInterval) clearInterval(thinkingInterval)
    scrollToBottom()
    abortController = null
  }
}

// 停止生成
const stopGeneration = () => {
  if (abortController) {
    const lastMsgIndex = messages.value.length - 1
    if (messages.value[lastMsgIndex]?.role === 'assistant') {
      messages.value[lastMsgIndex].stopped = true
    }
    abortController.abort()
  }
}

// 继续生成
const continueGeneration = async (index) => {
  const msg = messages.value[index]
  if (!msg) return

  if (!msg.content && msg.thinking) {
    const userMsg = messages.value[index - 1]
    if (userMsg && userMsg.role === 'user') {
       messages.value.splice(index - 1, 2)
       userInput.value = userMsg.content 
       sendMessage() 
    }
    return
  }

  if (msg.content) {
    msg.stopped = false 
    isLoading.value = true
    abortController = new AbortController()
    
    const history = messages.value.slice(0, index + 1).map(m => ({
      role: m.role,
      content: m.content || (m.thinking ? '' : '') 
    }))
    
    const currentContent = msg.content || '';
    const tail = currentContent.slice(-10);
    
    const prompt = tail 
      ? `请继续上文。上一条回复在“...${tail}”处中断了。请紧接着这几个字继续生成，**不要重复**这几个字，也不要重新开始。`
      : '请继续上文，紧接着写，不要重复已有的内容。';

    history.push({ role: 'user', content: prompt })

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          messages: history, 
          model: 'deepseek-v3.2',
          enable_thinking: false 
        }),
        signal: abortController.signal
      })

      if (!response.ok) throw new Error('请求失败')

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
                messages.value[index].content += content
                scrollToBottom()
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') msg.stopped = true
    } finally {
      isLoading.value = false
      abortController = null
    }
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
  <div class="app-background">
    <!-- 主界面卡片 -->
    <div class="chat-card">
      <!-- 头部 -->
      <header class="chat-header">
        <div class="logo">
          <div class="logo-icon-wrapper">
            <span class="logo-icon">🤖</span>
          </div>
          <div class="logo-info">
            <span class="logo-text">小象智能助手</span>
          </div>
        </div>
        
        <div class="header-controls">
           <!-- 模型切换开关 (Pill Style) -->
           <div class="mode-switch" @click="deepThinking = !deepThinking">
             <span :class="['switch-bg', { active: deepThinking }]"></span>
             <span class="switch-label left" :class="{ active: !deepThinking }">急速</span>
             <span class="switch-label right" :class="{ active: deepThinking }">深度思考</span>
           </div>
        </div>
      </header>

      <!-- 消息区域 -->
      <main ref="messagesContainer" class="messages-area">
        <TransitionGroup name="list">
          <!-- 欢迎信息 -->
          <div v-if="messages.length === 0" key="welcome" class="welcome-section">
            <div class="welcome-card">
              <div class="welcome-icon">✨</div>
              <h1 class="welcome-title">今天想聊点什么?</h1>
              <p class="welcome-subtitle">我是您的专属 AI 助手，随时准备协助您的工作与生活。</p>
              
              <div class="suggestion-chips">
                <button class="chip" @click="userInput='帮我写一份周报'; sendMessage()">📅 帮我写一份周报</button>
                <button class="chip" @click="userInput='解释量子纠缠'; sendMessage()">🔬 解释量子纠缠</button>
                <button class="chip" @click="userInput='Python 生成 CSV 代码'; sendMessage()">🐍 Python 生成 CSV</button>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-for="(msg, index) in messages" :key="index" 
               :class="['message-row', msg.role]">
            
            <!-- 头像 -->
            <div class="message-avatar">
              <img v-if="msg.role === 'user'" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              <div v-else class="ai-avatar">AI</div>
            </div>

            <div class="message-content-wrapper">
              <!-- 思考过程 (折叠卡片) -->
              <div v-if="msg.thinking || (msg.isThinking && msg.role === 'assistant')" class="thinking-card-wrapper">
                <details :open="msg.isThinking" class="thinking-card">
                  <summary>
                    <div class="thinking-header">
                      <span class="spin-icon" v-if="msg.isThinking">⟳</span>
                      <span class="static-icon" v-else>💡</span>
                      <span class="think-label">
                        {{ msg.isThinking ? '深度思考中...' : '深度思考结束' }}
                      </span>
                      <span class="think-time" v-if="msg.thinkingTime > 0">{{ msg.thinkingTime }}s</span>
                    </div>
                  </summary>
                  <div class="thinking-body markdown-body" v-html="renderMarkdown(msg.thinking)"></div>
                </details>
              </div>

              <!-- 正文气泡 -->
              <div class="message-bubble">
                <div v-if="msg.role === 'assistant'" 
                     v-html="renderMarkdown(msg.content || (msg.thinking ? '' : '...'))"
                     class="markdown-body">
                </div>
                <div v-else class="user-text">{{ msg.content }}</div>
              </div>
              
              <!-- 继续生成按钮 -->
              <div v-if="msg.stopped" class="msg-actions">
                <button @click="continueGeneration(index)" class="continue-btn">
                  <span class="icon">↻</span> 继续生成
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- 加载中态 -->
        <div v-if="isLoading && messages[messages.length - 1]?.content === '' && !messages[messages.length - 1]?.isThinking" 
             class="loading-wrapper">
           <div class="typing-indicator">
             <span></span><span></span><span></span>
           </div>
        </div>
      </main>

      <!-- 输入区域 -->
      <footer class="input-area">
        <div class="input-card">
          <textarea
            v-model="userInput"
            @keydown="handleKeydown"
            placeholder="问问小象"
            rows="1"
            class="glass-input"
          ></textarea>
          
          <div class="input-actions">
            <button 
              v-if="!isLoading"
              @click="sendMessage" 
              :disabled="!userInput.trim()"
              class="send-btn"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
            <button 
              v-else
              @click="stopGeneration" 
              class="stop-btn"
            >
              <span class="stop-icon">■</span>
            </button>
          </div>
        </div>
        <div class="footer-note">
           AI 可能会产生错误，请核对重要信息
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* 全局变量 - Pro Max 级配色系统 (精细版) */
:root {
  --bg-app: #f0f4f9;
  --bg-surface: #ffffff;
  
  /* 文本颜色 - 增加对比度 */
  --text-primary: #1f1f1f;
  --text-secondary: #444746;
  --text-muted: #757575;
  
  /* 品牌色 */
  --accent-color: #0b57d0;
  --accent-hover: #0842a0;
  --accent-light: #e8f0fe;
  
  /* 阴影 - 更轻盈 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04); 
  --shadow-md: 0 4px 8px rgba(0,0,0,0.06);
  --shadow-float: 0 8px 16px -4px rgba(0,0,0,0.08);
  
  /* 字体系统 - 锁定快乐圆体 (带系统圆体兜底) */
  --font-sans: 'ZCOOL KuaiLe', 'YouYuan', '幼圆', 'Yuanti SC', cursive;
  --mono-font: 'JetBrains Mono', 'Fira Code', monospace;
}

/* 布局容器 */
.app-background {
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-app);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  overflow: hidden;
  font-size: 20px; /* 进一步加大字号 (原 18px) */
  font-weight: 500;
  -webkit-font-smoothing: antialiased; /* 抗锯齿 */
}

.chat-card {
  width: 100%;
  height: 100%;
  max-width: 1440px;
  background: transparent;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 头部 */
.chat-header {
  padding: 1.5rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  background: linear-gradient(to bottom, #f0f4f9 0%, rgba(240,244,249,0.9) 100%);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Logo 区域 */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo-text {
  font-size: 1.35rem; /* 略微加大 Logo */
  font-weight: 700; /* 加粗 */
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

/* Mode Switch - 极致胶囊 */
.mode-switch {
  background: #e2e6ea;
  border-radius: 32px;
  padding: 3px;
  width: 170px; /* 略微收窄 */
  height: 40px; /* 更紧凑 */
  display: flex;
  position: relative;
  cursor: pointer;
}

.switch-bg {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(50% - 3px);
  height: calc(100% - 6px);
  background: white;
  border-radius: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.switch-bg.active {
  transform: translateX(100%);
  background: var(--accent-color);
}

.switch-label {
  flex: 1;
  text-align: center;
  line-height: 34px; /* 垂直居中 */
  font-size: 0.9rem; /* 加大开关文字 */
  font-weight: 600; /* 加粗 */
  color: var(--text-secondary);
  z-index: 2;
  transition: color 0.3s;
}

.switch-label.right.active {
  color: white;
}

/* 消息区域 */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 20%; /* 减少左右 padding 让内容更宽 */
  scroll-behavior: smooth;
  padding-bottom: 2rem;
}

@media (max-width: 1200px) { .messages-area { padding: 0 10%; } }
@media (max-width: 768px) { .messages-area { padding: 0 5%; } }

/* 隐藏滚动条 */
.messages-area::-webkit-scrollbar { width: 0px; }

/* 欢迎界面 */
.welcome-section {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.6s ease-out;
}

.welcome-title {
  font-size: 3.2rem; /* 加大欢迎标题 */
  line-height: 1.2;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #4285f4, #9c27b0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1.5px;
  font-weight: 800; /* 加粗 */
}

.welcome-subtitle {
  font-size: 1.5rem; /* 加大副标题 */
  font-weight: 500;
  color: #c4c7c5;
  margin-bottom: 3rem;
  letter-spacing: 0.5px;
}

.suggestion-chips {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.chip {
  padding: 12px 20px; /* 加大 Chip 尺寸 */
  background: white;
  border: 1px solid rgba(0,0,0,0.05); /* 微弱边框 */
  border-radius: 14px;
  color: var(--text-secondary);
  font-size: 1rem; /* 加大 Chip 字号 */
  font-weight: 600; /* 加粗 */
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  background: #f8fafd;
  border-color: #dbe4f7;
  color: var(--accent-color);
  transform: translateY(-1px);
}

/* 消息行 */
.message-row {
  margin-bottom: 2.5rem; /* 增加行间距 */
  display: flex;
  gap: 20px; /* 增加头像与气泡间距 */
  opacity: 0;
  animation: slideUp 0.4s forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-avatar {
  width: 36px; /* 加大头像 */
  height: 36px;
  margin-top: 4px;
  flex-shrink: 0;
}

.message-avatar img, .ai-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* 气泡内容 */
.message-content-wrapper {
  max-width: 88%; /* 稍微加宽气泡最大宽度 */
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-bubble {
  padding: 18px 24px; /* 大幅增加气泡内边距 (原 14px 20px) */
  border-radius: 20px;
  line-height: 1.8; /* 增加行高 (原 1.6) */
  font-size: 1.2rem; /* 稍微加大气泡文字 */
  font-weight: 100; /* 确保正文也有足够字重 */
}

/* 用户气泡 */
.message-row.user {
  flex-direction: row-reverse;
}

.user .message-bubble {
  background: #e8f0fe;
  color: #1a73e8;
  border-bottom-right-radius: 4px;
}

/* AI 气泡 */
.assistant .message-bubble {
  background: #ffffff;
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.02);
}

/* 思考卡片 */
.thinking-card {
  border: 1px solid rgba(0,0,0,0.06);
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}

.thinking-card summary {
  padding: 12px 16px; /* 加大 Summary Padding */
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
  background: #f8f9fa;
  cursor: pointer;
  transition: color 0.2s;
}

.thinking-card summary:hover {
  color: var(--text-primary);
}

.thinking-body {
  padding: 20px 24px; /* 加大思考区域 Padding */
  border-top: 1px solid #f1f1f1;
  font-size: 0.95rem; /* 加大思考区域文字 */
  line-height: 1.7;
  color: var(--text-secondary);
  background: #ffffff;
}

/* 输入区域 Pro */
.input-area {
  padding: 2rem 15%;
  background: linear-gradient(to top, #f0f4f9 70%, rgba(240, 244, 249, 0));
}

.input-card {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 28px; /* 稍微减小圆角 */
  padding: 8px 12px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  box-shadow: var(--shadow-float);
  border: 1px solid rgba(255,255,255,0.8);
  transition: all 0.3s;
}

.input-card:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.1);
}

.glass-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 12px;
  font-size: 1rem;
  color: var(--text-primary);
  line-height: 1.5;
  outline: none;
  resize: none;
  max-height: 160px;
}

.glass-input::placeholder {
  color: #aeb1b6;
}

/* 按钮组优化 - 胶囊型 */
.input-actions {
  display: flex;
  gap: 8px;
  padding-bottom: 6px; /* 对齐输入框底部 */
}

/* 发送按钮 - 改为圆形图标按钮 */
.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--text-primary); /* 实心黑底 */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: var(--accent-color); /* 悬浮变蓝 */
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #e1e3e1;
  color: #aeb1b6;
  cursor: not-allowed;
}

/* 停止/继续按钮 - 胶囊型文字按钮 */
.stop-btn, .continue-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stop-btn {
  background: white;
  border: 1px solid #e1e3e1;
  color: var(--text-primary);
}

.stop-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

/* 继续按钮样式覆盖 */
.continue-btn {
  background: white;
  border: 1px solid #e1e3e1;
  color: var(--accent-color);
  width: auto; /* 自适应宽度 */
  margin-top: 4px;
}

.continue-btn:hover {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.msg-actions {
  display: flex;
}


.footer-note {
  margin-top: 16px;
  font-size: 0.75rem;
  color: #8e918f;
  text-align: center;
  font-weight: 400;
}

/* 动效增强 */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* 响应式适配 */
@media (max-width: 768px) {
  .chat-header { padding: 1rem; }
  .welcome-title { font-size: 2.5rem; }
  .welcome-subtitle { font-size: 1.2rem; }
  .input-area { padding: 1.5rem 1rem; }
  .input-card { border-radius: 28px; }
  .message-content-wrapper { max-width: 90%; }
}
</style>
