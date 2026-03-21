# HeadcanonGen

> 输入你的角色和情绪，秒出一段粉丝向脑补小故事 ✨

一个面向同人/粉丝文化爱好者的 AI 脑补生成器。

## 功能

- 输入角色名、作品名
- 选择风格：💛 温馨 / 🌧️ 虐心 / 😂 沙雕 / 🌙 暗恋
- 一键生成 150-250 字的中文 headcanon 短文
- 支持再生成和一键复制

## 技术栈

- **框架**：Next.js 14 (App Router)
- **样式**：Tailwind CSS
- **AI**：Anthropic Claude (claude-sonnet-4-6)
- **部署**：Vercel

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 填入你的 ANTHROPIC_API_KEY

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

## 部署

推荐部署到 [Vercel](https://vercel.com)，在项目设置中添加环境变量 `ANTHROPIC_API_KEY` 即可。

## MVP 文档

详见 [MVP 需求文档](https://feishu.cn/docx/FeGodb4q1o1smrxRUItcV3aTnCh)
