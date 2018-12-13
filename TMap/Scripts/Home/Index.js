$(document).ready(function () {
    var tmap = new TMap("map");
    tmap.setClickMapEvent(function (e) {
        $("#event").text("map clicked");
        if (tmap.map.hasFeatureAtPixel(e.pixel)) {
            tmap.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                var layerName = layer.get("layerName");
                alert(layerName);
                var geometry = feature.getGeometry();
                if (geometry instanceof ol.geom.LineString) {
                }
                if (geometry instanceof ol.geom.Point) {
                    var style = feature.getStyle();
                    var text = style.getText();
                }
            });
        }
    });
    AddAirportLayer(tmap);
    //AddImageLayer(tmap);
    AddAirportName(tmap);
});

function AddAirportLayer(tmap)
{
    var layerName = "airportPoint";
    var textPointArray = [];
    for (var i = 0; i < airportData.length; i++) {
        var item = airportData[i];
        var point = new ol.geom.Point(ol.proj.transform([item.X, item.Y], "EPSG:4326", "EPSG:3857"));
        textPointArray.push({ point: point, text: item.name, data: item });
    }
    var airportLayer = new IconLayer({ map: tmap.map });
    airportLayer.RemoveLayer(layerName);
    airportLayer.ShowPointIcon(layerName, textPointArray, 0, -16);
    return airportLayer;
}

function AddImageLayer(tmap)
{
    var layerName = "imageLayer";
    var airportLayer = new ImageLayer({ map: tmap.map });
    airportLayer.RemoveLayer(layerName);
    airportLayer.ShowImage(layerName, "D:\\test\\mcr1\\Z_OTHE_RADAMCR_201707222302.png");
    return airportLayer;
}
function AddAirportName(tmap) {
    var layerName = "airportName";
    var textPointArray = [];
    for (var i = 0; i < airportData.length; i++) {
        var item = airportData[i];
        var point = new ol.geom.Point(ol.proj.transform([item.X, item.Y], "EPSG:4326", "EPSG:3857"));
        textPointArray.push({ point: point, text: item.name, data: item });
    }
    var airportLayer = new TextLayer({ map: tmap.map });
    airportLayer.RemoveLayer(layerName);
    airportLayer.ShowPointTextTips(layerName, textPointArray, 0, -16);
    return airportLayer;
}

$(function(){
    //Array
    var colors = [1, 2, 3, 4, 5];
    var colors2 = colors.slice(0);//1,2,3,4,5
    alert(colors2);
    var colors2 = colors.slice(1, 2);//2
    alert(colors2);
}
)
