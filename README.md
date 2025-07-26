# 国家气象中心天气预报可视化应用

这是一个Node.js Web应用，用于从国家气象中心(www.nmc.cn)获取多个城市的天气预报数据并生成交互式折线图。

## 功能特点

- 获取多个城市的天气预报数据
- 生成包含折线图的HTML文件（命令行版本）
- Web界面版本支持通过浏览器选择城市并查看天气预报
- 可视化展示最高温和最低温趋势
- 响应式设计，适配不同设备
- 交互式图表（悬停查看详情，点击图例显示/隐藏数据）

## 安装

1. 克隆此仓库：
```bash
git clone https://github.com/dmabupt/weather-visualization.git
cd weather-visualization
```

2. 安装依赖：
```bash
npm install
```

## 使用

### 本机运行
```bash
npm start
```

### Docker方式运行
```bash
# 构建Docker镜像
docker build -t weather-viz .

# 运行容器（映射到宿主机3000端口）
docker run -d -p 3000:3000 --name weather-app weather-viz
```
然后在浏览器中打开 http://localhost:3000 访问应用。

### Docker Compose方式运行
```bash
docker-compose up
```

## 数据来源
所有数据来自国家气象中心(www.nmc.cn)
