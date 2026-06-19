const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak, LevelFormat, PageNumberElement,
  Header, Footer, Tab, TabStopType
} = require('docx');
const fs = require('fs');

// ─── TOKENS ───────────────────────────────────────────────────
const T = {
  GREEN:   "1A6B3A", LGREEN:  "E8F5EC", MGREEN:  "2D8A50",
  DGREY:   "2D3748", MGREY:   "718096", LGREY:   "F7F9FB",
  WHITE:   "FFFFFF", BORDER:  "CBD5E0",
  AMBER:   "D97706", LAMBER:  "FFFBEB",
  RED:     "DC2626", LRED:    "FEF2F2",
  BLUE:    "1E3A5F", LBLUE:   "EFF6FF",
  DARK:    "1A202C", PURPLE:  "4C1D95", LPURPLE: "F5F3FF",
};

// ─── PRIMITIVES ───────────────────────────────────────────────
const bdr  = (c=T.BORDER,sz=1) => ({ style: BorderStyle.SINGLE, size: sz, color: c });
const bdrs = (c=T.BORDER) => ({ top:bdr(c), bottom:bdr(c), left:bdr(c), right:bdr(c) });
const noBdr = () => ({ top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE}, left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE} });

const P = (text, opts={}) => new Paragraph({
  spacing: { before: 60, after: 120 },
  children: [new TextRun({ text, font:"Arial", size:22, color:T.DGREY, ...opts })]
});
const Sp = () => new Paragraph({ children:[new TextRun("")], spacing:{before:0,after:80} });
const Br = () => new Paragraph({ children:[new PageBreak()] });

const H1 = text => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before:480, after:160 },
  border: { bottom:{ style:BorderStyle.SINGLE, size:4, color:T.GREEN, space:4 } },
  children: [new TextRun({ text, font:"Arial", size:34, bold:true, color:T.GREEN })]
});
const H2 = text => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before:320, after:120 },
  children: [new TextRun({ text, font:"Arial", size:26, bold:true, color:T.DGREY })]
});
const H3 = text => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before:200, after:80 },
  children: [new TextRun({ text, font:"Arial", size:22, bold:true, color:T.GREEN })]
});
const H4 = text => new Paragraph({
  spacing: { before:160, after:60 },
  children: [new TextRun({ text, font:"Arial", size:20, bold:true, color:T.DGREY })]
});

const Bullet = (text, level=0) => new Paragraph({
  numbering: { reference:"bullets", level },
  spacing: { before:40, after:40 },
  children: [new TextRun({ text, font:"Arial", size:22, color:T.DGREY })]
});
const Num = (text, level=0) => new Paragraph({
  numbering: { reference:"numbers", level },
  spacing: { before:40, after:40 },
  children: [new TextRun({ text, font:"Arial", size:22, color:T.DGREY })]
});

// ─── TABLE HELPERS ────────────────────────────────────────────
const hRow = (cols, widths, fill=T.GREEN) => new TableRow({
  tableHeader: true,
  children: cols.map((c,i) => new TableCell({
    borders: bdrs(fill), width:{ size:widths[i], type:WidthType.DXA },
    shading:{ fill, type:ShadingType.CLEAR },
    margins:{ top:80, bottom:80, left:120, right:120 },
    verticalAlign: VerticalAlign.CENTER,
    children:[new Paragraph({ children:[new TextRun({ text:c, font:"Arial", size:20, bold:true, color:T.WHITE })] })]
  }))
});
const dRow = (cols, widths, fill=T.WHITE) => new TableRow({
  children: cols.map((c,i) => new TableCell({
    borders: bdrs(), width:{ size:widths[i], type:WidthType.DXA },
    shading:{ fill, type:ShadingType.CLEAR },
    margins:{ top:80, bottom:80, left:120, right:120 },
    children:[new Paragraph({ children:[new TextRun({ text:c, font:"Arial", size:20, color:T.DGREY })] })]
  }))
});
const dRowB = (cols, widths, fill=T.WHITE, bolds=[]) => new TableRow({
  children: cols.map((c,i) => new TableCell({
    borders: bdrs(), width:{ size:widths[i], type:WidthType.DXA },
    shading:{ fill, type:ShadingType.CLEAR },
    margins:{ top:80, bottom:80, left:120, right:120 },
    children:[new Paragraph({ children:[new TextRun({ text:c, font:"Arial", size:20, color:T.DGREY, bold:bolds.includes(i) })] })]
  }))
});

const tbl = (rows, widths) => new Table({
  width:{ size:9360, type:WidthType.DXA },
  columnWidths: widths, rows
});

// ─── CALLOUT BOX ─────────────────────────────────────────────
const callout = (label, text, fill=T.LGREEN, accent=T.GREEN) => new Table({
  width:{ size:9360, type:WidthType.DXA }, columnWidths:[9360],
  rows:[new TableRow({ children:[new TableCell({
    borders:{ top:bdr(accent,6), bottom:bdr(), left:bdr(), right:bdr() },
    width:{ size:9360, type:WidthType.DXA },
    shading:{ fill, type:ShadingType.CLEAR },
    margins:{ top:120, bottom:120, left:200, right:200 },
    children:[
      new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({ text:label, font:"Arial", size:20, bold:true, color:accent })] }),
      new Paragraph({ spacing:{before:0,after:0},  children:[new TextRun({ text, font:"Arial", size:20, color:T.DGREY })] }),
    ]
  })] })]
});

// ─── CODE BLOCK ───────────────────────────────────────────────
const codeBlock = lines => new Table({
  width:{ size:9360, type:WidthType.DXA }, columnWidths:[9360],
  rows:[new TableRow({ children:[new TableCell({
    borders: bdrs(T.DARK),
    width:{ size:9360, type:WidthType.DXA },
    shading:{ fill:T.DARK, type:ShadingType.CLEAR },
    margins:{ top:120, bottom:120, left:200, right:200 },
    children: lines.map(l => new Paragraph({
      spacing:{before:0,after:20},
      children:[new TextRun({ text:l, font:"Courier New", size:18, color:"9CDCFE" })]
    }))
  })] })]
});

// ─── SECTION BANNER ───────────────────────────────────────────
const banner = (num, title, sub) => new Table({
  width:{ size:9360, type:WidthType.DXA }, columnWidths:[9360],
  rows:[new TableRow({ children:[new TableCell({
    borders: bdrs(T.GREEN),
    width:{ size:9360, type:WidthType.DXA },
    shading:{ fill:T.GREEN, type:ShadingType.CLEAR },
    margins:{ top:140, bottom:140, left:240, right:240 },
    children:[
      new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({ text:`${num}  ${title}`, font:"Arial", size:32, bold:true, color:T.WHITE })] }),
      new Paragraph({ spacing:{before:0,after:0},  children:[new TextRun({ text:sub, font:"Arial", size:20, color:"CCFFCC" })] }),
    ]
  })] })]
});

// ─── TITLE PAGE ───────────────────────────────────────────────
const titlePage = (doc, sub1, sub2) => [
  new Paragraph({ spacing:{before:1600,after:0}, children:[] }),
  new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:200},
    children:[new TextRun({ text:"AI-SUCE", font:"Arial", size:80, bold:true, color:T.GREEN })] }),
  new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:80},
    children:[new TextRun({ text:"GreenSC  +  GreenPurse", font:"Arial", size:26, color:T.MGREY })] }),
  new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:240,after:120},
    children:[new TextRun({ text:doc, font:"Arial", size:44, bold:true, color:T.DGREY })] }),
  new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:60},
    children:[new TextRun({ text:sub1, font:"Arial", size:22, color:T.MGREY })] }),
  new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:0},
    children:[new TextRun({ text:sub2, font:"Arial", size:20, color:T.MGREY })] }),
  Br(),
];

// ─── SHARED DOC CONFIG ────────────────────────────────────────
const docConfig = (children, headerText) => new Document({
  numbering:{ config:[
    { reference:"bullets", levels:[
      { level:0, format:LevelFormat.BULLET, text:"•", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:720,hanging:360}}} },
      { level:1, format:LevelFormat.BULLET, text:"◦", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:1080,hanging:360}}} },
    ]},
    { reference:"numbers", levels:[
      { level:0, format:LevelFormat.DECIMAL, text:"%1.", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:720,hanging:360}}} },
      { level:1, format:LevelFormat.DECIMAL, text:"%2.", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:1080,hanging:360}}} },
    ]},
  ]},
  styles:{
    default:{ document:{ run:{ font:"Arial", size:22 } } },
    paragraphStyles:[
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true, run:{size:34,bold:true,font:"Arial"}, paragraph:{spacing:{before:480,after:160},outlineLevel:0} },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true, run:{size:26,bold:true,font:"Arial"}, paragraph:{spacing:{before:320,after:120},outlineLevel:1} },
      { id:"Heading3", name:"Heading 3", basedOn:"Normal", next:"Normal", quickFormat:true, run:{size:22,bold:true,font:"Arial"}, paragraph:{spacing:{before:200,after:80},outlineLevel:2} },
    ]
  },
  sections:[{
    properties:{ page:{ size:{width:12240,height:15840}, margin:{top:1440,right:1440,bottom:1440,left:1440} } },
    headers:{ default: new Header({ children:[new Paragraph({
      border:{ bottom:{style:BorderStyle.SINGLE,size:2,color:T.GREEN,space:4} },
      children:[
        new TextRun({ text:headerText, font:"Arial", size:18, color:T.MGREY }),
        new TextRun({ text:"\tACE ICT Center, OAU  ·  June 2026", font:"Arial", size:18, color:T.MGREY }),
      ],
      tabStops:[{ type:TabStopType.RIGHT, position:9360 }]
    })] }) },
    footers:{ default: new Footer({ children:[new Paragraph({
      border:{ top:{style:BorderStyle.SINGLE,size:2,color:T.BORDER,space:4} },
      children:[
        new TextRun({ text:"Confidential  ·  Version 1.0", font:"Arial", size:18, color:T.MGREY }),
        new TextRun({ children:[new Tab(), new PageNumberElement()], font:"Arial", size:18, color:T.MGREY }),
      ],
      tabStops:[{ type:TabStopType.RIGHT, position:9360 }]
    })] }) },
    children
  }]
});


// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 1 — DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════════
function buildDesignSystem() {
  const W = [2200,2200,2200,2760]; // 4-col table widths
  const W3 = [2400,3000,3960];
  const W2 = [3600,5760];
  const W2e = [4200,5160];

  const children = [
    ...titlePage(
      "DESIGN SYSTEM",
      "Visual Language, Component Library & Usage Guidelines",
      "Version 1.0  ·  Applies to: GreenPurse Web  ·  GreenSC Web  ·  MyVirtualFarm"
    ),

    // ── 1. OVERVIEW ──────────────────────────────────────────────
    H1("1. Overview & Principles"),
    P("The AI-SUCE Design System is the single source of truth for all visual and interaction decisions across the three web applications: GreenPurse (buyer and farmer), GreenSC (store manager), and MyVirtualFarm (investment). It lives in the monorepo at packages/ui/ and is consumed by all Next.js apps. Every token, component, and pattern documented here must be used as specified — no one-off overrides in application code."),
    Sp(),

    H2("1.1 Design Principles"),
    tbl([
      hRow(["Principle","What it means in practice"],[3200,6160]),
      dRow(["Clarity first","Information hierarchy is always legible. No decoration competes with data. Farmers on 3G should read prices and status as fast as managers on fiber."],[3200,6160],T.LGREY),
      dRow(["Trust through consistency","Every app feels like one product. Same tokens, same component behaviour, same interaction patterns. Users who learn GreenPurse immediately understand GreenSC."],[3200,6160]),
      dRow(["Green means action","The primary brand green (#1A6B3A) is reserved exclusively for primary actions, active states, and positive values. Never use it decoratively."],[3200,6160],T.LGREY),
      dRow(["Accessible by default","WCAG AA minimum contrast on all text. Focus rings on all interactive elements. Screen-reader labels on all icon-only buttons."],[3200,6160]),
      dRow(["Mobile-first, web-first now","Components are designed for a minimum 320px viewport but optimised at 1280px. The current web build is the MVP; mobile-native follows."],[3200,6160],T.LGREY),
    ],[3200,6160]),
    Sp(),

    // ── 2. BRAND IDENTITY ──────────────────────────────────────
    Br(),
    H1("2. Brand Identity"),

    H2("2.1 Logos & App Marks"),
    tbl([
      hRow(["App","Mark","Primary Usage","Background Rule"],[2000,2200,2800,2360]),
      dRow(["GreenPurse","Green leaf + purse/card icon","Mobile app splash, web navbar, favicon","Use on white or brand-green backgrounds only"],[2000,2200,2800,2360],T.LGREY),
      dRow(["GreenSC","Green SC leaf mark","Sidebar top, web tab favicon","Use on dark sidebar (#1A202C) or white"],[2000,2200,2800,2360]),
      dRow(["AI-SUCE (parent)","GreenSC + GreenPurse lockup","Proposals, print, presentations","Never stretch, rotate, or recolor"],[2000,2200,2800,2360],T.LGREY),
    ],[2000,2200,2800,2360]),
    Sp(),

    H2("2.2 Brand Voice"),
    tbl([
      hRow(["Dimension","Tone","Example copy"],[2000,2800,4560]),
      dRow(["Headlines","Confident, active","Get fresh produce delivered to your door"],[2000,2800,4560],T.LGREY),
      dRow(["CTAs","Direct, verb-first","Add to cart · Pay now · Upload product · Track order"],[2000,2800,4560]),
      dRow(["Errors","Honest, never blame user","Payment declined — please check your wallet balance and retry"],[2000,2800,4560],T.LGREY),
      dRow(["Success","Warm, specific","₦22,000 sent to Amelia's Green Purse wallet"],[2000,2800,4560]),
      dRow(["Empty states","Helpful, action-oriented","No products listed yet — upload your first harvest"],[2000,2800,4560],T.LGREY),
    ],[2000,2800,4560]),
    Sp(),

    // ── 3. COLOUR SYSTEM ──────────────────────────────────────
    Br(),
    H1("3. Colour System"),
    P("All colours are defined as CSS custom properties in packages/ui/tokens/colors.css and extended into the Tailwind config. Never hardcode hex values in component or application code — always reference the token."),
    Sp(),

    H2("3.1 Brand Green Scale"),
    callout("Usage Rule", "The 600 stop (#1A6B3A) is the only fill permitted for primary buttons and active navigation items. The 50 stop (#E8F5EC) is used for hover backgrounds, tint fills, and light badges. Never use any other green stop for interactive elements."),
    Sp(),
    tbl([
      hRow(["Token","Hex","Stop","Usage"],[2400,2000,1200,3760]),
      dRow(["--color-green-50","#E8F5EC","50","Tint backgrounds, light badges, hover states"],[2400,2000,1200,3760],T.LGREY),
      dRow(["--color-green-100","#C6E6CE","100","Subtle borders on green surfaces"],[2400,2000,1200,3760]),
      dRow(["--color-green-200","#8ECFA0","200","Disabled primary button background"],[2400,2000,1200,3760],T.LGREY),
      dRow(["--color-green-400","#2D8A50","400","Hover state on primary button"],[2400,2000,1200,3760]),
      dRow(["--color-green-600","#1A6B3A","600","PRIMARY — buttons, active nav, key brand moments"],[2400,2000,1200,3760],T.LGREY),
      dRow(["--color-green-800","#0F4A28","800","Pressed/active primary button, sidebar background hover"],[2400,2000,1200,3760]),
      dRow(["--color-green-900","#062D18","900","Dark sidebar text on deep green backgrounds"],[2400,2000,1200,3760],T.LGREY),
    ],[2400,2000,1200,3760]),
    Sp(),

    H2("3.2 Semantic Colours"),
    tbl([
      hRow(["Semantic Role","Token","Hex","When to use"],[2400,2400,1600,2960]),
      dRow(["Success / Positive","--color-success","#1A6B3A","Delivered, confirmed, profit, active"],[2400,2400,1600,2960],T.LGREY),
      dRow(["Warning / Caution","--color-warning","#D97706","Pending, in transit, near expiry"],[2400,2400,1600,2960]),
      dRow(["Danger / Loss","--color-danger","#DC2626","Failed, overdue, loss, destructive action"],[2400,2400,1600,2960],T.LGREY),
      dRow(["Informational","--color-info","#1E40AF","Processing, neutral alerts, forex/exchange"],[2400,2400,1600,2960]),
      dRow(["Investment / Gain","--color-invest","#2D8A50","MyVirtualFarm profit, positive P&L"],[2400,2400,1600,2960],T.LGREY),
    ],[2400,2400,1600,2960]),
    Sp(),

    H2("3.3 Neutral Scale (Surfaces & Text)"),
    tbl([
      hRow(["Token","Hex","Usage"],[3200,2400,3760]),
      dRow(["--color-bg-page","#F7F9FB","Page background for all three apps"],[3200,2400,3760],T.LGREY),
      dRow(["--color-bg-surface","#FFFFFF","Cards, modals, dropdowns, form fields"],[3200,2400,3760]),
      dRow(["--color-bg-subtle","#F0F4F8","Metric tiles, table header rows, secondary panels"],[3200,2400,3760],T.LGREY),
      dRow(["--color-border-default","#CBD5E0","Default border on all components"],[3200,2400,3760]),
      dRow(["--color-border-strong","#A0AEC0","Hover and focused borders"],[3200,2400,3760],T.LGREY),
      dRow(["--color-text-primary","#2D3748","Body copy, data values, headings"],[3200,2400,3760]),
      dRow(["--color-text-secondary","#718096","Labels, captions, placeholders, hints"],[3200,2400,3760],T.LGREY),
      dRow(["--color-text-disabled","#CBD5E0","Disabled inputs and ghost text"],[3200,2400,3760]),
      dRow(["--color-dark-sidebar","#1A202C","GreenSC sidebar background"],[3200,2400,3760],T.LGREY),
    ],[3200,2400,3760]),
    Sp(),

    H2("3.4 Dark Mode"),
    callout("Dark Mode Strategy",
      "Dark mode is implemented via CSS custom property overrides in a [data-theme='dark'] selector. All three apps toggle this class on the <html> element via a user preference stored in localStorage. Component code never checks for dark mode — it only uses tokens. The token layer handles the swap. Dark mode token overrides are defined in packages/ui/tokens/dark.css and documented in the Storybook addon.",
      T.LGREY, T.DGREY),
    Sp(),

    // ── 4. TYPOGRAPHY ─────────────────────────────────────────
    Br(),
    H1("4. Typography System"),

    H2("4.1 Font Stack"),
    tbl([
      hRow(["Role","Font Family","Variable Token","Fallback"],[2000,2800,2400,2160]),
      dRow(["Primary (UI)","DM Sans","--font-sans","system-ui, sans-serif"],[2000,2800,2400,2160],T.LGREY),
      dRow(["Monospace (prices, codes)","JetBrains Mono","--font-mono","'Courier New', monospace"],[2000,2800,2400,2160]),
      dRow(["Serif (editorial, rare)","Lora","--font-serif","Georgia, serif"],[2000,2800,2400,2160],T.LGREY),
    ],[2000,2800,2400,2160]),
    Sp(),
    callout("Monospace Usage",
      "All monetary values (₦ and $ amounts), account numbers, wallet balances, transaction IDs, and order numbers must use --font-mono. This prevents layout jitter when values update, and makes numbers scannable in tables and dashboards. Example: font-family: var(--font-mono)."),
    Sp(),

    H2("4.2 Type Scale"),
    tbl([
      hRow(["Name","Size","Weight","Line Height","Token","Usage"],[2000,1200,1200,1600,2200,1160]),
      dRow(["Display","32px","500","1.2","--text-display","Hero sections, splash screens"],[2000,1200,1200,1600,2200,1160],T.LGREY),
      dRow(["H1","24px","500","1.3","--text-h1","Page titles"],[2000,1200,1200,1600,2200,1160]),
      dRow(["H2","18px","500","1.4","--text-h2","Section headers"],[2000,1200,1200,1600,2200,1160],T.LGREY),
      dRow(["H3","15px","500","1.5","--text-h3","Card titles, sub-sections"],[2000,1200,1200,1600,2200,1160]),
      dRow(["Body","14px","400","1.7","--text-body","All body copy"],[2000,1200,1200,1600,2200,1160],T.LGREY),
      dRow(["Small","13px","400","1.6","--text-sm","Secondary info, table cells"],[2000,1200,1200,1600,2200,1160]),
      dRow(["Caption","12px","400","1.5","--text-caption","Timestamps, hints, meta"],[2000,1200,1200,1600,2200,1160],T.LGREY),
      dRow(["Overline","11px","500","1.4","--text-overline","Metric labels (uppercase)"],[2000,1200,1200,1600,2200,1160]),
    ],[2000,1200,1200,1600,2200,1160]),
    Sp(),

    // ── 5. SPACING & LAYOUT ───────────────────────────────────
    Br(),
    H1("5. Spacing, Layout & Grid"),

    H2("5.1 Spacing Scale"),
    P("Base unit: 4px. All spacing values are multiples of 4. Use the token — never arbitrary pixel values in component or layout code."),
    Sp(),
    tbl([
      hRow(["Token","Value","Tailwind Class","Usage"],[2400,1200,2000,3760]),
      dRow(["--space-1","4px","p-1 / gap-1","Icon internal padding, inline gap between icon and label"],[2400,1200,2000,3760],T.LGREY),
      dRow(["--space-2","8px","p-2 / gap-2","Gap between closely related elements (badge + text)"],[2400,1200,2000,3760]),
      dRow(["--space-3","12px","p-3 / gap-3","Table cell padding, tight card internal spacing"],[2400,1200,2000,3760],T.LGREY),
      dRow(["--space-4","16px","p-4 / gap-4","Standard card padding, form field gap"],[2400,1200,2000,3760]),
      dRow(["--space-6","24px","p-6 / gap-6","Gap between card groups, section margin"],[2400,1200,2000,3760],T.LGREY),
      dRow(["--space-8","32px","p-8 / gap-8","Section breaks, large layout gaps"],[2400,1200,2000,3760]),
      dRow(["--space-12","48px","p-12 / gap-12","Page-level top/bottom padding"],[2400,1200,2000,3760],T.LGREY),
      dRow(["--space-16","64px","p-16 / gap-16","Hero sections, full-page vertical rhythm"],[2400,1200,2000,3760]),
    ],[2400,1200,2000,3760]),
    Sp(),

    H2("5.2 Border Radius"),
    tbl([
      hRow(["Token","Value","Tailwind","Usage"],[2400,1600,2000,3360]),
      dRow(["--radius-sm","4px","rounded","Badges, status chips, small pills"],[2400,1600,2000,3360],T.LGREY),
      dRow(["--radius-md","8px","rounded-lg","Buttons, input fields, dropdowns"],[2400,1600,2000,3360]),
      dRow(["--radius-lg","12px","rounded-xl","Cards, modals, panels"],[2400,1600,2000,3360],T.LGREY),
      dRow(["--radius-xl","20px","rounded-2xl","Filter chips, nav pills, large tags"],[2400,1600,2000,3360]),
      dRow(["--radius-full","9999px","rounded-full","Avatars, toggle tracks, circular icon buttons"],[2400,1600,2000,3360],T.LGREY),
    ],[2400,1600,2000,3360]),
    Sp(),

    H2("5.3 Layout Grid"),
    tbl([
      hRow(["Context","Grid","Gutter","Max Width"],[2400,2400,2400,2160]),
      dRow(["GreenPurse (buyer/farmer)","12 columns","16px","1280px"],[2400,2400,2400,2160],T.LGREY),
      dRow(["GreenSC (with sidebar)","10 columns (content area)","24px","Fluid (sidebar: 240px fixed)"],[2400,2400,2400,2160]),
      dRow(["MyVirtualFarm","12 columns","16px","1280px"],[2400,2400,2400,2160],T.LGREY),
      dRow(["Mobile (320px–767px)","4 columns","12px","100%"],[2400,2400,2400,2160]),
    ],[2400,2400,2400,2160]),
    Sp(),

    // ── 6. COMPONENT LIBRARY ─────────────────────────────────
    Br(),
    H1("6. Component Library"),
    P("All components live in packages/ui/src/components/. Each is a React functional component written in TypeScript with prop types defined via TypeScript interfaces. Every component has a Storybook story in packages/ui/src/stories/ and a Vitest unit test. Components are exported from packages/ui/src/index.ts."),
    Sp(),

    H2("6.1 Button"),
    H3("Variants"),
    tbl([
      hRow(["Variant","Class / Prop","Fill","Text","Border","Usage"],[1600,2000,1600,1400,1400,1360]),
      dRow(["Primary","variant='primary'","#1A6B3A","White","None","Main CTA — one per screen"],[1600,2000,1600,1400,1400,1360],T.LGREY),
      dRow(["Secondary","variant='secondary'","Transparent","#1A6B3A","1.5px green","Secondary actions"],[1600,2000,1600,1400,1400,1360]),
      dRow(["Ghost","variant='ghost'","Transparent","Muted","0.5px border","Tertiary, cancel, dismiss"],[1600,2000,1600,1400,1400,1360],T.LGREY),
      dRow(["Danger","variant='danger'","#DC2626","White","None","Delete, destructive only"],[1600,2000,1600,1400,1400,1360]),
      dRow(["Link","variant='link'","None","#1A6B3A","None (underline)","Inline text actions"],[1600,2000,1600,1400,1400,1360],T.LGREY),
    ],[1600,2000,1600,1400,1400,1360]),
    Sp(),
    H3("Sizes"),
    tbl([
      hRow(["Size","Prop","Padding","Font Size","Icon Size","Min Width"],[1600,1400,1800,1600,1600,1360]),
      dRow(["Small","size='sm'","6px 12px","13px","14px","None"],[1600,1400,1800,1600,1600,1360],T.LGREY),
      dRow(["Default","size='md'","9px 18px","14px","16px","80px"],[1600,1400,1800,1600,1600,1360]),
      dRow(["Large","size='lg'","13px 28px","16px","18px","120px"],[1600,1400,1800,1600,1600,1360],T.LGREY),
      dRow(["Full Width","fullWidth","(same)","(same)","(same)","100%"],[1600,1400,1800,1600,1600,1360]),
    ],[1600,1400,1800,1600,1600,1360]),
    Sp(),
    H3("States"),
    tbl([
      hRow(["State","Visual Change","Behaviour"],[2400,3600,3360]),
      dRow(["Default","As specified above","Clickable"],[2400,3600,3360],T.LGREY),
      dRow(["Hover","Primary: darken to #2D8A50. Others: subtle bg tint","Cursor pointer"],[2400,3600,3360]),
      dRow(["Pressed/Active","Scale(0.98), darken 10%","Held feedback"],[2400,3600,3360],T.LGREY),
      dRow(["Loading","Text replaced by spinner icon + 'Loading…' (aria-label preserved)","disabled + aria-busy=true"],[2400,3600,3360]),
      dRow(["Disabled","Opacity 0.4","disabled attribute, cursor not-allowed"],[2400,3600,3360],T.LGREY),
      dRow(["Focus","3px green focus ring (box-shadow: 0 0 0 3px rgba(26,107,58,.2))","Tab navigation"],[2400,3600,3360]),
    ],[2400,3600,3360]),
    Sp(),

    H2("6.2 Input Field"),
    tbl([
      hRow(["Prop / State","Border","Background","Notes"],[2400,2400,2000,2560]),
      dRow(["Default","1px #CBD5E0","White","Placeholder in --color-text-secondary"],[2400,2400,2000,2560],T.LGREY),
      dRow(["Focus","1px #1A6B3A + green focus ring","White","Border color switches to brand green"],[2400,2400,2000,2560]),
      dRow(["Error","1px #DC2626 + red focus ring","#FEF2F2 tint","Pairs with error message below"],[2400,2400,2000,2560],T.LGREY),
      dRow(["Disabled","1px #CBD5E0","#F7F9FB","Text at 40% opacity"],[2400,2400,2000,2560]),
      dRow(["With Icon (left)","—","—","Icon at 16px, left-pad 36px, icon color muted"],[2400,2400,2000,2560],T.LGREY),
      dRow(["With Icon (right)","—","—","Used for password toggle, clear button"],[2400,2400,2000,2560]),
    ],[2400,2400,2000,2560]),
    Sp(),
    H3("Companion elements"),
    Bullet("Label: 13px/500, --color-text-primary, 5px margin-bottom"),
    Bullet("Hint text: 12px/400, --color-text-secondary, 4px margin-top"),
    Bullet("Error message: 12px/400, --color-danger, 4px margin-top, paired with alert-circle icon"),
    Bullet("Character count (optional): 12px, right-aligned below field, changes to red when over limit"),
    Sp(),

    H2("6.3 Select & Dropdown"),
    tbl([
      hRow(["Property","Value"],[3600,5760]),
      dRow(["Trigger","Same height and style as Input Field"],[3600,5760],T.LGREY),
      dRow(["Chevron icon","Right side, 16px, rotates 180° on open"],[3600,5760]),
      dRow(["Menu","White surface, 12px radius-lg, border default, max-height 240px with scroll"],[3600,5760],T.LGREY),
      dRow(["Option height","36px, 12px horizontal padding"],[3600,5760]),
      dRow(["Option hover","--color-bg-subtle background"],[3600,5760],T.LGREY),
      dRow(["Selected option","Green checkmark right side, text in --color-green-600"],[3600,5760]),
    ],[3600,5760]),
    Sp(),

    H2("6.4 Card"),
    tbl([
      hRow(["Variant","Background","Border","Radius","Padding","Shadow","Usage"],[1600,1600,1600,1200,1400,1400,960]),
      dRow(["Raised","White","0.5px default","12px","20px","Subtle","Products, orders, suppliers"],[1600,1600,1600,1200,1400,1400,960],T.LGREY),
      dRow(["Metric","--color-bg-subtle","None","8px","16px","None","KPI tiles, dashboard stats"],[1600,1600,1600,1200,1400,1400,960]),
      dRow(["Flat","Transparent","0.5px default","12px","20px","None","Contained info panels"],[1600,1600,1600,1200,1400,1400,960],T.LGREY),
      dRow(["Wallet","Brand green gradient","None","12px","20px","md","GreenPurse wallet display"],[1600,1600,1600,1200,1400,1400,960]),
      dRow(["Product","White","0.5px default","12px","0 (image flush)","Subtle","Marketplace grid"],[1600,1600,1600,1200,1400,1400,960],T.LGREY),
    ],[1600,1600,1600,1200,1400,1400,960]),
    Sp(),

    H2("6.5 Badge & Status Chip"),
    tbl([
      hRow(["Status","Background Token","Text Token","Icon"],[2400,2800,2400,1760]),
      dRow(["Active / Delivered / Success","--color-green-50","--color-green-600","ti-check"],[2400,2800,2400,1760],T.LGREY),
      dRow(["Pending / In Transit / Warning","--color-amber-50","--color-warning","ti-clock"],[2400,2800,2400,1760]),
      dRow(["Failed / Overdue / Danger","--color-danger-light","--color-danger","ti-alert-circle"],[2400,2800,2400,1760],T.LGREY),
      dRow(["Processing / Info","--color-info-light","--color-info","ti-refresh"],[2400,2800,2400,1760]),
      dRow(["Draft / Neutral","--color-bg-subtle","--color-text-secondary","ti-file"],[2400,2800,2400,1760],T.LGREY),
    ],[2400,2800,2400,1760]),
    Sp(),

    H2("6.6 Alert / Notification Banner"),
    tbl([
      hRow(["Type","Left Border","Background","Text Colour","Icon"],[2000,2000,2200,2200,960]),
      dRow(["Success","3px #1A6B3A","#E8F5EC","#14532D","ti-circle-check"],[2000,2000,2200,2200,960],T.LGREY),
      dRow(["Warning","3px #D97706","#FFFBEB","#78350F","ti-alert-triangle"],[2000,2000,2200,2200,960]),
      dRow(["Danger","3px #DC2626","#FEF2F2","#7F1D1D","ti-alert-circle"],[2000,2000,2200,2200,960],T.LGREY),
      dRow(["Info","3px #1E40AF","#EFF6FF","#1E3A5F","ti-info-circle"],[2000,2000,2200,2200,960]),
    ],[2000,2000,2200,2200,960]),
    Sp(),

    H2("6.7 Table"),
    tbl([
      hRow(["Element","Specification"],[3200,6160]),
      dRow(["Header row","--color-bg-subtle background, 12px/500 text, 10px 12px padding"],[3200,6160],T.LGREY),
      dRow(["Data row","White background, 13px/400 text, 10px 12px padding"],[3200,6160]),
      dRow(["Alternating rows","Even rows: --color-bg-subtle (optional, configured per table)"],[3200,6160],T.LGREY),
      dRow(["Row hover","--color-bg-subtle background transition 100ms"],[3200,6160]),
      dRow(["Row divider","0.5px --color-border-default bottom border on each row"],[3200,6160],T.LGREY),
      dRow(["Sortable column","Chevron icon right of header text; filled chevron = active sort direction"],[3200,6160]),
      dRow(["Sticky header","position: sticky, top: 0, z-index: 10 for scrollable tables"],[3200,6160],T.LGREY),
      dRow(["Pagination","Below table, right-aligned: Previous / Page numbers / Next; max 7 page indicators"],[3200,6160]),
    ],[3200,6160]),
    Sp(),

    H2("6.8 Navigation Components"),
    H3("Sidebar (GreenSC)"),
    tbl([
      hRow(["Element","Specification"],[3200,6160]),
      dRow(["Container width","240px fixed, 100% viewport height, position: fixed left 0"],[3200,6160],T.LGREY),
      dRow(["Background","--color-dark-sidebar (#1A202C)"],[3200,6160]),
      dRow(["Logo area","16px padding, 48px height, app mark + wordmark in white"],[3200,6160],T.LGREY),
      dRow(["Nav item default","12px left padding + 16px icon + 8px gap + 13px label, rgba(255,255,255,0.6) text"],[3200,6160]),
      dRow(["Nav item active","rgba(26,107,58,0.4) background, white text, 3px left border in #1A6B3A"],[3200,6160],T.LGREY),
      dRow(["Nav item hover","rgba(255,255,255,0.08) background, white text"],[3200,6160]),
      dRow(["Collapse button","Bottom of sidebar, toggles to 64px icon-only mode"],[3200,6160],T.LGREY),
    ],[3200,6160]),
    Sp(),
    H3("Top Navigation (GreenPurse)"),
    tbl([
      hRow(["Element","Specification"],[3200,6160]),
      dRow(["Height","64px, position: sticky top 0, white background, bottom border 0.5px"],[3200,6160],T.LGREY),
      dRow(["Logo","Left side, 32px height"],[3200,6160]),
      dRow(["Address selector","Centred pill: green pin icon + address text + chevron"],[3200,6160],T.LGREY),
      dRow(["Right actions","Search icon, Cart icon (badge for item count), Profile avatar"],[3200,6160]),
    ],[3200,6160]),
    Sp(),
    H3("Tab Bar"),
    tbl([
      hRow(["Element","Specification"],[3200,6160]),
      dRow(["Container","Bottom border 1px default, no background"],[3200,6160],T.LGREY),
      dRow(["Tab item","13px text, 8px 14px padding, --color-text-secondary default"],[3200,6160]),
      dRow(["Active tab","--color-green-600 text, 2px green border-bottom (negative margin -1px)"],[3200,6160],T.LGREY),
      dRow(["Underline animation","border-bottom transitions with transform translateX 150ms"],[3200,6160]),
    ],[3200,6160]),
    Sp(),

    H2("6.9 Form Patterns"),
    H3("Registration / Login"),
    tbl([
      hRow(["Screen","Required Fields","CTA"],[3000,4200,2160]),
      dRow(["Registration","Username, Email, Phone Number, Password, Confirm Password","Register"],[3000,4200,2160],T.LGREY),
      dRow(["Login","Phone Number or Email, Password","Login (+ biometric icon)"],[3000,4200,2160]),
      dRow(["PIN Setup","4-digit numpad (PIN hidden), confirm PIN","Continue"],[3000,4200,2160],T.LGREY),
      dRow(["Biometric Setup","Toggle: Enable Touch ID (device API)","Enable / Skip"],[3000,4200,2160]),
      dRow(["Forgot Password","Phone or Email → OTP → New Password","Reset password"],[3000,4200,2160],T.LGREY),
    ],[3000,4200,2160]),
    Sp(),
    H3("Product Upload (Farmer)"),
    tbl([
      hRow(["Field","Type","Validation"],[3000,3000,3360]),
      dRow(["Title","Text input","Required, 3–100 chars"],[3000,3000,3360],T.LGREY),
      dRow(["Description","Textarea","Required, 20–1000 chars"],[3000,3000,3360]),
      dRow(["Category","Select","Required — must match existing category"],[3000,3000,3360],T.LGREY),
      dRow(["Price (₦/kg)","Number input","Required, > 0, max 7 digits"],[3000,3000,3360]),
      dRow(["Stock (kg)","Number input","Required, > 0, integer"],[3000,3000,3360],T.LGREY),
      dRow(["Condition","Select: Fresh / Dried / Processed","Required"],[3000,3000,3360]),
      dRow(["Images","File upload, min 1 max 5","Required, JPG/PNG only, max 5MB each"],[3000,3000,3360],T.LGREY),
    ],[3000,3000,3360]),
    Sp(),

    H2("6.10 Icon System"),
    P("Icons use the Tabler Icons library (outline style, 24px baseline). All icons referenced via class names (ti ti-{name}). Fill variants are not used — outline only throughout the product."),
    Sp(),
    tbl([
      hRow(["Context","Icon Name","Usage"],[2800,3000,3560]),
      dRow(["Home","ti-home","GreenPurse bottom nav — home"],[2800,3000,3560],T.LGREY),
      dRow(["Cart","ti-shopping-cart","Cart icon with item count badge"],[2800,3000,3560]),
      dRow(["Wallet","ti-wallet","GreenPurse wallet tab"],[2800,3000,3560],T.LGREY),
      dRow(["Transfer","ti-arrows-left-right","Wallet transfer action"],[2800,3000,3560]),
      dRow(["QR Pay","ti-qrcode","Scan-to-pay, My Code display"],[2800,3000,3560],T.LGREY),
      dRow(["Delivery / Truck","ti-truck","Logistics tracking, GreenSC sidebar"],[2800,3000,3560]),
      dRow(["Market","ti-chart-line","Market monitoring, MyVirtualFarm"],[2800,3000,3560],T.LGREY),
      dRow(["Warehouse","ti-building-warehouse","Warehousing service request"],[2800,3000,3560]),
      dRow(["Alert / Warning","ti-alert-triangle","Weather and pest alerts"],[2800,3000,3560],T.LGREY),
      dRow(["Search","ti-search","Search inputs and bars"],[2800,3000,3560]),
      dRow(["Dashboard","ti-layout-dashboard","GreenSC dashboard nav"],[2800,3000,3560],T.LGREY),
      dRow(["Settings","ti-settings","Settings screens"],[2800,3000,3560]),
      dRow(["Profile","ti-user","Profile / account"],[2800,3000,3560],T.LGREY),
      dRow(["Map pin","ti-map-pin","Address selection, delivery location"],[2800,3000,3560]),
      dRow(["Leaf (brand)","ti-leaf","Brand accent, logo companion"],[2800,3000,3560],T.LGREY),
    ],[2800,3000,3560]),
    Sp(),

    // ── 7. MOTION ─────────────────────────────────────────────
    Br(),
    H1("7. Motion & Animation"),
    tbl([
      hRow(["Animation","Duration","Easing","Trigger"],[2400,1600,2400,2960]),
      dRow(["Button press","100ms","ease-out","click / tap"],[2400,1600,2400,2960],T.LGREY),
      dRow(["State transition (hover, focus)","150ms","ease-in-out","hover / focus"],[2400,1600,2400,2960]),
      dRow(["Dropdown / menu open","200ms","ease-out","click"],[2400,1600,2400,2960],T.LGREY),
      dRow(["Modal enter","250ms","ease-out, scale 0.96→1 + opacity 0→1","open"],[2400,1600,2400,2960]),
      dRow(["Modal exit","200ms","ease-in, reverse","close"],[2400,1600,2400,2960],T.LGREY),
      dRow(["Page transition","200ms","ease-out, opacity 0→1","route change"],[2400,1600,2400,2960]),
      dRow(["Skeleton loader","1.5s loop","linear, shimmer left→right","loading state"],[2400,1600,2400,2960],T.LGREY),
      dRow(["Toast / alert enter","300ms","ease-out, translateY(-8px)→0","trigger"],[2400,1600,2400,2960]),
      dRow(["Real-time value update","400ms","ease-out, colour flash","WebSocket update"],[2400,1600,2400,2960],T.LGREY),
    ],[2400,1600,2400,2960]),
    Sp(),
    callout("Reduced Motion",
      "All animations must respect prefers-reduced-motion. In the Tailwind config, motion-safe: and motion-reduce: variants are enabled. Duration-0 and opacity-only fallbacks are applied when reduced motion is active. Never remove loading feedback entirely — show a static state instead of an animation.", T.LGREY, T.DGREY),
    Sp(),

    // ── 8. ACCESSIBILITY ─────────────────────────────────────
    Br(),
    H1("8. Accessibility Standards"),
    tbl([
      hRow(["Requirement","Standard","Implementation"],[3000,1800,4560]),
      dRow(["Colour contrast — body text","WCAG AA (4.5:1)","All text/bg combinations tested via Storybook a11y addon"],[3000,1800,4560],T.LGREY),
      dRow(["Colour contrast — large text","WCAG AA (3:1)","H1–H2 on white and subtle surfaces confirmed"],[3000,1800,4560]),
      dRow(["Focus indicator","WCAG 2.2 2.4.11","3px green focus ring on all interactive elements"],[3000,1800,4560],T.LGREY),
      dRow(["Keyboard navigation","WCAG 2.1.1","Tab order matches visual order; no keyboard traps"],[3000,1800,4560]),
      dRow(["Icon buttons","WCAG 1.1.1","All icon-only buttons have aria-label"],[3000,1800,4560],T.LGREY),
      dRow(["Form errors","WCAG 3.3.1","aria-describedby links error message to input"],[3000,1800,4560]),
      dRow(["Status updates","WCAG 4.1.3","Toast notifications use aria-live='polite'"],[3000,1800,4560],T.LGREY),
      dRow(["Images","WCAG 1.1.1","Product images have descriptive alt text; decorative images alt=''"],[3000,1800,4560]),
    ],[3000,1800,4560]),
    Sp(),

    // ── 9. IMPLEMENTATION ─────────────────────────────────────
    Br(),
    H1("9. Implementation Guide"),

    H2("9.1 Package Structure"),
    callout("packages/ui/ layout",
      "packages/ui/\n  src/\n    components/\n      Button/\n        Button.tsx          ← Component\n        Button.test.tsx     ← Vitest unit test\n        Button.stories.tsx  ← Storybook story\n        index.ts            ← Named export\n      Input/ Card/ Badge/ Alert/ Table/ Nav/ ...\n    tokens/\n      colors.css           ← All CSS custom properties\n      dark.css             ← Dark mode overrides\n      typography.css       ← Font faces + scale\n      spacing.css          ← Spacing + radius tokens\n    index.ts               ← Barrel export of all components\n  tailwind.config.ts       ← Tokens wired into Tailwind\n  tsconfig.json\n  package.json"),
    Sp(),

    H2("9.2 Tailwind Token Wiring"),
    codeBlock([
      "// tailwind.config.ts (packages/ui)",
      "import type { Config } from 'tailwindcss'",
      "",
      "export default {",
      "  theme: {",
      "    extend: {",
      "      colors: {",
      "        green: {",
      "          50:  'var(--color-green-50)',",
      "          600: 'var(--color-green-600)',",
      "          800: 'var(--color-green-800)',",
      "        },",
      "        danger: 'var(--color-danger)',",
      "        warning: 'var(--color-warning)',",
      "        info:    'var(--color-info)',",
      "      },",
      "      fontFamily: {",
      "        sans:  ['DM Sans', 'system-ui', 'sans-serif'],",
      "        mono:  ['JetBrains Mono', 'monospace'],",
      "      },",
      "      borderRadius: {",
      "        sm: '4px', md: '8px', lg: '12px', xl: '20px',",
      "      },",
      "    },",
      "  },",
      "} satisfies Config",
    ]),
    Sp(),

    H2("9.3 Component Usage Examples"),
    codeBlock([
      "// Correct — always import from packages/ui",
      "import { Button, Badge, MetricCard } from '@aisuce/ui'",
      "",
      "// Primary button",
      "<Button variant='primary' size='lg' onClick={handleCheckout}>",
      "  Pay ₦28,800",
      "</Button>",
      "",
      "// Status badge",
      "<Badge status='success'>Delivered</Badge>",
      "<Badge status='warning'>Pending</Badge>",
      "",
      "// Metric tile",
      "<MetricCard",
      "  label='Wallet balance'",
      "  value='₦3,554,841'",
      "  change='+12.4%'",
      "  trend='up'",
      "/>",
    ]),
    Sp(),

    H2("9.4 Do's and Don'ts"),
    tbl([
      hRow(["Do","Don't"],[4680,4680]),
      dRow(["Use --color-green-600 for primary actions","Hardcode #1A6B3A in any component or page"],[4680,4680],T.LGREY),
      dRow(["Use font-family: var(--font-mono) for all prices","Use px, em, or system fonts for monetary values"],[4680,4680]),
      dRow(["One primary button per screen / form","Stack two primary buttons side by side"],[4680,4680],T.LGREY),
      dRow(["Use semantic colour tokens for status","Use raw hex or arbitrary Tailwind colours for status"],[4680,4680]),
      dRow(["Add aria-label to every icon-only button","Ship icon buttons without accessible labels"],[4680,4680],T.LGREY),
      dRow(["Import from @aisuce/ui","Copy-paste component code into app directories"],[4680,4680]),
      dRow(["Use the 4px spacing scale","Use arbitrary values like margin: 7px or padding: 11px"],[4680,4680],T.LGREY),
      dRow(["Match type scale exactly (14px body, etc.)","Invent new font sizes not in the scale"],[4680,4680]),
    ],[4680,4680]),

    new Paragraph({
      alignment:AlignmentType.CENTER, spacing:{before:600,after:0},
      children:[new TextRun({ text:"— End of Design System Document —", font:"Arial", size:20, color:T.MGREY, italics:true })]
    }),
  ];

  return docConfig(children, "AI-SUCE — Design System");
}


// ═══════════════════════════════════════════════════════════════════════
//  DOCUMENT 2 — BACKEND TECHNICAL ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════
function buildBackendArch() {
  const children = [
    ...titlePage(
      "BACKEND TECHNICAL ARCHITECTURE",
      "NestJS · PostgreSQL · Redis · REST API · WebSockets",
      "Version 1.0  ·  Applies to: apps/api  ·  June 2026"
    ),

    // ── 1. OVERVIEW ────────────────────────────────────────────
    H1("1. Overview"),
    P("The AI-SUCE backend is a NestJS (Node.js + TypeScript) application serving as the single API for all three web frontends (GreenPurse, GreenSC, MyVirtualFarm) and the Django-based Super Admin panel. It exposes a versioned REST API at /api/v1/ and WebSocket gateways for real-time features. It persists data in PostgreSQL, caches in Redis, stores files in AWS S3, and delegates AI computation to Python microservices via HTTP."),
    Sp(),
    callout("Confirmed from Existing Code",
      "The Super Admin Django panel (GreenPurseBackEnd Administration Dashboard at 127.0.0.1:8000/admin/) already exists and manages the following models: User (with roles: Admin, Farmer, Agric Enterprise, Farm Customer), Commerce (Cart, CartItem, Category, FileUpload, ProductDetail, ProductImage, Product, Store), OTP (HOTP/TOTP devices), and Payment (Wallet). The NestJS API must be fully compatible with this existing schema — read the Django models before defining TypeORM entities.",
      T.LAMBER, T.AMBER),
    Sp(),

    // ── 2. MODULE ARCHITECTURE ─────────────────────────────────
    Br(),
    H1("2. Module Architecture"),
    P("NestJS organises code into modules. Each module owns its entities, services, controllers, DTOs, and guards. Modules communicate through injected services — never via direct database access across module boundaries."),
    Sp(),

    H2("2.1 Module Inventory"),
    tbl([
      hRow(["Module","Responsibility","Key Exports"],[2400,4400,2560]),
      dRow(["AppModule","Root module — imports all feature modules, global config, database","—"],[2400,4400,2560],T.LGREY),
      dRow(["ConfigModule","Environment variables via @nestjs/config, validation with Joi","ConfigService"],[2400,4400,2560]),
      dRow(["DatabaseModule","TypeORM connection, entity registration","DataSource"],[2400,4400,2560],T.LGREY),
      dRow(["AuthModule","Registration, login, JWT issue/refresh, PIN, OTP, role guards","JwtAuthGuard, RolesGuard, AuthService"],[2400,4400,2560]),
      dRow(["UsersModule","User CRUD, profile, role management","UsersService"],[2400,4400,2560],T.LGREY),
      dRow(["ProductsModule","Product CRUD, categories, stores, image upload, search","ProductsService"],[2400,4400,2560]),
      dRow(["OrdersModule","Cart, checkout, order lifecycle, platform fee","OrdersService"],[2400,4400,2560],T.LGREY),
      dRow(["WalletModule","Wallet CRUD, transactions, transfers, forex, QR codes","WalletService"],[2400,4400,2560]),
      dRow(["LogisticsModule","Delivery batches, routes, tracking events, driver assignment","LogisticsService"],[2400,4400,2560],T.LGREY),
      dRow(["MarketModule","Commodity prices, P&L, farm positions, watchlist","MarketService"],[2400,4400,2560]),
      dRow(["NotificationsModule","FCM push, in-app, email triggers","NotificationsService"],[2400,4400,2560],T.LGREY),
      dRow(["StorageModule","AWS S3 upload, signed URL generation","StorageService"],[2400,4400,2560]),
      dRow(["AIModule","HTTP proxy to Python AI microservices","AIService"],[2400,4400,2560],T.LGREY),
      dRow(["AdminModule","Platform analytics, ad slot management, super admin helpers","AdminService"],[2400,4400,2560]),
      dRow(["HealthModule","Health check endpoints for load balancer probes","—"],[2400,4400,2560],T.LGREY),
    ],[2400,4400,2560]),
    Sp(),

    H2("2.2 Module Dependency Graph"),
    callout("Dependency Rules",
      "Modules may only import modules listed below them in the dependency order. No circular imports. AppModule imports everything. Feature modules import only AuthModule (for guards), UsersModule (for user lookup), NotificationsModule (for triggers), and StorageModule (for file operations). They do NOT import each other's services directly — use events (EventEmitter2) for cross-module side effects.",
      T.LGREY, T.DGREY),
    Sp(),
    tbl([
      hRow(["Layer","Modules","Can Import"],[2400,3000,3960]),
      dRow(["Infrastructure","ConfigModule, DatabaseModule, HealthModule","External libraries only"],[2400,3000,3960],T.LGREY),
      dRow(["Core Services","AuthModule, UsersModule, StorageModule, NotificationsModule","Infrastructure layer"],[2400,3000,3960]),
      dRow(["Domain: Commerce","ProductsModule, OrdersModule","Core Services"],[2400,3000,3960],T.LGREY),
      dRow(["Domain: Finance","WalletModule","Core Services"],[2400,3000,3960]),
      dRow(["Domain: Logistics","LogisticsModule","Core Services, Commerce (OrdersModule events)"],[2400,3000,3960],T.LGREY),
      dRow(["Domain: Intelligence","MarketModule, AIModule","Core Services"],[2400,3000,3960]),
      dRow(["Platform","AdminModule","All domain modules (read-only)"],[2400,3000,3960],T.LGREY),
    ],[2400,3000,3960]),
    Sp(),

    // ── 3. DATABASE SCHEMA ─────────────────────────────────────
    Br(),
    H1("3. Database Schema"),
    P("PostgreSQL 16 via TypeORM 0.3.x. All entities use UUID primary keys (uuid_generate_v4()). Timestamps: created_at and updated_at on every table, auto-managed by TypeORM. Soft deletes via deleted_at where data must be retained for audit. Migrations are version-controlled in apps/api/src/migrations/ — never use synchronize: true in production."),
    Sp(),
    callout("Schema Compatibility Warning",
      "The Django admin reveals these existing table names: users, commerce_product, commerce_category, commerce_store, commerce_cart, commerce_cartitem, commerce_fileupload, commerce_productdetail, commerce_productimage, payment_wallet, auth_token_token, otp_hotp_hotpdevice. TypeORM entities MUST map to these existing table names using the @Entity('table_name') decorator. Do not let TypeORM create new tables that duplicate existing Django-managed ones.",
      T.LRED, T.RED),
    Sp(),

    H2("3.1 Identity Domain"),
    tbl([
      hRow(["Table","Column","Type","Constraints / Notes"],[2400,2400,2000,2560]),
      dRow(["users","id","UUID","PK, default uuid_generate_v4()"],[2400,2400,2000,2560],T.LGREY),
      dRow(["","email","VARCHAR(255)","UNIQUE, NOT NULL"],[2400,2400,2000,2560]),
      dRow(["","phone_number","VARCHAR(20)","UNIQUE, nullable"],[2400,2400,2000,2560],T.LGREY),
      dRow(["","username","VARCHAR(100)","UNIQUE, NOT NULL"],[2400,2400,2000,2560]),
      dRow(["","password_hash","VARCHAR(255)","bcrypt, NOT NULL"],[2400,2400,2000,2560],T.LGREY),
      dRow(["","pin_hash","VARCHAR(255)","bcrypt, nullable (set post-registration)"],[2400,2400,2000,2560]),
      dRow(["","is_admin","BOOLEAN","Default FALSE"],[2400,2400,2000,2560],T.LGREY),
      dRow(["","is_farmer","BOOLEAN","Default FALSE"],[2400,2400,2000,2560]),
      dRow(["","is_agric_enterprise","BOOLEAN","Default FALSE"],[2400,2400,2000,2560],T.LGREY),
      dRow(["","is_farm_customer","BOOLEAN","Default FALSE"],[2400,2400,2000,2560]),
      dRow(["","created_at / updated_at","TIMESTAMPTZ","Auto-managed by TypeORM"],[2400,2400,2000,2560],T.LGREY),
      dRow(["auth_token_token","id","BIGINT","PK"],[2400,2400,2000,2560]),
      dRow(["","key","VARCHAR(40)","UNIQUE — Knox-style token key"],[2400,2400,2000,2560],T.LGREY),
      dRow(["","user_id","UUID","FK → users.id"],[2400,2400,2000,2560]),
      dRow(["","created / expiry","TIMESTAMPTZ","Token lifecycle"],[2400,2400,2000,2560],T.LGREY),
    ],[2400,2400,2000,2560]),
    Sp(),

    H2("3.2 Commerce Domain"),
    tbl([
      hRow(["Table","Key Columns","Foreign Keys","Notes"],[2400,3600,1800,1560]),
      dRow(["commerce_store","id (UUID), name, farmer_id, address, lat, lng","farmer_id → users.id","One farmer may have multiple stores"],[2400,3600,1800,1560],T.LGREY),
      dRow(["commerce_category","id (UUID), name, slug, icon_url","—","Seeded by admin"],[2400,3600,1800,1560]),
      dRow(["commerce_product","id (UUID), title, description, store_id, category_id, price, kilogram, stock, condition, is_active","store_id, category_id","Platform fee applied at order creation, not stored here"],[2400,3600,1800,1560],T.LGREY),
      dRow(["commerce_productimage","id (UUID), product_id, s3_key, url, is_primary","product_id","Multiple images per product"],[2400,3600,1800,1560]),
      dRow(["commerce_productdetail","id (UUID), product_id, organic_pct, expiry_date, kcal_per_100g, rating","product_id","Extended product attributes"],[2400,3600,1800,1560],T.LGREY),
      dRow(["commerce_cart","id (UUID), user_id, created_at","user_id → users.id","One active cart per user"],[2400,3600,1800,1560]),
      dRow(["commerce_cartitem","id (UUID), cart_id, product_id, quantity","cart_id, product_id","Quantity in kg"],[2400,3600,1800,1560],T.LGREY),
      dRow(["orders","id (UUID), user_id, status, subtotal, discount, delivery_fee, platform_fee, grand_total, delivery_address_id, created_at","user_id","Status enum: PENDING, PLACED, ASSIGNED, ON_THE_WAY, DELIVERED, CANCELLED"],[2400,3600,1800,1560]),
      dRow(["order_items","id (UUID), order_id, product_id, quantity, unit_price, subtotal, farmer_id","order_id, product_id, farmer_id","Snapshot of price at order time"],[2400,3600,1800,1560],T.LGREY),
      dRow(["addresses","id (UUID), user_id, label, line1, city, state, lat, lng, is_default","user_id","Multiple addresses per user"],[2400,3600,1800,1560]),
      dRow(["coupons","id (UUID), code, discount_type, value, min_order, expiry, uses_remaining","—","PERCENTAGE or FIXED discount"],[2400,3600,1800,1560],T.LGREY),
    ],[2400,3600,1800,1560]),
    Sp(),

    H2("3.3 Finance Domain"),
    tbl([
      hRow(["Table","Key Columns","Foreign Keys","Notes"],[2400,3600,1800,1560]),
      dRow(["payment_wallet","id (UUID), user_id, balance (DECIMAL 15,2), account_name, account_number, bank, phone_number, pin_hash","user_id → users.id","One wallet per user; created by admin or auto on registration"],[2400,3600,1800,1560],T.LGREY),
      dRow(["wallet_transactions","id (UUID), wallet_id, type, amount, fee, balance_after, counterpart_wallet_id, status, idempotency_key, metadata (JSONB), created_at","wallet_id, counterpart_wallet_id","Type enum: DEPOSIT, WITHDRAWAL, TRANSFER_OUT, TRANSFER_IN, PURCHASE, INVESTMENT, FEE"],[2400,3600,1800,1560]),
      dRow(["qr_tokens","id (UUID), wallet_id, token_hash, amount (nullable), expires_at, used_at","wallet_id","Single-use, 5-minute expiry"],[2400,3600,1800,1560],T.LGREY),
      dRow(["bank_beneficiaries","id (UUID), wallet_id, bank_name, account_number, account_name","wallet_id","Saved beneficiaries for faster transfer"],[2400,3600,1800,1560]),
      dRow(["forex_rates","id (UUID), from_currency, to_currency, rate, vat_pct, fetched_at","—","Cached from external API, refreshed every 5 minutes via cron"],[2400,3600,1800,1560],T.LGREY),
    ],[2400,3600,1800,1560]),
    Sp(),

    H2("3.4 Logistics Domain"),
    tbl([
      hRow(["Table","Key Columns","Foreign Keys","Notes"],[2400,3600,1800,1560]),
      dRow(["delivery_batches","id (UUID), order_id, driver_id, vehicle_id, status, started_at, delivered_at","order_id, driver_id","Status: PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, FAILED"],[2400,3600,1800,1560],T.LGREY),
      dRow(["tracking_events","id (UUID), batch_id, lat, lng, speed_kmh, status, recorded_at","batch_id","IoT GPS push events (stub in Phase 1)"],[2400,3600,1800,1560]),
      dRow(["drivers","id (UUID), user_id, vehicle_id, license_number, phone, is_available","user_id"," "],[2400,3600,1800,1560],T.LGREY),
      dRow(["vehicles","id (UUID), plate, type, cooling_enabled, iot_device_id","—","Type: TRUCK, TRICYCLE, VAN"],[2400,3600,1800,1560]),
      dRow(["warehousing_requests","id (UUID), farmer_id, produce_type, volume_kg, requested_date, status, cooling_unit_id","farmer_id","Status: PENDING, CONFIRMED, ACTIVE, COMPLETED"],[2400,3600,1800,1560],T.LGREY),
    ],[2400,3600,1800,1560]),
    Sp(),

    H2("3.5 Market Intelligence Domain"),
    tbl([
      hRow(["Table","Key Columns","Notes"],[2800,3600,2960]),
      dRow(["commodities","id (UUID), name, symbol, category (CASH_CROP / FOOD_CROP), icon_url","Seeded: Cocoa, Groundnut, Rice, Millet, Maize"],[2800,3600,2960],T.LGREY),
      dRow(["commodity_prices","id (UUID), commodity_id, price (DECIMAL 15,4), recorded_at","Appended by price-feed cron job, never updated"],[2800,3600,2960]),
      dRow(["farm_positions","id (UUID), user_id, commodity_id, units_held, avg_buy_price, opened_at","Investment positions — opened/closed by buy/sell actions"],[2800,3600,2960],T.LGREY),
      dRow(["watchlist","id (UUID), user_id, commodity_id, added_at","Many-to-many user–commodity relationship"],[2800,3600,2960]),
      dRow(["weather_alerts","id (UUID), state, severity, message, valid_from, valid_to, sent_at","Ingested from OpenWeatherMap API"],[2800,3600,2960],T.LGREY),
      dRow(["price_alerts","id (UUID), user_id, commodity_id, threshold_type (ABOVE/BELOW), threshold_price, triggered_at, is_active","User-defined price alert triggers"],[2800,3600,2960]),
    ],[2800,3600,2960]),
    Sp(),

    // ── 4. API DESIGN ─────────────────────────────────────────
    Br(),
    H1("4. REST API Design"),

    H2("4.1 Conventions"),
    Bullet("Base URL: /api/v1/ — all routes versioned from day one"),
    Bullet("Authentication: Bearer JWT token in Authorization header"),
    Bullet("Content type: application/json for all request/response bodies"),
    Bullet("Error format: { statusCode, message, error, timestamp, path }"),
    Bullet("Pagination: { data: [], total, page, limit, totalPages } on all list endpoints"),
    Bullet("Idempotency: POST /wallet/transactions requires Idempotency-Key header"),
    Bullet("File uploads: multipart/form-data, max 5MB per file, 5 files per request"),
    Sp(),

    H2("4.2 Auth Endpoints"),
    tbl([
      hRow(["Method","Path","Auth","Request Body","Response"],[1000,3200,1200,2200,1760]),
      dRow(["POST","api/v1/auth/register","Public","username, email, phone, password, role","201: { user, token }"],[1000,3200,1200,2200,1760],T.LGREY),
      dRow(["POST","api/v1/auth/login","Public","email|phone, password","200: { user, token }"],[1000,3200,1200,2200,1760]),
      dRow(["POST","api/v1/auth/login/pin","JWT","pin (4 digits)","200: { verified: true }"],[1000,3200,1200,2200,1760],T.LGREY),
      dRow(["POST","api/v1/auth/otp/send","Public","phone|email","200: { message }"],[1000,3200,1200,2200,1760]),
      dRow(["POST","api/v1/auth/otp/verify","Public","phone|email, otp","200: { token }"],[1000,3200,1200,2200,1760],T.LGREY),
      dRow(["POST","api/v1/auth/refresh","JWT","—","200: { token }"],[1000,3200,1200,2200,1760]),
      dRow(["POST","api/v1/auth/logout","JWT","—","200: { message }"],[1000,3200,1200,2200,1760],T.LGREY),
      dRow(["PUT","api/v1/auth/pin","JWT","old_pin, new_pin","200: { message }"],[1000,3200,1200,2200,1760]),
    ],[1000,3200,1200,2200,1760]),
    Sp(),

    H2("4.3 Products & Catalogue Endpoints"),
    tbl([
      hRow(["Method","Path","Auth","Notes"],[1000,3600,1600,3160]),
      dRow(["GET","api/v1/products","Public","Filters: category, search, min_price, max_price, page, limit"],[1000,3600,1600,3160],T.LGREY),
      dRow(["GET","api/v1/products/feed","JWT (Buyer)","AI-ranked personalised feed based on buyer history"],[1000,3600,1600,3160]),
      dRow(["GET","api/v1/products/trending","Public","Most-purchased in last 7 days"],[1000,3600,1600,3160],T.LGREY),
      dRow(["GET","api/v1/products/:id","Public","Single product with images and details"],[1000,3600,1600,3160]),
      dRow(["POST","api/v1/products","JWT (Farmer)","Multipart: product fields + images. Returns created product"],[1000,3600,1600,3160],T.LGREY),
      dRow(["PATCH","api/v1/products/:id","JWT (Farmer, own)","Update any product field"],[1000,3600,1600,3160]),
      dRow(["DELETE","api/v1/products/:id","JWT (Farmer / Admin)","Soft delete only"],[1000,3600,1600,3160],T.LGREY),
      dRow(["GET","api/v1/categories","Public","Full category list with icon URLs"],[1000,3600,1600,3160]),
    ],[1000,3600,1600,3160]),
    Sp(),

    H2("4.4 Order & Cart Endpoints"),
    tbl([
      hRow(["Method","Path","Auth","Notes"],[1000,3600,1600,3160]),
      dRow(["GET","api/v1/cart","JWT","Current user's active cart with item totals"],[1000,3600,1600,3160],T.LGREY),
      dRow(["POST","api/v1/cart/items","JWT","{ product_id, quantity }. Creates cart if none exists"],[1000,3600,1600,3160]),
      dRow(["PATCH","api/v1/cart/items/:id","JWT","{ quantity }. 0 removes item"],[1000,3600,1600,3160],T.LGREY),
      dRow(["POST","api/v1/cart/coupon","JWT","{ code }. Validates and applies coupon"],[1000,3600,1600,3160]),
      dRow(["POST","api/v1/orders","JWT (Buyer)","Checkout: { address_id, coupon_code, payment_method }. Deducts wallet, creates order"],[1000,3600,1600,3160],T.LGREY),
      dRow(["GET","api/v1/orders","JWT","List caller's orders. Farmers see their sold orders"],[1000,3600,1600,3160]),
      dRow(["GET","api/v1/orders/:id","JWT","Order detail with items and tracking status"],[1000,3600,1600,3160],T.LGREY),
      dRow(["PATCH","api/v1/orders/:id/status","JWT (Logistics)","Update order status. Triggers WebSocket + push notification"],[1000,3600,1600,3160]),
    ],[1000,3600,1600,3160]),
    Sp(),

    H2("4.5 Wallet Endpoints"),
    tbl([
      hRow(["Method","Path","Auth","Notes"],[1000,3600,1600,3160]),
      dRow(["GET","api/v1/wallet","JWT","Wallet balance, card details, recent transactions"],[1000,3600,1600,3160],T.LGREY),
      dRow(["POST","api/v1/wallet/deposit","JWT","Initiates Paystack charge. Returns payment URL"],[1000,3600,1600,3160]),
      dRow(["POST","api/v1/wallet/withdraw","JWT + PIN","{ amount, bank_name, account_number }. Paystack payout"],[1000,3600,1600,3160],T.LGREY),
      dRow(["POST","api/v1/wallet/transfer","JWT + PIN","{ type: GP|BANK|PHONE|QR, amount, target, idempotency_key }"],[1000,3600,1600,3160]),
      dRow(["GET","api/v1/wallet/transactions","JWT","Paginated transaction history"],[1000,3600,1600,3160],T.LGREY),
      dRow(["POST","api/v1/wallet/qr/generate","JWT","Returns { qr_token, qr_image_url, expires_at }"],[1000,3600,1600,3160]),
      dRow(["POST","api/v1/wallet/qr/pay","JWT + PIN","{ qr_token, amount }. Validates and executes payment"],[1000,3600,1600,3160],T.LGREY),
      dRow(["GET","api/v1/wallet/forex","JWT","{ from, to, amount } → rate, vat, total"],[1000,3600,1600,3160]),
      dRow(["POST","api/v1/wallet/freeze","JWT","Toggles wallet freeze state"],[1000,3600,1600,3160],T.LGREY),
      dRow(["POST","api/v1/payments/webhook","Public (signed)","Paystack webhook — validates signature, updates wallet"],[1000,3600,1600,3160]),
    ],[1000,3600,1600,3160]),
    Sp(),

    H2("4.6 Market & Investment Endpoints"),
    tbl([
      hRow(["Method","Path","Auth","Notes"],[1000,3600,1600,3160]),
      dRow(["GET","api/v1/market/commodities","JWT","Full list with current prices and 24h change"],[1000,3600,1600,3160],T.LGREY),
      dRow(["GET","api/v1/market/commodities/:id/prices","JWT","{ period: 1D|1W|1M|1Y|5Y } price history array"],[1000,3600,1600,3160]),
      dRow(["GET","api/v1/market/portfolio","JWT","Account value, P&L, open positions"],[1000,3600,1600,3160],T.LGREY),
      dRow(["POST","api/v1/market/positions","JWT + PIN","Buy: { commodity_id, amount }. Sell: { position_id, units }"],[1000,3600,1600,3160]),
      dRow(["GET","api/v1/market/watchlist","JWT","User's watchlist with live prices"],[1000,3600,1600,3160],T.LGREY),
      dRow(["POST","api/v1/market/watchlist","JWT","{ commodity_id }. Add to watchlist"],[1000,3600,1600,3160]),
      dRow(["DELETE","api/v1/market/watchlist/:id","JWT","Remove from watchlist"],[1000,3600,1600,3160],T.LGREY),
      dRow(["POST","api/v1/market/alerts","JWT","{ commodity_id, threshold_type, threshold_price }"],[1000,3600,1600,3160]),
      dRow(["GET","api/v1/market/weather-alerts","JWT (Farmer)","Active weather alerts for farmer's state"],[1000,3600,1600,3160],T.LGREY),
    ],[1000,3600,1600,3160]),
    Sp(),

    // ── 5. WEBSOCKET GATEWAYS ─────────────────────────────────
    Br(),
    H1("5. WebSocket Gateways"),
    P("WebSocket connections managed by @nestjs/websockets using Socket.IO. Redis adapter (@socket.io/redis-adapter) enables horizontal scaling across multiple API instances from day one."),
    Sp(),

    H2("5.1 Order Tracking Gateway"),
    tbl([
      hRow(["Event","Direction","Payload","Description"],[2400,1600,2800,2560]),
      dRow(["join-order","Client → Server","{ order_id, token }","Subscribe to a specific order's tracking room"],[2400,1600,2800,2560],T.LGREY),
      dRow(["order:location-update","Server → Client","{ lat, lng, speed, eta_minutes }","Driver GPS position, emitted every 10 seconds"],[2400,1600,2800,2560]),
      dRow(["order:status-change","Server → Client","{ order_id, status, timestamp }","Status transition (ASSIGNED → ON_THE_WAY → DELIVERED)"],[2400,1600,2800,2560],T.LGREY),
      dRow(["order:driver-assigned","Server → Client","{ driver_name, vehicle_plate, phone }","Emitted when logistics assigns driver"],[2400,1600,2800,2560]),
    ],[2400,1600,2800,2560]),
    Sp(),

    H2("5.2 Market Data Gateway"),
    tbl([
      hRow(["Event","Direction","Payload","Description"],[2400,1600,2800,2560]),
      dRow(["subscribe-market","Client → Server","{ commodity_ids[] }","Subscribe to price feed for selected commodities"],[2400,1600,2800,2560],T.LGREY),
      dRow(["market:price-update","Server → Client","{ commodity_id, price, change_pct, timestamp }","Emitted when price feed cron refreshes (every 60 seconds)"],[2400,1600,2800,2560]),
      dRow(["market:alert-triggered","Server → Client","{ alert_id, commodity_id, price, message }","Emitted to specific user's room when price alert fires"],[2400,1600,2800,2560],T.LGREY),
    ],[2400,1600,2800,2560]),
    Sp(),

    H2("5.3 Notifications Gateway"),
    tbl([
      hRow(["Event","Direction","Payload","Description"],[2400,1600,2800,2560]),
      dRow(["authenticate","Client → Server","{ token }","Authenticate WebSocket connection, joins user-specific room"],[2400,1600,2800,2560],T.LGREY),
      dRow(["notification:new","Server → Client","{ id, type, title, body, data, created_at }","Real-time in-app notification"],[2400,1600,2800,2560]),
      dRow(["wallet:balance-update","Server → Client","{ new_balance, transaction_type, amount }","Instant balance refresh after transaction"],[2400,1600,2800,2560],T.LGREY),
    ],[2400,1600,2800,2560]),
    Sp(),

    // ── 6. AUTH ARCHITECTURE ──────────────────────────────────
    Br(),
    H1("6. Authentication & Authorisation Architecture"),

    H2("6.1 Auth Flow"),
    Num("User submits credentials (email/phone + password) to POST /api/v1/auth/login"),
    Num("AuthService validates credentials, checks bcrypt hash against stored password_hash"),
    Num("On success: generates JWT (15-minute expiry) + refresh token (7-day expiry, stored in Redis)"),
    Num("JWT payload: { sub: userId, email, roles: ['farmer'|'buyer'|'admin'|...], iat, exp }"),
    Num("Client stores JWT in memory (not localStorage); refresh token in httpOnly cookie"),
    Num("Every API request: JwtAuthGuard extracts and verifies JWT from Authorization header"),
    Num("Sensitive operations (wallet, PIN change): additional PIN verification via POST /auth/login/pin"),
    Num("Token refresh: client calls POST /auth/refresh; server validates refresh token from Redis, issues new JWT"),
    Sp(),

    H2("6.2 Guards & Decorators"),
    tbl([
      hRow(["Guard / Decorator","Type","Usage"],[3200,2400,3760]),
      dRow(["@UseGuards(JwtAuthGuard)","Global (with exceptions)","Applied globally in AppModule; public routes opt-out with @Public()"],[3200,2400,3760],T.LGREY),
      dRow(["@UseGuards(RolesGuard)","Method-level","Combined with @Roles() decorator to restrict endpoints by role"],[3200,2400,3760]),
      dRow(["@Roles('farmer', 'admin')","Custom decorator","Specifies which roles can access the route"],[3200,2400,3760],T.LGREY),
      dRow(["@Public()","Custom decorator","Bypasses JwtAuthGuard (login, register, public product list)"],[3200,2400,3760]),
      dRow(["@CurrentUser()","Custom decorator","Injects the authenticated user object from JWT payload into handler"],[3200,2400,3760],T.LGREY),
      dRow(["@UseGuards(PinGuard)","Method-level","Requires PIN verification header on wallet mutation routes"],[3200,2400,3760]),
      dRow(["@ApiKey()","Custom decorator","Admin API routes use API key header instead of JWT"],[3200,2400,3760],T.LGREY),
    ],[3200,2400,3760]),
    Sp(),

    H2("6.3 Role Matrix (repeated from Architecture Doc for API reference)"),
    tbl([
      hRow(["Endpoint Group","Buyer","Farmer","Store Manager (GreenSC)","Admin"],[3000,1200,1200,2200,1760]),
      dRow(["GET /products, /categories","✓","✓","✓","✓"],[3000,1200,1200,2200,1760],T.LGREY),
      dRow(["POST /products","—","✓","✓","✓"],[3000,1200,1200,2200,1760]),
      dRow(["POST /orders, GET /orders","✓","—","—","✓"],[3000,1200,1200,2200,1760],T.LGREY),
      dRow(["GET /orders (sold)","—","✓","—","✓"],[3000,1200,1200,2200,1760]),
      dRow(["PATCH /orders/:id/status","—","—","✓","✓"],[3000,1200,1200,2200,1760],T.LGREY),
      dRow(["All /wallet endpoints","✓","✓","—","✓"],[3000,1200,1200,2200,1760]),
      dRow(["All /market endpoints","✓","✓","—","✓"],[3000,1200,1200,2200,1760],T.LGREY),
      dRow(["POST /logistics","—","—","✓","✓"],[3000,1200,1200,2200,1760]),
      dRow(["GET /admin/*","—","—","—","✓"],[3000,1200,1200,2200,1760],T.LGREY),
    ],[3000,1200,1200,2200,1760]),
    Sp(),

    // ── 7. KEY PATTERNS ───────────────────────────────────────
    Br(),
    H1("7. Key Implementation Patterns"),

    H2("7.1 Platform Fee Calculation"),
    callout("Rule: Server-side only",
      "The 10% platform fee is ALWAYS calculated server-side in OrdersService.createOrder(). It is NEVER calculated or trusted from the client. The fee is computed as: platform_fee = subtotal * 0.10. The farmer receives 90% of item revenue credited to their wallet immediately upon delivery confirmation (status → DELIVERED). The 10% is credited to the platform revenue wallet.",
      T.LGREEN, T.GREEN),
    Sp(),
    codeBlock([
      "// orders/orders.service.ts — fee calculation (simplified)",
      "async createOrder(userId: string, dto: CreateOrderDto) {",
      "  const cart = await this.cartService.getActiveCart(userId)",
      "  const subtotal = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0)",
      "  const discount  = await this.couponService.apply(dto.couponCode, subtotal)",
      "  const platformFee = (subtotal - discount) * 0.10",
      "  const grandTotal  = subtotal - discount + deliveryFee",
      "",
      "  // Deduct from buyer wallet — atomic transaction",
      "  await this.walletService.deduct(userId, grandTotal, idempotencyKey)",
      "",
      "  // Order created with status PENDING",
      "  const order = await this.ordersRepo.save({ ..., platformFee, grandTotal })",
      "",
      "  // Farmer payout triggered only on DELIVERED status",
      "  return order",
      "}",
    ]),
    Sp(),

    H2("7.2 Idempotency on Wallet Transactions"),
    tbl([
      hRow(["Step","Detail"],[2400,6960]),
      dRow(["1. Client sends","POST /wallet/transfer with Idempotency-Key: <uuid> header"],[2400,6960],T.LGREY),
      dRow(["2. Server checks Redis","Key: idempotency:{key}. If exists → return cached response immediately (no DB write)"],[2400,6960]),
      dRow(["3. Server processes","Executes transfer inside a PostgreSQL transaction (BEGIN … COMMIT)"],[2400,6960],T.LGREY),
      dRow(["4. Server stores","Result stored in Redis with 24-hour TTL: SET idempotency:{key} <response> EX 86400"],[2400,6960]),
      dRow(["5. Retry-safe","Client can safely retry on network timeout — same response returned, no duplicate debit"],[2400,6960],T.LGREY),
    ],[2400,6960]),
    Sp(),

    H2("7.3 Event-Driven Cross-Module Communication"),
    P("Modules do not call each other's services directly across domain boundaries. They emit events via EventEmitter2 (@nestjs/event-emitter). This keeps modules decoupled and testable in isolation."),
    Sp(),
    tbl([
      hRow(["Event Name","Emitted By","Handled By","Trigger"],[2800,2400,2400,1760]),
      dRow(["order.placed","OrdersModule","LogisticsModule, NotificationsModule","New order created"],[2800,2400,2400,1760],T.LGREY),
      dRow(["order.status.changed","LogisticsModule","OrdersModule, NotificationsModule, WalletModule","Status transition"],[2800,2400,2400,1760]),
      dRow(["order.delivered","LogisticsModule","WalletModule","Triggers farmer payout (90%)"],[2800,2400,2400,1760],T.LGREY),
      dRow(["wallet.transaction.complete","WalletModule","NotificationsModule","Any wallet transaction"],[2800,2400,2400,1760]),
      dRow(["product.created","ProductsModule","AIModule (re-index)","New product uploaded"],[2800,2400,2400,1760],T.LGREY),
      dRow(["price.alert.triggered","MarketModule","NotificationsModule","Price threshold crossed"],[2800,2400,2400,1760]),
      dRow(["weather.alert.received","MarketModule","NotificationsModule","New weather alert ingested"],[2800,2400,2400,1760],T.LGREY),
    ],[2800,2400,2400,1760]),
    Sp(),

    H2("7.4 Caching Strategy"),
    tbl([
      hRow(["Data","Cache Key Pattern","TTL","Invalidation"],[2800,2800,1400,2360]),
      dRow(["Product list (by category)","products:cat:{id}:p:{page}","10 min","On product create/update/delete"],[2800,2800,1400,2360],T.LGREY),
      dRow(["Single product","products:item:{id}","30 min","On product update"],[2800,2800,1400,2360]),
      dRow(["Category list","categories:all","1 hour","On category change (rare)"],[2800,2800,1400,2360],T.LGREY),
      dRow(["Forex rate (NGN/USD)","forex:NGN:USD","5 min","Cron refresh every 5 min"],[2800,2800,1400,2360]),
      dRow(["Commodity price (latest)","market:price:{id}:latest","60 sec","Price feed cron"],[2800,2800,1400,2360],T.LGREY),
      dRow(["Trending products","products:trending","15 min","Cron recalculation"],[2800,2800,1400,2360]),
      dRow(["User JWT blacklist","auth:blacklist:{token_jti}","Until token expiry","On logout"],[2800,2800,1400,2360],T.LGREY),
      dRow(["Idempotency keys","idempotency:{key}","24 hours","Never evicted early"],[2800,2800,1400,2360]),
    ],[2800,2800,1400,2360]),
    Sp(),

    // ── 8. FOLDER STRUCTURE ───────────────────────────────────
    Br(),
    H1("8. Project Folder Structure"),
    codeBlock([
      "apps/api/src/",
      "  app.module.ts                ← Root module",
      "  main.ts                      ← Bootstrap, global pipes, Swagger setup",
      "  config/",
      "    configuration.ts           ← Joi-validated env schema",
      "  database/",
      "    database.module.ts",
      "    migrations/                ← TypeORM migration files (timestamped)",
      "  common/",
      "    decorators/                ← @Public(), @Roles(), @CurrentUser()",
      "    guards/                    ← JwtAuthGuard, RolesGuard, PinGuard",
      "    interceptors/              ← LoggingInterceptor, TransformInterceptor",
      "    filters/                   ← GlobalExceptionFilter",
      "    pipes/                     ← ValidationPipe (class-validator)",
      "    dto/                       ← Shared DTOs (PaginationDto, etc.)",
      "  modules/",
      "    auth/",
      "      auth.module.ts",
      "      auth.controller.ts",
      "      auth.service.ts",
      "      strategies/              ← JwtStrategy, LocalStrategy",
      "      dto/                     ← RegisterDto, LoginDto, PinDto",
      "    users/",
      "      users.module.ts",
      "      users.service.ts",
      "      entities/user.entity.ts  ← TypeORM entity mapping users table",
      "    products/",
      "      products.module.ts | .controller.ts | .service.ts",
      "      entities/                ← product.entity, category.entity, ...",
      "      dto/                     ← CreateProductDto, UpdateProductDto, ...",
      "    orders/ | wallet/ | logistics/ | market/ | notifications/",
      "    storage/",
      "      storage.service.ts       ← AWS S3 upload / signed URL",
      "    ai/",
      "      ai.service.ts            ← HTTP proxy to Python microservices",
      "    admin/",
      "      admin.module.ts | .controller.ts | .service.ts",
      "    health/",
      "      health.controller.ts     ← GET /health (DB + Redis + S3 checks)",
      "  gateways/",
      "    tracking.gateway.ts        ← Order tracking WebSocket",
      "    market.gateway.ts          ← Market price WebSocket",
      "    notifications.gateway.ts   ← User notification WebSocket",
    ]),
    Sp(),

    // ── 9. ENVIRONMENT VARIABLES ──────────────────────────────
    Br(),
    H1("9. Environment Variables"),
    callout("Security Rule", "Environment variables are NEVER committed to the repository. Production secrets are managed via AWS Secrets Manager. Developers use a .env.local file (gitignored). The .env.example file in the repo documents all required variables with placeholder values."),
    Sp(),
    tbl([
      hRow(["Variable","Example Value","Required","Description"],[2800,2400,1200,2960]),
      dRow(["NODE_ENV","production","Yes","API server port"],[2800,2400,1200,2960],T.LGREY),
      dRow(["PORT","3001","Yes","API server port"],[2800,2400,1200,2960]),
      dRow(["DATABASE_URL","postgresql://user:pass@host:5432/aisuce","Yes","Full Postgres connection string"],[2800,2400,1200,2960],T.LGREY),
      dRow(["REDIS_URL","redis://host:6379","Yes","Redis connection string"],[2800,2400,1200,2960]),
      dRow(["JWT_SECRET","<64-char random string>","Yes","JWT signing secret"],[2800,2400,1200,2960],T.LGREY),
      dRow(["JWT_EXPIRES_IN","15m","Yes","JWT access token expiry"],[2800,2400,1200,2960]),
      dRow(["JWT_REFRESH_EXPIRES_IN","7d","Yes","Refresh token expiry"],[2800,2400,1200,2960],T.LGREY),
      dRow(["PAYSTACK_SECRET_KEY","sk_live_...","Yes","Paystack secret key"],[2800,2400,1200,2960]),
      dRow(["PAYSTACK_WEBHOOK_SECRET","<hash>","Yes","Paystack webhook signature secret"],[2800,2400,1200,2960],T.LGREY),
      dRow(["AWS_REGION","eu-west-1","Yes","AWS region for S3 + Secrets Manager"],[2800,2400,1200,2960]),
      dRow(["AWS_S3_BUCKET","aisuce-media-prod","Yes","S3 bucket for product images"],[2800,2400,1200,2960],T.LGREY),
      dRow(["AWS_ACCESS_KEY_ID","AKIA...","Yes (dev only)","IAM credentials; use instance role in prod"],[2800,2400,1200,2960]),
      dRow(["FIREBASE_PROJECT_ID","aisuce-prod","Yes","FCM push notifications"],[2800,2400,1200,2960],T.LGREY),
      dRow(["FIREBASE_CREDENTIALS","<base64 JSON>","Yes","Firebase service account credentials"],[2800,2400,1200,2960]),
      dRow(["OPENWEATHER_API_KEY","<key>","Yes","OpenWeatherMap API"],[2800,2400,1200,2960],T.LGREY),
      dRow(["COMMODITY_PRICE_API_URL","https://api.example.com/v1","Yes","Agric commodity price feed base URL"],[2800,2400,1200,2960]),
      dRow(["AI_SERVICE_URL","http://ai-service:8001","Yes","Python AI microservices base URL"],[2800,2400,1200,2960],T.LGREY),
      dRow(["TERMII_API_KEY","<key>","Yes","SMS / OTP provider (Nigerian numbers)"],[2800,2400,1200,2960]),
      dRow(["PLATFORM_WALLET_ID","<UUID>","Yes","ID of the platform revenue wallet"],[2800,2400,1200,2960],T.LGREY),
    ],[2800,2400,1200,2960]),
    Sp(),

    // ── 10. TESTING ───────────────────────────────────────────
    Br(),
    H1("10. Testing Strategy"),
    tbl([
      hRow(["Test Type","Framework","Coverage Target","What to test"],[2000,2400,2000,2960]),
      dRow(["Unit","Jest / Vitest",">80% per service","Service methods in isolation with mocked repositories and external services"],[2000,2400,2000,2960],T.LGREY),
      dRow(["Integration","Jest + NestJS Testing Module","Key flows","Controller → Service → TypeORM with in-memory SQLite or test Postgres"],[2000,2400,2000,2960]),
      dRow(["E2E","Jest + Supertest","Critical paths","Auth flow, order flow, wallet transfer flow — against real test DB"],[2000,2400,2000,2960],T.LGREY),
      dRow(["Load","Artillery or k6","—","Simulate 500 concurrent buyers; wallet endpoint must handle 100 TPS"],[2000,2400,2000,2960]),
    ],[2000,2400,2000,2960]),
    Sp(),
    callout("Must-test Paths",
      "Priority E2E test cases: (1) Registration → PIN setup → Login → Add to cart → Checkout → Wallet deducted → Order placed. (2) Wallet transfer: sender balance decreases, receiver increases, 10% fee route. (3) Farmer uploads product → appears in buyer product list. (4) Order status change → WebSocket event received by buyer client. (5) Idempotency: duplicate wallet transfer returns same response, no double debit."),
    Sp(),

    new Paragraph({
      alignment:AlignmentType.CENTER, spacing:{before:600,after:0},
      children:[new TextRun({ text:"— End of Backend Technical Architecture Document —", font:"Arial", size:20, color:T.MGREY, italics:true })]
    }),
  ];

  return docConfig(children, "AI-SUCE — Backend Technical Architecture");
}


// ─── WRITE BOTH DOCS ─────────────────────────────────────────
async function main() {
  const ds   = buildDesignSystem();
  const be   = buildBackendArch();

  const dsBuf = await Packer.toBuffer(ds);
  fs.writeFileSync('/mnt/user-data/outputs/AISUCE_05_Design_System.docx', dsBuf);
  console.log('✓ AISUCE_05_Design_System.docx');

  const beBuf = await Packer.toBuffer(be);
  fs.writeFileSync('/mnt/user-data/outputs/AISUCE_06_Backend_Architecture.docx', beBuf);
  console.log('✓ AISUCE_06_Backend_Architecture.docx');
}
main().catch(console.error);
