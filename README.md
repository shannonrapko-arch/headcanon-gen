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

```env
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
| `NEXT_PUBLIC_SITE_URL` | 站点根 URL，用于 OG meta。**现在不填也没问题**，会自动回退到 `https://headcanon-gen.vercel.app`；以后买了正式域名再填 | 可选 |

4. 点击 **Deploy**，完成部署

> ⚠️ 不要把 `.env.local` 提交到 Git，该文件已在 `.gitignore` 中排除。

---

## 绑定自定义域名

项目代码层面不依赖任何硬编码域名，绑定自定义域名只需 Vercel 后台操作。

### 步骤

1. **Vercel 后台** → 进入项目 → **Settings → Domains**
2. 输入你的域名（如 `headcanon.example.com`），点击 **Add**
3. Vercel 会提示你去 DNS 服务商添加记录：
   - **根域名**（`example.com`）：添加 `A` 记录，指向 `76.76.21.21`
   - **子域名**（`www.example.com` 或其他前缀）：添加 `CNAME` 记录，指向 `cname.vercel-dns.com`
4. DNS 生效后（通常几分钟到 1 小时），Vercel 自动签发 HTTPS 证书
5. 在 Vercel **Environment Variables** 中补充：
   ```
   NEXT_PUBLIC_SITE_URL=https://你的域名
   ```
6. 重新触发一次部署（Redeploy），让 OG meta 信息生效

### 项目本身是否需要额外配置？

**不需要。** 项目代码已针对域名切换做好准备：
- API 路由使用相对路径（`/api/generate`），域名变化不影响
- OG `url` 读取 `NEXT_PUBLIC_SITE_URL` 环境变量，换域名只改变量即可
- favicon、静态资源均使用绝对路径，不受域名影响
- 无任何 CORS 硬编码、无 `allowedOrigins` 白名单需要维护

---

## 环境变量说明

```env
# DeepSeek API Key（必填）
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 站点根 URL，用于 OpenGraph meta（可选）
# - 不填：自动回退到 https://headcanon-gen.vercel.app，当前直接可用
# - 以后买了正式域名：填入 https://你的域名，Redeploy 一次即可完成切换
NEXT_PUBLIC_SITE_URL=
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
