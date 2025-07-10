#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getMultipleCityWeather } = require('./weather');

// 解析命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('请提供城市代码（以逗号分隔）');
    console.log('示例: node index.js 54511,58362,59287');
    process.exit(1);
}

const cityCodes = args[0].split(',');

// 主函数
async function main() {
    try {
        console.log('正在获取天气预报数据...');

        const citiesData = await getMultipleCityWeather(cityCodes);
        console.log('数据获取成功！');

        const htmlContent = generateHTML(citiesData);
        const outputPath = path.join(__dirname, 'weather-forecast.html');

        fs.writeFileSync(outputPath, htmlContent);
        console.log(`\n天气预报图表已生成: ${outputPath}`);
        console.log('请用浏览器打开查看');

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

// 生成HTML文件内容
function generateHTML(citiesData) {
    // 读取模板文件
    const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8');

    // 提取日期作为X轴
    const dates = citiesData[0].forecast.map(day => {
        const [year, month, date] = day.date.split('-');
        return `${month}/${date}`;
    });

    // 生成图表数据集
    const datasets = [];
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#C9CBCF', '#7EBE37'
    ];

    citiesData.forEach((cityData, index) => {
        const color = colors[index % colors.length];

        // 最高温数据集
        datasets.push({
            label: `${cityData.city} - 最高温`,
            data: cityData.forecast.map(day => {
                const temp = day.day.weather.temperature;
                return temp === '9999' ? null : parseInt(temp);
            }),
            borderColor: color,
            backgroundColor: `${color}33`,
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.3,
            fill: false
        });

        // 最低温数据集
        datasets.push({
            label: `${cityData.city} - 最低温`,
            data: cityData.forecast.map(day => {
                const temp = day.night.weather.temperature;
                return temp === '9999' ? null : parseInt(temp);
            }),
            borderColor: color,
            backgroundColor: `${color}33`,
            borderWidth: 3,
            pointRadius: 5,
            borderDash: [10, 5],
            tension: 0.3,
            fill: false
        });
    });

    // 替换模板中的占位符
    return template
        .replace('/* [DATASETS] */', JSON.stringify(datasets))
        .replace('/* [LABELS] */', JSON.stringify(dates))
        .replace('<!-- [TITLE] -->', `天气预报 - ${new Date().toLocaleDateString()}`)
        .replace('<!-- [CITIES] -->', citiesData.map(c => c.city).join(', '));
}

// 启动程序
main();