# 国家气象中心天气预报可视化应用

这是一个Node.js命令行应用，用于从 国家气象中心(www.nmc.cn) 获取多个城市的天气预报数据并生成交互式折线图。

## 功能特点

- 获取多个城市的天气预报数据
- 生成包含折线图的HTML文件
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

### 基本用法
```bash
node index.js <城市代码列表>
```

示例：
```bash
node index.js Wqsps,VZgct,MwkIG,zOenJ,SKMHP
```

### 全局安装（可选）
```bash
npm install -g .
```

安装后可以直接使用：
```bash
weather-viz Wqsps,VZgct,MwkIG,zOenJ,SKMHP
```

## 城市代码示例
- 北京: Wqsps
- 上海: WwcJd
- 广州: DwzZf
- 杭州: HIieJ
- 成都: yGYHR
- 武汉: bSpCz
- 长沙: zOenJ
- 张家口：AXmqR
- 大同：VZgct
- 乌兰察布：MwkIG
- 贵阳：SKMHP
- 西宁：SHRvr
- 兰州：ARkZA
- 拉萨：utJQK

## 输出说明
程序会在当前目录生成 `weather-forecast.html` 文件，包含：
- 多城市温度趋势折线图
- 图例说明
- 使用指南
- 数据来源信息

## 数据来源
所有数据来自国家气象中心(www.nmc.cn)
