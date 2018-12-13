(function () {
    TMap = function (target, opts) {
        this.defaultOptions = {
            xyzLocation: null,// "http://192.168.31.25:8089",
            geoServer:"http://192.168.40.125:8080/geoserver/CEATM/wms", //  "http://192.168.31.25:9099/geoserver/Anhui/wms",
            mapPrj: "EPSG:3857",
            center: [120, 33],
            zoom: 4,
            minZoom: 4,
            maxZoom: 12,
            extents: [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892],
            completedCallback: null
        };
        if (opts) {
            this.options = $.extend({}, this.defaultOptions, opts);
        }
        else {
            this.options = this.defaultOptions;
        }
        this.map = null;
        this.target = target;
        this.layers = [];
        this.mapPrj = "EPSG:3857";
        this.prj4326 = 'EPSG:4326';
        this.prj3857 = 'EPSG:3857';
        this._init();
        
    };
    TMap.prototype = {
        _init: function () {
            self = this;
            self._initBaseMapLayer();
            var mousePositionControl = new ol.control.MousePosition({
                coordinateFormat: ol.coordinate.createStringXY(4),
                projection: "EPSG:4326",
                className: "custom-mouse-position ol-control",
                undefinedHTML: "&nbsp"
            });

            self.map = new ol.Map({
                layers: [self.baseLayer],
                target: self.target,
                controls: ol.control.defaults({ attribution: false }).extend([mousePositionControl]),
                view: new ol.View({
                    projection: self.mapProjection,
                    center: ol.proj.transform(self.options.center, self.prj4326, self.mapPrj),
                    zoom: self.options.zoom,
                    minZoom: self.options.minZoom,
                    maxZoom: self.options.maxZoom,
                    maxExtent: self.options.extents,
                }),

            });
        },
        _initBaseMapLayer: function () {
            self = this;
            self.baseLayer = new ol.layer.Image({
                source: new ol.source.ImageWMS({
                    ratio: 1,
                    url: self.options.geoServer,
                    params: {
                        'FORMAT': "image/svg",
                        'VERSION': '1.1.1',
                        STYLES: '',
                        LAYERS: 'CEATM:worldMap',
                    }
                })
            });
        },
        setClickMapEvent: function (event)
        {
            self = this;
            self.map.on("click", function (e) {
                event(e);
            });
        },
        AddLayer: function (layerName, layer) {
            self = this;
            self.map.removeLayer(layerName);
            if (layer && layer.layer)
            {
                self.map.addLayer(layer.layer);
            } else if (layer)
            {
                self.map.addLayer(layer);
            }
        },
        AddController: function (options, clickEvent, mouseover, mouseout) {
            var self = this;
            var container = $("#map").find("div.ol-overlaycontainer-stopevent");
            var controller = $("<div class='ol-unselectable ol-control'></div>").appendTo(container);
            var button = $("<button type='button'></button>").appendTo(controller);
            controller.attr("name", options.name);
            controller.css({ "top": options.top, left: options.left, right: options.right, bottom: options.bottom, width: options.width, "border-radius": "0 0 2px 2px" });
            button.css({ width: options.width });
            button.attr("data-value", options.value);
            button.html(options.text);
            if (!!options.cssName) {
                //controller.addClass(options.cssName);
                button.addClass(options.cssName);
            }
            if (!!options.title) {
                button.attr("title", options.title);
            }
            $(button).click(function () {
                if (!!clickEvent) {
                    clickEvent(button);
                }
            });
            $(controller).hover(function () {
                if (!!mouseover) {
                    mouseover(controller);
                }
            }, function () {
                if (!!mouseout) {
                    mouseout(controller);
                }
            });
        }

    };
    return TMap
}());