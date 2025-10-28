# Layout Components

This directory contains reusable layout components that provide consistent page structures across the application.

## Components

### PageLayout
A basic page layout with optional title and back button.

**Props:**
- `title` (string, optional): Page title to display
- `backHref` (string, optional): URL for the back button
- `showBackButton` (boolean, default: true): Whether to show the back button
- `children` (ReactNode): Content to render inside the layout
- `className` (string, optional): Additional CSS classes

**Usage:**
```jsx
import { PageLayout } from '@/components/layout';

<PageLayout title="My Page" backHref="/home">
  <div>Page content here</div>
</PageLayout>
```

### MenuPageLayout
A page layout specifically designed for menu pages with a stack of buttons.

**Props:**
- Same as PageLayout, but automatically wraps children in a stack container

**Usage:**
```jsx
import { MenuPageLayout } from '@/components/layout';
import MenuButton from '@/components/MenuButton';

<MenuPageLayout title="Menu" backHref="/home">
  <MenuButton href="/option1">Option 1</MenuButton>
  <MenuButton href="/option2">Option 2</MenuButton>
</MenuPageLayout>
```

### HomePageLayout
A special layout for the home page with the three-part title structure.

**Props:**
- `children` (ReactNode): Menu buttons to render

**Usage:**
```jsx
import { HomePageLayout } from '@/components/layout';
import MenuButton from '@/components/MenuButton';

<HomePageLayout>
  <MenuButton href="/daily">Daily</MenuButton>
  <MenuButton href="/levels">Levels</MenuButton>
</HomePageLayout>
```

## Benefits

- **Consistency**: All pages follow the same visual structure
- **Maintainability**: Changes to layout can be made in one place
- **Reusability**: Components can be easily reused across different pages
- **Clean Code**: Pages are now much simpler and focused on their content
