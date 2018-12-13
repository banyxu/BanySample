
(function () {
    ImageLayer = function (options) {
        var opt = options ? options : {};
        if (!!options && !!options.name) this.name = opt.name;
        if (!!options && !!options.map) this.map = options.map;
        this.layer = null;
        this.ZIndex = 100;
        this.prj4326 = "EPSG:4326";
        this.mapPrj = "EPSG:3857";
    };
    ImageLayer.prototype = {
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
        ShowImage: function (layerName,url, projection, imageLoadFunction) {
            var self = this;
            self.layer = new ol.layer.Image({
                source: new ol.source.ImageStatic({
                    url: url,
                    crossOrigin: "",
                    projection: projection !== undefined ? projection : "EPSG:4326",
                    imageLoadFunction: imageLoadFunction
                }),
                zIndex: 1,
                layerName: layerName
            });
            self.map.addLayer(self.layer);
        },

    },
    updateSource = function (url, extent, projection, imageLoadFunction) {
        var self = this;
        self.layer.setSource(new ol.source.ImageStatic({
            url: url,
            crossOrigin: "",
            projection: projection !== undefined ? projection : "EPSG:4326",
            imageExtent: extent,
            imageLoadFunction: imageLoadFunction
        }));
    }

}());