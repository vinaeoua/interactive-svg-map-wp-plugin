# Interactive SVG Map WordPress Plugin

A flexible WordPress plugin that creates interactive SVG maps with hover effects, tooltips, and clickable regions. Perfect for displaying geographical data, floor plans, or any SVG-based interactive content.

## Features

- 🗺️ **Interactive SVG Maps** - Convert any SVG into an interactive map
- 🎯 **Hover Effects** - Smooth hover animations and highlighting
- 📊 **Data Integration** - Connect SVG elements to JSON data
- 📱 **Responsive Design** - Mobile-friendly and responsive
- 🎨 **Customizable Styling** - Easy CSS customization
- 📝 **Information Tooltips** - Display detailed information on hover
- 📋 **Sortable Lists** - Auto-generated alphabetical lists
- ⚙️ **Admin Interface** - Easy setup through WordPress admin

## Demo

This plugin includes a Massachusetts towns map as an example, but can be adapted for any SVG map with corresponding data.

## Installation

### Method 1: Upload Plugin Files

1. Download or clone this repository
2. Upload the plugin folder to `/wp-content/plugins/`
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Configure the plugin settings (see Configuration section)

### Method 2: GitHub Clone

```bash
cd /path/to/wordpress/wp-content/plugins/
git clone https://github.com/vinnydeboasse/interactive-svg-map-wp-plugin.git
```

## Configuration

### 1. Plugin Settings

1. Go to WordPress Admin → **Interactive SVG Map**
2. Upload or set the URL for your SVG file
3. Upload your JSON data file to `/wp-content/uploads/svg/map_data.json`
4. Save settings

### 2. Prepare Your Data

#### SVG Requirements
- SVG elements should have unique `id` attributes
- For best results, use `<path>`, `<polygon>`, or `<g>` elements for interactive regions
- Example SVG: [Wikimedia Commons MA Cities/Towns](https://commons.wikimedia.org/wiki/File:MA_cities_towns.svg)

#### JSON Data Format
Your JSON should be an array of objects with at least these fields:
```json
[
  {
    "Name": "Region Name",
    "ID": "svg_element_id",
    "Population": "50000",
    "Area": "25.5 sq mi",
    "Custom Field": "Any additional data"
  }
]
```

### 3. Display the Map

Use the shortcode `[interactive_svg_map]` on any page or post:

```
[interactive_svg_map]
```

## Customization

### CSS Styling

The plugin includes default styles, but you can customize them by adding CSS to your theme:

```css
/* Default region styling */
.region-path {
    fill: #e5e5e5;
    stroke: #fff;
    stroke-width: 0.5px;
    transition: fill 0.3s ease;
    cursor: pointer;
}

/* Hover effect */
.region-path:hover {
    fill: #66a3ff;
}

/* Highlighted state */
.region-highlighted {
    fill: #ff6347 !important;
    stroke: #222 !important;
    stroke-width: 2px !important;
}

/* Info tooltip */
#region-info-box {
    background: white;
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    max-width: 300px;
}
```

### JavaScript Customization

You can extend the functionality by modifying the JavaScript file or adding custom scripts:

```javascript
// Example: Add click handlers
jQuery(document).ready(function($) {
    $('.region-path').on('click', function() {
        var regionName = $(this).attr('data-region');
        // Custom click behavior
        window.location.href = '/region/' + regionName.toLowerCase();
    });
});
```

## File Structure

```
interactive-svg-map/
├── css/
│   └── interactive-svg-map.css
├── js/
│   └── interactive-svg-map.js
├── examples/
│   ├── ma_towns_data.json
│   └── README.md
├── interactive-svg-map.php
├── README.md
└── LICENSE
```

## Configuration Examples

### Example 1: Massachusetts Towns Map

```json
[
  {
    "Town Name": "Boston",
    "Population": "685094",
    "County": "Suffolk",
    "Area": "89.6 sq mi",
    "Incorporated": "1630"
  },
  {
    "Town Name": "Plymouth",
    "Population": "61217",
    "County": "Plymouth", 
    "Area": "134.0 sq mi",
    "Incorporated": "1620"
  }
]
```

### Example 2: Floor Plan

```json
[
  {
    "Room Name": "Conference Room A",
    "Capacity": "12",
    "Equipment": "Projector, Whiteboard",
    "Area": "300 sq ft"
  },
  {
    "Room Name": "Office 101",
    "Occupant": "John Smith",
    "Department": "Marketing",
    "Area": "120 sq ft"
  }
]
```

## Shortcode Parameters

The plugin supports several shortcode parameters for customization:

```
[interactive_svg_map 
    width="100%" 
    height="600px" 
    show_list="true" 
    info_position="follow"]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `width` | `100%` | Map container width |
| `height` | `auto` | Map container height |
| `show_list` | `true` | Show/hide the region list |
| `info_position` | `follow` | Tooltip position (`follow`, `fixed`, `bottom`) |

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Internet Explorer 11+ (limited support)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Map not displaying:**
- Check that the SVG URL is accessible
- Verify JSON file is properly formatted
- Check browser console for JavaScript errors

**Hover effects not working:**
- Ensure SVG elements have proper `id` attributes
- Verify JSON data matches SVG element IDs
- Check that CSS is properly loaded

**Responsive issues:**
- SVG should have a proper `viewBox` attribute
- Container should have responsive CSS

### Debug Mode

Add this to your `wp-config.php` for debugging:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Performance

- SVG files should be optimized (use tools like SVGO)
- Large datasets (>1000 regions) may impact performance
- Consider using lazy loading for very large maps

## License

This project is licensed under the GPL v2 or later - see the [LICENSE](LICENSE) file for details.

## Changelog

### Version 1.0.0
- Initial release
- Basic interactive map functionality
- WordPress admin integration
- Responsive design
- Hover effects and tooltips

## Support

- Create an issue on [GitHub](https://github.com/vinnydeboasse/interactive-svg-map-wp-plugin/issues)
- Check the [Wiki](https://github.com/vinnydeboasse/interactive-svg-map-wp-plugin/wiki) for detailed documentation

## Credits

- Example SVG map from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:MA_cities_towns.svg)
- Built with WordPress standards and best practices
- Inspired by various interactive mapping solutions

---

**Author:** [vinnydeboasse](https://github.com/vinnydeboasse)  
**WordPress Plugin URI:** https://github.com/vinnydeboasse/interactive-svg-map-wp-plugin  
**Tags:** svg, interactive, map, wordpress, regions, tooltip
