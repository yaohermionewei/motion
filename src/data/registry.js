import OvalTitleReveal from "../components/OvalTitleReveal";
import ovalTitleRevealSource from "../components/OvalTitleReveal.jsx?raw";
import LimeTextReveal from "../components/LimeTextReveal";
import limeTextRevealSource from "../components/LimeTextReveal.jsx?raw";
import KineticMarquee from "../components/KineticMarquee";
import kineticMarqueeSource from "../components/KineticMarquee.jsx?raw";
import RollingLettersButton from "../components/RollingLettersButton";
import rollingLettersButtonSource from "../components/RollingLettersButton.jsx?raw";
import RadialFillButton from "../components/RadialFillButton";
import radialFillButtonSource from "../components/RadialFillButton.jsx?raw";
import ArrowStateButton from "../components/ArrowStateButton";
import arrowStateButtonSource from "../components/ArrowStateButton.jsx?raw";
import LayeredImageReveal from "../components/LayeredImageReveal";
import layeredImageRevealSource from "../components/LayeredImageReveal.jsx?raw";
import DitheredMediaReveal from "../components/DitheredMediaReveal";
import ditheredMediaRevealSource from "../components/DitheredMediaReveal.jsx?raw";
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
import SocialFan from "../components/SocialFan";
import socialFanSource from "../components/SocialFan.jsx?raw";
import AnchoredCloudField from "../components/AnchoredCloudField";
import anchoredCloudFieldSource from "../components/AnchoredCloudField.jsx?raw";
import HeroShrinkScene from "../components/HeroShrinkScene";
import heroShrinkSceneSource from "../components/HeroShrinkScene.jsx?raw";
import DualPanelConverge from "../components/DualPanelConverge";
import dualPanelConvergeSource from "../components/DualPanelConverge.jsx?raw";
import OvalSectionReveal from "../components/OvalSectionReveal";
import ovalSectionRevealSource from "../components/OvalSectionReveal.jsx?raw";
import ScrollScatterScene from "../components/ScrollScatterScene";
import scrollScatterSceneSource from "../components/ScrollScatterScene.jsx?raw";
import SignatureDraw from "../components/SignatureDraw";
import signatureDrawSource from "../components/SignatureDraw.jsx?raw";
import StaggeredMenu from "../components/StaggeredMenu";
import staggeredMenuSource from "../components/StaggeredMenu.jsx?raw";
import ScrollDirectionNav from "../components/ScrollDirectionNav";
import scrollDirectionNavSource from "../components/ScrollDirectionNav.jsx?raw";

export const categories = [
  { id: "type", title: "文字与标题", english: "Type & Titles" },
  { id: "buttons", title: "按钮", english: "Buttons" },
  { id: "covers", title: "封面与悬停", english: "Covers & Hover" },
  { id: "galleries", title: "作品展示", english: "Project Galleries" },
  { id: "scenes-3d", title: "3D 场景", english: "3D Scenes" },
  { id: "transitions", title: "滚动转场", english: "Scroll Transitions" },
  { id: "paths", title: "轨迹与绘制", english: "Paths & Drawing" },
  { id: "navigation", title: "导航", english: "Navigation" },
];

export const motionComponents = [
  {
    id: "oval-title-reveal",
    category: "type",
    title: "椭圆标题揭示",
    english: "Oval Title Reveal",
    description: "每一行从椭圆裁切中展开，文字位移与遮罩同步完成，适合章节标题和大型开场文案。",
    complexity: "轻量",
    interaction: "进入即播放",
    Component: OvalTitleReveal,
    source: ovalTitleRevealSource,
  },
  {
    id: "lime-text-reveal",
    category: "type",
    title: "荧光文字揭示",
    english: "Lime Text Reveal",
    description: "荧光色块先盖住每行文字，文字打开后色块继续缩退，形成首页统一的信号式出现节奏。",
    complexity: "轻量",
    interaction: "进入即播放",
    Component: LimeTextReveal,
    source: limeTextRevealSource,
  },
  {
    id: "kinetic-marquee",
    category: "type",
    title: "动态跑马灯",
    english: "Kinetic Marquee",
    description: "内容连续循环，并根据滚动方向反转或短暂加速，适合合作方、服务和身份关键词。",
    complexity: "轻量",
    interaction: "滚动或点击",
    Component: KineticMarquee,
    source: kineticMarqueeSource,
  },
  {
    id: "rolling-letters",
    category: "buttons",
    title: "逐字翻滚按钮",
    english: "Rolling Letters",
    description: "每个字母依次向上翻滚，并由下方的同一份文字接替显示，形成连续转一圈的感觉。",
    complexity: "轻量",
    interaction: "悬停、聚焦或点击",
    Component: RollingLettersButton,
    source: rollingLettersButtonSource,
  },
  {
    id: "radial-fill-button",
    category: "buttons",
    title: "中心扩散按钮",
    english: "Radial Fill Button",
    description: "微小色块从按钮中心扩张并覆盖完整胶囊，同时让第二层标签接替出现，适合高权重 CTA。",
    complexity: "轻量",
    interaction: "悬停、聚焦或点按",
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
    Component: ArrowStateButton,
    source: arrowStateButtonSource,
  },
  {
    id: "layered-image-reveal",
    category: "covers",
    title: "双层图片揭示",
    english: "Layered Image Reveal",
    description: "第二张图片从顶部椭圆展开，底图同步轻微放大，适合项目不同状态或产品细节。",
    complexity: "轻量",
    interaction: "悬停、聚焦或点击",
    Component: LayeredImageReveal,
    source: layeredImageRevealSource,
  },
  {
    id: "dithered-media-reveal",
    category: "covers",
    title: "点阵媒体揭示",
    english: "Dithered Media Reveal",
    description: "单张媒体先以有序点阵呈现，再沿水平方向恢复色彩和完整分辨率，适合研究、作品与技术主题封面。",
    complexity: "中等",
    interaction: "进入即播放",
    Component: DitheredMediaReveal,
    source: ditheredMediaRevealSource,
  },
  {
    id: "scroll-ripple-reveal",
    category: "covers",
    title: "滚动水波显现",
    english: "Scroll Ripple Reveal",
    description: "上下滚动时，图片根据滚动速度的绝对值产生同一组水波式正弦折射；停止后振幅自然衰减并恢复平整。",
    complexity: "中等",
    interaction: "内部滚动",
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
    Component: PixelShimmerField,
    source: pixelShimmerFieldSource,
  },
  {
    id: "hover-disclosure-card",
    category: "covers",
    title: "信息切换卡",
    english: "Hover Disclosure Card",
    description: "图像封面在悬停、键盘聚焦或点按后退为信息面板，让同一张卡片兼顾视觉吸引和详细说明。",
    complexity: "轻量",
    interaction: "悬停、聚焦或点按",
    Component: HoverDisclosureCard,
    source: hoverDisclosureCardSource,
  },
  {
    id: "horizontal-reel",
    category: "galleries",
    title: "横向作品轨道",
    english: "Horizontal Reel",
    description: "滚轮、拖动和触控推动作品横向展开，对应首页连续经历图片的长轨道。",
    complexity: "中等",
    interaction: "滚动或拖动",
    Component: HorizontalReel,
    source: horizontalReelSource,
  },
  {
    id: "parallax-collage",
    category: "galleries",
    title: "视差作品墙",
    english: "Parallax Collage",
    description: "多张图片以不同位置和轻微速度差组成错落构图，适合项目、产品或摄影展示。",
    complexity: "中等",
    interaction: "内部滚动",
    Component: ParallaxCollage,
    source: parallaxCollageSource,
  },
  {
    id: "social-fan",
    category: "galleries",
    title: "七卡扇形画廊",
    english: "Social Fan",
    description: "七张卡从中央堆叠状态错峰展开，指向其中一张时当前卡上移放大，邻卡向两侧让位。",
    complexity: "中等",
    interaction: "进入视口、悬停、聚焦或点击",
    Component: SocialFan,
    source: socialFanSource,
  },
  {
    id: "anchored-cloud-field",
    category: "scenes-3d",
    title: "锚定翻滚云团",
    english: "Anchored Cloud Field",
    description: "程序生成的半透明云片固定在画面边缘，内部持续缓慢旋转、漂移和呼吸，同时为中央内容保留稳定的开放区域。",
    complexity: "中等",
    interaction: "持续播放",
    Component: AnchoredCloudField,
    source: anchoredCloudFieldSource,
  },
  {
    id: "hero-shrink-scene",
    category: "transitions",
    title: "首屏缩景转场",
    english: "Hero Shrink Scene",
    description: "全屏画面随滚动缩入中央目标框，下一场景的背景、巨型文字和信息层依次出现。",
    complexity: "中等",
    interaction: "内部滚动",
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
    Component: DualPanelConverge,
    source: dualPanelConvergeSource,
  },
  {
    id: "oval-section-reveal",
    category: "transitions",
    title: "椭圆章节揭幕",
    english: "Oval Section Reveal",
    description: "下一章节从顶部椭圆边界逐步打开，让背景和内容像幕布一样取代上一场景。",
    complexity: "中等",
    interaction: "内部滚动",
    Component: OvalSectionReveal,
    source: ovalSectionRevealSource,
  },
  {
    id: "scroll-scatter-scene",
    category: "transitions",
    title: "滚动散射场景",
    english: "Scroll Scatter Scene",
    description: "多张图片分组加入后持续沿景深向最终位置收束，三段中央文案同步缩放、淡出和接替，形成穿梭式长滚动叙事。",
    complexity: "中等",
    interaction: "内部滚动",
    Component: ScrollScatterScene,
    source: scrollScatterSceneSource,
  },
  {
    id: "signature-draw",
    category: "paths",
    title: "手写轨迹绘制",
    english: "Signature Draw",
    description: "原创手写路径随着滚动从 0% 绘制到 100%，适合签名、路线、标记和故事轨迹。",
    complexity: "中等",
    interaction: "内部滚动",
    Component: SignatureDraw,
    source: signatureDrawSource,
  },
  {
    id: "staggered-menu",
    category: "navigation",
    title: "错峰全屏菜单",
    english: "Staggered Menu",
    description: "菜单通过椭圆遮罩打开，导航文字与项目图片按照顺序进入并相互联动。",
    complexity: "中等",
    interaction: "点击并悬停",
    Component: StaggeredMenu,
    source: staggeredMenuSource,
  },
  {
    id: "scroll-direction-nav",
    category: "navigation",
    title: "方向感知导航",
    english: "Scroll Direction Nav",
    description: "向下阅读时收起固定导航，反向滚动时立即恢复，并在回到顶部时保持可见。",
    complexity: "中等",
    interaction: "内部滚动与键盘",
    Component: ScrollDirectionNav,
    source: scrollDirectionNavSource,
  },
];
