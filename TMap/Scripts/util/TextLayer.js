
(function () {
    TextLayer = function (options) {
        var opt = options ? options : {};
        if (!!options && !!options.name) this.name = opt.name;
        if (!!options && !!options.map) this.map = options.map;
        this.layer = null;
        this.ZIndex = 100;
        this.prj4326 = "EPSG:4326";
        this.mapPrj = "EPSG:3857";
    };
    TextLayer.prototype = {
        RemoveLayer: function (layerName) {
            var self = this;
            var featureLayers = self.map.getLayers();
            var array = featureLayers.getArray();
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                var properties = item.getProperties();
                if (!!properties.name && properties.name == layerName) {
                    self.map.removeLayer(item);
                    break;
                }
            }
        },
        ShowPointTextTips: function (name, points, left, top, textStyle) {//标识文字
            //for (var i = 0; i < airportList.length; i++) {
            //    var item = airportList[i];
            //    if (item.IsValid == 0) {
            //        continue;
            //    }
            //    if (item.OrderNo <= level) {
            //        var point = new ol.geom.Point(ol.proj.transform([item.X, item.Y], self.prj4326, self.mapPrj));
            //        textPointArray.push({ point: point, text: item.AirportName, data: item });
            //    }
            //}

            var self = this;
            var featureArray = [];
            for (var i = 0; i < points.length; i++) {
                var item = points[i];
                var point = item.point;
                var text = item.text;
                var feature = new ol.Feature(point);
                feature.attributes = { name: text, data: item.data };
                featureArray.push(feature);
            }
            var textVector = new ol.source.Vector({
                projection: self.prj4326
            });
            textVector.addFeatures(featureArray);

            var textLayer = new ol.layer.Vector({
                name: name,
                layerName:name,
                source: textVector,
                style: self.SetTextStyleFunction(left, top, name, textStyle)
            });
            textLayer.setZIndex(self.ZIndex);
            self.layer = textLayer;
            self.map.addLayer(textLayer);
        },


        SetTextStyleFunction: function (left, top, layerName, textStyle) {
            var self = this;
            return function (feature, resolution) {
                var style = new ol.style.Style({
                    text: self.CreateTextStyle(feature, resolution, left, top, layerName, textStyle),
                    zIndex: self.ZIndex
                });
                return [style];
            }
        },
        CreateTextStyle: function (feature, resolution, left, top, layerName, textStyleOption) {
            var self = this;
            var fillStyle = new ol.style.Fill({ color: "#000" });
            var strokeStyle = new ol.style.Stroke({ color: "#fff", width: 2 });
            var text = self.GetText(feature, resolution, layerName)

            var defaultStyleOption = {
                font: "13px Calibri,sans-serif",
                fill: fillStyle,
                stroke: strokeStyle,
                offsetX: left,
                offsetY: top,
                scale: 1,
                text: self.GetText(feature, resolution, layerName),
                zIndex: 100
            };
            if (!!textStyleOption) {
                defaultStyleOption = $.extend({}, defaultStyleOption, textStyleOption);
            }

            var textStyle = new ol.style.Text(defaultStyleOption);
            return textStyle;
        },
        GetText: function (feature, resolution, layerName) {
            var self = this;
            var text = feature.attributes.name;
            //if (self.map.getView().getZoom() < 7 && ("airline_text" == layerName || "terminalArea_text" == layerName)) {
            //    text = '';
            //}
            return text;
        },
        ChangeTextFeature: function (layerName, options) {
            var self = this;
            self.RemoveLayer(layerName);
            var lont = [options.coordinate.X, options.coordinate.Y];
            var coordinate = ol.proj.transform(lont, self.prj4326, self.mapPrj);
            var point = new ol.geom.Point(coordinate);
            var pointer = { data: options, point: point, text: options.text };
            var fillStyle = new ol.style.Fill({ color: options.style.font.color });
            var strokeStyle = new ol.style.Stroke({ color: options.style.bgColor, width: 5 });
            var textStyleOptions = {
                font: options.style.font.size + " Calibri,sans-serif",
                fill: fillStyle,
                stroke: strokeStyle
            }

            self.ShowPointTextTips(layerName, [pointer], 24, 8, textStyleOptions);

        },
    }

}());