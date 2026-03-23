# HeadcanonGen ✨

> 输入角色名和风格，AI 秒出一段粉丝向脑补小故事

面向同人/粉丝文化爱好者的 AI 脑补生成器，支持温馨、虐心、沙雕、暗恋四种风格。

## 功能

- 输入角色名（必填）、作品名（选填）
- 选择风格：💛 温馨 / 🌧️ 虐心 / 😂 沙雕 / 🌙 暗恋
- 一键生成 150–250 字的中文 headcanon 短文
- 支持再生成 + 一键复制

## 技术栈

- **框架**：Next.js 14 (App Router)
- **样式**：Tailwind CSS
- **AI**：DeepSeek (`deepseek-chat`)
- **部署**：Vercel

---

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

打开 `.env.local`，填入你的 DeepSeek API Key：

```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

> DeepSeek API Key 申请地址：https://platform.deepseek.com/

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 4. 构建生产版本（可选）

```bash
npm run build
npm run start
```

---

## Vercel 部署

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入该仓库
3. 在 Vercel 项目设置 → **Environment Variables** 中添加：

| 变量名 | 说明 | 是否必填 |
|---|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | ✅ 必填 |

4. 点击 **Deploy**，完成部署

> ⚠️ 不要把 `.env.local` 提交到 Git，该文件已在 `.gitignore` 中排除。

---

## 环境变量说明

```env
# DeepSeek API Key（必填）
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

---

## 项目结构

```
headcanon-gen/
├── src/
│   └── app/
│       ├── api/
│       │   └── generate/
│       │       └── route.ts   # AI 生成接口
│       ├── globals.css        # 全局样式
│       ├── layout.tsx         # 页面布局 + metadata
│       └── page.tsx           # 主页面
├── public/
│   ├── favicon.ico
│   └── favicon.svg
├── .env.example               # 环境变量示例
└── package.json
```

---

Made with ❤️ & AI
