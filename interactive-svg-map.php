<?php
/**
 * Plugin Name: Interactive SVG Map
 * Plugin URI: https://github.com/vinnydeboasse/interactive-svg-map-wp-plugin
 * Description: Create interactive SVG maps with hover effects, tooltips, and clickable regions. Perfect for geographical data, floor plans, or any SVG-based interactive content.
 * Version: 1.0.0
 * Author: vinnydeboasse
 * Author URI: https://github.com/vinnydeboasse
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: interactive-svg-map
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('INTERACTIVE_SVG_MAP_VERSION', '1.0.0');
define('INTERACTIVE_SVG_MAP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('INTERACTIVE_SVG_MAP_PLUGIN_PATH', plugin_dir_path(__FILE__));

/**
 * Main plugin class
 */
class InteractiveSVGMap {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    /**
     * Initialize the plugin
     */
    public function init() {
        // Hook into WordPress
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
        add_shortcode('interactive_svg_map', array($this, 'render_map_shortcode'));
        
        // Plugin activation hook
        register_activation_hook(__FILE__, array($this, 'activate'));
    }
    
    /**
     * Enqueue frontend styles and scripts
     */
    public function enqueue_assets() {
        wp_enqueue_script('jquery');
        
        wp_enqueue_style(
            'interactive-svg-map-styles',
            INTERACTIVE_SVG_MAP_PLUGIN_URL . 'css/interactive-svg-map.css',
            array(),
            INTERACTIVE_SVG_MAP_VERSION
        );
        
        wp_enqueue_script(
            'interactive-svg-map-script',
            INTERACTIVE_SVG_MAP_PLUGIN_URL . 'js/interactive-svg-map.js',
            array('jquery'),
            INTERACTIVE_SVG_MAP_VERSION,
            true
        );
        
        // Pass data to JavaScript
        wp_localize_script(
            'interactive-svg-map-script',
            'interactiveSvgMapData',
            array(
                'svgUrl' => get_option('interactive_svg_map_svg_url', 'https://commons.wikimedia.org/wiki/File:MA_cities_towns.svg'),
                'jsonUrl' => wp_upload_dir()['baseurl'] . '/svg/map_data.json',
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('interactive_svg_map_nonce')
            )
        );
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('Interactive SVG Map Settings', 'interactive-svg-map'),
            __('SVG Map', 'interactive-svg-map'),
            'manage_options',
            'interactive-svg-map-settings',
            array($this, 'admin_page'),
            'dashicons-location-alt',
            30
        );
    }
    
    /**
     * Enqueue admin scripts
     */
    public function admin_scripts($hook) {
        if ('toplevel_page_interactive-svg-map-settings' !== $hook) {
            return;
        }
        wp_enqueue_media();
    }
    
    /**
     * Admin settings page
     */
    public function admin_page() {
        // Handle form submission
        if (isset($_POST['submit_settings']) && wp_verify_nonce($_POST['_wpnonce'], 'interactive_svg_map_settings')) {
            if (isset($_POST['interactive_svg_map_svg_url'])) {
                update_option('interactive_svg_map_svg_url', esc_url_raw($_POST['interactive_svg_map_svg_url']));
                echo '<div class="notice notice-success"><p>' . __('Settings saved successfully!', 'interactive-svg-map') . '</p></div>';
            }
        }
        
        $svg_url = get_option('interactive_svg_map_svg_url', 'https://upload.wikimedia.org/wikipedia/commons/3/32/MA_cities_towns.svg');
        ?>
        <div class="wrap">
            <h1><?php _e('Interactive SVG Map Settings', 'interactive-svg-map'); ?></h1>
            
            <form method="post" action="">
                <?php wp_nonce_field('interactive_svg_map_settings'); ?>
                
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row"><?php _e('SVG Map File URL', 'interactive-svg-map'); ?></th>
                        <td>
                            <input type="url" 
                                   id="interactive_svg_map_svg_url" 
                                   name="interactive_svg_map_svg_url" 
                                   value="<?php echo esc_attr($svg_url); ?>" 
                                   class="regular-text" 
                                   placeholder="https://example.com/path/to/map.svg" />
                            <input type="button" 
                                   id="interactive_svg_map_upload_button" 
                                   class="button" 
                                   value="<?php _e('Upload SVG', 'interactive-svg-map'); ?>" />
                            <p class="description">
                                <?php _e('Enter the URL of your SVG map file or upload one. Default: Massachusetts cities/towns map from Wikimedia Commons.', 'interactive-svg-map'); ?>
                            </p>
                            
                            <?php if ($svg_url): ?>
                                <p><?php _e('Current SVG:', 'interactive-svg-map'); ?> 
                                   <a href="<?php echo esc_url($svg_url); ?>" target="_blank">
                                       <?php echo basename(parse_url($svg_url, PHP_URL_PATH)); ?>
                                   </a>
                                </p>
                            <?php endif; ?>
                        </td>
                    </tr>
                </table>
                
                <p class="submit">
                    <input type="submit" 
                           name="submit_settings" 
                           class="button-primary" 
                           value="<?php _e('Save Settings', 'interactive-svg-map'); ?>" />
                </p>
            </form>
            
            <hr>
            
            <h2><?php _e('Usage Instructions', 'interactive-svg-map'); ?></h2>
            
            <h3><?php _e('1. Setup Your Data', 'interactive-svg-map'); ?></h3>
            <p><?php _e('Upload your JSON data file to:', 'interactive-svg-map'); ?> 
               <code>/wp-content/uploads/svg/map_data.json</code></p>
            
            <details>
                <summary><?php _e('JSON Format Example', 'interactive-svg-map'); ?></summary>
                <pre><code>[
  {
    "Name": "Region Name",
    "ID": "svg_element_id", 
    "Population": "50000",
    "Area": "25.5 sq mi",
    "Description": "Additional information"
  },
  {
    "Name": "Another Region",
    "ID": "another_svg_id",
    "Population": "75000", 
    "Area": "40.2 sq mi",
    "Description": "More information"
  }
]</code></pre>
            </details>
            
            <h3><?php _e('2. Display the Map', 'interactive-svg-map'); ?></h3>
            <p><?php _e('Use this shortcode on any page or post:', 'interactive-svg-map'); ?></p>
            <code>[interactive_svg_map]</code>
            
            <h3><?php _e('3. Shortcode Parameters', 'interactive-svg-map'); ?></h3>
            <ul>
                <li><code>width</code> - <?php _e('Map width (default: 100%)', 'interactive-svg-map'); ?></li>
                <li><code>height</code> - <?php _e('Map height (default: auto)', 'interactive-svg-map'); ?></li>
                <li><code>show_list</code> - <?php _e('Show region list (default: true)', 'interactive-svg-map'); ?></li>
            </ul>
            
            <p><strong><?php _e('Example:', 'interactive-svg-map'); ?></strong> 
               <code>[interactive_svg_map width="800px" height="600px" show_list="false"]</code></p>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#interactive_svg_map_upload_button').click(function(e) {
                e.preventDefault();
                
                var custom_uploader = wp.media({
                    title: '<?php _e('Select SVG Map File', 'interactive-svg-map'); ?>',
                    button: {
                        text: '<?php _e('Use this file', 'interactive-svg-map'); ?>'
                    },
                    multiple: false,
                    library: {
                        type: 'image/svg+xml'
                    }
                }).on('select', function() {
                    var attachment = custom_uploader.state().get('selection').first().toJSON();
                    $('#interactive_svg_map_svg_url').val(attachment.url);
                }).open();
            });
        });
        </script>
        <?php
    }
    
    /**
     * Render the map shortcode
     */
    public function render_map_shortcode($atts) {
        $atts = shortcode_atts(array(
            'width' => '100%',
            'height' => 'auto',
            'show_list' => 'true'
        ), $atts, 'interactive_svg_map');
        
        $svg_url = get_option('interactive_svg_map_svg_url', 'https://upload.wikimedia.org/wikipedia/commons/3/32/MA_cities_towns.svg');
        $json_url = wp_upload_dir()['baseurl'] . '/svg/map_data.json';
        
        ob_start();
        ?>
        <div class="interactive-svg-map-container" style="width: <?php echo esc_attr($atts['width']); ?>;">
            <div id="svg-map-container" style="height: <?php echo esc_attr($atts['height']); ?>;">
                <!-- SVG will be loaded here -->
            </div>
            
            <div id="region-info-box" style="display: none;">
                <h3 id="region-name"></h3>
                <div id="region-details"></div>
            </div>
            
            <?php if ($atts['show_list'] === 'true'): ?>
            <div class="region-list-container">
                <h3><?php _e('Regions', 'interactive-svg-map'); ?></h3>
                <ul id="region-list"></ul>
            </div>
            <?php endif; ?>
        </div>
        
        <script type="text/javascript">
            // Pass URLs to the global scope for this instance
            window.interactiveSvgMapData = window.interactiveSvgMapData || {};
            window.interactiveSvgMapData.svgUrl = '<?php echo esc_js($svg_url); ?>';
            window.interactiveSvgMapData.jsonUrl = '<?php echo esc_js($json_url); ?>';
        </script>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Create necessary directories
        $upload_dir = wp_upload_dir();
        $svg_dir = $upload_dir['basedir'] . '/svg';
        
        if (!file_exists($svg_dir)) {
            wp_mkdir_p($svg_dir);
        }
        
        // Set default options
        add_option('interactive_svg_map_svg_url', 'https://upload.wikimedia.org/wikipedia/commons/3/32/MA_cities_towns.svg');
        
        // Create example JSON file if it doesn't exist
        $json_file = $svg_dir . '/map_data.json';
        if (!file_exists($json_file)) {
            $example_data = array(
                array(
                    'Name' => 'Boston',
                    'Population' => '685,094',
                    'Area' => '89.6 sq mi',
                    'County' => 'Suffolk',
                    'Incorporated' => '1630'
                ),
                array(
                    'Name' => 'Plymouth',
                    'Population' => '61,217', 
                    'Area' => '134.0 sq mi',
                    'County' => 'Plymouth',
                    'Incorporated' => '1620'
                )
            );
            
            file_put_contents($json_file, json_encode($example_data, JSON_PRETTY_PRINT));
        }
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
}

// Initialize the plugin
new InteractiveSVGMap();
