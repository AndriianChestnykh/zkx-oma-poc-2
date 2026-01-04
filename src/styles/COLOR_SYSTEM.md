# Color System Documentation

This document describes the two-theme color system implemented in the ZKX OMA POC application.

## Overview

The application supports two color schemes:
1. **Light Theme** - Clean, bright theme with white backgrounds
2. **Dark Theme** - Deep navy theme matching the reference screenshot

Themes can be switched via:
- **System Preference** - Automatically follows OS dark mode setting
- **Manual Toggle** - Theme toggle button in the header (overrides system preference)

## Theme Implementation

### CSS Variables

All colors are defined as CSS variables in `src/app/globals.css`:

```css
:root { /* Light theme defaults */ }
@media (prefers-color-scheme: dark) { /* Dark theme */ }
.theme-light { /* Explicit light theme class */ }
.theme-dark { /* Explicit dark theme class */ }
```

### Tailwind Integration

Colors are exposed as Tailwind utilities via `tailwind.config.ts`:

```typescript
colors: {
  background: "var(--background)",
  surface: { /* ... */ },
  primary: { /* ... */ },
  accent: { /* ... */ },
  text: { /* ... */ },
  border: { /* ... */ },
  status: { /* ... */ },
}
```

## Color Categories

### Base Colors

| Variable | Usage | Example |
|----------|-------|---------|
| `background` | Page background | `bg-background` |
| `foreground` | Default text color | `text-foreground` |

### Surface Colors

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `surface` | `#f8fafc` | `#0f172a` | Main content areas |
| `surface-elevated` | `#ffffff` | `#1e293b` | Cards, panels, headers |
| `surface-border` | `#e2e8f0` | `#334155` | Surface borders |

**Examples:**
```jsx
<div className="bg-surface">Main content</div>
<div className="bg-surface-elevated border border-surface-border">Card</div>
```

### Primary Colors (Blue)

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `primary` | `#3b82f6` | `#3b82f6` | Primary actions |
| `primary-hover` | `#2563eb` | `#60a5fa` | Hover states |
| `primary-light` | `#93c5fd` | `#93c5fd` | Backgrounds |
| `primary-dark` | `#1e40af` | `#1e40af` | Text emphasis |

**Examples:**
```jsx
<button className="bg-primary hover:bg-primary-hover text-text-on-primary">
  Action
</button>
<div className="bg-primary-light text-primary-dark">Info banner</div>
```

### Accent Colors

#### Purple
| Variable | Light | Dark |
|----------|-------|------|
| `accent-purple` | `#8b5cf6` | `#a78bfa` |
| `accent-purple-light` | `#c4b5fd` | `#c4b5fd` |

**Examples:**
```jsx
<span className="text-accent-purple">Purple text</span>
<div className="bg-accent-purple-light">Purple background</div>
```

#### Orange
| Variable | Light | Dark |
|----------|-------|------|
| `accent-orange` | `#f97316` | `#fb923c` |
| `accent-orange-light` | `#fdba74` | `#fdba74` |

**Examples:**
```jsx
<button className="bg-accent-orange hover:bg-accent-orange-light">
  Warning
</button>
```

#### Green
| Variable | Light | Dark |
|----------|-------|------|
| `accent-green` | `#22c55e` | `#4ade80` |
| `accent-green-light` | `#86efac` | `#86efac` |

**Examples:**
```jsx
<div className="text-accent-green">Success!</div>
```

#### Red
| Variable | Light | Dark |
|----------|-------|------|
| `accent-red` | `#ef4444` | `#f87171` |
| `accent-red-light` | `#fca5a5` | `#fca5a5` |

**Examples:**
```jsx
<div className="text-accent-red">Error message</div>
```

### Text Colors

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `text-primary` | `#1a1a1a` | `#f1f5f9` | Headlines, primary text |
| `text-secondary` | `#64748b` | `#cbd5e1` | Body text, labels |
| `text-tertiary` | `#94a3b8` | `#94a3b8` | Hints, captions |
| `text-on-primary` | `#ffffff` | `#ffffff` | Text on primary color |

**Examples:**
```jsx
<h1 className="text-text-primary">Main Heading</h1>
<p className="text-text-secondary">Descriptive text</p>
<span className="text-text-tertiary">Caption</span>
```

### Border & Divider

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `border` | `#e2e8f0` | `#334155` | Default borders |
| `border-hover` | `#cbd5e1` | `#475569` | Border hover states |
| `divider` | `#f1f5f9` | `#1e293b` | Section dividers |

**Examples:**
```jsx
<div className="border border-border hover:border-border-hover">
  Interactive card
</div>
<hr className="border-divider" />
```

### Status Colors

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `status-success` | `#22c55e` | `#4ade80` | Success states |
| `status-warning` | `#f59e0b` | `#fbbf24` | Warning states |
| `status-error` | `#ef4444` | `#f87171` | Error states |
| `status-info` | `#3b82f6` | `#60a5fa` | Info states |

**Examples:**
```jsx
<div className="bg-status-success text-white">Success!</div>
<div className="bg-status-error text-white">Error occurred</div>
```

## Special Effects

### Glow Effects

Matching the screenshot's glowing borders:

```jsx
// Box shadow glows
<div className="shadow-glow-primary">Primary glow</div>
<div className="shadow-glow-purple">Purple glow</div>
<div className="shadow-glow-orange">Orange glow</div>

// Border glows (utility classes in globals.css)
<div className="border-2 glow-border-primary">Glowing border</div>
<div className="border-2 glow-border-purple">Purple glowing border</div>
```

## Common Patterns

### Card Components

```jsx
<div className="bg-surface-elevated border border-border rounded-lg p-6 shadow-sm">
  <h3 className="text-text-primary text-lg font-semibold mb-2">
    Card Title
  </h3>
  <p className="text-text-secondary">
    Card content goes here
  </p>
</div>
```

### Button Variants

```jsx
// Primary button
<button className="bg-primary hover:bg-primary-hover text-text-on-primary px-4 py-2 rounded">
  Primary Action
</button>

// Secondary button
<button className="bg-surface-elevated hover:bg-surface border border-border text-text-primary px-4 py-2 rounded">
  Secondary Action
</button>

// Accent button
<button className="bg-accent-purple hover:bg-accent-purple-light text-white px-4 py-2 rounded">
  Accent Action
</button>
```

### Status Badges

```jsx
// Success badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-status-success text-white">
  Success
</span>

// Warning badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-status-warning text-white">
  Warning
</span>

// Error badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-status-error text-white">
  Error
</span>
```

### Forms

```jsx
<input
  type="text"
  className="w-full px-4 py-2 border border-border rounded-lg bg-surface-elevated text-text-primary placeholder-text-tertiary focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 outline-none transition-colors"
  placeholder="Enter text..."
/>
```

### Navigation Links

```jsx
<a
  href="/page"
  className="text-text-secondary hover:text-text-primary transition-colors"
>
  Link Text
</a>
```

## Theme Toggle Component

The `ThemeToggle` component (`src/components/ui/ThemeToggle.tsx`) provides three options:

1. **Light** - Force light theme
2. **Dark** - Force dark theme
3. **System** - Follow OS preference (default)

User preference is saved to `localStorage` and persists across sessions.

## Best Practices

1. **Always use CSS variables** - Never hardcode colors
2. **Use semantic names** - Use `bg-surface` instead of `bg-gray-100`
3. **Test both themes** - Always verify components in both light and dark mode
4. **Maintain consistency** - Use the same color for the same purpose throughout the app
5. **Accessible contrast** - Ensure text has sufficient contrast in both themes

## Migration Guide

To update existing components to use the new color system:

### Before:
```jsx
<div className="bg-white border-gray-200 text-gray-900">
  <p className="text-gray-500">Text</p>
</div>
```

### After:
```jsx
<div className="bg-surface-elevated border-border text-text-primary">
  <p className="text-text-secondary">Text</p>
</div>
```

## Reference

- **Light theme colors**: Defined in `:root` in `globals.css`
- **Dark theme colors**: Defined in `@media (prefers-color-scheme: dark)` and `.theme-dark` in `globals.css`
- **Tailwind config**: `tailwind.config.ts`
- **Theme toggle**: `src/components/ui/ThemeToggle.tsx`
- **Screenshot reference**: `Screenshot.png` (dark theme design)