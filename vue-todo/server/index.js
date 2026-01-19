/**
 * DeepSeek API 代理服务
 * 保护 API Key 不暴露给前端
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 从环境变量读取 API Key
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
    console.error('❌ 错误: 未设置 DEEPSEEK_API_KEY 环境变量');
    console.error('请运行: export DEEPSEEK_API_KEY="你的API密钥"');
    process.exit(1);
}

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '服务运行正常' });
});

// 聊天接口 - 流式响应
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: '消息不能为空' });
    }

    try {
        // 设置 SSE 响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 调用阿里云百炼 API（OpenAI 兼容模式）
        const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-v3',  // 阿里云百炼上的 DeepSeek 模型
                messages: [{ role: 'user', content: message }],
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API 错误:', errorText);
            res.write(`data: ${JSON.stringify({ error: 'API 调用失败' })}\n\n`);
            res.end();
            return;
        }

        // 转发流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            res.write(chunk);
        }

        res.end();
    } catch (error) {
        console.error('代理错误:', error);
        res.write(`data: ${JSON.stringify({ error: '服务器内部错误' })}\n\n`);
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 DeepSeek 代理服务已启动: http://localhost:${PORT}`);
    console.log(`📡 健康检查: http://localhost:${PORT}/api/health`);
});
