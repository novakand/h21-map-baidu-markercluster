/**
 * @fileoverview MarkerClusterer标记聚合器用来解决加载大量点要素到地图上产生覆盖现象的问题，并提高性能。
 * 主入口类是<a href="symbols/BMapLib.MarkerClusterer.html">MarkerClusterer</a>，
 * 基于Baidu Map API 1.2。
 *
 * @author Baidu Map Api Group 
 * @version 1.2
 */
 
 (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = { default: factory(), MarkerCluster: factory() } :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.BMapLib = global.BMapLib || {}, global.BMapLib.MarkerClusterer = factory());
}(this, (function () {
    'use strict';

    var __commonjs_global = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
    function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports, __commonjs_global), module.exports; }


    var index$1 = __commonjs(function (module, exports, global) {
        (function (root, factory) {
            if (typeof exports === 'object') {
                module.exports = factory();
            } else if (typeof define === 'function' && define.amd) {
                define(factory);
            } else {
                root.BMapLib = root.BMapLib || {};
                root.BMapLib.TextIconOverlay = root.BMapLib.TextIconOverlay || factory();
            }
        })(__commonjs_global, function () {
            var T,
                baidu = T = baidu || { version: "1.3.8" };
            var context = {};
            baidu.guid = "$BAIDU$";
            context[baidu.guid] = context[baidu.guid] || {};

            baidu.dom = baidu.dom || {};

            baidu.dom.g = function (id) {
                if ('string' == typeof id || id instanceof String) {
                    return document.getElementById(id);
                } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
                    return id;
                }
                return null;
            };

            baidu.g = baidu.G = baidu.dom.g;

            baidu.dom.getDocument = function (element) {
                element = baidu.dom.g(element);
                return element.nodeType == 9 ? element : element.ownerDocument || element.document;
            };

            baidu.lang = baidu.lang || {};
            baidu.lang.isString = function (source) {
                return '[object String]' == Object.prototype.toString.call(source);
            };

            baidu.isString = baidu.lang.isString;

            baidu.dom._g = function (id) {
                if (baidu.lang.isString(id)) {
                    return document.getElementById(id);
                }
                return id;
            };

            baidu._g = baidu.dom._g;
            baidu.browser = baidu.browser || {};

            if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
                baidu.browser.ie = baidu.ie = document.documentMode || + RegExp['\x241'];
            }

            baidu.dom.getComputedStyle = function (element, key) {
                element = baidu.dom._g(element);
                var doc = baidu.dom.getDocument(element),
                    styles;
                if (doc.defaultView && doc.defaultView.getComputedStyle) {
                    styles = doc.defaultView.getComputedStyle(element, null);
                    if (styles) {
                        return styles[key] || styles.getPropertyValue(key);
                    }
                }
                return '';
            };

            baidu.dom._styleFixer = baidu.dom._styleFixer || {};
            baidu.dom._styleFilter = baidu.dom._styleFilter || [];
            baidu.dom._styleFilter.filter = function (key, value, method) {
                for (var i = 0, filters = baidu.dom._styleFilter, filter; filter = filters[i]; i++) {
                    if (filter = filter[method]) {
                        value = filter(key, value);
                    }
                }
                return value;
            };

            baidu.string = baidu.string || {};

            baidu.string.toCamelCase = function (source) {
                if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
                    return source;
                }
                return source.replace(/[-_][^-_]/g, function (match) {
                    return match.charAt(1).toUpperCase();
                });
            };

            baidu.dom.getStyle = function (element, key) {
                var dom = baidu.dom;

                element = dom.g(element);
                key = baidu.string.toCamelCase(key);
                var value = element.style[key] ||
                    (element.currentStyle ? element.currentStyle[key] : "") ||
                    dom.getComputedStyle(element, key);
                if (!value) {
                    var fixer = dom._styleFixer[key];
                    if (fixer) {
                        value = fixer.get ? fixer.get(element) : baidu.dom.getStyle(element, fixer);
                    }
                }

                if (fixer = dom._styleFilter) {
                    value = fixer.filter(key, value, 'get');
                }

                return value;
            };

            baidu.getStyle = baidu.dom.getStyle;


            if (/opera\/(\d+\.\d)/i.test(navigator.userAgent)) {
                baidu.browser.opera = + RegExp['\x241'];
            }

            baidu.browser.isWebkit = /webkit/i.test(navigator.userAgent);
            baidu.browser.isGecko = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);
            baidu.browser.isStrict = document.compatMode == "CSS1Compat";

            baidu.dom.getPosition = function (element) {
                element = baidu.dom.g(element);
                var doc = baidu.dom.getDocument(element),
                    browser = baidu.browser,
                    getStyle = baidu.dom.getStyle,
                    BUGGY_GECKO_BOX_OBJECT = browser.isGecko > 0 &&
                        doc.getBoxObjectFor &&
                        getStyle(element, 'position') == 'absolute' &&
                        (element.style.top === '' || element.style.left === ''),
                    pos = { "left": 0, "top": 0 },
                    viewport = (browser.ie && !browser.isStrict) ? doc.body : doc.documentElement,
                    parent,
                    box;

                if (element == viewport) {
                    return pos;
                }

                if (element.getBoundingClientRect) {
                    box = element.getBoundingClientRect();

                    pos.left = Math.floor(box.left) + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
                    pos.top = Math.floor(box.top) + Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
                    pos.left -= doc.documentElement.clientLeft;
                    pos.top -= doc.documentElement.clientTop;

                    var htmlDom = doc.body,
                        htmlBorderLeftWidth = parseInt(getStyle(htmlDom, 'borderLeftWidth')),
                        htmlBorderTopWidth = parseInt(getStyle(htmlDom, 'borderTopWidth'));
                    if (browser.ie && !browser.isStrict) {
                        pos.left -= isNaN(htmlBorderLeftWidth) ? 2 : htmlBorderLeftWidth;
                        pos.top -= isNaN(htmlBorderTopWidth) ? 2 : htmlBorderTopWidth;
                    }
                } else {
                    parent = element;

                    do {
                        pos.left += parent.offsetLeft;
                        pos.top += parent.offsetTop;
                        if (browser.isWebkit > 0 && getStyle(parent, 'position') == 'fixed') {
                            pos.left += doc.body.scrollLeft;
                            pos.top += doc.body.scrollTop;
                            break;
                        }

                        parent = parent.offsetParent;
                    } while (parent && parent != element);

                    if (browser.opera > 0 || (browser.isWebkit > 0 && getStyle(element, 'position') == 'absolute')) {
                        pos.top -= doc.body.offsetTop;
                    }
                    parent = element.offsetParent;
                    while (parent && parent != doc.body) {
                        pos.left -= parent.scrollLeft;
                        if (!browser.opera || parent.tagName != 'TR') {
                            pos.top -= parent.scrollTop;
                        }
                        parent = parent.offsetParent;
                    }
                }

                return pos;
            };

            baidu.event = baidu.event || {};
            baidu.event._listeners = baidu.event._listeners || [];
            baidu.event.on = function (element, type, listener) {
                type = type.replace(/^on/i, '');
                element = baidu.dom._g(element);

                var realListener = function (ev) {
                    listener.call(element, ev);
                },
                    lis = baidu.event._listeners,
                    filter = baidu.event._eventFilter,
                    afterFilter,
                    realType = type;
                type = type.toLowerCase();
                if (filter && filter[type]) {
                    afterFilter = filter[type](element, type, realListener);
                    realType = afterFilter.type;
                    realListener = afterFilter.listener;
                }

                if (element.addEventListener) {
                    element.addEventListener(realType, realListener, false);
                } else if (element.attachEvent) {
                    element.attachEvent('on' + realType, realListener);
                }

                lis[lis.length] = [element, type, listener, realListener, realType];
                return element;
            };

            baidu.on = baidu.event.on;

            (function () {
                var guid = context[baidu.guid];
                baidu.lang.guid = function () {
                    return "TANGRAM__" + (guid._counter++).toString(36);
                };
                guid._counter = guid._counter || 1;
            })();

            context[baidu.guid]._instances = context[baidu.guid]._instances || {};

            baidu.lang.isFunction = function (source) {
                return '[object Function]' == Object.prototype.toString.call(source);
            };

            baidu.lang.Class = function (guid) {
                this.guid = guid || baidu.lang.guid();
                context[baidu.guid]._instances[this.guid] = this;
            };
            context[baidu.guid]._instances = context[baidu.guid]._instances || {};
            baidu.lang.Class.prototype.dispose = function () {
                delete context[baidu.guid]._instances[this.guid];

                for (var property in this) {
                    if (!baidu.lang.isFunction(this[property])) {
                        delete this[property];
                    }
                }
                this.disposed = true;
            };

            baidu.lang.Class.prototype.toString = function () {
                return "[object " + (this._className || "Object") + "]";
            };

            baidu.lang.Event = function (type, target) {
                this.type = type;
                this.returnValue = true;
                this.target = target || null;
                this.currentTarget = null;
            };

            baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
                if (!baidu.lang.isFunction(handler)) {
                    return;
                }

                !this.__listeners && (this.__listeners = {});
                var t = this.__listeners, id;
                if (typeof key == "string" && key) {
                    if (/[^\w\-]/.test(key)) {
                        throw ("nonstandard key:" + key);
                    } else {
                        handler.hashCode = key;
                        id = key;
                    }
                }
                type.indexOf("on") != 0 && (type = "on" + type);

                typeof t[type] != "object" && (t[type] = {});
                id = id || baidu.lang.guid();
                handler.hashCode = id;
                t[type][id] = handler;
            };

            baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
                if (typeof handler != "undefined") {
                    if ((baidu.lang.isFunction(handler) && !(handler = handler.hashCode))
                        || (!baidu.lang.isString(handler))
                    ) {
                        return;
                    }
                }

                !this.__listeners && (this.__listeners = {});

                type.indexOf("on") != 0 && (type = "on" + type);

                var t = this.__listeners;
                if (!t[type]) {
                    return;
                }
                if (typeof handler != "undefined") {
                    t[type][handler] && delete t[type][handler];
                } else {
                    for (var guid in t[type]) {
                        delete t[type][guid];
                    }
                }
            };

            baidu.lang.Class.prototype.dispatchEvent = function (event, options) {
                if (baidu.lang.isString(event)) {
                    event = new baidu.lang.Event(event);
                }
                !this.__listeners && (this.__listeners = {});
                options = options || {};
                for (var i in options) {
                    event[i] = options[i];
                }

                var i, t = this.__listeners, p = event.type;
                event.target = event.target || this;
                event.currentTarget = this;

                p.indexOf("on") != 0 && (p = "on" + p);

                baidu.lang.isFunction(this[p]) && this[p].apply(this, arguments);

                if (typeof t[p] == "object") {
                    for (i in t[p]) {
                        t[p][i].apply(this, arguments);
                    }
                }
                return event.returnValue;
            };


            baidu.lang.inherits = function (subClass, superClass, className) {
                var key, proto,
                    selfProps = subClass.prototype,
                    clazz = new Function();

                clazz.prototype = superClass.prototype;
                proto = subClass.prototype = new clazz();
                for (key in selfProps) {
                    proto[key] = selfProps[key];
                }
                subClass.prototype.constructor = subClass;
                subClass.superClass = superClass.prototype;

                if ("string" == typeof className) {
                    proto._className = className;
                }
            };
            baidu.inherits = baidu.lang.inherits;

            var _IMAGE_PATH = 'http://api.map.baidu.com/library/TextIconOverlay/1.2/src/images/m';

            var _IMAGE_EXTENSION = 'png';

            /**
             *@exports TextIconOverlay as BMapLib.TextIconOverlay
             */

            var TextIconOverlay = function (position, text, options) {
                try {
                    BMap;
                } catch (e) {
                    throw Error('Baidu Map JS API is not ready yet!');
                }
                T.lang.inherits(TextIconOverlay, BMap.Overlay, "TextIconOverlay");
                this._position = position;
                this._text = text;
                this._options = options || {};
                this._styles = this._options['styles'] || [];
                (!this._styles.length) && this._setupDefaultStyles();
            };


            TextIconOverlay.prototype._setupDefaultStyles = function () {
                var sizes = [53, 56, 66, 78, 90];
                for (var i = 0, size; size = sizes[i]; i++) {
                    this._styles.push({
                        url: _IMAGE_PATH + i + '.' + _IMAGE_EXTENSION,
                        size: new BMap.Size(size, size)
                    });
                }
            };

            TextIconOverlay.prototype.initialize = function (map) {
                this._map = map;
                this._domElement = document.createElement('div');
                this._updateCss();
                this._updateText();
                this._updatePosition();
                this._bind();
                this._map.getPanes().markerMouseTarget.appendChild(this._domElement);
                return this._domElement;
            };

            TextIconOverlay.prototype.draw = function () {
                this._map && this._updatePosition();
            };

            TextIconOverlay.prototype.getText = function () {
                return this._text;
            };
            TextIconOverlay.prototype.setText = function (text) {
                if (text && (!this._text || (this._text.toString() != text.toString()))) {
                    this._text = text;
                    this._updateText();
                    this._updateCss();
                    this._updatePosition();
                }
            };

            TextIconOverlay.prototype.getPosition = function () {
                return this._position;
            };

            TextIconOverlay.prototype.setPosition = function (position) {
                if (position && (!this._position || !this._position.equals(position))) {
                    this._position = position;
                    this._updatePosition();
                }
            };

            TextIconOverlay.prototype.getStyleByText = function (text, styles) {
                var count = parseInt(text);
                var index = parseInt(count / 10);
                index = Math.max(0, index);
                index = Math.min(index, styles.length - 1);
                return styles[index];
            };

            TextIconOverlay.prototype._updateCss = function () {
                if (!this._domElement) {
                    return
                }
                var style = this.getStyleByText(this._text, this._styles);
                this._domElement.style.cssText = this._buildCssText(style);
            };

            TextIconOverlay.prototype._updateText = function () {
                if (this._domElement) {
                    this._domElement.innerHTML = this._text;
                }
            };

            TextIconOverlay.prototype._updatePosition = function () {
                if (this._domElement && this._position) {
                    var style = this._domElement.style;
                    var pixelPosition = this._map.pointToOverlayPixel(this._position);
                    pixelPosition.x -= Math.ceil(parseInt(style.width) / 2);
                    pixelPosition.y -= Math.ceil(parseInt(style.height) / 2);
                    style.left = pixelPosition.x + "px";
                    style.top = pixelPosition.y + "px";
                }
            };

            TextIconOverlay.prototype._buildCssText = function (style) {
                var url = style['url'];
                var size = style['size'];
                var anchor = style['anchor'];
                var offset = style['offset'];
                var textColor = style['textColor'] || 'black';
                var textSize = style['textSize'] || 10;

                var csstext = [];
                if (T.browser["ie"] < 7) {
                    csstext.push('filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(' +
                        'sizingMethod=scale,src="' + url + '");');
                } else {
                    csstext.push('background-image:url(' + url + ');');
                    var backgroundPosition = '0 0';
                    (offset instanceof BMap.Size) && (backgroundPosition = offset.width + 'px' + ' ' + offset.height + 'px');
                    csstext.push('background-position:' + backgroundPosition + ';');
                }

                if (size instanceof BMap.Size) {
                    if (anchor instanceof BMap.Size) {
                        if (anchor.height > 0 && anchor.height < size.height) {
                            csstext.push('height:' + (size.height - anchor.height) + 'px; padding-top:' + anchor.height + 'px;');
                        }
                        if (anchor.width > 0 && anchor.width < size.width) {
                            csstext.push('width:' + (size.width - anchor.width) + 'px; padding-left:' + anchor.width + 'px;');
                        }
                    } else {
                        csstext.push('height:' + size.height + 'px; line-height:' + size.height + 'px;');
                        csstext.push('width:' + size.width + 'px; text-align:center;');
                    }
                }

                csstext.push('cursor:pointer; color:' + textColor + '; position:absolute; font-size:' +
                    textSize + 'px; font-family:Arial,sans-serif; font-weight:bold');
                return csstext.join('');
            };

            TextIconOverlay.prototype._bind = function () {
                if (!this._domElement) {
                    return;
                }
                var me = this;
                var map = this._map;
                var BaseEvent = T.lang.Event;
                function eventExtend(e, be) {
                    var elem = e.srcElement || e.target;
                    var x = e.clientX || e.pageX;
                    var y = e.clientY || e.pageY;
                    if (e && be && x && y && elem) {
                        var offset = T.dom.getPosition(map.getContainer());
                        be.pixel = new BMap.Pixel(x - offset.left, y - offset.top);
                        be.point = map.pixelToPoint(be.pixel);
                    }
                    return be;
                }

                T.event.on(this._domElement, "mouseover", function (e) {
                    me.dispatchEvent(eventExtend(e, new BaseEvent("onmouseover")));
                });
                T.event.on(this._domElement, "mouseout", function (e) {
                    me.dispatchEvent(eventExtend(e, new BaseEvent("onmouseout")));
                });
                T.event.on(this._domElement, "click", function (e) {
                    me.dispatchEvent(eventExtend(e, new BaseEvent("onclick")));
                });
            };

            return TextIconOverlay;
        });
    });

    var TextIconOverlay = (index$1 && typeof index$1 === 'object' && 'default' in index$1 ? index$1['default'] : index$1);

    var getExtendedBounds = function (map, bounds, gridSize) {
        bounds = cutBoundsInRange(bounds);
        var pixelNE = map.pointToPixel(bounds.getNorthEast());
        var pixelSW = map.pointToPixel(bounds.getSouthWest());
        pixelNE.x += gridSize;
        pixelNE.y -= gridSize;
        pixelSW.x -= gridSize;
        pixelSW.y += gridSize;
        var newNE = map.pixelToPoint(pixelNE);
        var newSW = map.pixelToPoint(pixelSW);
        return new BMap.Bounds(newSW, newNE);
    };

    var cutBoundsInRange = function (bounds) {
        var maxX = getRange(bounds.getNorthEast().lng, -180, 180);
        var minX = getRange(bounds.getSouthWest().lng, -180, 180);
        var maxY = getRange(bounds.getNorthEast().lat, -74, 74);
        var minY = getRange(bounds.getSouthWest().lat, -74, 74);
        return new BMap.Bounds(new BMap.Point(minX, minY), new BMap.Point(maxX, maxY));
    };

    var getRange = function (i, mix, max) {
        mix && (i = Math.max(i, mix));
        max && (i = Math.min(i, max));
        return i;
    };

    var isArray = function (source) {
        return '[object Array]' === Object.prototype.toString.call(source);
    };

    var indexOf = function (item, source) {
        var index = -1;
        if (isArray(source)) {
            if (source.indexOf) {
                index = source.indexOf(item);
            } else {
                for (var i = 0, m; m = source[i]; i++) {
                    if (m === item) {
                        index = i;
                        break;
                    }
                }
            }
        }
        return index;
    };

    var MarkerClusterer = function (map, options) {
        try {
            BMap;
        } catch (e) {
            throw Error('Baidu Map JS API is not ready yet!');
        }
        if (!map) {
            return;
        }
        this._map = map;
        this._markers = [];
        this._clusters = [];

        var opts = options || {};
        this._gridSize = opts["gridSize"] || 60;
        this._maxZoom = opts["maxZoom"] || 18;
        this._minClusterSize = opts["minClusterSize"] || 2;
        this._isAverageCenter = false;
        if (opts['isAverageCenter'] != undefined) {
            this._isAverageCenter = opts['isAverageCenter'];
        }
        this._styles = opts["styles"] || [];

        var that = this;
        this._map.addEventListener("zoomend", function () {
            that._redraw();
        });

        this._map.addEventListener("moveend", function () {
            that._redraw();
        });

        var mkrs = opts["markers"];
        isArray(mkrs) && this.addMarkers(mkrs);
    };

    MarkerClusterer.prototype.addMarkers = function (markers) {
        if (!markers.length) {
            return
        }
        for (var i = 0, len = markers.length; i < len; i++) {
            this._pushMarkerTo(markers[i]);
        }
        this._createClusters();
    };

    MarkerClusterer.prototype._pushMarkerTo = function (marker) {
        var index = indexOf(marker, this._markers);
        if (index === -1) {
            marker.isInCluster = false;
            this._markers.push(marker);//Marker拖放后enableDragging不做变化，忽略
        }
    };

    MarkerClusterer.prototype.addMarker = function (marker) {
        this._pushMarkerTo(marker);
        this._createClusters();
    };

    MarkerClusterer.prototype._createClusters = function () {
        var mapBounds = this._map.getBounds();
        if (!mapBounds.getCenter()) {
            return
        }
        var extendedBounds = getExtendedBounds(this._map, mapBounds, this._gridSize);
        for (var i = 0, marker; marker = this._markers[i]; i++) {
            if (!marker.isInCluster && extendedBounds.containsPoint(marker.getPosition())) {
                this._addToClosestCluster(marker);
            }
        }
    };

    MarkerClusterer.prototype._addToClosestCluster = function (marker) {
        var distance = 4000000;
        var clusterToAddTo = null;
        var position = marker.getPosition();
        for (var i = 0, cluster; cluster = this._clusters[i]; i++) {
            var center = cluster.getCenter();
            if (center) {
                var d = this._map.getDistance(center, marker.getPosition());
                if (d < distance) {
                    distance = d;
                    clusterToAddTo = cluster;
                }
            }
        }

        if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
            clusterToAddTo.addMarker(marker);
        } else {
            var cluster = new Cluster(this);
            cluster.addMarker(marker);
            this._clusters.push(cluster);
        }
    };

    MarkerClusterer.prototype._clearLastClusters = function () {
        for (var i = 0, cluster; cluster = this._clusters[i]; i++) {
            cluster.remove();
        }
        this._clusters = [];
        this._removeMarkersFromCluster();
    };

    MarkerClusterer.prototype._removeMarkersFromCluster = function () {
        for (var i = 0, marker; marker = this._markers[i]; i++) {
            marker.isInCluster = false;
        }
    };

    MarkerClusterer.prototype._removeMarkersFromMap = function () {
        for (var i = 0, marker; marker = this._markers[i]; i++) {
            marker.isInCluster = false;
            var label = marker.getLabel();
            this._map.removeOverlay(marker);
            marker.setLabel(label);
        }
    };
    MarkerClusterer.prototype._removeMarker = function (marker) {
        var index = indexOf(marker, this._markers);
        if (index === -1) {
            return false;
        }
        this._map.removeOverlay(marker);
        this._markers.splice(index, 1);
        return true;
    };

    MarkerClusterer.prototype.removeMarker = function (marker) {
        var success = this._removeMarker(marker);
        if (success) {
            this._clearLastClusters();
            this._createClusters();
        }
        return success;
    };
    MarkerClusterer.prototype.removeMarkers = function (markers) {
        var success = false;
        for (var i = 0; i < markers.length; i++) {
            var r = this._removeMarker(markers[i]);
            success = success || r;
        }

        if (success) {
            this._clearLastClusters();
            this._createClusters();
        }
        return success;
    };

    MarkerClusterer.prototype.clearMarkers = function () {
        this._clearLastClusters();
        this._removeMarkersFromMap();
        this._markers = [];
    };

    MarkerClusterer.prototype._redraw = function () {
        this._clearLastClusters();
        this._createClusters();
    };

    MarkerClusterer.prototype.getGridSize = function () {
        return this._gridSize;
    };

    MarkerClusterer.prototype.setGridSize = function (size) {
        this._gridSize = size;
        this._redraw();
    };

    MarkerClusterer.prototype.getMaxZoom = function () {
        return this._maxZoom;
    };
    MarkerClusterer.prototype.setMaxZoom = function (maxZoom) {
        this._maxZoom = maxZoom;
        this._redraw();
    };

    MarkerClusterer.prototype.getStyles = function () {
        return this._styles;
    };

    MarkerClusterer.prototype.setStyles = function (styles) {
        this._styles = styles;
        this._redraw();
    };

    MarkerClusterer.prototype.getMinClusterSize = function () {
        return this._minClusterSize;
    };

    MarkerClusterer.prototype.setMinClusterSize = function (size) {
        this._minClusterSize = size;
        this._redraw();
    };

    MarkerClusterer.prototype.isAverageCenter = function () {
        return this._isAverageCenter;
    };

    MarkerClusterer.prototype.getMap = function () {
        return this._map;
    };

    MarkerClusterer.prototype.getMarkers = function () {
        return this._markers;
    };

    MarkerClusterer.prototype.getClustersCount = function () {
        var count = 0;
        for (var i = 0, cluster; cluster = this._clusters[i]; i++) {
            cluster.isReal() && count++;
        }
        return count;
    };

    function Cluster(markerClusterer) {
        this._markerClusterer = markerClusterer;
        this._map = markerClusterer.getMap();
        this._minClusterSize = markerClusterer.getMinClusterSize();
        this._isAverageCenter = markerClusterer.isAverageCenter();
        this._center = null;
        this._markers = [];
        this._gridBounds = null;
        this._isReal = false;

        this._clusterMarker = new TextIconOverlay(this._center, this._markers.length, { "styles": this._markerClusterer.getStyles() });
    }

    Cluster.prototype.addMarker = function (marker) {
        if (this.isMarkerInCluster(marker)) {
            return false;
        }
        if (!this._center) {
            this._center = marker.getPosition();
            this.updateGridBounds();//
        } else {
            if (this._isAverageCenter) {
                var l = this._markers.length + 1;
                var lat = (this._center.lat * (l - 1) + marker.getPosition().lat) / l;
                var lng = (this._center.lng * (l - 1) + marker.getPosition().lng) / l;
                this._center = new BMap.Point(lng, lat);
                this.updateGridBounds();
            }
        }

        marker.isInCluster = true;
        this._markers.push(marker);

        var len = this._markers.length;
        if (len < this._minClusterSize) {
            this._map.addOverlay(marker);
            return true;
        } else if (len === this._minClusterSize) {
            for (var i = 0; i < len; i++) {
                var label = this._markers[i].getLabel();
                this._markers[i].getMap() && this._map.removeOverlay(this._markers[i]);
                this._markers[i].setLabel(label);
            }

        }
        this._map.addOverlay(this._clusterMarker);
        this._isReal = true;
        this.updateClusterMarker();
        return true;
    };

    Cluster.prototype.isMarkerInCluster = function (marker) {
        if (this._markers.indexOf) {
            return this._markers.indexOf(marker) != -1;
        } else {
            for (var i = 0, m; m = this._markers[i]; i++) {
                if (m === marker) {
                    return true;
                }
            }
        }
        return false;
    };

    Cluster.prototype.isMarkerInClusterBounds = function (marker) {
        return this._gridBounds.containsPoint(marker.getPosition());
    };

    Cluster.prototype.isReal = function (marker) {
        return this._isReal;
    };

    Cluster.prototype.updateGridBounds = function () {
        var bounds = new BMap.Bounds(this._center, this._center);
        this._gridBounds = getExtendedBounds(this._map, bounds, this._markerClusterer.getGridSize());
    };

    Cluster.prototype.updateClusterMarker = function () {
        if (this._map.getZoom() > this._markerClusterer.getMaxZoom()) {
            this._clusterMarker && this._map.removeOverlay(this._clusterMarker);
            for (var i = 0, marker; marker = this._markers[i]; i++) {
                this._map.addOverlay(marker);
            }
            return;
        }

        if (this._markers.length < this._minClusterSize) {
            this._clusterMarker.hide();
            return;
        }

        this._clusterMarker.setPosition(this._center);

        this._clusterMarker.setText(this._markers.length);

        this._clusterMarker.addEventListener && !this._clusterMarker._hasClickEvent && this._clusterMarker.addEventListener("click", function (event) {
            this._clusterMarker._hasClickEvent = true;
            this._markers && this._map.setViewport(this.getBounds());
        }.bind(this));
    };

    Cluster.prototype.remove = function () {
        for (var i = 0, m; m = this._markers[i]; i++) {
            var label = this._markers[i].getLabel();
            this._markers[i].getMap() && this._map.removeOverlay(this._markers[i]);
            this._markers[i].setLabel(label);
        }
        this._map.removeOverlay(this._clusterMarker);
        this._markers.length = 0;
        delete this._markers;
    };

    Cluster.prototype.getBounds = function () {
        var bounds = new BMap.Bounds(this._center, this._center);
        for (var i = 0, marker; marker = this._markers[i]; i++) {
            bounds.extend(marker.getPosition());
        }
        return bounds;
    };

    Cluster.prototype.getCenter = function () {
        return this._center;
    };

    return MarkerClusterer;

})));
