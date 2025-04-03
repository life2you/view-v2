# Pump Data 前端

这是一个与 Pump Data API 对接的前端项目，用于展示代币数据。

## 功能特点

- 配置后端API地址
- 代币列表展示（支持分页、排序和筛选）
- 代币详情查看
- 代币交易记录查看
- 代币回复列表查看

## 技术栈

- React
- React Router
- Axios
- Ant Design
- Vite

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm start
```

项目将在 http://localhost:3000 启动。

### 生产环境构建

```bash
npm run build
```

## 后端API配置

项目启动后，可以通过界面上的API配置组件修改后端API地址，默认为 `http://localhost:8000`。

## 项目结构

```
/
├── public/               # 静态资源
├── src/
│   ├── components/       # UI组件
│   ├── contexts/         # React上下文
│   ├── pages/            # 页面组件
│   ├── services/         # API服务
│   ├── utils/            # 工具函数
│   ├── App.jsx           # 应用入口组件
│   └── main.jsx          # 应用渲染入口
├── index.html            # HTML模板
├── vite.config.js        # Vite配置
└── package.json          # 项目依赖与脚本
```

## 接口说明

此前端项目对接了 Pump Data API，详细API文档请参考后端项目的API文档。