const express = require('express');
const axios = require('axios');
const path = require('path');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

// 创建Redis客户端
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// 处理Redis连接错误
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// 连接到Redis
(async () => {
  await redisClient.connect();
})();

// 缓存中间件 - 修改为接受键生成函数
const cacheMiddleware = (keyFn, ttl = 43200) => { // 默认12小时过期
  return async (req, res, next) => {
    try {
      const cacheKey = keyFn(req); // 使用函数生成缓存键
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // 将缓存键附加到req对象，供后续使用
      req.cacheKey = cacheKey;
      next();
    } catch (err) {
      console.error('Cache error:', err);
      next();
    }
  };
};

// 设置响应缓存
const setCache = async (key, data, ttl = 43200) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.error('Set cache error:', err);
  }
};

// 中间件
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// 获取省份列表 - 使用固定键
app.get('/api/provinces', cacheMiddleware(() => 'provinces'), async (req, res) => {
  try {
    const response = await axios.get('http://www.nmc.cn/rest/province');
    const provinces = response.data;

    // 构建省份数据对象 {省份名: 省份代码}
    const provinceData = {};
    provinces.forEach(province => {
      provinceData[province.name] = province.code;
    });

    const result = {
      success: true,
      data: provinceData
    };
    
    // 设置缓存
    await setCache('provinces', result);
    
    res.json(result);
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// 获取城市列表 - 使用动态键
app.get('/api/cities/:provinceCode', 
  cacheMiddleware(req => `cities:${req.params.provinceCode}`), 
  async (req, res) => {
    try {
      const { provinceCode } = req.params;
      const response = await axios.get(`http://www.nmc.cn/rest/province/${provinceCode}`);
      const cities = response.data;

      // 构建城市数据对象 {城市名: 城市代码}
      const cityData = {};
      cities.forEach(city => {
        cityData[city.city] = city.code;
      });

      const result = {
        success: true,
        data: cityData
      };
      
      // 设置缓存 - 使用中间件生成的键
      await setCache(req.cacheKey, result);
      
      res.json(result);
    } catch (error) {
      res.json({
        success: false,
        error: error.message
      });
    }
  }
);

// 获取天气数据
app.post('/api/weather', async (req, res) => {
  try {
    const { cityCodes } = req.body;
    
    // 创建缓存键（按城市代码排序确保相同城市组合的键一致）
    const cacheKey = `weather:${cityCodes.sort().join(',')}`;
    
    // 尝试从缓存获取
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    // 并行获取所有城市的天气数据
    const weatherPromises = cityCodes.map(async (cityCode) => {
      const response = await axios.get(`http://www.nmc.cn/rest/tempchart/${cityCode}`);
      return {
        cityCode,
        forecast: response.data
      };
    });
    
    const weatherResults = await Promise.all(weatherPromises);
    
    // 获取城市名称
    const cityInfos = cityCodes.map((cityCode) => {
      if (req.body.cityNames && req.body.cityNames[cityCode]) {
        return {
          code: cityCode,
          name: req.body.cityNames[cityCode]
        };
      }
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
    
    const result = {
      success: true,
      data: resultData
    };
    
    // 设置缓存（12小时）
    await redisClient.setEx(cacheKey, 43200, JSON.stringify(result));
    
    res.json(result);
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