const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// 获取省份列表
app.get('/api/provinces', async (req, res) => {
    try {
        const response = await axios.get('http://www.nmc.cn/rest/province');
        const provinces = response.data;

        // 构建省份数据对象 {省份名: 省份代码}
        const provinceData = {};
        provinces.forEach(province => {
            provinceData[province.name] = province.code;
        });

        res.json({
            success: true,
            data: provinceData
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// 获取城市列表
app.get('/api/cities/:provinceCode', async (req, res) => {
    try {
        const { provinceCode } = req.params;
        const response = await axios.get(`http://www.nmc.cn/rest/province/${provinceCode}`);
        const cities = response.data;

        // 构建城市数据对象 {城市名: 城市代码}
        const cityData = {};
        cities.forEach(city => {
            cityData[city.city] = city.code;
        });

        res.json({
            success: true,
            data: cityData
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// 获取天气数据
app.post('/api/weather', async (req, res) => {
    try {
        const { cityCodes } = req.body;
        
        // 并行获取所有城市的天气数据
        const weatherPromises = cityCodes.map(async (cityCode) => {
            const response = await axios.get(`http://www.nmc.cn/rest/tempchart/${cityCode}`);
            return {
                cityCode,
                forecast: response.data
            };
        });
        
        const weatherResults = await Promise.all(weatherPromises);
        
        // 获取城市名称 - 简化版本
        const cityInfos = cityCodes.map((cityCode) => {
            // 直接从请求参数中获取城市名称（如果前端提供了）
            if (req.body.cityNames && req.body.cityNames[cityCode]) {
                return {
                    code: cityCode,
                    name: req.body.cityNames[cityCode]
                };
            }
            
            // 回退方案：使用城市代码
            return {
                code: cityCode,
                name: cityCode
            };
        });
        
        // 构建最终数据结构
        const resultData = weatherResults.map((weatherResult) => {
            const cityInfo = cityInfos.find(info => info.code === weatherResult.cityCode);
            return {
                city: cityInfo.name,
                forecast: weatherResult.forecast
            };
        });
        
        res.json({
            success: true,
            data: resultData
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});