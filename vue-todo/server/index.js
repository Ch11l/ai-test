/**
 * DeepSeek API 代理服务
 * 保护 API Key 不暴露给前端
 */

require('dotenv').config();
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
    const { message, messages, model, enable_thinking } = req.body;

    // 简单验证：message 或 messages 至少有一个
    if (!message && (!messages || messages.length === 0)) {
        return res.status(400).json({ error: '消息不能为空' });
    }

    try {
        // 设置 SSE 响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 统一使用 DeepSeek-V3.2 混合模型
        // 它同时具备 V3 的极速和 R1 的深度思考能力，通过参数控制
        const unifiedModel = 'deepseek-v3.2';

        // 决定是否开启思考：优先使用前端传来的 enable_thinking，兼容旧逻辑
        let shouldThink = false;
        if (typeof enable_thinking !== 'undefined') {
            shouldThink = enable_thinking;
        } else if (model === 'deepseek-r1') {
            shouldThink = true;
        }

        // 写入日志文件
        require('fs').appendFileSync('request_log.txt', `[${new Date().toISOString()}] Request: ${model} -> Actual: ${unifiedModel}, Thinking: ${shouldThink}\n`);
        console.log(`🤖 模型请求: ${model} | 实际调用: ${unifiedModel} | 思考模式: ${shouldThink ? 'ON' : 'OFF'}`);

        // 构造消息体
        let messagesPayload;
        if (messages && Array.isArray(messages)) {
            messagesPayload = messages;
        } else {
            messagesPayload = [{ role: 'user', content: message }];
        }

        // 调用阿里云百炼 API
        const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: unifiedModel, // 统一模型
                messages: messagesPayload,
                stream: true,
                enable_thinking: shouldThink // 动态控制思考
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API 错误:', errorText);
            // 记录错误日志
            require('fs').appendFileSync('request_log.txt', `[${new Date().toISOString()}] Error: ${errorText}\n`);
            res.write(`data: ${JSON.stringify({ error: 'API 调用失败' })}\n\n`);
            res.end();
            return;
        }

        // 转发流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let isFirstChunk = true;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);

            // 调试：记录第一个 chunk 的内容
            if (isFirstChunk) {
                console.log('API Response First Chunk:', chunk);
                require('fs').appendFileSync('request_log.txt', `[${new Date().toISOString()}] First Chunk: ${chunk}\n`);
                isFirstChunk = false;
            }

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
