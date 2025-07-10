const axios = require('axios');

/**
 * 获取指定城市的天气预报数据
 * @param {string} cityCode 城市代码
 * @returns {Promise<Object>} 包含城市名称和预报数据的对象
 */
async function getWeatherData(cityCode) {
    try {
        const url = `https://www.nmc.cn/rest/weather?stationid=${cityCode}`;
        const response = await axios.get(url);

        if (response.data.code !== 0) {
            throw new Error(`API错误: ${response.data.msg}`);
        }

        return {
            city: response.data.data.real.station.city,
            forecast: response.data.data.predict.detail
        };
    } catch (error) {
        throw new Error(`获取天气数据失败: ${error.message}`);
    }
}

/**
 * 获取多个城市的天气预报数据
 * @param {string[]} cityCodes 城市代码数组
 * @returns {Promise<Object[]>} 包含所有城市预报数据的数组
 */
async function getMultipleCityWeather(cityCodes) {
    try {
        const results = await Promise.all(
            cityCodes.map(code => getWeatherData(code.trim()))
        );
        return results;
    } catch (error) {
        throw new Error('获取天气数据时出错: ' + error.message);
    }
}

module.exports = {
    getWeatherData,
    getMultipleCityWeather
};