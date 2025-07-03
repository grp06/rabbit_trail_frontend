# Breadcrumb Components

I've created three beautiful breadcrumb variants that live on the right side of the UI with multicolored but chill styling. Each variant splits the UX into digestible phases with clean spacing.

## 🎨 Color Scheme

All variants use a soft, muted color palette that's "super chill and integrated":
- **Explore Phase**: Soft Teal (#7dd3c0)
- **Discover Phase**: Soft Purple (#a78bfa)  
- **Deep Dive Phase**: Soft Pink (#f9a8d4)
- **Synthesize Phase**: Soft Amber (#fbbf24)

## 📍 Variant 1: Vertical Dots (Breadcrumbs.tsx)

A minimalist vertical dot navigation that appears on the right side:
- Clean dot indicators that grow when active
- Subtle phase labels that appear vertically
- Smooth hover effects with color-matched glows
- Connectors between dots to show progression
- Active labels slide out horizontally

**Best for**: Clean, minimal interfaces where you want subtle navigation

## 📊 Variant 2: Horizontal Phases (HorizontalBreadcrumbs.tsx)

A phase-grouped horizontal layout with a progress bar:
- Groups breadcrumbs by phase (Explore, Discover, Deep Dive, Synthesize)
- Multicolored progress bar at the top showing journey completion
- Pill-shaped breadcrumb items with phase-based colors
- Items wrap within their phase groups
- Hover effects with subtle elevation

**Best for**: When you want to emphasize the different phases of exploration

## 🗺️ Variant 3: Floating Mini-Map (FloatingBreadcrumbs.tsx)

A sophisticated floating journey map in the bottom-right:
- Glass-morphism design with backdrop blur
- Phase progress indicators showing distribution
- Shows last 5 items with numbered steps
- Collapsible to save space
- Monospace step numbers for a technical feel

**Best for**: Power users who want a detailed journey overview

## 🚀 Usage

The breadcrumbs are already integrated into your main page. They track the user's journey through queries automatically. Each new query adds a breadcrumb item, and the phase is determined by the depth of exploration.

To switch between variants, simply change which component is imported in your page.tsx:

```tsx
// Choose one:
import Breadcrumbs from './components/Breadcrumbs'
import HorizontalBreadcrumbs from './components/HorizontalBreadcrumbs'  
import FloatingBreadcrumbs from './components/FloatingBreadcrumbs'
```

## 🎮 Demo

Visit `/breadcrumb-demo` to see all three variants in action and interact with them!

## 🎯 Features

All variants include:
- Multicolored phase-based styling
- Smooth animations and transitions
- Click to navigate to previous queries
- Responsive and accessible design
- Clean spacing and visual hierarchy
- Right-side positioning as requested