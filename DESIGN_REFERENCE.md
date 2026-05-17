# MindLeaf Design Reference — Extracted from Stitch MCP
> Auto-generated from Stitch project "MindLeaf Desktop PDF Reader" (ID: 11467122467017950992)
> DO NOT EDIT MANUALLY — reflects exact Stitch design spec

---

## Design Theme: "Digital Sanctuary" — Liquid Glass Dark

### Color Tokens (exact hex values from Stitch)
```
Background:                 #050505  (near-black base — NOT #13131b)
Surface:                    #13131b
Surface-dim:                #13131b
Surface-bright:             #393841
Surface-container-lowest:   #0d0d15
Surface-container-low:      #1b1b23
Surface-container:          #1f1f27
Surface-container-high:     #292932
Surface-container-highest:  #34343d
On-surface:                 #e4e1ed
On-surface-variant:         #c7c4d7
Outline:                    #908fa0
Outline-variant:            #464554
Primary:                    #c0c1ff  (indigo tint)
Primary-container:          #8083ff
On-primary:                 #1000a9
Inverse-primary:            #494bd6
Secondary:                  #4fdbc8  (teal)
Secondary-container:        #04b4a2
On-secondary:               #003731
Tertiary:                   #ffb783  (warm amber)
Tertiary-container:         #d97721
Accent (core):              #6366f1  (indigo — primary action color)
Error:                      #ffb4ab
```

### Ambient Glows (critical to the look)
- **Bottom-left**: Deep indigo-purple radial gradient, large, low opacity (~15%)
  - `radial-gradient(ellipse at 0% 100%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)`
- **Top-right**: Soft teal radial gradient
  - `radial-gradient(ellipse at 100% 0%, rgba(79, 219, 200, 0.10) 0%, transparent 60%)`
- These are applied as `::before` / `::after` pseudo-elements on `<body>` or the root container.

### Glass Surface Rules (NON-NEGOTIABLE)
- `backdrop-filter: blur(24px)`
- `background: rgba(255, 255, 255, 0.06)`
- `border: 1px solid rgba(255, 255, 255, 0.12)`
- `border-radius: 24px`  (main panels)
- `box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15)`

### Elevated Glass (dropdowns, tooltips, popovers)
- `backdrop-filter: blur(40px)`
- `background: rgba(255, 255, 255, 0.10)`
- `border: 1px solid rgba(255, 255, 255, 0.15)`

---

## Typography — Inter Only
| Role         | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| display-lg   | 48px | 600    | 1.1         | -0.02em        |
| display-md   | 32px | 600    | 1.2         | -0.01em        |
| headline-lg  | 24px | 600    | 1.3         | -0.01em        |
| headline-sm  | 18px | 600    | 1.4         | 0              |
| body-lg      | 16px | 400    | 1.6         | 0              |
| body-md      | 14px | 400    | 1.5         | 0              |
| label-md     | 12px | 500    | 1           | 0.05em         |
| caption      | 11px | 400    | 1.2         | 0              |

Secondary text: `rgba(255, 255, 255, 0.6)`

---

## Layout — Three-Pane Desktop Architecture

### Left Navigation Rail
- Width: **240px** (fixed)
- Glass surface panel
- Logo: "MindLeaf" wordmark + "Digital Sanctuary" subtitle
- Nav items: Bookshelf, Reader, Insights, Statistics, Bookmarks, Settings, Help
- Active nav item: indigo accent (#6366f1), full-opacity icon
- Inactive nav item: icon at 70% white opacity

### Center (Primary Reading / Content Area)
- Fluid width
- Max-width: 900px, centered
- Page margins: 40px
- PDF viewer sits in a recessed viewport (inner shadow)

### Right Inspector Panel (contextual)
- Width: **280px** (optional)
- Shows: annotations, insights, bookmarks depending on context

---

## Component Spec

### Navigation Item
```
padding: 12px 16px
border-radius: 8px (list item highlight)
gap: 12px (icon + label)
icon size: 20px, stroke 1.5px
active: bg rgba(99,102,241,0.15), icon #6366f1
hover: bg rgba(255,255,255,0.06)
```

### Book Card (Bookshelf Grid)
```
border-radius: 16px
padding: 0 (image fills)
cover image: aspect-ratio 2/3
hover: scale(1.03), indigo shadow
title: headline-sm (white)
subtitle: label-md (rgba(255,255,255,0.6))
```

### Add Book Modal
```
backdrop: rgba(0,0,0,0.6)
modal panel: glass surface, border-radius: 24px, padding: 32px
drop zone: dashed border rgba(99,102,241,0.4), border-radius: 16px
```

### Annotation Popover
```
glass elevated, border-radius: 16px
color swatches: yellow, green, blue, pink, orange
action buttons: ghost style
```

### Insights Panel (Right)
```
header: "My Insights", count label
highlight items: glass-on-glass cards, left border colored stripe
note text: body-md
```

### Bookmarks Panel (Right)
```
book title header
bookmark items: page number + excerpt
```

### Reading Stats Screen
```
Stat cards in a grid (streak, pages, time)
Activity heatmap (color blocks per day)
Recently finished list with progress indicators
```

---

## Screens Inventory (from Stitch)
1. **Bookshelf (Refined)** — Library view, left sidebar nav, book grid
2. **PDF Reader** — Three-pane with content in center, left nav, right insights
3. **Add Book Modal** — Overlay modal with drag-drop zone
4. **Annotation Popover** — Context popup on text selection
5. **Insights Panel** — Right panel with all highlights
6. **Bookmarks Panel** — Right panel with bookmarks per book
7. **Reading Stats** — Full page stats with heatmap

---

## Spacing System (8px grid)
- unit: 8px
- page margin: 40px
- sidebar gutter: 24px
- card padding: 24px
- stack-sm: 8px | stack-md: 16px | stack-lg: 32px

## Shape / Radius
- panels / cards: 24px
- buttons / inputs / tags: 12–16px
- list item highlights: 8px
- full pill: 9999px
