# Motion Index

Motion Index 是一个可预览、可复制、可替换内容的 React 网页动效组件库。当前包含 8 个分类、22 个正式组件，覆盖文字揭示、按钮反馈、封面悬停、作品画廊、3D 场景、滚动转场、轨迹绘制和导航。

仓库只包含对外组件网站所需的原创代码与演示资源，不包含来源网站的恢复页面、生产脚本、品牌素材、摄影、截图或研究归档。

## 功能

- 在同一页面浏览全部正式组件。
- 在 Preview 和 Code 之间切换。
- 一键重新播放当前动效。
- 复制完整组件源码后替换默认文字、颜色、图片或数据。
- 支持桌面和移动端布局。
- 动效组件在合理范围内支持 `prefers-reduced-motion`。
- WebGL 组件使用 Three.js，并包含资源释放和不可用时的降级表现。

## 组件分类

- 文字与标题：Oval Title Reveal、Lime Text Reveal、Kinetic Marquee
- 按钮：Rolling Letters、Radial Fill Button、Arrow State
- 封面与悬停：Layered Image Reveal、Dithered Media Reveal、Scroll Ripple Reveal、Pixel Shimmer Field、Hover Disclosure Card
- 作品展示：Horizontal Reel、Parallax Collage、Social Fan
- 3D 场景：Anchored Cloud Field
- 滚动转场：Hero Shrink Scene、Dual Panel Converge、Oval Section Reveal、Scroll Scatter Scene
- 轨迹与绘制：Signature Draw
- 导航：Staggered Menu、Scroll Direction Nav

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

Vite 启动后打开终端显示的本地地址即可。

## 检查与构建

```bash
npm run check
npm run build
npm run preview
```

- `npm run check` 检查 22 个正式组件、8 个分类和公开演示资源是否完整。
- `npm run build` 生成只包含 Motion Index 的生产文件，并检查是否混入本地研究标记。
- `npm run preview` 预览构建后的生产版本。

## 使用组件

1. 在左侧目录中选择组件。
2. 点击 `Code`。
3. 点击“复制代码”。
4. 将组件放入自己的 React 项目。
5. 根据组件顶部的 import 安装所需依赖。
6. 替换默认文字、图片 URL、颜色或数据。

组件源码以单文件示例为主，方便直接阅读和迁移。涉及 Three.js 或 Lenis 的组件需要保留对应依赖。

## 目录结构

```text
.
├── index.html
├── public/
│   ├── fonts/
│   ├── images/
│   └── motion-index-mark.svg
├── scripts/
│   ├── check-deployment.mjs
│   └── check-motion-library.mjs
├── src/
│   ├── components/
│   ├── data/registry.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── LICENSE
└── NOTICE.md
```

## 演示资源

`public/images/` 中的十张复古未来主义 PNG 用于展示图片遮罩、悬停、画廊、WebGL 和滚动转场。复制组件后可以直接替换成自己的图片。

Anchored Cloud Field 不读取外部云纹理；云层纹理由组件在浏览器中生成，因此复制组件代码后不需要额外下载素材。

## 许可

组件网站和正式组件代码使用 MIT License。演示图片、字体与第三方依赖遵循各自的许可或使用范围，详见 `NOTICE.md` 和 `public/fonts/` 中的许可文件。
