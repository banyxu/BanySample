/************************初始化*****************************************/
require([
        "esri/map",
        "esri/dijit/Legend",
        "esri/dijit/Scalebar",
        "esri/tasks/PrintTask",
        "esri/tasks/PrintParameters",
        "esri/tasks/PrintTemplate",
        "esri/geometry/Extent",
        "esri/layers/GraphicsLayer",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/ImageParameters",
        "esri/toolbars/navigation",
        "esri/geometry/webMercatorUtils",
        "esri/geometry/ScreenPoint",
        "esri/geometry/Point",
        "esri/geometry/Polygon",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/PictureFillSymbol",
        "esri/symbols/CartographicLineSymbol",
        "esri/renderers/ClassBreaksRenderer",
        "esri/InfoTemplate",
        "esri/tasks/QueryTask",
        "esri/tasks/query",
        "esri/tasks/FeatureSet",
        "esri/layers/FeatureLayer",
        "esri/symbols/TextSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/layers/LabelLayer",
        "esri/Color",
        "esri/graphic",
        "esri/SpatialReference",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/on",
        "dijit/form/DropDownButton",
        "dijit/DropDownMenu",
        "dijit/MenuItem",
        "dijit/form/Button",
        "dojo/dnd/move",
        "dojo/parser",
        "dijit/registry",
        "dojox/charting/Chart2D",
         "dojox/charting/themes/PlotKit/blue",
         "dojox/charting/action2d/Highlight",
         "dojox/charting/action2d/Tooltip",
        "dijit/layout/BorderContainer",
        "dijit/layout/TabContainer",
        "dijit/layout/ContentPane",
        "dojox/layout/ContentPane",
        "dijit/layout/StackContainer",
        "dijit/Toolbar",
        "dojo/domReady!"
],
        function (Map,
        Legend,
        Scalebar,
        PrintTask,
        PrintParameters,
        PrintTemplate,
        Extent,
        GraphicsLayer,
        ArcGISDynamicMapServiceLayer,
        ArcGISTiledMapServiceLayer,
        ImageParameters,
        Navigation,
        webMercatorUtils,
        ScreenPoint,
        Point,
        Polygon,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        SimpleFillSymbol,
        PictureMarkerSymbol,
        PictureFillSymbol,
        CartographicLineSymbol,
        ClassBreaksRenderer,
        InfoTemplate,
        QueryTask,
        Query,
        FeatureSet,
        FeatureLayer,
        TextSymbol,
        SimpleRenderer,
        LabelLayer,
        Color,
        Graphic,
        SpatialReference,
        dom,
        domConstruct,
        on,
        DropDownButton,
        DropDownMenu,
        MenuItem,
        Button,
        Move,
        parser,
        registry,
        Chart2D,
        theme,
        Highlight,
        Tooltip
        ) {
            parser.parse();

            (function () {
                MapDraw = function (options) {
                    var self = this;
                    this.defaultOptions = {
                        mapTargetId: "mapDiv",
                        extent: [7948259, 1498567, 15432368, 7336710],
                        gisServer: "/Application/Map2/MapServer",
                        mapServer: ""
                    };
                    if (!!options) {
                        this.options = $.extend({}, this.defaultOptions, options);
                    }
                    else {
                        this.options = this.defaultOptions;
                    }
                    this.wgs84SpatialReference = new SpatialReference({ wkid: 4326 });
                    this.webMercatorSpatialReference = new SpatialReference({ wkid: 102113 });
                    this.BaseMap = null;
                    this.baseMapServiceLayer = null;
                    this.navToolbar = null;
                    self._InitConst();
                    self._InitBaseMap();
                    self.AddController();
                };
                MapDraw.prototype = {
                    _InitConst: function () {
                        var self = this;
                        this.wgs84SpatialReference = new SpatialReference({ wkid: 4326 });
                        this.webMercatorSpatialReference = new SpatialReference({ wkid: 102113 });
                        this.startExtent = new Extent();
                        this.startExtent.xmin = self.options.extent[0];
                        this.startExtent.ymin = self.options.extent[1];
                        this.startExtent.xmax = self.options.extent[2];
                        this.startExtent.ymax = self.options.extent[3];
                        this.startExtent.spatialReference = self.webMercatorSpatialReference;
                    },
                    _InitBaseMap: function () {
                        var self = this;
                        self.BaseMap = new Map("mapDiv", {
                            logo: false,
                            slider: true,
                            extent: self.startExtent
                        });
                        self.ShowSateliteLayer();
                        self.ShowSurfaceLayer();
                    },
                    ShowSurfaceLayer: function () {/*加载平面地图*/
                        var self = this;
                        var imageParameters = new ImageParameters();
                        imageParameters.format = "jpeg";
                        var baseMapServiceLayer = new ArcGISDynamicMapServiceLayer(self.options.mapServer, {
                            opacity: 1.0,
                            imageParameters: imageParameters
                        });
                        baseMapServiceLayer.id = "basemap_Surface";
                        baseMapServiceLayer.setVisibility(true);
                        dojo.connect(baseMapServiceLayer, "onLoad", function (layers) { return; });
                        self.BaseMap.addLayer(baseMapServiceLayer);

                    },
                    ShowSateliteLayer: function () {/*加载卫星地图*/
                        var self = this;
                        var serviceName = "AnHui";
                        dataUrl = self.options.gisServer + "/Application/" + serviceName + "/MapServer";
                        var baseTitleMapLayer = new esri.layers.ArcGISTiledMapServiceLayer(dataUrl);
                        baseTitleMapLayer.id = "basemap_Satelite";
                        baseTitleMapLayer.setVisibility(false);
                        self.BaseMap.addLayer(baseTitleMapLayer);
                    },
                    DisplayLayerById: function (layerId, isShow) {
                        var self = this;
                        var layer = self.BaseMap.getLayer(layerId);
                        if (!!layer) {
                            layer.setVisibility(isShow);
                        }
                    },
                    show: function () {
                        var wgs84SpatialReference = new SpatialReference({ wkid: 4326 });
                        var webMercatorSpatialReference = new SpatialReference({ wkid: 102113 });

                    },
                    AddController: function () {
                        var self = this;
                        /*添加刻度尺*/
                        var scalebar = new Scalebar({
                            map: self.BaseMap,
                            scalebarUnit: "metric",
                            scalebarStyle: "line"
                        });

                        /*添加导出工具栏*/
                        var menu = new DropDownMenu({ style: "display: none;" });
                        var menuItem4 = new MenuItem({
                            label: "图片",
                            iconClass: "formatIcon",
                            onClick: function () {
                                saveMap("image");
                            }
                        });
                        menu.addChild(menuItem4);

                        var menuItem5 = new MenuItem({
                            label: "SVG",
                            iconClass: "formatIcon",
                            onClick: function () {
                                saveMap("svg");
                            }
                        });
                        menu.addChild(menuItem5);

                        var button = new DropDownButton({
                            label: "导出",
                            dropDown: menu,
                            id: "exportButton",
                            iconClass: "saveIcon"
                        });
                        dom.byId("navToolbar").appendChild(button.domNode);

                        self.SetMapToolbarEvent();
                    },
                    SetMapToolbarEvent: function () {
                        var self = this;
                        self.navToolbar = new esri.toolbars.Navigation(self.BaseMap);
                        on(self.navToolbar, "onExtentHistoryChange", self.extentHistoryChangeHandler);

                        registry.byId("zoomfullext").on("click", function () {
                            //self.navToolbar.zoomToFullExtent();
                            self.BaseMap.setExtent(self.startExtent);
                        });

                        registry.byId("zoomprev").on("click", function () {
                            self.navToolbar.zoomToPrevExtent();
                        });

                        registry.byId("zoomnext").on("click", function () {
                            self.navToolbar.zoomToNextExtent();
                        });

                        registry.byId("surface_tool").on("click", function () {
                            self.DisplayLayerById("basemap_Satelite", false);
                            self.DisplayLayerById("basemap_Surface", true);

                        });

                        registry.byId("satellite_tool").on("click", function () {
                            self.DisplayLayerById("basemap_Satelite", true);
                            self.DisplayLayerById("basemap_Surface", false);
                        });

                    },
                    extentHistoryChangeHandler: function () {
                        var self = this;
                        registry.byId("zoomprev").disabled = self.navToolbar.isFirstExtent();
                        registry.byId("zoomnext").disabled = self.navToolbar.isLastExtent();
                    }
                };
                return MapDraw;
            }());
        });

