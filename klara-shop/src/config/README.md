# Branding Configuration System

This system allows you to easily customize the visual identity of the application through a JSON configuration file.

## Configuration File

The main branding configuration is stored in `branding.json`. This file contains all the visual elements that define your brand:

### Structure

```json
{
  "brandName": "your brand name",
  "typography": {
    "primaryFont": { /* Primary font settings */ },
    "headingFont": { /* Heading font settings */ },
    "brandFont": { /* Brand logo font settings */ }
  },
  "colors": {
    "primary": { /* Primary color palette */ },
    "secondary": { /* Secondary color palette */ },
    "accent": { /* Accent color palette */ },
    "background": { /* Background colors */ },
    "text": { /* Text colors */ }
  },
  "logo": {
    "type": "text", // or "image"
    "text": "brand text",
    "icon": "🌸", // emoji or icon
    "showIcon": true,
    "iconPosition": "left", // or "right"
    "style": { /* Logo styling */ }
  },
  "theme": {
    "borderRadius": "8px",
    "elevation": { /* Shadow definitions */ },
    "spacing": { /* Spacing system */ }
  },
  "header": { /* Header styling */ },
  "cards": { /* Card styling */ },
  "buttons": { /* Button styling */ }
}
```

## Usage

### 1. Using the BrandingContext

```tsx
import { useBranding } from '../contexts/BrandingContext';

function MyComponent() {
  const { branding, loading, error } = useBranding();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div style={{ color: branding?.colors.primary.main }}>
      {branding?.brandName}
    </div>
  );
}
```

### 2. Using the Themed Components

The system automatically applies branding to Material-UI components:

```tsx
import { Button, Card, Typography } from '@mui/material';

function MyComponent() {
  return (
    <>
      <Button variant="contained" color="primary">
        Primary Button (uses brand colors)
      </Button>
      <Card>
        Card with brand styling
      </Card>
      <Typography variant="h6">
        Typography with brand fonts
      </Typography>
    </>
  );
}
```

### 3. Using CSS Variables

CSS custom properties are automatically set:

```css
.my-element {
  background-color: var(--brand-primary);
  color: var(--brand-text-primary);
  font-family: var(--brand-font-family);
  border-radius: var(--brand-border-radius);
  box-shadow: var(--brand-elevation-medium);
}
```

### 4. Using Utility Classes

Pre-defined utility classes are available:

```tsx
<div className="brand-primary brand-heading-font">
  Styled with brand colors and fonts
</div>
```

Available utility classes:
- `.brand-primary`, `.brand-secondary`, `.brand-accent` - Text colors
- `.brand-bg-primary`, `.brand-bg-secondary`, `.brand-bg-paper` - Background colors
- `.brand-font`, `.brand-heading-font` - Typography
- And more...

## Customization

To customize the branding:

1. **Edit the JSON file**: Modify `src/config/branding.json`
2. **Reload the application**: The changes will be applied automatically
3. **Test different configurations**: You can create multiple JSON files for different brands

### Color Palette

Each color in the palette should include:
- `main`: Primary shade
- `light`: Lighter variant
- `dark`: Darker variant  
- `contrastText`: Text color that contrasts well with the main color

### Typography

Configure fonts by specifying:
- `family`: Font family name
- `fallbacks`: Array of fallback fonts
- `weight`: Font weight
- `style`: Font style (normal, italic)
- `transform`: Text transform (none, uppercase, lowercase, capitalize)

### Logo Configuration

Support both text and image logos:
- **Text logos**: Specify text, icon, and styling
- **Image logos**: Specify image URL and dimensions
- **Icons**: Can use emojis or icon font characters

## Advanced Usage

### Creating Theme Variants

You can create multiple branding configurations for different themes:

```
src/config/
├── branding.json (default)
├── branding-dark.json
├── branding-christmas.json
└── branding-minimal.json
```

### Dynamic Branding

The system supports loading different branding configurations at runtime:

```tsx
const { reloadBranding } = useBranding();

// Switch to different branding
await reloadBranding('/config/branding-dark.json');
```

### Integration with External Systems

The branding configuration can be loaded from:
- JSON files (default)
- API endpoints
- Environment variables
- Content Management Systems

## Troubleshooting

### Common Issues

1. **Fonts not loading**: Ensure font URLs are accessible and included in CSS
2. **Colors not applying**: Check that CSS variables are properly set
3. **Theme not updating**: Verify the JSON syntax and structure

### Debug Mode

Enable debug logging to troubleshoot branding issues:

```tsx
<BrandingProvider debug={true}>
  <App />
</BrandingProvider>
```

This will log branding loading events and configuration details to the console.