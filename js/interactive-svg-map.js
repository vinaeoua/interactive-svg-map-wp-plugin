/**
 * Interactive SVG Map JavaScript
 * Version: 1.0.0
 * Author: vinnydeboasse
 * GitHub: https://github.com/vinnydeboasse/interactive-svg-map-wp-plugin
 */

jQuery(document).ready(function ($) {
    'use strict';

    // Configuration
    const config = {
        selectors: {
            container: '#svg-map-container',
            infoBox: '#region-info-box',
            regionList: '#region-list',
            regionName: '#region-name',
            regionDetails: '#region-details'
        },
        classes: {
            regionPath: 'region-path',
            highlighted: 'region-highlighted',
            active: 'active',
            loading: 'loading',
            error: 'error',
            visible: 'visible'
        },
        data: {
            nameField: 'Name',
            idField: 'ID',
            fallbackFields: ['Town Name', 'City', 'Region', 'Area']
        },
        animation: {
            duration: 300,
            easing: 'ease'
        }
    };

    // Main application object
    const InteractiveSVGMap = {
        
        // Application state
        state: {
            mapData: null,
            svgLoaded: false,
            currentRegion: null,
            isInitialized: false
        },

        /**
         * Initialize the interactive map
         */
        init: function() {
            console.log('🚀 Initializing Interactive SVG Map...');
            
            // Check if required data is available
            if (typeof window.interactiveSvgMapData === 'undefined') {
                console.error('❌ Map configuration not found');
                this.showError('Map configuration not found. Please check plugin settings.');
                return;
            }

            const { svgUrl, jsonUrl } = window.interactiveSvgMapData;
            
            if (!svgUrl || !jsonUrl) {
                console.error('❌ SVG or JSON URL not configured');
                this.showError('Map files not configured. Please check plugin settings.');
                return;
            }

            // Show loading state
            this.showLoading();

            // Load data and SVG
            this.loadMapData(jsonUrl)
                .then(() => this.loadSVG(svgUrl))
                .then(() => this.processMap())
                .then(() => this.bindEvents())
                .then(() => {
                    this.state.isInitialized = true;
                    console.log('✅ Interactive SVG Map initialized successfully');
                })
                .catch(error => {
                    console.error('❌ Map initialization failed:', error);
                    this.showError('Failed to load map. Please try again later.');
                });
        },

        /**
         * Load JSON data
         */
        loadMapData: function(jsonUrl) {
            return new Promise((resolve, reject) => {
                $.getJSON(jsonUrl)
                    .done(data => {
                        console.log('✅ JSON data loaded:', data.length, 'regions');
                        this.state.mapData = data;
                        resolve(data);
                    })
                    .fail((jqXHR, textStatus, errorThrown) => {
                        console.error('❌ Failed to load JSON:', textStatus, errorThrown);
                        reject(new Error(`Failed to load map data: ${textStatus}`));
                    });
            });
        },

        /**
         * Load SVG file
         */
        loadSVG: function(svgUrl) {
            return new Promise((resolve, reject) => {
                const $container = $(config.selectors.container);
                
                $container.load(svgUrl, (response, status, xhr) => {
                    if (status === 'error') {
                        console.error('❌ Failed to load SVG:', xhr.statusText);
                        reject(new Error(`Failed to load SVG: ${xhr.statusText}`));
                        return;
                    }

                    console.log('✅ SVG loaded successfully');
                    this.state.svgLoaded = true;
                    this.optimizeSVG();
                    resolve();
                });
            });
        },

        /**
         * Optimize SVG for responsive display
         */
        optimizeSVG: function() {
            const $svg = $(config.selectors.container + ' svg');
            
            if ($svg.length === 0) {
                console.warn('⚠️ No SVG element found');
                return;
            }

            // Set responsive viewBox if not present
            if (!$svg.attr('viewBox')) {
                const width = $svg.attr('width') || $svg.width() || 800;
                const height = $svg.attr('height') || $svg.height() || 600;
                $svg.attr('viewBox', `0 0 ${width} ${height}`);
                console.log('📐 ViewBox set:', `0 0 ${width} ${height}`);
            }

            // Make SVG responsive
            $svg.attr({
                'width': '100%',
                'height': 'auto'
            });

            // Remove any namespace issues
            $svg.find('*').each(function() {
                if (this.tagName && this.tagName.includes(':')) {
                    const newTagName = this.tagName.split(':').pop();
                    const $newElement = $(`<${newTagName}>`).attr(this.attributes);
                    $newElement.html($(this).html());
                    $(this).replaceWith($newElement);
                }
            });
        },

        /**
         * Process the loaded map and data
         */
        processMap: function() {
            return new Promise((resolve) => {
                const processedRegions = [];
                const $paths = $(config.selectors.container + ' path, ' + 
                               config.selectors.container + ' polygon, ' + 
                               config.selectors.container + ' g[id]');

                console.log(`🔍 Found ${$paths.length} potential interactive elements`);

                $paths.each((index, element) => {
                    const $element = $(element);
                    const elementId = $element.attr('id');
                    
                    if (!elementId) return;

                    // Find matching data
                    const regionData = this.findRegionData(elementId);
                    
                    if (regionData) {
                        // Add interactive class
                        $element.addClass(config.classes.regionPath);
                        
                        // Store data
                        $element.data('region-data', regionData);
                        $element.attr('data-region-name', this.getRegionName(regionData));
                        
                        // Make focusable for accessibility
                        $element.attr('tabindex', '0');
                        $element.attr('role', 'button');
                        $element.attr('aria-label', `View information for ${this.getRegionName(regionData)}`);
                        
                        processedRegions.push(regionData);
                        
                        console.log(`✅ Processed region: ${this.getRegionName(regionData)}`);
                    }
                });

                console.log(`✅ Processed ${processedRegions.length} interactive regions`);
                
                // Build region list
                this.buildRegionList(processedRegions);
                
                // Hide loading state
                this.hideLoading();
                
                resolve(processedRegions);
            });
        },

        /**
         * Find region data by element ID
         */
        findRegionData: function(elementId) {
            if (!this.state.mapData) return null;

            // Direct ID match
            let match = this.state.mapData.find(item => {
                const id = item[config.data.idField];
                return id && id.toLowerCase() === elementId.toLowerCase();
            });

            if (match) return match;

            // Name-based matching
            match = this.state.mapData.find(item => {
                const name = this.getRegionName(item);
                return name && name.toLowerCase().replace(/\s+/g, '') === elementId.toLowerCase().replace(/\s+/g, '');
            });

            if (match) return match;

            // Partial matching
            match = this.state.mapData.find(item => {
                const name = this.getRegionName(item);
                if (!name) return false;
                
                const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanId = elementId.toLowerCase().replace(/[^a-z0-9]/g, '');
                
                return cleanName.includes(cleanId) || cleanId.includes(cleanName);
            });

            return match || null;
        },

        /**
         * Get region name from data object
         */
        getRegionName: function(regionData) {
            // Try primary name field
            if (regionData[config.data.nameField]) {
                return regionData[config.data.nameField];
            }

            // Try fallback fields
            for (const field of config.data.fallbackFields) {
                if (regionData[field]) {
                    return regionData[field];
                }
            }

            // Use first non-ID field as fallback
            for (const key in regionData) {
                if (key !== config.data.idField && regionData[key]) {
                    return regionData[key];
                }
            }

            return 'Unknown Region';
        },

        /**
         * Build the region list
         */
        buildRegionList: function(regions) {
            const $list = $(config.selectors.regionList);
            if ($list.length === 0) return;

            // Sort regions alphabetically
            const sortedRegions = regions.sort((a, b) => {
                const nameA = this.getRegionName(a).toLowerCase();
                const nameB = this.getRegionName(b).toLowerCase();
                return nameA.localeCompare(nameB);
            });

            // Clear existing list
            $list.empty();

            // Add regions to list
            sortedRegions.forEach(regionData => {
                const regionName = this.getRegionName(regionData);
                const $listItem = $('<li>')
                    .text(regionName)
                    .data('region-data', regionData)
                    .attr('tabindex', '0')
                    .attr('role', 'button')
                    .attr('aria-label', `Highlight ${regionName}`);

                $list.append($listItem);
            });

            console.log(`📋 Built region list with ${sortedRegions.length} items`);
        },

        /**
         * Bind event handlers
         */
        bindEvents: function() {
            return new Promise((resolve) => {
                const $container = $(config.selectors.container);

                // Region path events
                $container.on('mouseenter', `.${config.classes.regionPath}`, (e) => {
                    this.handleRegionHover($(e.currentTarget), true);
                });

                $container.on('mouseleave', `.${config.classes.regionPath}`, (e) => {
                    this.handleRegionHover($(e.currentTarget), false);
                });

                $container.on('click', `.${config.classes.regionPath}`, (e) => {
                    this.handleRegionClick($(e.currentTarget));
                });

                $container.on('keydown', `.${config.classes.regionPath}`, (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleRegionClick($(e.currentTarget));
                    }
                });

                // Region list events
                $(config.selectors.regionList).on('mouseenter', 'li', (e) => {
                    const regionData = $(e.currentTarget).data('region-data');
                    this.highlightRegionByData(regionData, true);
                });

                $(config.selectors.regionList).on('mouseleave', 'li', () => {
                    this.clearHighlights();
                });

                $(config.selectors.regionList).on('click', 'li', (e) => {
                    const regionData = $(e.currentTarget).data('region-data');
                    this.handleRegionClickByData(regionData);
                });

                $(config.selectors.regionList).on('keydown', 'li', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const regionData = $(e.currentTarget).data('region-data');
                        this.handleRegionClickByData(regionData);
                    }
                });

                // Mouse movement for tooltip positioning
                $(document).on('mousemove', (e) => {
                    this.updateTooltipPosition(e.pageX, e.pageY);
                });

                // Hide tooltip when clicking outside
                $(document).on('click', (e) => {
                    if (!$(e.target).closest(config.selectors.infoBox).length && 
                        !$(e.target).hasClass(config.classes.regionPath)) {
                        this.hideTooltip();
                    }
                });

                console.log('🔗 Event handlers bound successfully');
                resolve();
            });
        },

        /**
         * Handle region hover
         */
        handleRegionHover: function($element, isEntering) {
            const regionData = $element.data('region-data');
            
            if (isEntering) {
                this.highlightRegion($element, true);
                this.showTooltip(regionData);
                this.highlightListItem(regionData, true);
            } else {
                this.highlightRegion($element, false);
                this.hideTooltip();
                this.highlightListItem(regionData, false);
            }
        },

        /**
         * Handle region click
         */
        handleRegionClick: function($element) {
            const regionData = $element.data('region-data');
            this.handleRegionClickByData(regionData);
        },

        /**
         * Handle region click by data
         */
        handleRegionClickByData: function(regionData) {
            if (!regionData) return;

            console.log('🖱️ Region clicked:', this.getRegionName(regionData));
            
            // You can customize this behavior
            // For example, navigate to a detail page:
            // window.location.href = `/region/${this.getRegionName(regionData).toLowerCase().replace(/\s+/g, '-')}`;
            
            // Or trigger a custom event
            $(document).trigger('regionClicked', [regionData]);
        },

        /**
         * Highlight region
         */
        highlightRegion: function($element, highlight) {
            if (highlight) {
                $element.addClass(config.classes.highlighted);
            } else {
                $element.removeClass(config.classes.highlighted);
            }
        },

        /**
         * Highlight region by data
         */
        highlightRegionByData: function(regionData, highlight) {
            const regionName = this.getRegionName(regionData);
            const $element = $(`.${config.classes.regionPath}[data-region-name="${regionName}"]`);
            this.highlightRegion($element, highlight);
        },

        /**
         * Clear all highlights
         */
        clearHighlights: function() {
            $(`.${config.classes.highlighted}`).removeClass(config.classes.highlighted);
            $(config.selectors.regionList + ' li').removeClass(config.classes.active);
        },

        /**
         * Highlight list item
         */
        highlightListItem: function(regionData, highlight) {
            const regionName = this.getRegionName(regionData);
            const $listItem = $(config.selectors.regionList + ' li').filter(function() {
                return $(this).text() === regionName;
            });

            if (highlight) {
                $listItem.addClass(config.classes.active);
            } else {
                $listItem.removeClass(config.classes.active);
            }
        },

        /**
         * Show tooltip
         */
        showTooltip: function(regionData) {
            if (!regionData) return;

            const $tooltip = $(config.selectors.infoBox);
            const $name = $(config.selectors.regionName);
            const $details = $(config.selectors.regionDetails);

            // Set region name
            $name.text(this.getRegionName(regionData));

            // Build details HTML
            let detailsHtml = '';
            for (const key in regionData) {
                if (key !== config.data.nameField && key !== config.data.idField && regionData[key]) {
                    detailsHtml += `<p><strong>${this.formatFieldName(key)}:</strong> ${regionData[key]}</p>`;
                }
            }

            $details.html(detailsHtml || '<p>No additional information available</p>');
            
            // Show tooltip
            $tooltip.addClass(config.classes.visible);
        },

        /**
         * Hide tooltip
         */
        hideTooltip: function() {
            $(config.selectors.infoBox).removeClass(config.classes.visible);
        },

        /**
         * Update tooltip position
         */
        updateTooltipPosition: function(x, y) {
            const $tooltip = $(config.selectors.infoBox);
            
            if ($tooltip.hasClass(config.classes.visible)) {
                const offset = 20;
                const tooltipWidth = $tooltip.outerWidth();
                const tooltipHeight = $tooltip.outerHeight();
                const windowWidth = $(window).width();
                const windowHeight = $(window).height();

                // Adjust position to keep tooltip in viewport
                let left = x + offset;
                let top = y + offset;

                if (left + tooltipWidth > windowWidth) {
                    left = x - tooltipWidth - offset;
                }

                if (top + tooltipHeight > windowHeight) {
                    top = y - tooltipHeight - offset;
                }

                $tooltip.css({
                    left: Math.max(10, left) + 'px',
                    top: Math.max(10, top) + 'px'
                });
            }
        },

        /**
         * Format field name for display
         */
        formatFieldName: function(fieldName) {
            return fieldName
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
        },

        /**
         * Show loading state
         */
        showLoading: function() {
            $(config.selectors.container).html('<div class="' + config.classes.loading + '">Loading map...</div>');
        },

        /**
         * Hide loading state
         */
        hideLoading: function() {
            $(config.selectors.container + ' .' + config.classes.loading).remove();
        },

        /**
         * Show error message
         */
        showError: function(message) {
            $(config.selectors.container).html(`<div class="${config.classes.error}">${message}</div>`);
        }
    };

    // Initialize the map when DOM is ready
    InteractiveSVGMap.init();

    // Expose to global scope for external access
    window.InteractiveSVGMap = InteractiveSVGMap;
});
