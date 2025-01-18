const express = require('express');
const axios = require('axios');
const cors = require('cors');


const app = express();
app.use(cors()); // 支持跨域请求;
// 支持 JSON 请求体
app.use(express.json());

// Reader API 基础 URL
const READER_BASE_URL = 'https://r.jina.ai/';

// 读取 URL 内容的接口
app.post('/read-url', async (req, res) => {
    try {
        const { url, apiKey } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // 构建 Reader API 请求
        const readerUrl = `${READER_BASE_URL}${encodeURIComponent(url)}`;
        
        const headers = {};

        headers['X-API-Key'] = 'jina_a7b4207bd8e74a0f874bc2c9b6e5351bqUSlRDy56pcRb2YoZc2M91lAxx-u';
        // 如果提供了 API key，添加到请求头中以获得更高的速率限制
        if (apiKey) {
            headers['X-API-Key'] = apiKey;
        }

        // 调用 Reader API
        const response = await axios.get(readerUrl, { headers });
        
        // 返回处理后的内容
        res.json({
            success: true,
            content: response.data
        });

    } catch (error) {
        console.error('Error reading URL:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to read URL'
        });
    }
});

// 搜索内容的接口
app.post('/search', async (req, res) => {
    try {
        const { query, apiKey } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // 构建搜索 API 请求
        const searchUrl = `https://s.jina.ai/${encodeURIComponent(query)}`;
        
        const headers = {};
        if (apiKey) {
            headers['X-API-Key'] = apiKey;
        }

        // 调用搜索 API
        const response = await axios.get(searchUrl, { headers });
        
        res.json({
            success: true,
            results: response.data
        });

    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to perform search'
        });
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 