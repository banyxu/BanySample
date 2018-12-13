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
        "esri/layers/WebTiledLayer",
        "esri/layers/WMSLayer",
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
        "esri/symbols/Font",
        "esri/symbols/TextSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/layers/LabelLayer",
        "esri/layers/LabelClass",
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
        "dojo/domReady!",
        "esri/dijit/OverviewMap"
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
        WebTiledLayer,
        WMSLayer,
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
        Font,
        TextSymbol,
        SimpleRenderer,
        LabelLayer,
        LabelClass,
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
            var dojoConfig = { parseOnLoad: true };
            dojo.require("esri.layers.MapImage");
            //dojo.require("esri.layers.ImageServiceParameters");
            dojo.require("esri.layers.MapImageLayer");
            parser.parse();

            (function () {
                GisMap = function (options) {
                    var self = this;
                    this.defaultOptions = {
                        mapTargetId: "mapDiv",
                        extent: [7948259, 1498567, 15432368, 9336710],
                        gisServer: "/Application/Map2/MapServer",
                        mapServer: "",
                        riverServer: "/river/wms",
                        highwayServer: "/river/wms"
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
                    this.mapDraw = null;
                    this.ActiveTextInput = false;
                    this.focusLayer = null;
                    this.focusInterval = null;
                    this.activeInterval = null;
                    this.activeLayer = null;
                    this.RemoveGraphicsCallback = null;
                    this.intervalTime = 0;
                    this.IsChange = 0;
                    this.IsM_Drag = 0;
                    self._InitConst();
                    self._InitBaseMap();
                    this.MagnifierMap = null;
                    this.changeCode = "";
                    this.proTypeLegends = null;

                };
                GisMap.prototype = {
                    _InitConst: function () {
                        var self = this;
                        this.wgs84SpatialReference = new SpatialReference({ wkid: 4326 });
                        this.webMercatorSpatialReference = new SpatialReference({ wkid: 102113 });
                        // this.startExtent = new esri.geometry.Extent(114.84595386, 29.4163509, 119.60824717, 34.62676847, new esri.SpatialReference({ wkid: 4326 }));
                        this.startExtent = new esri.geometry.Extent(114, 29.4, 120, 34.8, new esri.SpatialReference({ wkid: 4326 }));
                    },
                    _InitBaseMap: function () {
                        var self = this;

                        self.BaseMap = new Map("mapDiv", {
                            logo: false,
                            slider: true,
                            zoom: 7,
                            center: [117, 32],
                            maxZoom: 14,
                            minZoom: 7,
                            spatialReference: self.wgs84SpatialReference,
                            showLabels: true,
                            extent: self.startExtent
                        });
                        $("#mapDiv_root").css({ height: "100%" });




                        var cityCode = $("#defaultCityCode").val();//"340000";
                        if (!!$.cookie("selectedCityCode")) {
                            cityCode = $.cookie("selectedCityCode");
                        }
                        var layerName = $.Enumerable.From(cities)
                                  .Where(function (x) { return x.CITY_CODE == cityCode; })
                                  .Select(function (x) { return x.LAYER_NAME; })
                                  .FirstOrDefault();
                        self.ShowChinaSurfaceLayer(layerName);
                        //self.ShowRiverSurfaceLayer(layerName);
                        //self.ShowHighWayLayer(layerName);

                        $("#mapDiv_river_Surface").height($("#mapDiv").height() + 60);//.css({ "border-bottom": "solid 2px #1a96dd" });
                        $("#mapDiv_gc").attr("height", $("#mapDiv").height() + 60);//.css({ "border-bottom": "solid 2px RED" });;

                        //$("#mapDiv_river_Surface").height($("#mapDiv").height()+20).css({ "border-bottom": "solid 2px #1a96dd" });
                        //$("#mapDiv_gc").attr("height", $("#mapDiv").height()+20).css({ "border-bottom": "solid 2px RED" });;

                       // self.ActiveCityArea(cityCode);
                      //  self.AddController();
                       // self.ActiveDraw();

                        dojo.connect(self.BaseMap, "onMouseUp", function (evt) {
                            //self.IsM_Drag = 0;
                            var Mdiv = document.getElementById("MagnifierDiv");
                            Mdiv.style.display = "none";
                            self.BaseMap.graphics.clear();
                            if (!!self.ActiveTextInput) {
                                if (!!self.mouseUpCallback) {
                                    self.mouseUpCallback(evt);
                                }
                            }
                        });
                        // qianwt 2017-08-09 整个页面点击时，隐藏站点信息，点击站点信息容器，阻止事件冒泡 begin
                        $(self.BaseMap.infoWindow.domNode).click(function (evt) {
                            evt.stopPropagation();
                            return false;
                        });
                        $(document).click(function () {
                            self.BaseMap.infoWindow.hide();
                        });
                        // qianwt 2017-08-09 整个页面点击时，隐藏站点信息，点击站点信息容器，阻止事件冒泡 end
                    },



                    InitMagnifierDiv: function (mMap) {

                        this.MagnifierMap = mMap;
                        // mMap.BaseMap.disablePan();
                        mMap.BaseMap.disableClickRecenter();
                        mMap.BaseMap.disableDoubleClickZoom();
                        // mMap.BaseMap.disableMapNavigation();
                        mMap.BaseMap.disableShiftDoubleClickZoom();
                        //  mMap.BaseMap.disableScrollWheelZoom();

                        var Mdiv = document.getElementById("MagnifierDiv");
                        Mdiv.style.backgroundColor = "bisque";
                        Mdiv.style.border = "3px solid green";
                        Mdiv.style.display = "none";

                        var self = this;
                        //m为放大系数
                        var tmp_graphic = null;
                        mMap.BaseMap.on("extent-change", function () {

                            var Mdiv = document.getElementById("MagnifierDiv");
                            if (Mdiv.style.display == "none")
                                return;

                            var baseExtent = mMap.BaseMap.extent;

                            var polygon = new Polygon(new SpatialReference({ wkid: 4326 }));
                            //添加多边形的各个角的顶点坐标，注意：首尾要链接，也就是说，第一个点和最后一个点要一致  
                            polygon.addRing([[baseExtent.xmin, baseExtent.ymin], [baseExtent.xmin, baseExtent.ymax], [baseExtent.xmax, baseExtent.ymax], [baseExtent.xmax, baseExtent.ymin], [baseExtent.xmin, baseExtent.ymin]]);
                            var lineSymbol = new CartographicLineSymbol(
                                CartographicLineSymbol.STYLE_SOLID,
                                new Color([255, 0, 0]), 1,
                                CartographicLineSymbol.CAP_ROUND,
                                CartographicLineSymbol.JOIN_MITER, 3
                               );
                            if (tmp_graphic != null)
                            { self.BaseMap.graphics.remove(tmp_graphic); }
                            tmp_graphic = new Graphic(polygon, lineSymbol);
                            self.BaseMap.graphics.add(tmp_graphic);



                        });
                        //// qianwt 2017-09-06 加上鼠标点击，关闭放大镜 begin
                        //self.BaseMap.on("mouse-down", function (evt) {
                        //    //if (self.IsM_Drag == 1) {
                        //    //    self.BaseMap.setMapCursor("default");
                        //    //    document.getElementById("MagnifierDiv").style.display = "none";
                        //    //    self.IsM_Drag = 0;
                        //    //}
                        //});
                        // qianwt 2017-09-06 加上鼠标点击，关闭放大镜 end

                        //jack 2017-08-11  拖动放大镜
                        //self.BaseMap.on("mouse-move", function (evt) {
                        //    if (self.IsM_Drag == 1)
                        //    {
                        //        var point = evt.mapPoint;
                        //        var layer = self.BaseMap.getLayer("basemap_Surface_Area");
                        //        var extent = layer.graphics[0]._extent;
                        //        var Mdiv = document.getElementById("MagnifierDiv");
                        //        // 判断当前鼠标位置，是否在地图矩形区域内
                        //        if (point.x <= extent.xmax && point.x >= extent.xmin && point.y <= extent.ymax && point.y >= extent.ymin) {
                        //            if (Mdiv.style.display == "none")
                        //                Mdiv.style.display = "block";

                        //            // qianwt 重新计算放大镜位置 begin
                        //            /*
                        //            var leftPx = evt.x - mapDiv_Main.offsetLeft - 100;
                        //            var topPx = evt.y - mapDiv_Main.offsetTop - 100;
                        //            */
                        //            var mapDiv_Main = document.getElementById("mapDiv_Main");
                        //            //console.log(evt);
                        //            //console.log("evt.x = " + evt.x);
                        //            //console.log("mapDiv_Main.offsetLeft = " + mapDiv_Main.offsetLeft);
                        //            //console.log("evt.y = " + evt.y);
                        //            //console.log("mapDiv_Main.offsetTop = " + mapDiv_Main.offsetTop);
                        //            // 把此处evt.x, y改成clientX,Y
                        //            var leftPx = evt.clientX - mapDiv_Main.offsetLeft - 125;
                        //            var topPx = evt.clientY - $(document).scrollTop(); -175;
                        //            // 放大镜到顶部，图放到鼠标下面，重新计算top
                        //            if (topPx < 0) {
                        //                topPx = evt.clientY - mapDiv_Main.offsetTop + 25;
                        //            }
                        //            if (leftPx < 0) {
                        //                leftPx = evt.clientX - mapDiv_Main.offsetLeft;
                        //            }
                        //            Mdiv.style.left = leftPx + "px";
                        //            Mdiv.style.top = topPx + "px";
                        //            // qianwt 重新计算放大镜位置 end
                        //            //console.log("Mdiv.style.left = " + leftPx + "px");
                        //            //console.log("Mdiv.style.top = " + topPx + "px");
                        //            //var point = evt.mapPoint;

                        //            //  var screenPoint = self.BaseMap.toScreen(evt.mapPoint);
                        //            // alert(mapDiv_Main.offsetLeft + "," + mapDiv_Main.offsetTop);

                        //            // screenPoint.x -= 178;
                        //            // screenPoint.y += 85;
                        //            //screenPoint.y += 12;
                        //            // var p = self.BaseMap.toMap(screenPoint);
                        //            mMap.BaseMap.centerAt(point);
                        //        }
                        //        else
                        //        {
                        //            Mdiv.style.display = "none";
                        //        }
                        //    }
                        //    //else {
                        //    //    var Mdiv = document.getElementById("MagnifierDiv");

                        //    //    if (Mdiv.style.display != "none") {
                        //    //        var point = evt.mapPoint;
                        //    //        mMap.BaseMap.centerAt(point);
                        //    //    }
                        //    //}
                        //});
                        // qianwt 2014-09-06 注释掉jack点，更换方式 begin
                        //$("#MagnifierDiv").mousedown(function () {

                        //    self.IsM_Drag = 1;
                        //    var Mdiv = document.getElementById("MagnifierDiv");
                        //    Mdiv.style.zIndex = 1;
                        //});
                        //$("#MagnifierDiv").mouseup(function () {
                        //    //alert("11");
                        //    self.IsM_Drag = 0;
                        //});
                        // qianwt 2014-09-06 注释掉jack点，更换方式 end
                    },


                    ActiveDraw: function () {
                        var self = this;
                        self.mapDraw = new esri.toolbars.Draw(self.BaseMap);
                        self.mapDraw.on("draw-end", function (evt) {

                            self.BaseMap.graphics.clear();
                            var lineSymbol = new CartographicLineSymbol(
                              CartographicLineSymbol.STYLE_SOLID,
                              new Color([255, 0, 0]), 3,
                              CartographicLineSymbol.CAP_ROUND,
                              CartographicLineSymbol.JOIN_MITER, 3
                             );

                            if (evt.geometry.type === "extent") {
                                self.BaseMap.graphics.add(new Graphic(evt.geometry, lineSymbol));
                            }
                            //if (evt.geometry.type === "point" || evt.geometry.type === "multipoint") {
                            //    symbol = markerSymbol;
                            //} else if (evt.geometry.type === "line" || evt.geometry.type === "polyline") {
                            //    symbol = lineSymbol;
                            //    self.BaseMap.graphics.add(new Graphic(evt.geometry, symbol));
                            //}


                            var obj = document.getElementById("MagnifierDiv");
                            obj.style.display = "block";

                            self.BaseMap.setMapCursor("default");
                            self.mapDraw.deactivate();
                            var extent = evt.geometry.getExtent();
                            var pt1 = new Point(extent.xmax, extent.ymax);
                            var pt2 = new Point(extent.xmin, extent.ymin);
                            var screenPt1 = self.BaseMap.toScreen(pt1);
                            var screenPt2 = self.BaseMap.toScreen(pt2);
                            var m = 2;
                            //当拉框超过200*200时候，以框子中心点为准，以主地图的当前经纬度和屏幕像素的比例 *2    ，作为放大框的地图外围
                            if ((screenPt1.x - screenPt2.x) > 200 || (screenPt2.x - screenPt1.x) > 200 || (screenPt1.y - screenPt2.y) > 200 || (screenPt2.y - screenPt1.y > 200)) {
                                var baseExtent = self.BaseMap.extent;
                                var mCenter = extent.getCenter();
                                ;
                                var mainWidth = self.BaseMap.width;
                                var mainHeight = self.BaseMap.height;
                                // 一个像素点代表的经纬度
                                var mainDeltX = (baseExtent.xmax - baseExtent.xmin) / mainWidth;
                                var mainDeltY = (baseExtent.ymax - baseExtent.ymin) / mainHeight;

                                var mainCenterX = (baseExtent.xmax + baseExtent.xmin) / 2;
                                var mainCenterY = (baseExtent.ymax + baseExtent.ymin) / 2;

                                var x1 = mCenter.x - mainDeltX * 200 / m;
                                var x2 = mCenter.x + mainDeltX * 200 / m;
                                var y1 = mCenter.y - mainDeltY * 200 / m;
                                var y2 = mCenter.y + mainDeltY * 200 / m;
                                // alert("x1:"+x1 +" x2:"+ x2 + " y1:" +y1 +" y2:"+y2);
                                var newExtent = new Extent(x1, y1, x2, y2, new esri.SpatialReference({ wkid: 4326 }));
                                self.MagnifierMap.BaseMap.setExtent(newExtent);
                            }
                            else {
                                self.MagnifierMap.BaseMap.setExtent(evt.geometry.getExtent());
                            }
                        });
                    },
                    ShowChinaSurfaceLayer: function (layerName) {/*加载平面地图*/
                        var self = this;
                        var geoWmsUrl = self.options.mapServer;
                        var layer1 = new esri.layers.WMSLayerInfo({ name: "1001", title: "HuangShanAll" });
                        var resourceInfo = {
                            extent: self.startExtent,
                            layerInfos: [layer1], version: '1.1.1'
                        };

                        var localHost = location.host;
                        if (localHost == "218.22.3.196:8080") {
                            geoWmsUrl = geoWmsUrl.replace("10.129.2.220:8080", "218.22.3.196:8080");
                        }
                        var geoWmsLayer = new esri.layers.WMSLayer(geoWmsUrl, { resourceInfo: resourceInfo });
                        geoWmsLayer.setImageFormat("png");
                        geoWmsLayer.setVisibleLayers([layerName]);//"",]);
                        geoWmsLayer.id = "basemap_Surface";
                        self.BaseMap.addLayer(geoWmsLayer);
                        /*测试Layer的Feature*/
                    },
                    ShowRiverSurfaceLayer: function (layerName) {  /*添加river的geoserver*/
                        var self = this;
                        var geoWmsUrl = self.options.mapServer.replace("Anhui", "river");
                        var resourceInfo = {
                            extent: self.startExtent,
                            layerInfos: [], version: '1.1.1'
                        };
                        var geoWmsLayer = new esri.layers.WMSLayer(geoWmsUrl, { resourceInfo: resourceInfo });
                        geoWmsLayer.setImageFormat("png");
                        if (!!layerName) {
                            layerName = layerName.replace("Anhui", "river");
                            geoWmsLayer.setVisibleLayers([layerName]);//"",]);

                            geoWmsLayer.id = "river_Surface";
                            self.BaseMap.addLayer(geoWmsLayer);
                        }

                    },
                    ShowHighWayLayer: function (layerName) {/*加载平面地图*/
                        var self = this;
                        var self = this;
                        var geoWmsUrl = self.options.mapServer.replace("Anhui", "highway");
                        var resourceInfo = {
                            extent: self.startExtent,
                            layerInfos: [], version: '1.1.1'
                        };
                        var geoWmsLayer = new esri.layers.WMSLayer(geoWmsUrl, { resourceInfo: resourceInfo });
                        geoWmsLayer.setImageFormat("png");
                        layerName = layerName.replace("Anhui", "highway");
                        geoWmsLayer.setVisibleLayers([layerName]);//"",]);
                        geoWmsLayer.id = "highway_Surface";
                        self.BaseMap.addLayer(geoWmsLayer);
                        return;
                    },

                    ActiveCityArea: function (cityCode) {
                        var self = this;

                        self.RemoveLayer("basemap_Surface_Area");
                        if (cityCode.toString() == "340000") {
                            var dataUrl = "/scripts/main/data/Anhui_Area.json";
                            $.getJSON(dataUrl, function (jsonResult) {
                                var features = jsonResult.features;
                                var extent = self.AddPolylineLayer("basemap_Surface_Area", features, { opacity: 0.5, color: "#11EE69", lineWidth: 5 }, cityCode);
                                self.BaseMap.setExtent(self.startExtent);
                                //  self.BaseMap.setExtent(extent);
                                self.FlashActiveAreaLayer("basemap_Surface_Area", false);

                            });
                        } else {
                            if (parseInt(cityCode) % 100 == 0) {
                                $.getJSON("/scripts/main/data/city/" + cityCode.toString() + ".json", function (jsonResult) {
                                    var cityCodeArr = 0;
                                    var features = jsonResult.features;
                                    var activeFeatures = $.Enumerable.From(features)
                                    //.Where(function (x) { return x.properties.UNITCODE == cityCode; })
                                    .ToArray();
                                    var extent = self.AddPolylineLayer("basemap_Surface_Area", activeFeatures, { opacity: 0.5, color: "#11EE69", lineWidth: 5 }, cityCode);
                                    if (!!extent) {
                                        self.BaseMap.setExtent(extent);
                                    }
                                    self.FlashActiveAreaLayer("basemap_Surface_Area", true);
                                    return;

                                });
                            } else {
                                $.getJSON("/scripts/main/data/county/" + cityCode.toString() + ".json", function (jsonResult) {
                                    var features = jsonResult.features;
                                    var activeFeatures = $.Enumerable.From(features)
                                    .ToArray();
                                    var extent = self.AddPolylineLayer("basemap_Surface_Area", activeFeatures, { opacity: 0.5, color: "#75F4F4", lineWidth: 5 }, cityCode);
                                    self.BaseMap.setExtent(extent);
                                    self.FlashActiveAreaLayer("basemap_Surface_Area", true);
                                });

                            }
                        }
                    },
                    FlashActiveAreaLayer: function (layerId, defaultShow) {
                        var self = this;

                        self.activeLayer = self.BaseMap.getLayer(layerId);
                        if (!self.activeLayer) { return; }
                        if (!defaultShow) {
                            self.activeLayer.hide();
                        }
                        return;
                        self.intervalTime = 0;
                        if (!self.activeInterval) {
                            self.activeInterval = setInterval(function () {
                                if (!!self.activeLayer.visible) {
                                    self.activeLayer.hide();
                                } else {
                                    self.activeLayer.show();
                                }
                                self.intervalTime++;

                                if (self.intervalTime >= 10) {
                                    if (!defaultShow) {
                                        self.activeLayer.hide();
                                    }
                                    clearInterval(self.activeInterval);
                                    self.activeInterval = null;
                                }
                            }, 200);
                        }
                    },
                    VisibleLayerById: function (layerId, isShow) {
                        var self = this;
                        var layer = self.BaseMap.getLayer(layerId);
                        if (!!layer) {

                            layer.setVisibility(isShow);
                        } else {

                        }
                    },
                    DisplayCityLayer: function (cityLayerName, aroundCityArray) {
                        var self = this;
                        var baseLayerId = "basemap_Surface";
                        var layer = self.BaseMap.getLayer(baseLayerId);
                        var riverLayerNames = [];
                        var highwayLayerNames = [];
                        if (!!layer) {
                            var visibleLayerIds = layer.visibleLayers;
                            var activeVisibleLayerId = [];
                            activeVisibleLayerId.push(cityLayerName);
                            if (!!aroundCityArray) {

                                if ($.inArray("420000", aroundCityArray) > -1 || $.inArray("410000", aroundCityArray) > -1
                                    || $.inArray("360000", aroundCityArray) > -1 || $.inArray("330000", aroundCityArray) > -1
                                    || $.inArray("370000", aroundCityArray) > -1
                                    || $.inArray("320000", aroundCityArray) > -1) {
                                    for (var i = 0; i < aroundCityArray.length; i++) {
                                        activeVisibleLayerId.push("Anhui:" + aroundCityArray[i]);
                                    }
                                    //activeVisibleLayerId.push("Anhui:highway");
                                }
                                else {
                                    var aroundLayerNames = $.Enumerable.From(cities)
                                                            .Where(function (x) { return $.inArray(x.CITY_CODE, aroundCityArray) > -1; })
                                                            .Select(function (x) { return x.LAYER_NAME; })
                                                            .ToArray();
                                    var aroundRiverName = $.Enumerable.From(cities)
                                                            .Where(function (x) { return $.inArray(x.CITY_CODE, aroundCityArray) > -1 && x.CITY_CODE.substr(0, 2) == "34"; })
                                                            .Select(function (x) { return x.LAYER_NAME; })
                                                            .ToArray();
                                    if (!!aroundLayerNames) {
                                        for (var i = 0; i < aroundLayerNames.length; i++) {
                                            activeVisibleLayerId.push(aroundLayerNames[i]);

                                            //  highwayLayerNames.push(aroundLayerNames[i].replace("Anhui", "highway"));
                                        }
                                    }
                                    if (!!aroundRiverName) {
                                        for (var i = 0; i < aroundRiverName.length; i++) {
                                            riverLayerNames.push(aroundRiverName[i].replace("Anhui", "river"));
                                        }
                                    }
                                    //     self.ChangeCityRiver("Anhui:highway", false);
                                }
                            }
                            //if ("Anhui:XXZX_CITY_POLY" == cityLayerName) {
                            //    self.ChangeCityHighway(["highway:Anhui"], true);
                            //} else {
                            //    highwayLayerNames.push(cityLayerName.replace("Anhui", "highway"));
                            //    self.ChangeCityHighway(highwayLayerNames, true);
                            //}
                            if ("Anhui:XXZX_CITY_POLY" == cityLayerName) {

                                self.ChangeCityRiver(["river:AnHui"], true);
                            }
                            else {
                                riverLayerNames.push(cityLayerName.replace("Anhui", "river"));
                                self.ChangeCityRiver(riverLayerNames, true);
                            }

                            layer.setVisibleLayers(activeVisibleLayerId);
                        }
                    },
                    ChangeCityRiver: function (layerNames) {
                        var self = this;
                        var baseLayerId = "river_Surface";
                        var layer = self.BaseMap.getLayer(baseLayerId);
                        if (!!layer) {
                            layer.setVisibleLayers(layerNames);
                        }
                    },
                    ChangeCityHighway: function (layerNames) {
                        var self = this;
                        var baseLayerId = "highway_Surface";
                        var layer = self.BaseMap.getLayer(baseLayerId);
                        if (!!layer) {
                            layer.setVisibleLayers(layerNames);
                        }
                    },
                    DisplayLayerById: function (layerId, isShow, isVis) {
                        var self = this;
                        var baseLayerId = "river_Surface";
                        if (!!isVis) {
                            baseLayerId = "basemap_Surface";
                        }
                        var layer = self.BaseMap.getLayer(baseLayerId);
                        if (!!layer) {

                            var visibleLayerIds = layer.visibleLayers;
                            if ($.inArray(layerId, visibleLayerIds) > -1) {
                                if (!isShow) {
                                    var index = $.inArray(layerId, visibleLayerIds);
                                    visibleLayerIds.splice(index, 1);
                                    layer.setVisibleLayers(visibleLayerIds);
                                }
                            } else {
                                if (!!isShow) {
                                    visibleLayerIds.push(layerId);
                                    layer.setVisibleLayers(visibleLayerIds);
                                }
                            }
                        }
                    },
                    AddController: function () {
                        var self = this;
                        /*添加刻度尺*/
                        var scalebar = new Scalebar({
                            map: self.BaseMap,
                            scalebarUnit: "metric",
                            scalebarStyle: "line"
                        });

                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'><img id='btnExtent' src='/content/gis/images/eyeExtent.png' style='width:20px;height:20px;' title='鹰眼'></img></div>");
                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'><img id='btnFullExtent' src='/content/gis/images/reset.png' style='width:20px;height:20px;' title='原图'></img></div>");
                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'><img id='btn_table' src='/content/gis/images/Table.png' style='width:20px;height:20px;' title='表格'></img></div>");
                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'><img id='btnClassBreak' src='/content/gis/images/ColorBreak.png'style='width:20px;height:20px;'  title='色斑图'></img></div>");
                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'><img id='btnClassBreakSet' src='/content/gis/images/breakset.png'style='width:22px;height:22px;'  title='绘图阈值设置'></img></div>");
                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'><img id='btnChart' src='/content/gis/images/Chart.png' style='width:20px;height:20px;' title='时序图'></img></div>");
                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'> <img id='btnStationQuery' src='/content/gis/images/search_button.png' style='width:20px;height:20px;' title='站点查询'></img></div>");
                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;display:none;'> <img id='btnPreNumQuery' src='/content/gis/images/precx.png' style='width:22px;height:22px;' title='雨量范围查询'></img></div>");
                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'> <img id='btnCharactor' src='/content/gis/images/Text.png' style='width:20px;height:20px;' title='文字'></img></div>");
                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'><img id='btnExport' src='/content/gis/images/export.png'style='width:20px;height:20px;'  title='导出'></img></div>");
                        //$("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'><img id='btnFullSceen' src='/content/gis/images/activeSceen_gray.png' style='width:20px;height:20px; background-color:white;' title='全屏'></img></div>");
                        $("#mapDiv_zoom_slider").append("<div class='esriSimpleSliderDecrementButton' style='border-top: solid 1px #57585A;padding-top: 5px;font-size:16px;'><img id='btnClear' title='清除图层' src='/content/gis/images/delete.png'  style='width:20px;height:20px;'></img></div>");
                        self.SetMapToolbarEvent();
                    },
                    SetMapToolbarEvent: function () {
                        var self = this;
                        self.navToolbar = new esri.toolbars.Navigation(self.BaseMap);
                        on(self.navToolbar, "onExtentHistoryChange", self.extentHistoryChangeHandler);

                        dojo.connect(window, 'resize', self.BaseMap, self.BaseMap.resize);
                        self.BaseMap.on("extent-change", function () {
                            var center_y = (self.BaseMap.extent.ymax + self.BaseMap.extent.ymin) / 2;
                            var center_x = (self.BaseMap.extent.xmax + self.BaseMap.extent.xmin) / 2;
                            var centerPt = new esri.geometry.Point(center_x, center_y, self.webMercatorSpatialReference);
                            //self.BaseMap.centerAt(centerPt);

                        });
                        $("#btnFullExtent").click(function () {
                            //self.navToolbar.zoomToFullExtent();
                            self.ActiveTextInput = false;
                            self.BaseMap.setExtent(self.startExtent);
                        });

                        //$("#btnFullSceen").click(function () {
                        //    if (!$(this).hasClass("fullSceen")) {
                        //        $(this).attr("src", "/content/gis/images/fullSceen_gray.png");
                        //        $(this).addClass("fullSceen");
                        //    } else {
                        //        $(this).attr("src", "/content/gis/images/activeSceen_gray.png");
                        //        $(this).removeClass("fullSceen");
                        //    }
                        //});

                        on(dom.byId("btnExtent"), "click", function (event) {
                            //resize页面下，解决鼠标跑偏问题                 
                            var e = document.createEvent("Event");
                            e.initEvent("resize", true, true);
                            window.dispatchEvent(e);
                            self.MagnifierMap.BaseMap.resize();


                            self.BaseMap.graphics.clear();
                            self.BaseMap.setMapCursor("pointer");
                            self.ActiveTextInput = false;
                            self.mapDraw.activate(esri.toolbars.Draw.EXTENT);
                            var Mdiv = document.getElementById("MagnifierDiv");
                            Mdiv.style.display = "block";

                        });

                        on(dom.byId("btnCharactor"), "click", function (event) {
                            self.BaseMap.setMapCursor("text");
                            self.ActiveTextInput = true;

                        });

                        on(dom.byId("btnClear"), "click", function (event) {
                            //self.BaseMap.setExtent(self.startExtent);
                            self.ActiveTextInput = false;
                            self.ClearProductLayers();
                        });

                        on(dom.byId("btnExport"), "click", function (event) {
                            self.ActiveTextInput = false;
                            self.Export();
                        });

                        //self.BaseMap.on("mouse-drag", function (evt) {
                        //    if (self.BaseMap.infoWindow.isShowing) {
                        //        var loc = self.BaseMap.infoWindow.getSelectedFeature().geometry;
                        //        if (!self.BaseMap.extent.contains(loc)) {
                        //            self.BaseMap.infoWindow.hide();
                        //        }
                        //    }
                        //});

                        //dojo.connect(self.BaseMap, "onLayerAdd", function (item) {
                        //    if (!!self.AddLayerCallClick) {
                        //        if (item.id.indexOf("product") > -1) {
                        //            self.AddLayerCallClick(item);
                        //        }
                        //    }
                        //});

                        //dojo.connect(self.BaseMap, "onLayerRemove", function (item) {
                        //    if (!!self.RemoveLayerCallClick) {
                        //        self.RemoveLayerCallClick(item.id);
                        //    }
                        //});

                    },
                    extentHistoryChangeHandler: function () {
                        var self = this;
                        registry.byId("zoomprev").disabled = self.navToolbar.isFirstExtent();
                        registry.byId("zoomnext").disabled = self.navToolbar.isLastExtent();
                    },
                    ClearProductLayers: function () {
                        var self = this;
                        self.BaseMap.graphics.clear();
                        self.BaseMap.infoWindow.hide();
                        if (!!$("table[id*='_legend']") && $("table[id*= '_legend']").length > 0) {
                            $("table[id*='_legend']").remove();
                        }
                        $("#mapTitle").remove();
                        $("#topTenData").remove();
                        $("#product_class_break").remove();
                        var layerIds = ["product_point_nation", "product_point", "product_class_break"];
                        self.RemoveLayer(layerIds);

                    },
                    ReplaceTranslateCSS: function (cloneMapView, brow) {
                        // 需要根据色斑图容器、色斑图HTML标签中css3样式transform，计算left，top
                        var jq_break = cloneMapView.find("#mapDiv_product_class_break, #mapDiv_product_class_break img, #mapDiv_river_Surface, #mapDiv_river_Surface img, #mapDiv_basemap_Surface, #mapDiv_basemap_Surface img");
                        //alert(jq_break.length);
                        jq_break.each(function () {
                            var jq_this = $(this);
                            var transformCss = jq_this.css("transform");
                            //alert(transformCss);
                            var top;
                            var left;
                            if (transformCss.indexOf("translate") > -1) {
                                // 360极速模式
                                var pattern = /(-?\d+px)\s*,\s*(-?\d+px)/;
                                if (pattern.exec(transformCss) && RegExp.$1 && RegExp.$2) {
                                    left = RegExp.$1;
                                    top = RegExp.$2;
                                } else {
                                    //alert("导出功能不支持当前浏览器：" + transformCss);
                                    return true;
                                }
                            }
                            else if (transformCss.indexOf("matrix3d") > -1) {
                                // IE11
                                var postionArray = transformCss.replace("matrix3d", "").replace("(", "").replace(")", "").replace(" ", "").split(",");
                                left = postionArray[12] + "px";
                                top = postionArray[13] + "px";
                            }
                            else if (transformCss.indexOf("matrix") > -1) {
                                // IE10
                                var postionArray = transformCss.replace("matrix", "").replace("(", "").replace(")", "").replace(" ", "").split(",");
                                left = postionArray[4] + "px";
                                top = postionArray[5] + "px";
                            } else {
                                //  alert("导出功能不支持当前浏览器：" + transformCss);
                                return true;
                            }
                            jq_this.css({ "top": top, "left": left });
                        });
                        // qianwt 2017-09-04 注释掉beily代码，重新计算各个浏览器
                        //if (!!brow.chrome && !!brow.webkit) { return; }
                        //if (!!brow.msie) { /*标示为IE版本需要进行替换*/
                        //    alert("标示为IE版本需要进行替换");
                        //}
                        //if (!!brow.mozilla) { alert("标示为mozilla版本需要进行替换"); }
                        //if (!!brow.opera) { alert("标示为opera版本需要进行替换"); }
                        /*
                        if (cloneMapView.find("#mapDiv_product_class_break").length > 0) {
                            //alert("IE9以下不支持css，transform: translate3d(592px, 6px, 0px); 需要更改为：-ms-transform: translate(592px, 6px)");
                            var translateCss = cloneMapView.find("#mapDiv_product_class_break").css("transform");
                            if (translateCss != undefined && translateCss != "") {
                                var newCss = "";
                                var left = 0;
                                var top = 0;
                                if (translateCss.indexOf("matrix3d") > -1) {
                                    var postionArray = translateCss.replace("matrix3d", "").replace("(", "").replace(")", "").split(",");
                                    //var newMatrix = postionArray[12] + "px," + postionArray[13] + "px";
                                    //newCss = "translate(" + newMatrix + ")";
                                    cloneMapView.find("#mapDiv_product_class_break").css({ left: postionArray[12] + "px", top: postionArray[13] + "px" });
                                    //cloneMapView.find("#mapDiv_product_class_break").css({ "-webkit-transform": newCss });
                                }
                                else {
                                    if (translateCss.indexOf("translate3d") > -1) {
                                        var postionArray = translateCss.replace("translate3d", "").replace("(", "").replace(")", "").split(",");
                                        //var newMatrix = postionArray[0] + "," + postionArray[1];
                                        //newCss = "translate(" + newMatrix + ")";
                                        //alert(newCss);

                                        cloneMapView.find("#mapDiv_product_class_break").css({ left: postionArray[0], top: postionArray[1] });
                                        //cloneMapView.find("#mapDiv_product_class_break").css({ "-webkit-transform": newCss });
                                    } else {
                                        // cloneMapView.find("#mapDiv_product_class_break").css({ "-webkit-transform": translateCss });
                                    }
                                }

                            }
                            var img = cloneMapView.find("#mapDiv_product_class_break").find("img");
                            if (!!img) {
                                var imgTranslateCss = img.css("transform");


                                if (imgTranslateCss != undefined && translateCss != "") {
                                    var newCss = "";

                                    if (imgTranslateCss.indexOf("matrix3d") > -1) {
                                        var postionArray = imgTranslateCss.replace("matrix3d", "").replace("(", "").replace(")", "").split(",");
                                        //var newMatrix = postionArray[12] + "px," + postionArray[13] + "px";
                                        //newCss = "translate(" + newMatrix + ")";
                                        //alert("Image NEWCSS　＝　" + newCss);
                                        //img.css({ "transform": "" })
                                        //alert("设置Image的css成功=" + JSON.stringify({ "-webkit-transform": newCss }));
                                        //img.css({ "-webkit-transform": newCss });
                                        img.css({ left: postionArray[12] + "px", top: postionArray[13] + "px" });
                                    }
                                    else {
                                        if (translateCss.indexOf("translate3d") > -1) {
                                            var postionArray = imgTranslateCss.replace("translate3d", "").replace("(", "").replace(")", "").split(",");
                                            //var newMatrix = postionArray[0] + "," + postionArray[1];
                                            //newCss = "translate(" + newMatrix + ")";
                                            //alert("Image NEWCSS　＝　" + newCss);
                                            //img.css({ "-webkit-transform": newCss });
                                            //img.css({ "transform": "" })
                                            //img.css({ left: postionArray[12] + "px", top: postionArray[13] + "px" });
                                            img.css({ left: postionArray[0], top: postionArray[1] });
                                            //alert("设置Image的css成功=" + JSON.stringify({ "-webkit-transform": newCss }));
                                        } else {
                                            //alert("Image NEWCSS　No Change　＝　" + translateCss);
                                            // img.remove
                                            img.css({ "-webkit-transform": translateCss });
                                        }
                                    }
                                }
                            }
                        }
                        */
                        return;
                    },
                    Export: function () {
                        var self = this;
                        var width = $("#mapDiv").width();
                        var height = $("#mapDiv").height();
                        var html = $("#mapDiv").html();
                        var cloneMapView = $("<div></div>").html(html);
                        cloneMapView.find("div[id='mapDiv_zoom_slider']").remove();
                        cloneMapView.find("div.esriScalebar").remove();
                        // qianwt 2017-08-09 IE浏览器需要清除样式，clip: rect(auto, auto, auto, auto); 移除站点信息DIV begin
                        cloneMapView.find("#mapDiv_container").css("clip", "");
                        cloneMapView.find("div.esriPopup").remove();

                        // qianwt 2017-08-09 IE浏览器需要清除样式，clip: rect(auto, auto, auto, auto); 移除站点信息DIV begin
                        /*wkHtmlToImage 使用的sarafi和Chrome的内核，IE模式下的transform: translate3d(592px, 6px, 0px)样式需要更改为：-webkit-transform: translate(592px, 6px);*/

                        self.ReplaceTranslateCSS(cloneMapView, $.browser);

                        html = cloneMapView.html();
                        var format = "image";
                        AjaxUtil.Request("POST", "/API/MapExport/" + format + "?width=" + width + "&height=" + height, html, function (result) {
                            if (!!result.result) {
                                //var viewUrl = "/API/MapExport/" + result.data + "?format=" + format
                                //window.open(viewUrl, "导出GIS图");

                                // qianwt 2017-08-07 此处把GIS地图标题名作为导出文件名；filename必须通过encodeURIComponent进行中文编码，否则IE浏览器会乱码
                                var filename = $("#mapTitle span[name='editor_text']").text().replace(" ", "");
                                var viewUrl = "/API/MapExport/" + result.data + "?format=" + format + "&filename=" + encodeURIComponent(filename);
                                /// qianwt 2017-08-07 直接用当前页面下载链接，弃用window.open；360浏览器IE模式服务端会执行两次问题，此处暂时未做处理，可以通过form.post方式解决
                                location.href = viewUrl;
                                // qianwt 2017-08-07 通过创建一个链接下载 begin 
                                //var jq_a_gis_download = $("#a_gis_download");
                                //if (jq_a_gis_download.length == 0)
                                //{
                                //    jq_a_gis_download = $("<a id='a_gis_download'>导出GIS图</a>");
                                //    $(document.body).append(jq_a_gis_download);
                                //}
                                //jq_a_gis_download.attr("href", viewUrl);
                                //jq_a_gis_download.click();
                                // qianwt 2017-08-07 通过创建一个链接下载 end
                            }
                            else {
                                DialogUtil.error(result.error);
                            }
                        });
                    },
                    RemoveLayer: function (layerIds) {
                        var self = this;
                        if (layerIds instanceof Array) {
                            for (var i = 0; i < layerIds.length; i++) {
                                var layer = self.BaseMap.getLayer(layerIds[i]);

                                if (!!layer) {

                                    self.BaseMap.removeLayer(layer);
                                }
                            }
                        } else {
                            var layer = self.BaseMap.getLayer(layerIds);
                            if (!!layer) {
                                self.BaseMap.removeLayer(layer);
                            }
                        }
                    },
                    FocusStation: function (station) {
                        var self = this;
                        self.RemoveLayer("station_focus");
                        self.focusLayer = new esri.layers.GraphicsLayer({ id: "station_focus" });
                        var markerSymbol = new esri.symbol.PictureMarkerSymbol("\\content\\gis\\images\\station_focus.png", 28, 48);
                        var myPoint = new Point([station["Longitude"], station["Latitude"]], self.wgs84SpatialReference);
                        markerSymbol.setOffset(0, 19)
                        var mlpoint = new esri.geometry.Multipoint(new esri.SpatialReference({ wkid: 4326 }));
                        var myPoint1 = new Point([station["Longitude"] + 0.1, station["Latitude"] + 0.1], self.wgs84SpatialReference);
                        var myPoint2 = new Point([station["Longitude"] - 0.1, station["Latitude"] - 0.1], self.wgs84SpatialReference);
                        mlpoint.addPoint(myPoint);
                        mlpoint.addPoint(myPoint1);
                        mlpoint.addPoint(myPoint2);
                        self.BaseMap.centerAndZoom(myPoint, 1);
                        var extent = mlpoint.getExtent();
                        self.BaseMap.setExtent(extent.expand(2));
                        var graphic = new Graphic(myPoint, markerSymbol);
                        self.focusLayer.add(graphic);
                        self.BaseMap.addLayer(self.focusLayer);
                        self.focusLayer.hide();
                        self.intervalTime = 0;
                        if (!self.focusInterval) {
                            self.focusInterval = setInterval(function () {
                                if (!!self.focusLayer.visible) {
                                    self.focusLayer.hide();
                                } else {
                                    self.focusLayer.show();
                                }
                                self.intervalTime++;

                                if (self.intervalTime >= 20) {
                                    self.focusLayer.hide();
                                    clearInterval(self.focusInterval);
                                    self.focusInterval = null;
                                }
                            }, 200);
                        }
                    },

                    AddTextLabelLayer: function (layerAttr, markerData, infoTemplate, labelField, labelStyle, offset, opacity, labelType, minScale) {
                        /*labelType表示能见度或者其他类型*/

                        var self = this;
                        if (!opacity) { opacity = 1; }
                        var features = [];
                        var id = layerAttr;
                        var name = "";
                        if (layerAttr instanceof String) {
                            id = layerAttr;
                        } else {
                            id = layerAttr.id;
                            name = layerAttr.name;
                        }
                        if (!labelStyle) {
                            labelStyle = { fontSize: "11px" };
                        }
                        var labelGraphicsLayer = self.BaseMap.getLayer(id);
                        var layerIsExisted = true;
                        if (!labelGraphicsLayer) {
                            layerIsExisted = false;
                            labelGraphicsLayer = new esri.layers.GraphicsLayer({ id: id, name: name });
                        }

                        // var labelGraphicsLayer = new esri.layers.GraphicsLayer({ id: id });
                        labelGraphicsLayer.name = name;
                        var font = new Font(labelStyle.fontSize, Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD);
                        for (var i = 0; i < markerData.length; i++) {
                            var pointModel = markerData[i];
                            var labelPoint = new Point(pointModel.Point, self.wgs84SpatialReference);
                            var colorStr = "#000000";
                            if (!!pointModel.Color) {
                                colorStr = pointModel.Color.toLowerCase().replace("0x", "#");
                            }

                            var textStr = pointModel.TextArray[0];
                            var timeStr = "";
                            if (pointModel.TimeArray != null && pointModel.TimeArray.length > 0) {
                                timeStr = pointModel.TimeArray[0];
                            }
                            if (labelType == 2) {/*标示能见度*/
                                if (parseFloat(textStr) > 1000) {
                                    textStr = parseInt(parseFloat(textStr) / 1000);
                                } else {
                                    textStr = parseFloat(textStr) / 1000;
                                }
                            }
                            //if (!!timeStr && timeStr.length > 0) {
                            //    textStr = textStr + "(" + timeStr + ")";
                            //}
                            var textSymbol = new TextSymbol(textStr, font, new Color(colorStr));
                            if (!!offset) {
                                textSymbol.setOffset(offset.x, offset.y);
                            }
                            var graphic = new Graphic(labelPoint, textSymbol);
                            var attr = pointModel.Properties;
                            graphic.setAttributes(attr);
                            labelGraphicsLayer.add(graphic);
                        }
                        if (!layerIsExisted) {
                            labelGraphicsLayer.setOpacity(opacity);
                            self.BaseMap.addLayer(labelGraphicsLayer);
                            if (!!minScale) {
                                labelGraphicsLayer.setMinScale(minScale);
                            }

                            self.AddMapClickEvent(labelGraphicsLayer);
                        }
                        return;
                    },
                    AddMarkerLayer: function (layerAttr, markerData, infoTemplate, labelField, labelStyle, offset, opacity, minScale) {
                        var self = this;
                        var name = "";
                        var id = layerAttr;
                        if (layerAttr instanceof String) {
                            id = layerAttr;
                        } else {
                            id = layerAttr.id;
                            name = layerAttr.name;
                        }
                        var graphicLayer = self.BaseMap.getLayer(id);
                        var layerIsExisted = true;
                        if (!graphicLayer) {
                            layerIsExisted = false;
                            graphicLayer = new esri.layers.GraphicsLayer({ id: id, name: name });
                        }
                        var markerSymbol = new esri.symbol.PictureMarkerSymbol("\\content\\gis\\images\\station.png", 8, 8);

                        for (var i = 0; i < markerData.length; i++) {
                            var pointModel = markerData[i];
                            var myPoint = new Point(pointModel.Point, self.wgs84SpatialReference);
                            if (!!pointModel.Symbol) {
                                markerSymbol = new esri.symbol.PictureMarkerSymbol(pointModel.Symbol.Link, pointModel.Symbol.Size.w, pointModel.Symbol.Size.h);
                                markerSymbol.setAngle(pointModel.Symbol.Angle);
                            }
                            var graphic = new Graphic(myPoint, markerSymbol);
                            graphic.setAttributes(pointModel.Properties);
                            graphicLayer.add(graphic);
                        }
                        if (!layerIsExisted) {
                            if (!!minScale) {
                                graphicLayer.setMinScale(minScale);
                            }
                            self.BaseMap.addLayer(graphicLayer);
                            self.AddMapClickEvent(graphicLayer);
                        }

                    },
                    AddLegendLayer: function (legendId, legendData, infoTemplate, labelField, labelStyle, offset, opacity) {
                        var self = this;

                        var legend = $("#" + legendId);
                        if (!legendData) {
                            if (!!legend && legend.length > 0) {
                                isExisted = true;
                                $(legend).empty();
                            }
                            return;
                        }
                        self.proTypeLegends = legendData.legends;
                        var legendHeight = (legendData.legends.length + 1) * 30 + 30;
                        var top = $("#mapDiv").height();
                        top = window.screen.height;
                        var width = $("#mapDiv").width();
                        var selfWidth = 200;
                        var offSetX = (width - selfWidth + 40);
                        //offSetX = 40;
                        //   $(".scalebar_bottom-left").css({ "left": 25 + "px", "top": top - 230 + "px" });
                        if (!legend || legend.length == 0) {
                            legend = $("<table id='" + legendId + "'  style='cursor:move;font-family:Microsoft Yahe, 宋体, Arial, sans-serif; font-size:14px;  border-collapse: separate;border-spacing:5px;position:relative; background-color:white; '></table>").appendTo($("#mapDiv"));
                            $(legend).css({ top: (-legendHeight) + "px", left: offSetX + "px" });
                            $(legend).width(selfWidth);
                            var m1 = new dojo.dnd.Moveable(legendId, { box: { l: 100, t: 100, w: 500, h: 500 } });
                        } else {
                            $(legend).empty();
                        }
                        var title = legendData.title;
                        title = title.replace("风向", "");
                        var titleStr = "<tr style='border-collapse:collapse;'><th colspan='2' style='text-align:left;'><b>" + title + "统计";
                        if (legendData.title == "积雪深度") {
                            titleStr += "<br/>(0.0cm代表微量)";
                        }
                        titleStr += "</b></th></tr>";
                        legend.append(titleStr);
                        var colors = ["#3399FF", "#FF3300", "#92D050", "#F79646", "#93CDDD", "#8064A2", "#FFC000"]
                        for (var i = legendData.legends.length - 1; i >= 0 ; i--) {
                            var color = legendData.legends[i].color.toLowerCase().replace("0x", "#");
                            var text = legendData.legends[i].text;
                            legend.append("<tr><td style='background-color:" + color + ";width:30px;height:18px;'></td><td style='padding-left:5px;padding-right:10px;'>" + text + "</td></tr>");
                            //if (legendData.title == "积雪深度" && i == 0) {
                            //    legend.append("<tr><td style='width:30px;height:18px;'>&nbsp;</td><td  style='padding-left:5px;padding-right:10px;'> 0.01cm 代表微量 </td></tr>");
                            //}
                        }
                    },
                    AddHistoryLayer: function (legendId, legendData, infoTemplate, labelField, labelStyle, offset, opacity) {
                        var self = this;
                        var legend = $("#" + legendId);
                        if (!legendData) {
                            if (!!legend && legend.length > 0) {
                                $(legend).empty();
                            }
                            return;
                        }
                        var legendHeight = (legendData.legends.length + 1) * 30 + 40;

                        if (!legend || legend.length == 0) {
                            legend = $("<table id='" + legendId + "'  style='cursor:pointer;font-family:Microsoft Yahe, 宋体, Arial, sans-serif; font-size:14px;  border-collapse: separate;border-spacing:5px;position:absolute; '></table>").appendTo($("#mapDiv"));
                            var top = $("#mapDiv").height();
                            var width = $("#mapDiv").width();
                            $(legend).css({ top: (top - legendHeight) + "px", left: 20 + "px" });
                            var m1 = new dojo.dnd.Moveable(legendId, { box: { l: 100, t: 100, w: 500, h: 500 } });
                        } else {
                            $(legend).empty();
                            var top = $("#mapDiv").height();
                            var width = $("#mapDiv").width();
                            $(legend).css({ top: (top - legendHeight) + "px", left: 20 + "px" });
                        }
                        legend.append("<tr style='border-collapse:collapse;'><th colspan='2' style='text-align:center;'><b>" + legendData.title + "统计</b></th></tr>");
                        var colors = ["#3399FF", "#FF3300", "#92D050", "#F79646", "#93CDDD", "#8064A2", "#FFC000"]
                        for (var i = 0; i < legendData.legends.length; i++) {
                            var color = legendData.legends[i].color.toLowerCase().replace("0x", "#");
                            var text = legendData.legends[i].text;
                            legend.append("<tr><td style='background-color:" + color + ";width:30px;height:18px;'></td><td style='padding-left:5px;padding-right:10px;'>" + text + "</td></tr>");
                        }
                    },
                    AddClassBreakByImageLayer: function (layerId, extent, imageUrl) {
                        var self = this;
                        var mil = new esri.layers.MapImageLayer({ 'id': layerId });
                        var mi = new esri.layers.MapImage({
                            extent: new Extent(extent[0], extent[1], extent[2], extent[3], { wkid: 4326 }),
                            'href': imageUrl
                        });

                        mil.addImage(mi);
                        // mil.setOpacity(0.9);
                        self.BaseMap.addLayer(mil);
                        self.BaseMap.reorderLayer(mil, 0);

                    },
                    AddBreakLegendLayer: function (legendObject, legendData, infoTemplate, labelField, labelStyle, offset, opacity) {
                        var self = this;

                        var legendId = legendObject;
                        if (legendObject instanceof Object) {
                            legendId = legendObject.id;
                        } else {
                            legendId = legendObject;

                        }
                        var ticket = 30;
                        if (legendData.legends.length * 30 > 360) {
                            ticket = 400 / legendData.legends.length;
                        }

                        var legendHeight = (legendData.legends.length + 1) * ticket + 40;

                        //  var legendHeight = (legendData.legends.length + 1) * 20 + 40;
                        if (legendHeight < 360) { legendHeight = 360; }
                        var legend = $("#" + legendId);


                        var top = $("#mapDiv").height();
                        top = window.screen.height;
                        var width = $("#mapDiv").width();
                        var selfWidth = 200;
                        var offSetX = (width - selfWidth + 40);

                        if (!legend || legend.length == 0) {
                            legend = $("<ul id='" + legendId + "' class='gis-legend' style='cursor:move;'></ul>").appendTo($("#mapDiv"));

                            var top = $("#mapDiv").height();
                            var width = $("#mapDiv").width();
                            //   $(legend).css({ top: (top - legendHeight - 30) + "px", left: 20 + "px" });
                            $(legend).css({ top: (top - legendHeight - 40) + "px", left: offSetX + "px" });
                        } else {
                            $(legend).empty();
                            var top = $("#mapDiv").height();
                            var width = $("#mapDiv").width();

                            // $(legend).css({ top: (top - legendHeight - 30) + "px", left: 20 + "px" });
                            //    $(legend).css({ top: ($("#mapDiv_zoom_slider").top + $("#mapDiv_zoom_slider").height + 30) + "px", left: 20 + "px" });
                        }
                        legend.show();
                        var title = legendData.title;
                        title = title.replace("风向", "");
                        legend.append("<li   class='rotate-style' id='btnClassBreakSet' title='点击设置色斑图阈值'><b style='font-size:16px;'>" + title + "(" + legendData.unit + ")</b></li>");
                        var colors = ["#3399FF", "#FF3300", "#92D050", "#F79646", "#93CDDD", "#8064A2", "#FFC000"];
                        var legendLength = legendData.legends.length;
                        var eachHeight = legendHeight / legendLength;

                        for (var i = legendLength - 1; i >= 0; i--) {
                            var color = legendData.legends[i].color.toLowerCase().replace("0x", "#");
                            var text = legendData.legends[i].text;
                            legend.append("<li style='height:" + eachHeight + "px;width:100%;float:left;'><span style='background-color:" + color + ";width:18px;height:" + eachHeight + "px; display:inline-block;float:left;'></span><span class='rotate-style'  style='padding-left:5px;display:inline-block;float:left;padding-right:20px;margin-top:-10px; '>" + text + "</span></li>");//
                        }
                        var m1 = new dojo.dnd.Moveable(legendId, { box: { l: 100, t: 100, w: 500, h: 500 } });
                    },
                    AddPolylineLayer: function (layerId, features, styleOption, cityCode) {
                        var self = this;
                        var opacity = 1;
                        var color = "#FFFFFF";
                        var lineWidth = 2;
                        if (!!styleOption && !!styleOption.opacity) { opacity = styleOption.opacity; }
                        if (!!styleOption && !!styleOption.color) { color = styleOption.color; }
                        if (!!styleOption && !!styleOption.lineWidth) { lineWidth = styleOption.lineWidth; }
                        var path1 = [[114.9783, 29.4225], [115.15432285714286, 34.661825], [115.28634000000001, 34.661825], [114.9783, 30.480075], [114.9783, 29.4225]];
                        var graphicLayer = new esri.layers.GraphicsLayer({ id: layerId });
                        var index = 0;
                        if (cityCode == "340600" || cityCode == "341300" || cityCode == "341299") { index = 2; } else
                            if (cityCode == "340799" || cityCode == "341881") { index = 1; }
                            else if (cityCode == "340100") { index = 5; }
                            else if (cityCode == "341100") { index = 9; }
                            else if (cityCode == "341200") { index = 14; }
                            else if (cityCode == "341600") { index = 15; }
                            else
                            { index = 0; }
                        for (var i = 0; i < features.length; i++) {
                            var geometry = features[i].geometry;
                            var cooridinates = geometry.coordinates;
                            var line = new esri.geometry.Polyline({
                                "paths": cooridinates[index],// multiPologon,
                                "spatialReference": { "wkid": 4326 }
                            });
                            var lineSymbol = new esri.symbol.CartographicLineSymbol(
                              esri.symbol.CartographicLineSymbol.STYLE_SOLID,
                              new dojo.Color(color), lineWidth,
                              esri.symbol.CartographicLineSymbol.CAP_ROUND,
                              esri.symbol.CartographicLineSymbol.JOIN_MITER, 5
                            );

                            var polyline = new esri.Graphic(line, lineSymbol);
                            graphicLayer.add(polyline);

                        }
                        graphicLayer.setOpacity(opacity);
                        self.BaseMap.addLayer(graphicLayer);

                        var extent_new = null;
                        if (!!graphicLayer.graphics && graphicLayer.graphics.length > 0) {
                            for (var i = 0; i < graphicLayer.graphics.length; i++) {
                                var extent = graphicLayer.graphics[i].geometry.getExtent();
                                if (!extent_new) {
                                    extent_new = extent;
                                } else {
                                    if (extent_new.xmin > extent.xmin) {
                                        extent_new.xmin = extent.xmin;
                                    }
                                    if (extent_new.ymin > extent.ymin) {
                                        extent_new.ymin = extent.ymin;
                                    }
                                    if (extent_new.xmax < extent.xmax) {
                                        extent_new.xmax = extent.xmax;
                                    }
                                    if (extent_new.ymax < extent.ymax) {
                                        extent_new.ymax = extent.ymax;
                                    }
                                }
                            }
                        }
                        extent_new.ymax = extent_new.ymax + 0.1;
                        //extent_new.xmax = extent_new.xmax + 0.1;
                        extent_new.ymin = extent_new.ymin - 0.1;
                        //extent_new.xmin = extent_new.xmin - 0.1;
                        return extent_new;
                    },
                    AddMultiPolygonLayer: function (layerAttr, features, opacity) {

                        var self = this;
                        if (!opacity) { opacity = 1; }
                        var name = "";
                        var id = layerAttr;
                        if (layerAttr instanceof String) {
                            id = layerAttr;
                        } else {
                            id = layerAttr.id;
                            name = layerAttr.name;
                        }
                        var graphicLayer = new esri.layers.GraphicsLayer({ id: id, name: name });
                        graphicLayer.spatialReference = new SpatialReference(102100);
                        for (var i = 0; i < features.length; i++) {
                            var geometry = features[i].geometry;
                            var cooridinates = geometry.coordinates;
                            for (var j = 0; j < cooridinates.length; j++) {
                                var multiPologon = cooridinates[j];
                                var line = new esri.geometry.Polyline({
                                    "paths": multiPologon,
                                    "spatialReference": self.wgs84SpatialReference
                                });
                                var lineSymbol = new esri.symbol.CartographicLineSymbol(
                                  esri.symbol.CartographicLineSymbol.STYLE_SOLID,
                                  new dojo.Color("#000000"), 1,
                                  esri.symbol.CartographicLineSymbol.CAP_ROUND,
                                  esri.symbol.CartographicLineSymbol.JOIN_MITER, 1
                                );
                                var polyline = new esri.Graphic(line, lineSymbol);
                                graphicLayer.add(polyline);
                            }
                        }
                        graphicLayer.setOpacity(opacity);
                        self.BaseMap.addLayer(graphicLayer);

                    },
                    CreateRingFeature: function (rings, attributes, fillColor) {
                        var self = this;
                        if (!fillColor) { fillColor = "#000000"; }
                        var opacity = 1;
                        if (fillColor == "#FFFFFF" || fillColor == "#ffffff") {
                            opacity = 0;
                            fillColor = [0, 0, 0, 0];
                        }
                        var polygonJson = {
                            "rings": [[[-122.63, 45.52], [-122.57, 45.53], [-122.52, 45.50], [-122.49, 45.48],
      [-122.64, 45.49], [-122.63, 45.52], [-122.63, 45.52]]], "spatialReference": { "wkid": 4326 }
                        };


                        var rings = new esri.geometry.Polygon({
                            "rings": rings,
                            "spatialReference": { "wkid": 4326 }
                        });
                        if (fillColor == "#FFFFFF" || fillColor == "#ffffff") {
                            return null;
                        }
                        var fillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color(fillColor), 0),
                            new dojo.Color(fillColor));
                        var polyline = new esri.Graphic(rings, fillSymbol);
                        polyline.attributes = attributes;
                        return polyline;

                    },
                    AddClassBreakLayer: function (CurrentElement, layerAttr, breakDataList, range, colorList) {

                        var self = this;
                        var name = "";

                        var id = layerAttr;
                        if (layerAttr instanceof Object) {
                            id = layerAttr.id;
                            name = layerAttr.name;
                        } else {
                            id = layerAttr;
                        }
                        var renderFieldName = "RenderData";
                        var alpha = 1; //透明度
                        var outline = new SimpleLineSymbol(
    SimpleLineSymbol.STYLE_NULL);
                        var symbol = new SimpleFillSymbol();
                        symbol.setColor(new Color([255, 255, 255, 0])).setOutline(outline);
                        var renderer = new ClassBreaksRenderer(symbol, renderFieldName);
                        var minValue = -99999;
                        var maxValue = 99999;
                        var emptyChartRanges = [];
                        {
                            $(range).each(function (index) {
                                var value = range[index];
                                if (index == 0) { minValue = Infinity; }

                                //var breakColor = colorList[index + 1];
                                var breakColor = colorList[index];
                                var colorStr = CommonUtil.brgba(breakColor);
                                colorStr = colorStr.replace("rgba(", "").replace(")", "");
                                var colorArray = colorStr.split(",");

                                if ("0XFFFFFF" == breakColor) {
                                    renderer.addBreak(minValue, value, new SimpleFillSymbol().setColor(new Color([colorArray[0], colorArray[1], colorArray[2], 0])).setOutline(outline));

                                    emptyChartRanges.push({ min: minValue, max: value });
                                } else {

                                    renderer.addBreak(minValue, value, new SimpleFillSymbol().setColor(new Color([colorArray[0], colorArray[1], colorArray[2], alpha])).setOutline(outline));
                                }
                                minValue = value;
                                if (index == range.length - 1) {
                                    var breakColor = colorList[index];
                                    var colorStr = CommonUtil.brgba(breakColor);
                                    colorStr = colorStr.replace("rgba(", "").replace(")", "");
                                    var colorArray = colorStr.split(",");
                                    renderer.addBreak(value, Infinity, new SimpleFillSymbol().setColor(new Color([colorArray[0], colorArray[1], colorArray[2], alpha])).setOutline(outline));
                                }

                            });
                        }
                        /*todo Set field*/
                        var fields = [
                                    {
                                        "name": "FID",
                                        "type": "esriFieldTypeOID",
                                        "alias": "FID"
                                    },
                                    {
                                        "name": "RenderData",
                                        "type": "esriFieldTypeSingle",
                                        "alias": "RenderData"
                                    }];

                        /*todo  fill feature Set*/

                        breakDataList = $.Enumerable.From(breakDataList)
                                             .OrderBy(function (x) { return x.Value })
                                             .ToArray();
                        var features = [];

                        for (var index = 0; index < breakDataList.length; index++) {
                            var item = breakDataList[index];
                            var points = item.PointList;
                            //if (item.Type == "Close") { continue; }
                            //if (item.Value > 36) { continue; }
                            if (!points || points.length == 0) { continue; }
                            var needAdd = true;

                            var maxValue = 1;
                            for (var i = 0; !!emptyChartRanges && i < emptyChartRanges.length; i++) {
                                var emptyChartRange = emptyChartRanges[i];
                                maxValue = emptyChartRange.max;
                                if (emptyChartRange.min == Infinity) {
                                    if (parseFloat(item.Value) < emptyChartRange.max - 0.01) {
                                        needAdd = false;
                                    }
                                    break;
                                }

                                if (emptyChartRange.max == Infinity) {
                                    if (parseFloat(item.Value) > emptyChartRange.min) {
                                        needAdd = false;
                                    }
                                    break;
                                }
                                if (parseFloat(item.Value) < emptyChartRange.max - 0.01) {
                                    needAdd = false;
                                    break;
                                }

                            }

                            if (!needAdd) {

                                continue;
                            }

                            var geometries = [];
                            for (var j = 0; j < points.length; j++) {
                                geometries.push(new Point([points[j].X, points[j].Y], self.wgs84SpatialReference));
                            }
                            var polygon = new Polygon(self.wgs84SpatialReference);
                            polygon.addRing(geometries);

                            var graphic = new Graphic(polygon);
                            if (graphic == null) { continue; }

                            var attributes = { "FID": index, RenderData: item.Value };

                            graphic.attributes = attributes;
                            // if (item.Value <=10 ) {
                            features.push(graphic);
                            //  }

                        }

                        var layerDefinition = {
                            geometryType: "esriGeometryPolygon",
                            fields: fields
                        }
                        var featureSet = new FeatureSet();
                        featureSet.features = features;
                        featureSet.fields = fields;
                        featureSet.fieldAliases = { FID: "FID", RenderData: "RenderData" };
                        featureSet.geometryType = "esriGeometryPolygon";
                        featureSet.spatialReference = self.wgs84SpatialReference;
                        var featureCollection = {
                            layerDefinition: layerDefinition,
                            featureSet: featureSet
                        };

                        var layer = new FeatureLayer(featureCollection, {
                            mode: FeatureLayer.MODE_SNAPSHOT,
                            infoTemplate: null,
                            outFields: ["*"],
                            id: id,
                            name: name
                        });
                        layer.setRenderer(renderer);
                        self.BaseMap.addLayer(layer);
                        self.BaseMap.reorderLayer(layer, 0);

                        //if (self.classBreakLegend != null) {
                        //    self.classBreakLegend.refresh([{ layer: layer }]);
                        //}
                        //else {
                        //    self.classBreakLegend = new Legend({
                        //        map: self.BaseMap,
                        //        layerInfos: [{ layer: layer }]
                        //    }, "legend");
                        //    self.classBreakLegend.startup();
                        //}
                    },
                    GetColorByRangeValue: function (range, value, colorArray) {
                        var index = $.inArray(value, range);
                        if (index == -1) { return colorArray[0]; }
                        if (index < colorArray.length) {
                            return colorArray[index + 1];
                        } else {
                            return colorArray[colorArray.length - 1];
                        }

                    },
                    AddTextToGraphicsLayer: function (labelGraphicsLayer, pointModel, labelField, labelStyle, labelType) {
                        /*labelType表示能见度或者其他类型*/
                        var self = this;
                        var offset = { x: 0, y: 10 };
                        if (!labelStyle) {
                            labelStyle = { fontSize: "14px" };
                        }
                        var font = new Font(labelStyle.fontSize, Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD);
                        var labelPoint = new Point([pointModel.Lon, pointModel.Lat], self.wgs84SpatialReference);
                        var colorStr = "#4300fb";
                        var val = pointModel.Customer_Value[0];
                        if (!!pointModel.Color) {
                            colorStr = pointModel.Color.toLowerCase().replace("0x", "#");
                        }
                        else {
                            if (self.proTypeLegends != null) {
                                for (var i = 0; i < self.proTypeLegends.length; i++) {
                                    var item = self.proTypeLegends[i];
                                    var col = item.color.toLowerCase().replace("0x", "#");;
                                }
                            }
                        }
                        var textStr = pointModel.Customer_Value[0];
                        if (labelType == 2) {/*标示能见度*/
                            if (parseFloat(textStr) > 1000) {
                                textStr = parseInt(parseFloat(textStr) / 1000);
                            } else {
                                textStr = parseFloat(textStr) / 1000;
                            }
                        }
                        var textSymbol = new TextSymbol(textStr, font, new Color(colorStr));
                        if (!!offset) {
                            textSymbol.setOffset(offset.x, offset.y);
                        }
                        var graphic = new Graphic(labelPoint, textSymbol);
                        graphic.setAttributes(pointModel);
                        labelGraphicsLayer.add(graphic);

                    },
                    RemoveGraphicsFromLayer: function (graphics, layerName) {
                        var self = this;
                        var graphicLayer = self.BaseMap.getLayer(layerName);
                        var isExisted = false;
                        if (!!graphicLayer) {
                            var activeStation = null;
                            var stationCode = null;
                            if (!!graphics.attributes.Station_Id_C) {
                                stationCode = graphics.attributes.Station_Id_C;
                                activeStation = $.Enumerable.From(graphicLayer.graphics).Where(function (x) { return x.attributes.Station_Id_C == graphics.attributes.Station_Id_C }).FirstOrDefault();
                            }
                            if (!!graphics.attributes.StationCode) {
                                stationCode = graphics.attributes.StationCode;

                            }
                            var activeStation = $.Enumerable.From(graphicLayer.graphics).Where(function (x) { return x.attributes.StationCode == stationCode || x.attributes.Station_Id_C == stationCode }).FirstOrDefault();
                            if (!!activeStation) {
                                graphicLayer.remove(activeStation);
                                isExisted = true;
                            }
                            //if (!!isExisted && !!self.RemoveGraphicsCallback) {

                            //}
                        }
                    },
                    ChangeGraphicsValue: function (item) {
                        var self = this;
                        //var graphicLayer = self.BaseMap.getLayer("product_point_nation");
                        var graphicLayer = self.BaseMap.getLayer("product_point");
                        var isExisted = false;
                        if (!!graphicLayer) {

                            var activeStation = $.Enumerable.From(graphicLayer.graphics).Where(function (x) { return x.attributes.Station_Id_C == item.Station_Id_C }).FirstOrDefault();
                            if (!!activeStation) {
                                activeStation.attributes = item;
                                if (!!activeStation.symbol) {
                                    var newSymbol = JSON.parse(JSON.stringify(activeStation.symbol));
                                    newSymbol.url = "\content\gis\images\wind_90_90\10.png";
                                    activeStation.setSymbol(newSymbol);
                                } else {
                                    graphicLayer.remove(activeStation);
                                    self.AddTextToGraphicsLayer(graphicLayer, item);
                                }
                                isExisted = true;
                            }
                        }
                        if (!isExisted) {
                            graphicLayer = self.BaseMap.getLayer("product_point_nation");
                            if (!!graphicLayer) {
                                var activeStation = $.Enumerable.From(graphicLayer.graphics).Where(function (x) { return x.attributes.Station_Id_C == item.Station_Id_C }).FirstOrDefault();
                                if (!!activeStation) {
                                    activeStation.attributes = item;
                                    if (!!activeStation.symbol) {
                                        var newSymbol = JSON.parse(JSON.stringify(activeStation.symbol));
                                        newSymbol.url = "\content\gis\images\wind_90_90\10.png";
                                        activeStation.setSymbol(newSymbol);
                                    } else {
                                        graphicLayer.remove(activeStation);
                                        self.AddTextToGraphicsLayer(graphicLayer, item);
                                    }
                                    isExisted = true;
                                }
                            }
                        }
                        if (!!graphicLayer && isExisted) {
                            graphicLayer.refresh();
                        }
                    },
                    GetInfoWindowContent: function (graphicData, activeProductType) {

                        var isMaxMin = false;
                        var isVis = false;
                        var isWin = false;
                        if (activeProductType.TypeCode_CIMISS.indexOf("Max") > -1 || activeProductType.TypeCode_CIMISS.indexOf("MAX") > -1 || activeProductType.TypeCode_CIMISS.indexOf("Min") > -1 || activeProductType.TypeCode_CIMISS.indexOf("MIN") > -1) {
                            isMaxMin = true;
                        }
                        if (activeProductType.TypeCode_CIMISS.indexOf("WIN") > -1 || activeProductType.TypeCode_CIMISS.indexOf("Win") > -1) {
                            isWin = true;
                        }
                        if (activeProductType.TypeCode_CIMISS.indexOf("VIS") > -1 || activeProductType.TypeCode_CIMISS.indexOf("Vis") > -1) {
                            isVis = true;
                        }
                        var isInternet = $("#IsInternet").val() == "True" ? true : false;
                        if (!!graphicData && graphicData.Customer_Value != null && graphicData.Customer_Value != undefined) {

                            var htmlContent = "<table class='grid-table'><tr><td style='width:80px;'>站名</td><td style='width:80px;'>{{Station_Name}}</td></tr><tr><td style='width:80px;'>站码</td><td style='width:160px;'>{{Station_Id_C}}</td></tr>";

                            htmlContent += " <tr><td>所属区域</td><td>{{GetCityName Admin_Code_CHN}} - {{GetContryName Admin_Code_CHN}}</td></tr>";
                            if (!isInternet) {
                                htmlContent += " <tr><td>经度</td><td>{{ToFixed Lon 2}}</td></tr><tr><td>纬度</td><td>{{ToFixed Lat 2}}</td></tr>";
                            } else {/**/
                                var functionIds = $("#FunctionIds").val().split(',');
                                /*A,A10001,A10002,A10004,A10005,A10006,B,B10002,B10004*/
                                if (functionIds.indexOf("B10011") > -1) {
                                    htmlContent += " <tr><td>经度</td><td>{{ToFixed Lon 2}}</td></tr><tr><td>纬度</td><td>{{ToFixed Lat 2}}</td></tr>";
                                }/*显示经纬度*/
                            }
                            var typeName = activeProductType.TypeName;
                            if (activeProductType.TypeCode_CIMISS.indexOf("PRE") > -1) {
                                typeName = "降水量";
                            }
                            if (!!isWin) {
                                htmlContent += "<tr><td>" + typeName + "</td><td><input name='value_text' type='text' value='{{ShowCustomerByIndex Customer_Value 1}}'  style='width:40px;'/>" + activeProductType.UNIT + "<input name='value_text_ext' readonly type='text' value='{{ShowCustomerByIndex Customer_Value 0}}'  style='width:40px;'/>(°)</td></tr>";

                            } else {
                                if (!!isVis) {/*能见度*/
                                    htmlContent += " <tr><td>" + typeName + "</td><td><input name='value_text' type='text' value='{{ShowCustomerVISByIndex Customer_Value 0}}'  style='width:60px;'/>" + activeProductType.UNIT + "</td></tr>";
                                }
                                else {
                                    htmlContent += " <tr><td>" + typeName + "</td><td><input name='value_text' type='text' value='{{ShowCustomerByIndexForInput Customer_Value 0 }}'  style='width:60px;'/>" + activeProductType.UNIT + "</td></tr>";
                                    if (activeProductType.TypeCode_CIMISS.indexOf("PRE_Arti_Enc_CYC") > -1) {
                                        htmlContent += "<tr><td>加密周期</td><td><input name='value_text' type='text' value='{{ShowCustomerByIndex Customer_Value 1}}'  style='width:40px;'/>h</td></tr>";
                                    }
                                }
                            }

                            if (isMaxMin) {
                                if (!isWin) {
                                    htmlContent += " <tr><td>出现时间</td> <td>{{ShowDayHour DayHour}}{{ShowCustomerTimeByIndex Customer_Value 1}}</td></tr>";
                                } else {

                                    htmlContent += " <tr><td>出现时间</td> <td>{{ShowDayHour DayHour}}{{ShowCustomerTimeByIndex Customer_Value 2}}</td></tr>";
                                }
                            }
                            // qianwt 2017-11-15 温度->三小时变温，不显示查看时序图 begin
                            //if (activeProductType.Id != 15) {
                            //    htmlContent += " <tr><td style='width:80px;' colspan='2'><a  name='chart_link'  href='javascript:;' style='color:blue;cursor:pointer;'>查看时序图</a></td></tr>";
                            //}
                            // qianwt 2017-11-15 温度->三小时变温，不显示查看时序图 end
                            htmlContent += " <tr><td style='width:80px;' colspan='2'><a  name='chart_link'  href='javascript:;' style='color:blue;cursor:pointer;'>查看时序图</a></td></tr>";
                            htmlContent += "</table>";

                        } else {

                            var htmlContent = "<table class='grid-table'><tr><td style='width:80px;'>站名</td><td>{{StationName}}</td></tr><tr><td style='width:80px;'>站码</td><td>{{StationCode}}</td></tr>";
                            htmlContent += " <tr><td>所属区域</td><td>{{GetCityName CityCode}} - {{GetContryName CityCode}}</td></tr>";
                            if (!isInternet) {
                                htmlContent += " <tr><td style='width:80px;'>经度</td><td>{{ToFixed Longitude 2}}</td></tr><tr><td style='width:80px;'>纬度</td><td>{{ToFixed Latitude 2}}</td></tr>";
                                htmlContent += " <tr><td style='width:80px;' colspan='2'><a name='chart_link' href='javascript:;' style='color:blue;cursor:pointer;'>查看时序图</a></td></tr>";
                            } else {/**/
                                var functionIds = $("#FunctionIds").val().split(',');
                                /*A,A10001,A10002,A10004,A10005,A10006,B,B10002,B10004*/
                                if (functionIds.indexOf("B10011") > -1) {
                                    htmlContent += " <tr><td style='width:80px;'>经度</td><td>{{ToFixed Longitude 2}}</td></tr><tr><td style='width:80px;'>纬度</td><td>{{ToFixed Latitude 2}}</td></tr>";
                                }/*显示经纬度*/
                                if (functionIds.indexOf("B10002") > -1) {
                                    htmlContent += " <tr><td style='width:80px;' colspan='2'><a name='chart_link' href='javascript:;' style='color:blue;cursor:pointer;'>查看时序图</a></td></tr>";
                                }
                            }

                            htmlContent += "</table>";
                        }
                        return Handlebars.compile(htmlContent)(graphicData);
                    },
                    AddMapClickEvent: function (graphicsLayer) {
                        var self = this;
                        dojo.connect(graphicsLayer, "onMouseOver", function (evt) {
                            if (!!evt.graphic.attributes && !!evt.relatedTarget && !!evt.relatedTarget.style) {
                                evt.relatedTarget.style.cursor = "pointer";
                                /*添加鼠标over事件*/

                                //self.BaseMap.infoWindow.setTitle("站点信息");//.show();
                                //var graphicsContent = self.GetInfoWindowContent(evt.graphic.attributes, autoStation.ActiceProductType);
                                //self.BaseMap.infoWindow.setContent(graphicsContent);//.show();
                                //var screenPoint = self.BaseMap.toScreen(evt.mapPoint);
                                //self.BaseMap.infoWindow.show(screenPoint);
                                //screenPoint.x = evt.layerX;
                                //screenPoint.y = evt.layerY;
                                //self.BaseMap.infoWindow.show(screenPoint);
                                //$(self.BaseMap.infoWindow.domNode).find("a[name='chart_link']").click(function () {
                                //    if (!!self.clickCallback) {
                                //        var item = evt.graphic.attributes;
                                //        self.clickCallback(item);
                                //    }
                                //});
                                //$(self.BaseMap.infoWindow.domNode).find("input[name='value_text']").blur(function () {
                                //    var newValue = $(this).val();
                                //    var item = evt.graphic.attributes;
                                //    item.Customer_Value[0] = newValue;
                                //    self.ChangeGraphicsValue(item);
                                //});
                                //$(self.BaseMap.infoWindow.domNode).find("input[name='value_text']").bind("keypress", function (event) {
                                //    if (event.keyCode == "13") {
                                //        var newValue = $(this).val();
                                //        var item = evt.graphic.attributes;
                                //        item.Customer_Value[0] = newValue;
                                //        self.ChangeGraphicsValue(item);
                                //    }
                                //});
                            }
                        });
                        // qianwt 2017-08-09 把站点信息框鼠标移动事件改成鼠标单击事件 begin
                        dojo.connect(graphicsLayer, "onClick", function (evt) {
                            if (!!evt.graphic.attributes) {
                                // qianwt 2017-08-09  鼠标左击时，把右击操作菜单隐藏 begin
                                $("div.smart_menu_box").hide();
                                // qianwt 2017-08-09  鼠标左击时，把右击操作菜单隐藏 end
                                self.BaseMap.infoWindow.setTitle("站点信息");//.show();

                                var itemData = evt.graphic.attributes;
                                var stcd = evt.graphic.attributes.StationCode;
                                if (!!stcd) {/*站点标志或者站点名称*/
                                    /*找到对应的站点数据*/
                                    var isNationStation = evt.graphic.attributes.StationCode.substr(0, 1) == "5";

                                    var graphicLayer = self.BaseMap.getLayer("product_point");
                                    var isExisted = false;
                                    if (!!graphicLayer) {
                                        var activeStation = $.Enumerable.From(graphicLayer.graphics).Where(function (x) { return x.attributes.Station_Id_C == stcd }).FirstOrDefault();
                                        if (!!activeStation) {
                                            itemData = activeStation.attributes;
                                            isExisted = true;
                                        }
                                    }
                                    if (!isExisted) {
                                        graphicLayer = self.BaseMap.getLayer("product_point_nation");
                                        if (!!graphicLayer) {
                                            var activeStation = $.Enumerable.From(graphicLayer.graphics).Where(function (x) { return x.attributes.Station_Id_C == stcd }).FirstOrDefault();
                                            if (!!activeStation) {
                                                itemData = activeStation.attributes;
                                                isExisted = true;
                                            }
                                        }
                                    }

                                }
                                var graphicsContent = self.GetInfoWindowContent(itemData, autoStation.ActiceProductType);
                                self.BaseMap.infoWindow.setContent(graphicsContent);//.show();

                                var screenPoint = self.BaseMap.toScreen(evt.mapPoint);
                                self.BaseMap.infoWindow.show(screenPoint);
                                screenPoint.x = evt.layerX;
                                screenPoint.y = evt.layerY;
                                self.BaseMap.infoWindow.show(screenPoint);
                                $(self.BaseMap.infoWindow.domNode).find("a[name='chart_link']").click(function () {
                                    if (!!self.clickCallback) {
                                        var item = evt.graphic.attributes;
                                        self.clickCallback(item);
                                    }
                                });
                                $(self.BaseMap.infoWindow.domNode).find("input[name='value_text']").blur(function () {
                                    var newValue = $(this).val();
                                    var item = evt.graphic.attributes;
                                    if (item.Customer_Value[0] == newValue) { return; }
                                    item.Customer_Value[0] = newValue;
                                    self.ChangeGraphicsValue(item);
                                });
                                $(self.BaseMap.infoWindow.domNode).find("input[name='value_text']").bind("keypress", function (event) {
                                    if (event.keyCode == "13") {
                                        var newValue = $(this).val();
                                        var item = evt.graphic.attributes;
                                        if (item.Customer_Value[0] == newValue) { return; }
                                        item.Customer_Value[0] = newValue;
                                        self.ChangeGraphicsValue(item);
                                    }
                                });
                                // qianwt 2017-08-09 此处阻止事件冒泡 begin
                                evt = evt || window.event;
                                evt.cancelBubble = true;
                                if (evt.stopPropagation) {
                                    evt.stopPropagation();
                                }
                                // qianwt 2017-08-09 此处阻止事件冒泡 begin
                            }
                        });
                        // qianwt 2017-08-09 把站点信息框鼠标移动事件改成鼠标单击事件 end
                        dojo.connect(graphicsLayer, "onMouseOut", function (evt) {
                            if (!!evt.relatedTarget && !!evt.relatedTarget.style) {
                                evt.relatedTarget.style.cursor = "";
                            }
                        });
                        dojo.connect(graphicsLayer, "onMouseDown", function (e) {
                            if (e.which == 3) {
                                // qianwt 2017-08-09  鼠标右击时，把站点信息隐藏 begin
                                self.BaseMap.infoWindow.hide();
                                // qianwt 2017-08-09  鼠标右击时，把站点信息隐藏 end
                                var opertion = {
                                    name: "", offsetX: 2, offsetY: 2, textLimit: 10, beforeShow: $.noop, afterShow: $.noop
                                };
                                var imageMenuData = [];
                                var isInternet = $("#IsInternet").val() == "True" ? true : false;
                                if (!isInternet) {
                                    imageMenuData.push([{
                                        text: "查看时序图", func: function () {
                                            if (!!self.clickCallback) {
                                                var item = $(this)[0].e_graphic.attributes;
                                                self.clickCallback(item);
                                            }
                                        }
                                    }]);
                                    imageMenuData.push([{
                                        text: "编辑",
                                        func: function () {
                                            var x = $(this).attr("x");
                                            var y = $(this).attr("y");
                                            var graphics = $(this)[0].e_graphic;
                                            var item = graphics.attributes;
                                            if (!!item.Customer_Value) {
                                                var editorView = $("<div style='text-align:center;'><input type='text' name='tb_value'/><br><br><input type='button' value='确定' name='confirm'/>&nbsp;&nbsp;&nbsp<input type='button' value='取消'  name='cancel'/></div>");

                                                DialogUtil.ShowDialog(null, editorView, { width: 280, height: 160, title: "数值修改" });

                                                editorView.find("input[name='tb_value']").val(item.Customer_Value[0]).focus();
                                                editorView.find("input[name='confirm']").click(function () {
                                                    item.Customer_Value[0] = editorView.find("input[name='tb_value']").val();
                                                    self.ChangeGraphicsValue(item);
                                                    DialogUtil.HideDialog();
                                                    self.IsChange = 1;
                                                    self.changeCode += item.Station_Id_C + ",";
                                                });
                                                editorView.find("input[name='cancel']").click(function () {
                                                    DialogUtil.HideDialog();
                                                });
                                            }
                                            else {
                                                DialogUtil.showWarn("站名不可编辑");
                                            }

                                        }
                                    }]);
                                    imageMenuData.push([{
                                        text: "删除",
                                        func: function () {
                                            var graphics = $(this)[0].e_graphic;
                                            var layerIdArray = ["label_station_marker", "label_station", "label_station_marker_nation", "label_station_nation", "product_point", "product_point_nation"];
                                            for (var i = 0; i < layerIdArray.length; i++) {
                                                self.RemoveGraphicsFromLayer(graphics, layerIdArray[i]);
                                            }
                                            if (!!self.RemoveGraphicsCallback) {
                                                var stationCode = graphics.attributes.Station_Id_C;
                                                if (!stationCode) {
                                                    stationCode = graphics.attributes.StationCode;
                                                }
                                                if (!!stationCode) {
                                                    self.RemoveGraphicsCallback(stationCode);
                                                }
                                                self.changeCode += stationCode + ",";
                                                self.IsChange = 1;
                                            }
                                        }
                                    }]);
                                } else {/**/
                                    var functionIds = $("#FunctionIds").val().split(',');
                                    /*A,A10001,A10002,A10004,A10005,A10006,B,B10002,B10004*/
                                    if (functionIds.indexOf("B10002") > -1) {
                                        imageMenuData.push([{
                                            text: "查看时序图", func: function () {
                                                if (!!self.clickCallback) {
                                                    var item = $(this)[0].e_graphic.attributes;
                                                    self.clickCallback(item);
                                                }
                                            }
                                        }]);
                                    }/*查看时序图*/
                                }

                                var targetControl = e.srcElement;

                                $(targetControl).smartMenu(imageMenuData, opertion, e);

                            }
                            else {
                                //var item = e.graphic.attributes;
                                //self.clickCallback(item);
                            }
                        });
                    },
                    ShowAutoStationByType: function (stationType, cityCode, cityArray, isShow) {
                        var self = this;
                        var layerIdArray = ["label_station_marker", "label_station", "product_point", "product_otime_nation", "product_otime"];
                        if (!isShow) {
                            if (!!self.HideAutoStationCallback) {
                                self.HideAutoStationCallback(stationType, cityCode, cityArray, layerIdArray);
                            }
                        }
                        else {
                            if (!!self.ShowAutoStationCallback) {

                                self.ShowAutoStationCallback(stationType, cityCode, cityArray);
                            }
                        }
                    }
                };
                return GisMap;
            }());





            (function () {
                MagnifierMap = function (options) {
                    var self = this;
                    this.defaultOptions = {
                        mapTargetId: "MagnifierDiv",
                        extent: [7948259, 1498567, 15432368, 9336710],
                        gisServer: "/Application/Map2/MapServer",
                        mapServer: "",
                        riverServer: "/river/wms",
                        highwayServer: "/river/wms"
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
                    this.mapDraw = null;
                    this.ActiveTextInput = false;
                    this.focusLayer = null;
                    this.focusInterval = null;
                    this.activeInterval = null;
                    this.activeLayer = null;
                    this.RemoveGraphicsCallback = null;
                    this.intervalTime = 0;
                    this.IsChange = 0;
                    self._InitConst();
                    self._InitBaseMap();
                    this.changeCode = "";
                    this.proTypeLegends = null;

                };
                MagnifierMap.prototype = {
                    _InitConst: function () {
                        var self = this;
                        this.wgs84SpatialReference = new SpatialReference({ wkid: 4326 });
                        this.webMercatorSpatialReference = new SpatialReference({ wkid: 102113 });
                        // this.startExtent = new esri.geometry.Extent(114.84595386, 29.4163509, 119.60824717, 34.62676847, new esri.SpatialReference({ wkid: 4326 }));
                        this.startExtent = new esri.geometry.Extent(114, 29.4, 120, 34.8, new esri.SpatialReference({ wkid: 4326 }));

                    },
                    _InitBaseMap: function () {
                        var self = this;

                        self.BaseMap = new Map("MagnifierDiv", {
                            logo: false,
                            slider: true,
                            zoom: 7,
                            center: [117, 32],
                            maxZoom: 14,
                            minZoom: 7,
                            spatialReference: self.wgs84SpatialReference,
                            showLabels: true,
                            extent: self.startExtent
                        });

                        var cityCode = $("#defaultCityCode").val();//"340000";
                        if (!!$.cookie("selectedCityCode")) {
                            cityCode = $.cookie("selectedCityCode");
                        }
                        var layerName = $.Enumerable.From(cities)
                                  .Where(function (x) { return x.CITY_CODE == cityCode; })
                                  .Select(function (x) { return x.LAYER_NAME; })
                                  .FirstOrDefault();
                        //self.ShowChinaSurfaceLayer(layerName);
                       // self.ShowRiverSurfaceLayer(layerName);
                        //self.ShowHighWayLayer(layerName);

                        //self.ActiveCityArea(cityCode);

                        //self.ActiveDraw();

                    },



                    ActiveDraw: function () {
                        var self = this;
                        self.mapDraw = new esri.toolbars.Draw(self.BaseMap);
                        self.mapDraw.on("draw-end", function (evt) {
                            self.BaseMap.setMapCursor("default");
                            self.mapDraw.deactivate();
                            //self.BaseMap.setExtent(evt.geometry.getExtent());
                        });
                    },
                    ShowChinaSurfaceLayer: function (layerName) {/*加载平面地图*/
                        var self = this;
                        var geoWmsUrl = self.options.mapServer;
                        var resourceInfo = {
                            extent: self.startExtent,
                            layerInfos: [], version: '1.1.1'
                        };

                        var localHost = location.host;
                        if (localHost == "218.22.3.196:8080") {
                            geoWmsUrl = geoWmsUrl.replace("10.129.2.220:8080", "218.22.3.196:8080");
                        }
                        var geoWmsLayer = new esri.layers.WMSLayer(geoWmsUrl, { resourceInfo: resourceInfo });
                        geoWmsLayer.setImageFormat("png");
                        geoWmsLayer.setVisibleLayers([layerName]);//"",]);
                        geoWmsLayer.id = "basemap_Surface＿MagnifierMap";
                        self.BaseMap.addLayer(geoWmsLayer);
                        /*测试Layer的Feature*/
                    },
                    ShowRiverSurfaceLayer: function (layerName) {  /*添加river的geoserver*/
                        var self = this;
                        var geoWmsUrl = self.options.mapServer.replace("Anhui", "river");
                        var resourceInfo = {
                            extent: self.startExtent,
                            layerInfos: [], version: '1.1.1'
                        };
                        var geoWmsLayer = new esri.layers.WMSLayer(geoWmsUrl, { resourceInfo: resourceInfo });
                        geoWmsLayer.setImageFormat("png");
                        if (!!layerName) {
                            layerName = layerName.replace("Anhui", "river");
                            geoWmsLayer.setVisibleLayers([layerName]);//"",]);

                            geoWmsLayer.id = "river_Surface";
                            self.BaseMap.addLayer(geoWmsLayer);
                        }

                    },
                    ShowHighWayLayer: function (layerName) {/*加载平面地图*/
                        var self = this;
                        var self = this;
                        var geoWmsUrl = self.options.mapServer.replace("Anhui", "highway");
                        var resourceInfo = {
                            extent: self.startExtent,
                            layerInfos: [], version: '1.1.1'
                        };
                        var geoWmsLayer = new esri.layers.WMSLayer(geoWmsUrl, { resourceInfo: resourceInfo });
                        geoWmsLayer.setImageFormat("png");
                        layerName = layerName.replace("Anhui", "highway");
                        geoWmsLayer.setVisibleLayers([layerName]);//"",]);
                        geoWmsLayer.id = "highway_Surface";
                        self.BaseMap.addLayer(geoWmsLayer);
                        return;
                    },

                    ActiveCityArea: function (cityCode) {
                        var self = this;

                        self.RemoveLayer("basemap_Surface_Area");
                        if (cityCode.toString() == "340000") {
                            var dataUrl = "/scripts/main/data/Anhui_Area.json";
                            $.getJSON(dataUrl, function (jsonResult) {
                                var features = jsonResult.features;
                                var extent = self.AddPolylineLayer("basemap_Surface_Area", features, { opacity: 0.5, color: "#11EE69", lineWidth: 5 }, cityCode);
                                self.BaseMap.setExtent(self.startExtent);
                                //  self.BaseMap.setExtent(extent);
                                self.FlashActiveAreaLayer("basemap_Surface_Area", false);
                                self.ChangeCityRiver("Anhui:highway", true);
                            });
                        } else {
                            self.ChangeCityRiver("Anhui:highway", false);
                            if (parseInt(cityCode) % 100 == 0) {
                                $.getJSON("/scripts/main/data/city/" + cityCode.toString() + ".json", function (jsonResult) {
                                    var cityCodeArr = 0;
                                    var features = jsonResult.features;
                                    var activeFeatures = $.Enumerable.From(features)
                                    //.Where(function (x) { return x.properties.UNITCODE == cityCode; })
                                    .ToArray();
                                    var extent = self.AddPolylineLayer("basemap_Surface_Area", activeFeatures, { opacity: 0.5, color: "#11EE69", lineWidth: 5 }, cityCode);
                                    if (!!extent) {
                                        self.BaseMap.setExtent(extent);
                                    }
                                    self.FlashActiveAreaLayer("basemap_Surface_Area", true);
                                    return;

                                });
                            } else {
                                $.getJSON("/scripts/main/data/county/" + cityCode.toString() + ".json", function (jsonResult) {
                                    var features = jsonResult.features;
                                    var activeFeatures = $.Enumerable.From(features)
                                    .ToArray();
                                    var extent = self.AddPolylineLayer("basemap_Surface_Area", activeFeatures, { opacity: 0.5, color: "#75F4F4", lineWidth: 5 }, cityCode);
                                    self.BaseMap.setExtent(extent);
                                    self.FlashActiveAreaLayer("basemap_Surface_Area", true);
                                });

                            }
                        }
                    },
                    FlashActiveAreaLayer: function (layerId, defaultShow) {
                        var self = this;

                        self.activeLayer = self.BaseMap.getLayer(layerId);
                        if (!self.activeLayer) { return; }
                        if (!defaultShow) {
                            self.activeLayer.hide();
                        }
                        return;
                        self.intervalTime = 0;
                        if (!self.activeInterval) {
                            self.activeInterval = setInterval(function () {
                                if (!!self.activeLayer.visible) {
                                    self.activeLayer.hide();
                                } else {
                                    self.activeLayer.show();
                                }
                                self.intervalTime++;

                                if (self.intervalTime >= 10) {
                                    if (!defaultShow) {
                                        self.activeLayer.hide();
                                    }
                                    clearInterval(self.activeInterval);
                                    self.activeInterval = null;
                                }
                            }, 200);
                        }
                    },
                    VisibleLayerById: function (layerId, isShow) {
                        var self = this;
                        var layer = self.BaseMap.getLayer(layerId);
                        if (!!layer) {

                            layer.setVisibility(isShow);
                        } else {

                        }
                    },
                    DisplayCityLayer: function (cityLayerName, aroundCityArray) {
                        var self = this;
                        var baseLayerId = "basemap_Surface";
                        var layer = self.BaseMap.getLayer(baseLayerId);
                        var riverLayerNames = [];
                        var highwayLayerNames = [];
                        if (!!layer) {
                            var visibleLayerIds = layer.visibleLayers;
                            var activeVisibleLayerId = [];
                            activeVisibleLayerId.push(cityLayerName);
                            if (!!aroundCityArray) {

                                if ($.inArray("420000", aroundCityArray) > -1 || $.inArray("410000", aroundCityArray) > -1
                                    || $.inArray("360000", aroundCityArray) > -1 || $.inArray("330000", aroundCityArray) > -1
                                    || $.inArray("370000", aroundCityArray) > -1
                                    || $.inArray("320000", aroundCityArray) > -1) {
                                    for (var i = 0; i < aroundCityArray.length; i++) {
                                        activeVisibleLayerId.push("Anhui:" + aroundCityArray[i]);
                                    }
                                }
                                else {
                                    var aroundLayerNames = $.Enumerable.From(cities)
                                                            .Where(function (x) { return $.inArray(x.CITY_CODE, aroundCityArray) > -1; })
                                                            .Select(function (x) { return x.LAYER_NAME; })
                                                            .ToArray();
                                    var aroundRiverName = $.Enumerable.From(cities)
                                                            .Where(function (x) { return $.inArray(x.CITY_CODE, aroundCityArray) > -1 && x.CITY_CODE.substr(0, 2) == "34"; })
                                                            .Select(function (x) { return x.LAYER_NAME; })
                                                            .ToArray();
                                    if (!!aroundLayerNames) {
                                        for (var i = 0; i < aroundLayerNames.length; i++) {
                                            activeVisibleLayerId.push(aroundLayerNames[i]);

                                            //  highwayLayerNames.push(aroundLayerNames[i].replace("Anhui", "highway"));
                                        }
                                    }
                                    if (!!aroundRiverName) {
                                        for (var i = 0; i < aroundRiverName.length; i++) {
                                            riverLayerNames.push(aroundRiverName[i].replace("Anhui", "river"));
                                        }
                                    }
                                }
                            }
                            //if ("Anhui:XXZX_CITY_POLY" == cityLayerName) {
                            //    self.ChangeCityHighway(["highway:Anhui"], true);
                            //} else {
                            //    highwayLayerNames.push(cityLayerName.replace("Anhui", "highway"));
                            //    self.ChangeCityHighway(highwayLayerNames, true);
                            //}
                            if ("Anhui:XXZX_CITY_POLY" == cityLayerName) {

                                self.ChangeCityRiver(["river:AnHui"], true);
                            }
                            else {
                                riverLayerNames.push(cityLayerName.replace("Anhui", "river"));
                                self.ChangeCityRiver(riverLayerNames, true);
                            }

                            layer.setVisibleLayers(activeVisibleLayerId);
                        }
                    },
                    ChangeCityRiver: function (layerNames) {
                        var self = this;
                        var baseLayerId = "river_Surface";
                        var layer = self.BaseMap.getLayer(baseLayerId);
                        if (!!layer) {
                            layer.setVisibleLayers(layerNames);
                        }
                    },
                    ChangeCityHighway: function (layerNames) {
                        var self = this;
                        var baseLayerId = "highway_Surface";
                        var layer = self.BaseMap.getLayer(baseLayerId);
                        if (!!layer) {
                            layer.setVisibleLayers(layerNames);
                        }
                    },
                    DisplayLayerById: function (layerId, isShow, isVis) {
                        var self = this;
                        var baseLayerId = "river_Surface";
                        if (!!isVis) {
                            baseLayerId = "basemap_Surface";
                        }
                        var layer = self.BaseMap.getLayer(baseLayerId);
                        if (!!layer) {

                            var visibleLayerIds = layer.visibleLayers;
                            if ($.inArray(layerId, visibleLayerIds) > -1) {
                                if (!isShow) {
                                    var index = $.inArray(layerId, visibleLayerIds);
                                    visibleLayerIds.splice(index, 1);
                                    layer.setVisibleLayers(visibleLayerIds);
                                }
                            } else {
                                if (!!isShow) {
                                    visibleLayerIds.push(layerId);
                                    layer.setVisibleLayers(visibleLayerIds);
                                }
                            }
                        }
                    },
                    RemoveLayer: function (layerIds) {
                        var self = this;
                        if (layerIds instanceof Array) {
                            for (var i = 0; i < layerIds.length; i++) {
                                var layer = self.BaseMap.getLayer(layerIds[i]);
                                if (!!layer) {
                                    self.BaseMap.removeLayer(layer);
                                }
                            }
                        } else {
                            var layer = self.BaseMap.getLayer(layerIds);
                            if (!!layer) {
                                self.BaseMap.removeLayer(layer);
                            }
                        }
                    },
                    FocusStation: function (station) {
                        var self = this;
                        self.RemoveLayer("station_focus");
                        self.focusLayer = new esri.layers.GraphicsLayer({ id: "station_focus" });
                        var markerSymbol = new esri.symbol.PictureMarkerSymbol("\\content\\gis\\images\\station_focus.png", 28, 48);
                        var myPoint = new Point([station["Longitude"], station["Latitude"]], self.wgs84SpatialReference);
                        markerSymbol.setOffset(0, 19)
                        var mlpoint = new esri.geometry.Multipoint(new esri.SpatialReference({ wkid: 4326 }));
                        var myPoint1 = new Point([station["Longitude"] + 0.1, station["Latitude"] + 0.1], self.wgs84SpatialReference);
                        var myPoint2 = new Point([station["Longitude"] - 0.1, station["Latitude"] - 0.1], self.wgs84SpatialReference);
                        mlpoint.addPoint(myPoint);
                        mlpoint.addPoint(myPoint1);
                        mlpoint.addPoint(myPoint2);
                        self.BaseMap.centerAndZoom(myPoint, 1);
                        var extent = mlpoint.getExtent();
                        self.BaseMap.setExtent(extent.expand(2));
                        var graphic = new Graphic(myPoint, markerSymbol);
                        self.focusLayer.add(graphic);
                        self.BaseMap.addLayer(self.focusLayer);
                        self.focusLayer.hide();
                        self.intervalTime = 0;
                        if (!self.focusInterval) {
                            self.focusInterval = setInterval(function () {
                                if (!!self.focusLayer.visible) {
                                    self.focusLayer.hide();
                                } else {
                                    self.focusLayer.show();
                                }
                                self.intervalTime++;

                                if (self.intervalTime >= 20) {
                                    self.focusLayer.hide();
                                    clearInterval(self.focusInterval);
                                    self.focusInterval = null;
                                }
                            }, 200);
                        }
                    },

                    AddTextLabelLayer: function (layerAttr, markerData, infoTemplate, labelField, labelStyle, offset, opacity, labelType, minScale) {
                        /*labelType表示能见度或者其他类型*/

                        var self = this;
                        if (!opacity) { opacity = 1; }
                        var features = [];
                        var id = layerAttr;
                        var name = "";
                        if (layerAttr instanceof String) {
                            id = layerAttr;
                        } else {
                            id = layerAttr.id;
                            name = layerAttr.name;
                        }
                        if (!labelStyle) {
                            labelStyle = { fontSize: "11px" };
                        }
                        var labelGraphicsLayer = self.BaseMap.getLayer(id);
                        var layerIsExisted = true;
                        if (!labelGraphicsLayer) {
                            layerIsExisted = false;
                            labelGraphicsLayer = new esri.layers.GraphicsLayer({ id: id, name: name });
                        }

                        // var labelGraphicsLayer = new esri.layers.GraphicsLayer({ id: id });
                        labelGraphicsLayer.name = name;
                        var font = new Font(labelStyle.fontSize, Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD);
                        for (var i = 0; i < markerData.length; i++) {
                            var pointModel = markerData[i];
                            var labelPoint = new Point(pointModel.Point, self.wgs84SpatialReference);
                            var colorStr = "#000000";
                            if (!!pointModel.Color) {
                                colorStr = pointModel.Color.toLowerCase().replace("0x", "#");
                            }

                            var textStr = pointModel.TextArray[0];
                            var timeStr = "";
                            if (pointModel.TimeArray != null && pointModel.TimeArray.length > 0) {
                                timeStr = pointModel.TimeArray[0];
                            }
                            if (labelType == 2) {/*标示能见度*/
                                if (parseFloat(textStr) > 1000) {
                                    textStr = parseInt(parseFloat(textStr) / 1000);
                                } else {
                                    textStr = parseFloat(textStr) / 1000;
                                }
                            }
                            //if (!!timeStr && timeStr.length > 0) {
                            //    textStr = textStr + "(" + timeStr + ")";
                            //}
                            var textSymbol = new TextSymbol(textStr, font, new Color(colorStr));
                            if (!!offset) {
                                textSymbol.setOffset(offset.x, offset.y);
                            }
                            var graphic = new Graphic(labelPoint, textSymbol);
                            var attr = pointModel.Properties;
                            graphic.setAttributes(attr);
                            labelGraphicsLayer.add(graphic);
                        }
                        if (!layerIsExisted) {
                            labelGraphicsLayer.setOpacity(opacity);
                            self.BaseMap.addLayer(labelGraphicsLayer);
                            if (!!minScale) {
                                labelGraphicsLayer.setMinScale(minScale);
                            }

                            //self.AddMapClickEvent(labelGraphicsLayer);
                        }
                        return;
                    },
                    AddMarkerLayer: function (layerAttr, markerData, infoTemplate, labelField, labelStyle, offset, opacity, minScale) {
                        var self = this;
                        var name = "";
                        var id = layerAttr;
                        if (layerAttr instanceof String) {
                            id = layerAttr;
                        } else {
                            id = layerAttr.id;
                            name = layerAttr.name;
                        }
                        var graphicLayer = self.BaseMap.getLayer(id);
                        var layerIsExisted = true;
                        if (!graphicLayer) {
                            layerIsExisted = false;
                            graphicLayer = new esri.layers.GraphicsLayer({ id: id, name: name });
                        }
                        var markerSymbol = new esri.symbol.PictureMarkerSymbol("\\content\\gis\\images\\station.png", 8, 8);

                        for (var i = 0; i < markerData.length; i++) {
                            var pointModel = markerData[i];
                            var myPoint = new Point(pointModel.Point, self.wgs84SpatialReference);
                            if (!!pointModel.Symbol) {
                                markerSymbol = new esri.symbol.PictureMarkerSymbol(pointModel.Symbol.Link, pointModel.Symbol.Size.w, pointModel.Symbol.Size.h);
                                markerSymbol.setAngle(pointModel.Symbol.Angle);
                            }
                            var graphic = new Graphic(myPoint, markerSymbol);
                            graphic.setAttributes(pointModel.Properties);
                            graphicLayer.add(graphic);
                        }
                        if (!layerIsExisted) {
                            if (!!minScale) {
                                graphicLayer.setMinScale(minScale);
                            }
                            self.BaseMap.addLayer(graphicLayer);
                            //self.AddMapClickEvent(graphicLayer);
                        }

                    },

                    AddHistoryLayer: function (legendId, legendData, infoTemplate, labelField, labelStyle, offset, opacity) {
                        var self = this;
                        var legend = $("#" + legendId);
                        if (!legendData) {
                            if (!!legend && legend.length > 0) {
                                $(legend).empty();
                            }
                            return;
                        }
                        var legendHeight = (legendData.legends.length + 1) * 30 + 40;

                        if (!legend || legend.length == 0) {
                            legend = $("<table id='" + legendId + "'  style='cursor:pointer;font-family:Microsoft Yahe, 宋体, Arial, sans-serif; font-size:14px;  border-collapse: separate;border-spacing:5px;position:absolute; '></table>").appendTo($("#mapDiv"));
                            var top = $("#mapDiv").height();
                            var width = $("#mapDiv").width();
                            $(legend).css({ top: (top - legendHeight) + "px", left: 20 + "px" });
                            var m1 = new dojo.dnd.Moveable(legendId, { box: { l: 100, t: 100, w: 500, h: 500 } });
                        } else {
                            $(legend).empty();
                            var top = $("#mapDiv").height();
                            var width = $("#mapDiv").width();
                            $(legend).css({ top: (top - legendHeight) + "px", left: 20 + "px" });
                        }
                        legend.append("<tr style='border-collapse:collapse;'><th colspan='2' style='text-align:center;'><b>" + legendData.title + "统计</b></th></tr>");
                        var colors = ["#3399FF", "#FF3300", "#92D050", "#F79646", "#93CDDD", "#8064A2", "#FFC000"]
                        for (var i = 0; i < legendData.legends.length; i++) {
                            var color = legendData.legends[i].color.toLowerCase().replace("0x", "#");
                            var text = legendData.legends[i].text;
                            legend.append("<tr><td style='background-color:" + color + ";width:30px;height:18px;'></td><td style='padding-left:5px;padding-right:10px;'>" + text + "</td></tr>");
                        }
                    },

                    AddPolylineLayer: function (layerId, features, styleOption, cityCode) {
                        var self = this;
                        var opacity = 1;
                        var color = "#FFFFFF";
                        var lineWidth = 2;
                        if (!!styleOption && !!styleOption.opacity) { opacity = styleOption.opacity; }
                        if (!!styleOption && !!styleOption.color) { color = styleOption.color; }
                        if (!!styleOption && !!styleOption.lineWidth) { lineWidth = styleOption.lineWidth; }
                        var path1 = [[114.9783, 29.4225], [115.15432285714286, 34.661825], [115.28634000000001, 34.661825], [114.9783, 30.480075], [114.9783, 29.4225]];
                        var graphicLayer = new esri.layers.GraphicsLayer({ id: layerId });
                        var index = 0;
                        if (cityCode == "340600" || cityCode == "341300" || cityCode == "341299") { index = 2; } else
                            if (cityCode == "340799" || cityCode == "341881") { index = 1; }
                            else if (cityCode == "340100") { index = 5; }
                            else if (cityCode == "341100") { index = 9; }
                            else if (cityCode == "341200") { index = 14; }
                            else if (cityCode == "341600") { index = 15; }
                            else
                            { index = 0; }
                        for (var i = 0; i < features.length; i++) {
                            var geometry = features[i].geometry;
                            var cooridinates = geometry.coordinates;
                            var line = new esri.geometry.Polyline({
                                "paths": cooridinates[index],// multiPologon,
                                "spatialReference": { "wkid": 4326 }
                            });
                            var lineSymbol = new esri.symbol.CartographicLineSymbol(
                              esri.symbol.CartographicLineSymbol.STYLE_SOLID,
                              new dojo.Color(color), lineWidth,
                              esri.symbol.CartographicLineSymbol.CAP_ROUND,
                              esri.symbol.CartographicLineSymbol.JOIN_MITER, 5
                            );

                            var polyline = new esri.Graphic(line, lineSymbol);
                            graphicLayer.add(polyline);

                        }
                        graphicLayer.setOpacity(opacity);
                        self.BaseMap.addLayer(graphicLayer);

                        var extent_new = null;
                        if (!!graphicLayer.graphics && graphicLayer.graphics.length > 0) {
                            for (var i = 0; i < graphicLayer.graphics.length; i++) {
                                var extent = graphicLayer.graphics[i].geometry.getExtent();
                                if (!extent_new) {
                                    extent_new = extent;
                                } else {
                                    if (extent_new.xmin > extent.xmin) {
                                        extent_new.xmin = extent.xmin;
                                    }
                                    if (extent_new.ymin > extent.ymin) {
                                        extent_new.ymin = extent.ymin;
                                    }
                                    if (extent_new.xmax < extent.xmax) {
                                        extent_new.xmax = extent.xmax;
                                    }
                                    if (extent_new.ymax < extent.ymax) {
                                        extent_new.ymax = extent.ymax;
                                    }
                                }
                            }
                        }
                        extent_new.ymax = extent_new.ymax + 0.1;
                        //extent_new.xmax = extent_new.xmax + 0.1;
                        extent_new.ymin = extent_new.ymin - 0.1;
                        //extent_new.xmin = extent_new.xmin - 0.1;
                        return extent_new;
                    },
                    AddMultiPolygonLayer: function (layerAttr, features, opacity) {

                        var self = this;
                        if (!opacity) { opacity = 1; }
                        var name = "";
                        var id = layerAttr;
                        if (layerAttr instanceof String) {
                            id = layerAttr;
                        } else {
                            id = layerAttr.id;
                            name = layerAttr.name;
                        }
                        var graphicLayer = new esri.layers.GraphicsLayer({ id: id, name: name });
                        graphicLayer.spatialReference = new SpatialReference(102100);
                        for (var i = 0; i < features.length; i++) {
                            var geometry = features[i].geometry;
                            var cooridinates = geometry.coordinates;
                            for (var j = 0; j < cooridinates.length; j++) {
                                var multiPologon = cooridinates[j];
                                var line = new esri.geometry.Polyline({
                                    "paths": multiPologon,
                                    "spatialReference": self.wgs84SpatialReference
                                });
                                var lineSymbol = new esri.symbol.CartographicLineSymbol(
                                  esri.symbol.CartographicLineSymbol.STYLE_SOLID,
                                  new dojo.Color("#000000"), 1,
                                  esri.symbol.CartographicLineSymbol.CAP_ROUND,
                                  esri.symbol.CartographicLineSymbol.JOIN_MITER, 1
                                );
                                var polyline = new esri.Graphic(line, lineSymbol);
                                graphicLayer.add(polyline);
                            }
                        }
                        graphicLayer.setOpacity(opacity);
                        self.BaseMap.addLayer(graphicLayer);

                    },
                    CreateRingFeature: function (rings, attributes, fillColor) {
                        var self = this;
                        if (!fillColor) { fillColor = "#000000"; }
                        var opacity = 1;
                        if (fillColor == "#FFFFFF" || fillColor == "#ffffff") {
                            opacity = 0;
                            fillColor = [0, 0, 0, 0];
                        }
                        var polygonJson = {
                            "rings": [[[-122.63, 45.52], [-122.57, 45.53], [-122.52, 45.50], [-122.49, 45.48],
      [-122.64, 45.49], [-122.63, 45.52], [-122.63, 45.52]]], "spatialReference": { "wkid": 4326 }
                        };


                        var rings = new esri.geometry.Polygon({
                            "rings": rings,
                            "spatialReference": { "wkid": 4326 }
                        });
                        if (fillColor == "#FFFFFF" || fillColor == "#ffffff") {
                            return null;
                        }
                        var fillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color(fillColor), 0),
                            new dojo.Color(fillColor));
                        var polyline = new esri.Graphic(rings, fillSymbol);
                        polyline.attributes = attributes;
                        return polyline;

                    },


                    AddTextToGraphicsLayer: function (labelGraphicsLayer, pointModel, labelField, labelStyle, labelType) {
                        /*labelType表示能见度或者其他类型*/
                        var self = this;
                        var offset = { x: 0, y: 10 };
                        if (!labelStyle) {
                            labelStyle = { fontSize: "14px" };
                        }
                        var font = new Font(labelStyle.fontSize, Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD);
                        var labelPoint = new Point([pointModel.Lon, pointModel.Lat], self.wgs84SpatialReference);
                        var colorStr = "#4300fb";
                        var val = pointModel.Customer_Value[0];
                        if (!!pointModel.Color) {
                            colorStr = pointModel.Color.toLowerCase().replace("0x", "#");
                        }
                        else {
                            if (self.proTypeLegends != null) {
                                for (var i = 0; i < self.proTypeLegends.length; i++) {
                                    var item = self.proTypeLegends[i];
                                    var col = item.color.toLowerCase().replace("0x", "#");;
                                }
                            }
                        }
                        var textStr = pointModel.Customer_Value[0];
                        if (labelType == 2) {/*标示能见度*/
                            if (parseFloat(textStr) > 1000) {
                                textStr = parseInt(parseFloat(textStr) / 1000);
                            } else {
                                textStr = parseFloat(textStr) / 1000;
                            }
                        }
                        var textSymbol = new TextSymbol(textStr, font, new Color(colorStr));
                        if (!!offset) {
                            textSymbol.setOffset(offset.x, offset.y);
                        }
                        var graphic = new Graphic(labelPoint, textSymbol);
                        graphic.setAttributes(pointModel);
                        labelGraphicsLayer.add(graphic);

                    },
                    RemoveGraphicsFromLayer: function (graphics, layerName) {
                        var self = this;
                        var graphicLayer = self.BaseMap.getLayer(layerName);
                        var isExisted = false;
                        if (!!graphicLayer) {
                            var activeStation = null;
                            var stationCode = null;
                            if (!!graphics.attributes.Station_Id_C) {
                                stationCode = graphics.attributes.Station_Id_C;
                                activeStation = $.Enumerable.From(graphicLayer.graphics).Where(function (x) { return x.attributes.Station_Id_C == graphics.attributes.Station_Id_C }).FirstOrDefault();
                            }
                            if (!!graphics.attributes.StationCode) {
                                stationCode = graphics.attributes.StationCode;

                            }
                            var activeStation = $.Enumerable.From(graphicLayer.graphics).Where(function (x) { return x.attributes.StationCode == stationCode || x.attributes.Station_Id_C == stationCode }).FirstOrDefault();
                            if (!!activeStation) {
                                graphicLayer.remove(activeStation);
                                isExisted = true;
                            }
                            //if (!!isExisted && !!self.RemoveGraphicsCallback) {

                            //}
                        }
                    },
                    ChangeGraphicsValue: function (item) {
                        var self = this;
                        //var graphicLayer = self.BaseMap.getLayer("product_point_nation");
                        var graphicLayer = self.BaseMap.getLayer("product_point");
                        var isExisted = false;
                        if (!!graphicLayer) {

                            var activeStation = $.Enumerable.From(graphicLayer.graphics).Where(function (x) { return x.attributes.Station_Id_C == item.Station_Id_C }).FirstOrDefault();
                            if (!!activeStation) {
                                activeStation.attributes = item;
                                if (!!activeStation.symbol) {
                                    var newSymbol = JSON.parse(JSON.stringify(activeStation.symbol));
                                    newSymbol.url = "\content\gis\images\wind_90_90\10.png";
                                    activeStation.setSymbol(newSymbol);
                                } else {
                                    graphicLayer.remove(activeStation);
                                    self.AddTextToGraphicsLayer(graphicLayer, item);
                                }
                                isExisted = true;
                            }
                        }
                        if (!isExisted) {
                            graphicLayer = self.BaseMap.getLayer("product_point_nation");
                            if (!!graphicLayer) {
                                var activeStation = $.Enumerable.From(graphicLayer.graphics).Where(function (x) { return x.attributes.Station_Id_C == item.Station_Id_C }).FirstOrDefault();
                                if (!!activeStation) {
                                    activeStation.attributes = item;
                                    if (!!activeStation.symbol) {
                                        var newSymbol = JSON.parse(JSON.stringify(activeStation.symbol));
                                        newSymbol.url = "\content\gis\images\wind_90_90\10.png";
                                        activeStation.setSymbol(newSymbol);
                                    } else {
                                        graphicLayer.remove(activeStation);
                                        self.AddTextToGraphicsLayer(graphicLayer, item);
                                    }
                                    isExisted = true;
                                }
                            }
                        }
                        if (!!graphicLayer && isExisted) {
                            graphicLayer.refresh();
                        }
                    },





                    ShowAutoStationByType: function (stationType, cityCode, cityArray, isShow) {
                        var self = this;
                        var layerIdArray = ["label_station_marker", "label_station", "product_point"];
                        if (!isShow) {

                            if (!!self.HideAutoStationCallback) {

                                self.HideAutoStationCallback(stationType, cityCode, cityArray, layerIdArray);
                            }
                        }
                        else {
                            if (!!self.ShowAutoStationCallback) {

                                self.ShowAutoStationCallback(stationType, cityCode, cityArray);
                            }
                        }
                    }
                };
                return MagnifierMap;
            }());


            var ArcGisServer = "";// $("#arcGisServer").val();
            location.hash = "right";
            var gisMap = new GisMap({ gisServer: ArcGisServer, mapServer: mapUrl, extent: [1.2784593103048649E7, 3428745.657248824, 1.3314760331234625E7, 4113315.682570853] });
            var MagnifierMap = new MagnifierMap({ gisServer: ArcGisServer, mapServer: mapUrl, extent: [1.2784593103048649E7, 3428745.657248824, 1.3314760331234625E7, 4113315.682570853] });
            var autoStation = new AutoStation({ GisMap: gisMap, MagnifierMap: MagnifierMap });
            gisMap.proType = autoStation.ActiceProductType;
            gisMap.InitMagnifierDiv(MagnifierMap);

            gisMap.clickCallback = function (item) {
                var station = null;

                if (!!item && !!item.StationCode) {
                    station = { id: item.StationCode, name: item.StationName };
                }
                if (!station && !!item && !!item.Station_Id_C) {
                    station = { id: item.Station_Id_C, name: item.Station_Name };
                }
                if (!station) { return; }

                if (!station) { return; }
                autoStation.getChart(station, true);

            }

            gisMap.RemoveGraphicsCallback = function (stationCode) {
                if (!!autoStation && !!autoStation.RemoveDataByStationCode) {
                    autoStation.RemoveDataByStationCode(stationCode);
                }
            };
            gisMap.AddLayerCallClick = function (layerObject) {
                if (!!autoStation && !!autoStation.AddLayer) {
                    autoStation.AddLayer(layerObject);
                }
            };
            gisMap.RemoveLayerCallClick = function (layerId) {
                if (!!autoStation && !!autoStation.RemoveLayer) {
                    autoStation.RemoveLayer(layerId);
                }
            };

            gisMap.mouseUpCallback = function (evt) {
                if (!!autoStation && !!autoStation.AddText) {
                    autoStation.AddText({ evt: evt, text: "请输入对应的标题" });
                    gisMap.BaseMap.setMapCursor("default");
                    gisMap.ActiveTextInput = false;
                }

            }

            gisMap.ShowAutoStationCallback = function (stationType, cityCode, cityArray) {
                if (!!autoStation) {
                    var filterStations = $.Enumerable.From(autoStation.FilterStations).
                    Where(function (x) { return (cityCode == "340000" || $.inArray(x.CityCode.toString(), cityArray) > -1) && x.StationClass == stationType })
                        .Select(function (item) { return { StationCode: item.StationCode, Point: [item["Longitude"], item["Latitude"]], Properties: item, Value: "", TextArray: [item["StationName"]] } })
                        .ToArray();

                    var offset = { x: 0, y: -18 };
                    var minScale = 3466743.32573175 * 0.3;
                    gisMap.AddTextLabelLayer({ id: "label_station" }, filterStations, null, null, null, offset, 0.5, null, minScale);
                    gisMap.AddMarkerLayer({ id: "label_station_marker" }, filterStations, null, null, null, null, 0.5, minScale);


                    var productType = autoStation.ActiceProductType;

                    var filterStationIdArray = $.Enumerable.From(filterStations)
                             .Select(function (x) { return x.StationCode; }).ToArray();
                    var newDS = $.Enumerable.From(autoStation.ProductDataList.DS)
                                            .Where(function (x) {
                                                return $.inArray(x.Station_Id_C.toString(), filterStationIdArray) > -1;
                                            })
                                            .ToArray();
                    autoStation._ShowProductDataByStationType(productType, newDS);
                    return;
                }
            }

            gisMap.HideAutoStationCallback = function (stationType, cityCode, cityArray, layerIdArray) {


                var isFilterStationIds = true;
                if (stationType == "label_station_marker" || stationType == "label_station") {
                    isFilterStationIds = false;
                }
                if (!isFilterStationIds) {

                    return;
                }
                var filterAutoStationIds = $.Enumerable.From(autoStation.FilterStations)
                                        .Where(function (x) { return (cityCode == "340000" || $.inArray(x.CityCode.toString(), cityArray) > -1) && x.StationClass == stationType })
                                        .Select(function (x) { return x.StationCode }).ToArray();

                if (!filterAutoStationIds || filterAutoStationIds.length == 0) { return; }

                for (var m = 0; m < layerIdArray.length; m++) {
                    var layerId = layerIdArray[m];
                    var layer = gisMap.BaseMap.getLayer(layerId);
                    if (!!layer) {
                        for (var i = 0; i < layer.graphics.length; i++) {
                            var graphic = layer.graphics[i];
                            var stationCode = layer.graphics[i].attributes.StationCode
                            var stationClass = layer.graphics[i].attributes.StationClass;
                            if (layer.id == "product_point" || layer.id == "product_otime_nation" || layer.id == "product_otime") {
                                stationCode = layer.graphics[i].attributes.Station_Id_C;
                                stationClass = layer.graphics[i].attributes.Station_levl;
                                if ($.inArray(stationCode, filterAutoStationIds) > -1) {
                                    layer.remove(graphic);
                                    i--;
                                }
                                continue;
                            }
                            if (stationType == stationClass) {
                                layer.remove(graphic);
                                i--;
                            }
                        }
                    }
                }
            }


        });