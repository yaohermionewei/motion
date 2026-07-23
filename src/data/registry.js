import OvalTitleReveal from "../components/OvalTitleReveal";
import ovalTitleRevealSource from "../components/OvalTitleReveal.jsx?raw";
import LimeTextReveal from "../components/LimeTextReveal";
import limeTextRevealSource from "../components/LimeTextReveal.jsx?raw";
import KineticMarquee from "../components/KineticMarquee";
import kineticMarqueeSource from "../components/KineticMarquee.jsx?raw";
import RadialTextLens from "../components/RadialTextLens";
import radialTextLensSource from "../components/RadialTextLens.jsx?raw";
import RollingLettersButton from "../components/RollingLettersButton";
import rollingLettersButtonSource from "../components/RollingLettersButton.jsx?raw";
import StaggeredRollButton from "../components/StaggeredRollButton";
import staggeredRollButtonSource from "../components/StaggeredRollButton.jsx?raw";
import RadialFillButton from "../components/RadialFillButton";
import radialFillButtonSource from "../components/RadialFillButton.jsx?raw";
import ArrowStateButton from "../components/ArrowStateButton";
import arrowStateButtonSource from "../components/ArrowStateButton.jsx?raw";
import LayeredImageReveal from "../components/LayeredImageReveal";
import layeredImageRevealSource from "../components/LayeredImageReveal.jsx?raw";
import ScrollRippleReveal from "../components/ScrollRippleReveal";
import scrollRippleRevealSource from "../components/ScrollRippleReveal.jsx?raw";
import PixelShimmerField from "../components/PixelShimmerField";
import pixelShimmerFieldSource from "../components/PixelShimmerField.jsx?raw";
import HoverDisclosureCard from "../components/HoverDisclosureCard";
import hoverDisclosureCardSource from "../components/HoverDisclosureCard.jsx?raw";
import HorizontalReel from "../components/HorizontalReel";
import horizontalReelSource from "../components/HorizontalReel.jsx?raw";
import ParallaxCollage from "../components/ParallaxCollage";
import parallaxCollageSource from "../components/ParallaxCollage.jsx?raw";
import FannedImageGallery from "../components/FannedImageGallery";
import fannedImageGallerySource from "../components/FannedImageGallery.jsx?raw";
import AnchoredCloudField from "../components/AnchoredCloudField";
import anchoredCloudFieldSource from "../components/AnchoredCloudField.jsx?raw";
import HeroShrinkScene from "../components/HeroShrinkScene";
import heroShrinkSceneSource from "../components/HeroShrinkScene.jsx?raw";
import DualPanelConverge from "../components/DualPanelConverge";
import dualPanelConvergeSource from "../components/DualPanelConverge.jsx?raw";
import ScrollScatterScene from "../components/ScrollScatterScene";
import scrollScatterSceneSource from "../components/ScrollScatterScene.jsx?raw";
import SignatureDraw from "../components/SignatureDraw";
import signatureDrawSource from "../components/SignatureDraw.jsx?raw";
import StaggeredMenu from "../components/StaggeredMenu";
import staggeredMenuSource from "../components/StaggeredMenu.jsx?raw";

export const categories = [
  { id: "galleries", title: "作品展示", english: "Project Galleries" },
  { id: "covers", title: "封面", english: "Covers" },
  { id: "buttons", title: "按钮", english: "Buttons" },
  { id: "type", title: "文字与标题", english: "Type & Titles" },
  { id: "transitions", title: "滚动转场", english: "Scroll Transitions" },
  { id: "scenes-3d", title: "3D 场景", english: "3D Scenes" },
  { id: "navigation", title: "导航", english: "Navigation" },
  { id: "paths", title: "轨迹与绘制", english: "Paths & Drawing" },
];

export const motionComponents = [
  {
    id: "oval-title-reveal",
    category: "type",
    title: "上下浮现标题",
    english: "Vertical Title Entrance",
    description: "每一行从椭圆裁切中展开，文字位移与遮罩同步完成，适合章节标题和大型开场文案。",
    complexity: "轻量",
    interaction: "进入即播放",
    implementation: ["DOM", "CSS clip-path", "IntersectionObserver"],
    Component: OvalTitleReveal,
    source: ovalTitleRevealSource,
  },
  {
    id: "lime-text-reveal",
    category: "type",
    title: "荧光色块文字入场",
    english: "Color Block Text Entrance",
    description: "荧光色块先盖住每行文字，文字打开后色块继续缩退，形成首页统一的信号式出现节奏。",
    complexity: "轻量",
    interaction: "进入即播放",
    implementation: ["DOM", "CSS clip-path", "IntersectionObserver"],
    Component: LimeTextReveal,
    source: limeTextRevealSource,
  },
  {
    id: "kinetic-marquee",
    category: "type",
    title: "跑马灯",
    english: "Marquee",
    description: "内容连续循环，并根据滚动方向反转或短暂加速，适合合作方、服务和身份关键词。",
    complexity: "轻量",
    interaction: "滚动或点击",
    implementation: ["DOM", "CSS keyframes", "Wheel Events"],
    Component: KineticMarquee,
    source: kineticMarqueeSource,
  },
  {
    id: "radial-text-lens",
    category: "type",
    title: "径向文字透镜",
    english: "Radial Text Lens",
    description: "连续文字流经过中央径向场时在月心压缩、向两侧放射拉伸，并叠加液化、色差、扫描线与指针扰动。",
    complexity: "中等",
    interaction: "持续播放与悬停",
    implementation: ["Three.js", "WebGL multipass", "Pointer inertia"],
    Component: RadialTextLens,
    source: radialTextLensSource,
  },
  {
    id: "rolling-letters",
    category: "buttons",
    title: "逐字翻滚按钮",
    english: "Rolling Letters",
    description: "每个字母依次向上翻滚，并由下方的同一份文字接替显示，形成连续转一圈的感觉。",
    complexity: "轻量",
    interaction: "悬停、聚焦或点击",
    implementation: ["DOM", "CSS transition"],
    Component: RollingLettersButton,
    source: rollingLettersButtonSource,
  },
  {
    id: "staggered-roll-button",
    category: "buttons",
    title: "错峰翻滚按钮",
    english: "Staggered Roll Button",
    description: "奇偶字符分成两组向上错峰翻滚，由下方同字副本接替显示，形成短促而有层次的按钮反馈。",
    complexity: "轻量",
    interaction: "悬停、聚焦或点按",
    implementation: ["DOM", "CSS keyframes"],
    Component: StaggeredRollButton,
    source: staggeredRollButtonSource,
  },
  {
    id: "radial-fill-button",
    category: "buttons",
    title: "中心扩散按钮",
    english: "Radial Fill Button",
    description: "微小色块从按钮中心扩张并覆盖完整胶囊，同时让第二层标签接替出现，适合高权重 CTA。",
    complexity: "轻量",
    interaction: "悬停、聚焦或点按",
    implementation: ["DOM", "CSS transform"],
    Component: RadialFillButton,
    source: radialFillButtonSource,
  },
  {
    id: "arrow-state",
    category: "buttons",
    title: "箭头状态按钮",
    english: "Arrow State",
    description: "按钮进入互动状态时，箭头从收拢和倾斜状态展开为明确的前进方向。",
    complexity: "轻量",
    interaction: "悬停、聚焦或点击",
    implementation: ["SVG", "CSS transform"],
    Component: ArrowStateButton,
    source: arrowStateButtonSource,
  },
  {
    id: "layered-image-reveal",
    category: "covers",
    title: "双图切换",
    english: "Dual Image Switch",
    description: "第二张图片从顶部椭圆展开，底图同步轻微放大，适合项目不同状态或产品细节。",
    complexity: "轻量",
    interaction: "悬停、聚焦或点击",
    implementation: ["DOM", "CSS clip-path"],
    Component: LayeredImageReveal,
    source: layeredImageRevealSource,
  },
  {
    id: "scroll-scatter-scene",
    category: "galleries",
    title: "滚动散射",
    english: "Scroll Scatter",
    description: "多张图片分组加入后持续沿景深向最终位置收束，三段中央文案同步缩放、淡出和接替，形成穿梭式长滚动叙事。",
    complexity: "中等",
    interaction: "内部滚动",
    implementation: ["Canvas 2D", "Scroll mapping", "rAF"],
    Component: ScrollScatterScene,
    source: scrollScatterSceneSource,
  },
  {
    id: "parallax-collage",
    category: "galleries",
    title: "视差作品墙",
    english: "Parallax Collage",
    description: "多张图片以不同位置和轻微速度差组成错落构图，适合项目、产品或摄影展示。",
    complexity: "中等",
    interaction: "内部滚动",
    implementation: ["DOM", "CSS transform", "Scroll mapping"],
    Component: ParallaxCollage,
    source: parallaxCollageSource,
  },
  {
    id: "horizontal-reel",
    category: "galleries",
    title: "横向作品轨道",
    english: "Horizontal Reel",
    description: "滚轮、拖动和触控推动作品横向展开，对应首页连续经历图片的长轨道。",
    complexity: "中等",
    interaction: "滚动或拖动",
    implementation: ["DOM", "CSS transform", "Pointer / Wheel"],
    Component: HorizontalReel,
    source: horizontalReelSource,
  },
  {
    id: "fanned-image-gallery",
    category: "galleries",
    title: "七卡扇形画廊",
    english: "Fanned Image Gallery",
    description: "七张卡从中央堆叠状态错峰展开，指向其中一张时当前卡上移放大，邻卡向两侧让位。",
    complexity: "中等",
    interaction: "进入视口、悬停、聚焦或点击",
    implementation: ["DOM", "CSS keyframes", "IntersectionObserver"],
    Component: FannedImageGallery,
    source: fannedImageGallerySource,
  },
  {
    id: "scroll-ripple-reveal",
    category: "galleries",
    title: "滚动水波显现",
    english: "Scroll Ripple Reveal",
    description: "上下滚动时，图片根据滚动速度的绝对值产生同一组水波式正弦折射；停止后振幅自然衰减并恢复平整。",
    complexity: "中等",
    interaction: "内部滚动",
    implementation: ["Three.js", "WebGL shader", "Lenis"],
    Component: ScrollRippleReveal,
    source: scrollRippleRevealSource,
  },
  {
    id: "pixel-shimmer-field",
    category: "covers",
    title: "闪烁点阵场",
    english: "Pixel Shimmer Field",
    description: "多尺度流动噪声经过 Bayer 有序抖动形成不断重组的像素密度场，中央保留稳定阅读区，适合 CTA 与章节声明。",
    complexity: "中等",
    interaction: "持续播放",
    implementation: ["Canvas 2D", "Procedural noise", "rAF"],
    Component: PixelShimmerField,
    source: pixelShimmerFieldSource,
  },
  {
    id: "hover-disclosure-card",
    category: "covers",
    title: "悬停显示信息",
    english: "Hover Info",
    description: "图像封面在悬停、键盘聚焦或点按后退为信息面板，让同一张卡片兼顾视觉吸引和详细说明。",
    complexity: "轻量",
    interaction: "悬停、聚焦或点按",
    implementation: ["DOM", "CSS transition"],
    Component: HoverDisclosureCard,
    source: hoverDisclosureCardSource,
  },
  {
    id: "anchored-cloud-field",
    category: "scenes-3d",
    title: "云朵",
    english: "Cloud Field",
    description: "云团停留在场景锚点，内部云片以不同方向缓慢翻滚和呼吸，适合在内容周围营造不干扰阅读的持续空间氛围。",
    complexity: "中等",
    interaction: "持续播放",
    implementation: ["Three.js", "WebGL shader", "Instancing"],
    Component: AnchoredCloudField,
    source: anchoredCloudFieldSource,
  },
  {
    id: "hero-shrink-scene",
    category: "transitions",
    title: "缩景转场",
    english: "Shrink Transition",
    description: "全屏画面随滚动缩入中央目标框，下一场景的背景、巨型文字和信息层依次出现。",
    complexity: "中等",
    interaction: "内部滚动",
    implementation: ["DOM", "CSS variables", "Scroll mapping"],
    Component: HeroShrinkScene,
    source: heroShrinkSceneSource,
  },
  {
    id: "dual-panel-converge",
    category: "transitions",
    title: "双侧场景汇合",
    english: "Dual Panel Converge",
    description: "两张图片从屏幕左右进入，两列标题同时向中心汇合，形成两个主题的对照场景。",
    complexity: "中等",
    interaction: "内部滚动",
    implementation: ["DOM", "CSS transform", "Scroll mapping"],
    Component: DualPanelConverge,
    source: dualPanelConvergeSource,
  },
  {
    id: "signature-draw",
    category: "paths",
    title: "手写轨迹绘制",
    english: "Signature Draw",
    description: "原创手写路径随着滚动从 0% 绘制到 100%，适合签名、路线、标记和故事轨迹。",
    complexity: "中等",
    interaction: "内部滚动",
    implementation: ["SVG", "Stroke dash", "Scroll mapping"],
    Component: SignatureDraw,
    source: signatureDrawSource,
  },
  {
    id: "staggered-menu",
    category: "navigation",
    title: "全屏菜单",
    english: "Fullscreen Menu",
    description: "菜单通过椭圆遮罩打开，导航文字与项目图片按照顺序进入并相互联动。",
    complexity: "中等",
    interaction: "点击并悬停",
    implementation: ["DOM", "CSS clip-path", "CSS transitions"],
    Component: StaggeredMenu,
    source: staggeredMenuSource,
  },
];
