(function () {
    RasterLayer=function(options)
    {
        var opt = options ? options : {};
        if (opt.name) this.name = opt.name;
        if (options.map) this.map = options.map;
        this.layer = null;
        this.type = null;
        this.rasterData = null;
        this.isFirst = true;
        this.init();
    };
    RasterLayer.prototype = {
        context: null,
        canvas: null,
        init:function()
        {
            this.type = LayerType.RasterLayer;
            var imageCanvas = new ol.source.ImageCanvas({ canvasFunction: this.canvasFunction.bind(this) });
            this.layer= new ol.layer.Image({
                source: imageCanvas,
                opacity:0.5
            });
            this.map.addLayer(this.layer);
            this.layer.setVisible(true);
        },
        setData:function(data)
        {
            this.rasterData = data;
           
        },
        canvasFunction: function (extent, resolution, pixelRatio, size, projection) {
           // var canvas
            if (this.isFirst)//这里必须要做一个判断，每次的范围变动都会引起重绘，从而触发该回调函数，不判断的话，将会导致canvas无法被绘制到地图上，出现闪现的情况 
            {
                this.isFirst = false;
                // canvas = document.createElement('canvas');
                this.canvas = document.createElement('canvas');
                
                this.canvas.width = size[0];
                this.canvas.height = size[1];
                this.context = this.canvas.getContext('2d');
                //this.canvas = canvas;
                //var context = canvas.getContext('2d');
                //this.context = context;
                this.drawData(this.context);
               
            } else {
                 this.refresh();
            }
            return this.canvas;
        },
        drawData: function (context)
        {
            if (this.rasterData == null) return;
            var radarData = this.rasterData;
            var rangeObj = this.getDataRange(radarData);
            var colorObj = this.getColorObj();
            var noDataValue = 9999.0, dataArray;
            var drawExtent = {};
            drawExtent.xmin = rangeObj.xmin;
            drawExtent.xmax = rangeObj.xmax;
            drawExtent.ymin = rangeObj.ymin;
            drawExtent.ymax = rangeObj.ymax;

            var data = [];
            for (i = 0; i < radarData.data.length ; i++) {
                var temp = radarData.data[i];
                for (j = 0; j < temp.length; j++) {
                    data.push(temp[j]);
                }
            }
            var dataArray = data;
            var imageDatas = colorObj.imageData, imageLength = colorObj.imageLength, imageStart = colorObj.imageStart;
            if (!data || !dataArray || !dataArray.length) { return; }
            var numColumns = rangeObj.nCols, numRows = rangeObj.nRows, size = rangeObj.cellSize;
            var selectImage = colorObj.selectImage;


            var valmin = data.valmin, valmax = data.valmax;
            var imageData = [];
            var i1, i2;
            if (valmin != null) i1 = colorObj.selectImage(valmin);
            if (valmax != null) i2 = colorObj.selectImage(valmax);
            for (var i = 0; i < imageDatas.length / 4; i++) {
                imageData[4 * i] = imageDatas[4 * i];
                imageData[4 * i + 1] = imageDatas[4 * i + 1];
                imageData[4 * i + 2] = imageDatas[4 * i + 2];
                if (i1 == null && i2 == null) {
                    imageData[4 * i + 3] = imageDatas[4 * i + 3];
                    continue;
                }
                if (i1 != null) {
                    if (i < i1) {
                        imageData[4 * i + 3] = 0;
                        continue;
                    }
                }
                if (i2 != null) {
                    if (i >= i2) {
                        imageData[4 * i + 3] = 0;
                        continue;
                    }
                }
                imageData[4 * i + 3] = imageDatas[4 * i + 3];
            }
            var ctx = context;
            //---------------
            //范围116.6597822372451 40.35925089887001   118.08745884074322  38.4568718247087
            var p1 = { x: drawExtent.xmin, y: drawExtent.ymax };// new esri.geometry.Point(drawExtent.xmin, drawExtent.ymax, map.spatialReference);//左上
            var p2 = { x: drawExtent.xmax, y: drawExtent.ymin };// new esri.geometry.Point(drawExtent.xmax, drawExtent.ymin, map.spatialReference);//右下
            var ltrLon = (p2.x - p1.x) / (numColumns - 1);//每列所占经度
            var utdLat = (p1.y - p2.y) / (numRows - 1);//每列所占纬度

            var pxy1 = this.ToScreen(p1);// map.toScreen(p1);
            var pxy2 = this.ToScreen(p2);//map.toScreen(p2);

            if (pxy1.x != 0 && !pxy1.x) {
                return;
            }

            var ltrWidth = (pxy2.x - pxy1.x) / (numColumns - 1);//每列宽度
            var utdHeight = (pxy2.y - pxy1.y) / (numRows - 1);//每列高度

            if (ltrWidth >= 1 && utdHeight >= 1) {

            } else {

                var ctx = context;
                var xw = pxy2.x - pxy1.x + 1;
                var yh = pxy2.y - pxy1.y + 1;
                var newimagedata = ctx.createImageData(xw, yh);
                var mapWidth = imageData.length / 4 - 1;
                var nl = 0, cdata = 0, ci = 0, cj = 0;
                console.info("start");
                for (var i = 0; i < yh - 1; i++) {
                    var yIndex = Math.abs(Math.round((i + 1) * (numRows / yh)) - 1);
                    if (yIndex == 599) {
                        var a = 1;
                    }
                    for (var j = 0; j < xw - 1; j++) {
                        var xIndex = Math.round((j + 1) * (numColumns / xw)) - 1;
                        cdata = (radarData.data[yIndex][xIndex] === null) ? noDataValue : radarData.data[yIndex][xIndex];
                        if (cdata == noDataValue) {
                            newimagedata.data[nl] = 0;
                            newimagedata.data[nl + 1] = 0;
                            newimagedata.data[nl + 2] = 0;
                            newimagedata.data[nl + 3] = 0;
                        } else {
                            var nll;
                            if (selectImage) {
                                nll = colorObj.selectImage(cdata);
                            } else {
                                if (isNaN(cdata)) {
                                    //nll=mapWidth;
                                    nl += 4;
                                    continue;
                                } else {
                                    var k = (cdata) - imageStart;
                                    var y = (k / imageLength);
                                    nll = Math.floor(y * mapWidth);
                                    if (nll < 0 || nll > mapWidth) {
                                        //nll=mapWidth;
                                        nl += 4;
                                        continue;
                                    }
                                }
                            }
                            newimagedata.data[nl] = imageData[nll * 4];
                            newimagedata.data[nl + 1] = imageData[nll * 4 + 1];
                            newimagedata.data[nl + 2] = imageData[nll * 4 + 2];
                            newimagedata.data[nl + 3] = imageData[nll * 4 + 3];
                        }
                        nl += 4;
                    }
                }
                // showImage();
                ctx.putImageData(newimagedata, pxy1.x, pxy1.y);

                return;
            }

            //确定范围
            var viewExtent = app.map.getView().calculateExtent();//map.extent;
            var viewPoint1 = ol.proj.transform([viewExtent[0], viewExtent[3]], app.mapProjection, app.radarProjection);//左上
            var viewPoint2 = ol.proj.transform([viewExtent[2], viewExtent[1]], app.mapProjection, app.radarProjection);//右下
            var ee = { xmin: viewPoint1[0], xmax: viewPoint2[0], ymin: viewPoint2[1], ymax: viewPoint1[1] };
            var pxStart;
            var pxEnd;
            var xCut1 = 0, xCut2 = 0;
            if (ee.xmin >= p2.x || ee.xmax <= p1.x) {
                return;
            } else if (p1.x >= ee.xmin && p2.x <= ee.xmax) {
                pxStart = p1.x;
                pxEnd = p2.x;
            } else if (p1.x >= ee.xmin && p2.x > ee.xmax) {
                pxStart = p1.x;
                xCut2 = Math.floor((p2.x - ee.xmax) / ltrLon);
                if (xCut2 > 0) xCut2 = xCut2 - 1;
                pxEnd = p2.x - xCut2 * ltrLon;
            } else if (p1.x < ee.xmin && p2.x > ee.xmax) {
                xCut1 = Math.floor((ee.xmin - p1.x) / ltrLon);
                pxStart = p1.x + xCut1 * ltrLon;

                xCut2 = Math.floor((p2.x - ee.xmax) / ltrLon);
                if (xCut2 > 0) xCut2 = xCut2 - 1;
                pxEnd = p2.x - xCut2 * ltrLon;
            } else if (p1.x < ee.xmin && p2.x <= ee.xmax) {
                xCut1 = Math.floor((ee.xmin - p1.x) / ltrLon);
                pxStart = p1.x + xCut1 * ltrLon;
                pxEnd = p2.x;
            }

            var pyStart;
            var pyEnd;
            var yCut1 = 0, yCut2 = 0;
            if (ee.ymin >= p1.y || ee.ymax <= p2.y) {
                return;
            } else if (p1.y >= ee.ymax && p2.y <= ee.ymin) {
                yCut1 = Math.floor((p1.y - ee.ymax) / utdLat);
                pyStart = p1.y - yCut1 * utdLat;

                yCut2 = Math.floor((ee.ymin - p2.y) / utdLat);
                if (yCut2 > 0) yCut2 = yCut2 - 1;
                pyEnd = p2.y + yCut2 * utdLat;
            } else if (p1.y >= ee.ymax && p2.y > ee.ymin) {
                yCut1 = Math.floor((p1.y - ee.ymax) / utdLat);
                pyStart = p1.y - yCut1 * utdLat;
                pyEnd = p2.y;
            } else if (p1.y < ee.ymax && p2.y > ee.ymin) {
                pyStart = p1.y;
                pyEnd = p2.y;
            } else if (p1.y < ee.ymax && p2.y <= ee.ymin) {
                pyStart = p1.y;
                yCut2 = Math.floor((ee.ymin - p2.y) / utdLat);
                if (yCut2 > 0) yCut2 = yCut2 - 1;
                pyEnd = p2.y + yCut2 * utdLat;
            }
            var pStart = { x: pxStart, y: pyStart };// new esri.geometry.Point(pxStart, pyStart, map.spatialReference);//左上
            var pEnd = { x: pxEnd, y: pyEnd };//new esri.geometry.Point(pxEnd, pyEnd, map.spatialReference);//右下
            var startLocation = this.ToScreen(pStart);// map.toScreen(pStart);
            var endLocation = this.ToScreen(pEnd);// map.toScreen(pEnd);


            //console.time("f");
            //dataArray数据处理
            var multiple = 1;//设定一个数据绘制multiple*multiple个像素
            while (multiple > ltrWidth || multiple > utdHeight) {
                multiple--;
            }
            var xInte = Math.floor(ltrWidth / multiple);
            var yInte = Math.floor(utdHeight / multiple);

            var changeL = numRows - yCut2, changel = numColumns - xCut2, inl, nlm, nln;
            dataArr = dataArray;
            var numData = [];
            for (var i = yCut1, ii = 0; i < changeL; i++, ii++) {
                var arr = [];
                for (var j = xCut1, jj = 0; j < changel; j++, jj++) {
                    arr[jj] = (dataArr[numColumns * (i) + j] === null ? noDataValue : dataArr[numColumns * (i) + j]);
                }
                numData[ii] = this.addArr(arr, xInte);
            }
            var arrXY = this.changeArr(numData, yInte);
            //console.timeEnd("f");

            var ctx = context;
            var newimagedata = ctx.createImageData((pxy2.x - pxy1.x) * (1 - ((xCut1 + xCut2) / (numColumns))), (pxy2.y - pxy1.y) * (1 - ((yCut1 + yCut2) / (numRows))));
            var nl = 0, nlFlag = 0, ii = 0, iiFlag = 0;
            var mapWidth = imageData.length / 4 - 1;
            var newWidth = newimagedata.width, newWidth4 = newWidth * 4;
            var newHeight = newimagedata.height;
            var imageRGBA = newimagedata.data;
            //var cellXx=newWidth/(arrXY.length*multiple);
            //var cellYy=newHeight/(arrXY[0].length*multiple);
            var cellXx = (pxy2.x - pxy1.x) / ((numColumns - 1) * xInte * multiple);
            var cellYy = (pxy2.y - pxy1.y) / ((numRows - 1) * yInte * multiple);
            iiFlag = yCut1 * yInte * multiple;
            //console.time("e");
            var arrxy0 = arrXY[0].length;
            var arrxy1 = arrXY.length;
            multiple1 = multiple - 1;
            var r, g, b, a;
            for (var i = 0; i < arrxy0; i++) {
                nlFlag = xCut1 * xInte * multiple;
                var rarr = [], barr = [], garr = [], aarr = [], arrIndex = 0;;
                for (var j = 0; j < arrxy1; j++) {
                    var nll;
                    if (arrXY[j][i] == noDataValue) {
                        r = 0;
                        g = 0;
                        b = 0;
                        a = 0;
                    } else {
                        if (selectImage) {
                            nll = colorObj.selectImage(arrXY[j][i]);
                        } else {
                            if (isNaN(arrXY[j][i])) {
                                nll = mapWidth;
                                //nl+=4;
                                //continue;
                            } else {
                                var k = (arrXY[j][i]) - imageStart;
                                var y = (k / imageLength);
                                nll = Math.floor(y * mapWidth);
                                if (nll < 0 || nll > mapWidth) {
                                    nll = mapWidth;
                                    //nl+=4;
                                    //continue;
                                }
                            }
                        }
                        nll *= 4;
                        r = imageData[nll];
                        g = imageData[nll + 1];
                        b = imageData[nll + 2];
                        a = imageData[nll + 3];
                    }
                    for (var m = 0; m < multiple; m++) {
                        rarr[arrIndex] = imageRGBA[nl] = r;
                        garr[arrIndex] = imageRGBA[nl + 1] = g;
                        barr[arrIndex] = imageRGBA[nl + 2] = b;
                        aarr[arrIndex] = imageRGBA[nl + 3] = a;
                        arrIndex++;
                        nl += 4;
                        nlFlag++;
                        if (cellXx > 1 && ((nlFlag * cellXx) - Math.floor((nlFlag - 1) * cellXx)) >= 2) {
                            rarr[arrIndex] = imageRGBA[nl] = r;
                            garr[arrIndex] = imageRGBA[nl + 1] = g;
                            barr[arrIndex] = imageRGBA[nl + 2] = b;
                            aarr[arrIndex] = imageRGBA[nl + 3] = a;
                            arrIndex++;
                            nl += 4;
                        }
                    }
                    if (nl >= ((ii + 1) * newWidth4)) {
                        nl = (ii + 1) * newWidth4;
                        continue;
                    }
                }

                nl = (ii + 1) * newWidth4;
                ii++;
                iiFlag++;
                if (cellYy > 1 && (cellYy * iiFlag - Math.floor(cellYy * (iiFlag - 1))) >= 2) {
                    for (var l = 0; l < newWidth; l++) {
                        imageRGBA[nl] = rarr[l];
                        imageRGBA[nl + 1] = garr[l];
                        imageRGBA[nl + 2] = barr[l];
                        imageRGBA[nl + 3] = aarr[l];
                        nl += 4;
                    }
                    ii++;
                }
                for (var mul = 0; mul < multiple1; mul++) {
                    for (var l = 0; l < newWidth; l++) {
                        imageRGBA[nl] = rarr[l];
                        imageRGBA[nl + 1] = garr[l];
                        imageRGBA[nl + 2] = barr[l];
                        imageRGBA[nl + 3] = aarr[l];
                        nl += 4;
                    }
                    ii++;
                    iiFlag++;
                    if (cellYy > 1 && (cellYy * iiFlag - Math.floor(cellYy * (iiFlag - 1))) >= 2) {
                        for (var l = 0; l < newWidth; l++) {
                            imageRGBA[nl] = rarr[l];
                            imageRGBA[nl + 1] = garr[l];
                            imageRGBA[nl + 2] = barr[l];
                            imageRGBA[nl + 3] = aarr[l];
                            nl += 4;
                        }
                        ii++;
                    }
                }

                if (ii > newHeight) {
                    break;
                }

            }
            ctx.putImageData(newimagedata, Math.floor(pxy1.x + xCut1 * ltrWidth), Math.floor(pxy1.y + yCut1 * utdHeight));
        },


        getDataRange: function () {
            if (this.rasterData == null) return;
            var data = this.rasterData;
            return {
                nCols: data.nx,
                nRows: data.ny,
                ymin: (data.startLat < data.endLat) ? data.startLat : data.endLat,
                xmin: data.startLon,
                ymax: (data.startLat > data.endLat) ? data.startLat : data.endLat,
                xmax: data.endLon,
                xCell: data.dx,
                yCell: data.dy,
                noDataValue: data.invalid,
                isShowZero: true,
                jsonUrl: "js_bianjie_sea_webMer",
                disInter: false,
                isCut: false,
                fixedNum: 0
            };
        },

        getColorObj: function () {
            return {
                "type": "CR_5",
                "unit": "dBZ",
                "imageData": new Uint8Array(
                    [0, 172, 164, 255,
                    192, 192, 254, 255,
                    122, 114, 238, 255,
                    30, 38, 238, 255,
                    166, 252, 168, 255,
                    0, 234, 0, 255,
                    16, 146, 26, 255,
                    252, 244, 100, 255,
                    200, 200, 2, 255,
                    140, 140, 0, 255,
                    254, 172, 172, 255,
                    254, 100, 92, 255,
                    238, 2, 48, 55, 255,
                    212, 142, 254, 255,
                    170, 36, 250, 255]),
                "levels": [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60,65],
                "selectImage": function (im) {
                    var imc = 0;
                    if (im < 0) {
                        imc = 0;
                    } else if (im < 5) {
                        imc = 1;
                    } else if (im < 10) {
                        imc = 2;
                    } else if (im < 15) {
                        imc = 3;
                    } else if (im < 20) {
                        imc = 4;
                    } else if (im < 25) {
                        imc = 5;
                    } else if (im < 30) {
                        imc = 6;
                    } else if (im <35) {
                        imc = 7;
                    } else if (im < 40) {
                        imc = 8;
                    } else if (im < 45) {
                        imc = 9;
                    } else if (im < 50) {
                        imc = 10;
                    } else if (im < 55) {
                        imc = 11;
                    } else if (im < 60) {
                        imc = 12;
                    } else if (im < 65) {
                        imc = 13;
                    } else {
                        imc = 14;
                    }
                    return imc;
                }
            };


            //return {
            //    "type": "CR_5",
            //    "unit": "dBZ",
            //    "imageData": new Uint8Array([0, 172, 164, 255,
            //118, 118, 118, 255,
            //0, 224, 255, 255,
            //0, 176, 255, 255,
            //0, 144, 204, 255,
            //50, 0, 150, 255,
            //0, 255, 144, 255,
            //0, 197, 0, 255,
            //0, 239, 0, 255,
            //254, 255, 0, 255,
            //174, 0, 0, 255,
            //255, 0, 0, 255,
            //255, 255, 255, 255,
            //231, 0, 255, 255]),
            //    "levels": [0, 2, 3, 5, 8, 9, 11, 12, 14, 16, 17, 18, 20],
            //    "selectImage": function (im) {
            //        var imc = 0;
            //        if (im < 0) {
            //            imc = 0;
            //        } else if (im < 2) {
            //            imc = 1;
            //        } else if (im < 3) {
            //            imc = 2;
            //        } else if (im < 5) {
            //            imc = 3;
            //        } else if (im < 8) {
            //            imc = 4;
            //        } else if (im < 9) {
            //            imc = 5;
            //        } else if (im < 11) {
            //            imc = 6;
            //        } else if (im < 12) {
            //            imc = 7;
            //        } else if (im < 14) {
            //            imc = 8;
            //        } else if (im < 16) {
            //            imc = 9;
            //        } else if (im < 17) {
            //            imc = 10;
            //        } else if (im < 18) {
            //            imc = 11;
            //        } else if (im < 20) {
            //            imc = 12;
            //        } else {
            //            imc = 13;
            //        }
            //        return imc;
            //    }
            //};
        },

        addArr : function (addarr, s) {
            if (s > 1) {
                var addarr1 = [];
                var d, ss = Math.floor(s / 2);
                addarr1[0] = addarr[0];
                inl = addarr.length - 1;
                for (var i = 0; i < inl; i++) {
                    var a1 = addarr[i];
                    var a2 = addarr[i + 1];
                    if (a2 == this.rasterData.invalid || a1 == this.rasterData.invalid) {
                        for (var j = 1; j < ss; j++) {
                            addarr1[i * s + j] = a1;
                        }
                        for (var j = ss; j <= s; j++) {
                            addarr1[i * s + j] = a2;
                        }
                    } else {
                        d = (a2 - a1) / s;
                        for (var j = 1; j <= s; j++) {
                            addarr1[i * s + j] = addarr1[i * s + j - 1] + d;
                        }
                    }
                    addarr1[i * s + s] = a2;
                    addarr1[i * s] = addarr1[i * s + 1];
                }
                // inl = s-1;
                // for(var i=0;i<inl;i++){
                // addarr1[addarr1.length]=addarr1[addarr1.length-1]+d;
                // }
                //addarr1.pop();
                return addarr1;
            } else if (s < 1) {
                return addarr;
            } else {
                return addarr;
            }
        },

        changeArr:function (changearr, s) {
            var arr = [];
            nlm = changearr[0].length;
            nln = changearr.length;
            for (var i = 0; i < nlm; i++) {
                var arry = [];
                for (var j = 0; j < nln; j++) {
                    arry[j] = changearr[j][i];
                }
                arr[i] = this.addArr(arry, s);
            }
            return arr;

        },

        ToScreen: function (point) {
            var screenCenterX = this.canvas.width / 2;
            var screenCenterY = this.canvas.height / 2;
            var resolution = app.map.getView().getResolution();
            var geoCenter = app.map.getView().getCenter();
            var geoP = transform([point.x, point.y], app.mapProjection);
            var PosX = screenCenterX + ((geoP[0] - geoCenter[0]) / resolution + 0.5);
            var PosY = screenCenterY - ((geoP[1] - geoCenter[1]) / resolution + 0.5);
            return { x: PosX, y: PosY };
        },

        refresh: function () {
            //if (RasterLayer.context!=null)
            //    RasterLayer.context.clearRect(0, 0, RasterLayer.canvas.width, RasterLayer.canvas.height);
            //this.drawData(RasterLayer.canvas, RasterLayer.context);
            //this.layer.setVisible(true);
            if (this.context != null)
            {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawData(this.context);
            }
        },
       
    }
   
    ol.inherits(MapLayer, BaseLayer);
}());

var dataList = ["Z_OTHE_RADAMCR_201707222212.bin", "Z_OTHE_RADAMCR_201707222218.bin", "Z_OTHE_RADAMCR_201707222223.bin", "Z_OTHE_RADAMCR_201707222229.bin"
                , "Z_OTHE_RADAMCR_201707222234.bin", "Z_OTHE_RADAMCR_201707222240.bin", "Z_OTHE_RADAMCR_201707222246.bin", "Z_OTHE_RADAMCR_201707222251.bin",
                "Z_OTHE_RADAMCR_201707222257.bin", "Z_OTHE_RADAMCR_201707222302.bin", "Z_OTHE_RADAMCR_201707222308.bin", "Z_OTHE_RADAMCR_201707222313.bin", "Z_OTHE_RADAMCR_201707222319.bin"
                , "Z_OTHE_RADAMCR_201707222324.bin", "Z_OTHE_RADAMCR_201707222330.bin", "Z_OTHE_RADAMCR_201707222335.bin", "Z_OTHE_RADAMCR_201707222341.bin", "Z_OTHE_RADAMCR_201707222347.bin"
                , "Z_OTHE_RADAMCR_201707222352.bin", "Z_OTHE_RADAMCR_201707222358.bin"];
function GetDataList() {
    var dic = [];
    //$.post("/Home/GetRadarData",
    //  { name: "Z_OTHE_RADAMCR_201707222218.bin", type: LayerType.IMAGE, forecast: 100, interval: -20 },
    //  function (data) {
    //      if (!!data) {
    //          var jsonData = $.parseJSON(data);
    //          dic.push(jsonData);
    //          rasterLayer = new RasterLayer({ name: "canvasLayer", map: app.map });
    //          rasterLayer.setData(jsonData);
    //      }
    //  });

    for (var i = 0; i <20; i++) {
        var name = dataList[i];
       // var name = "Z_OTHE_RADAMCR_201707222358.bin";
       // $.post("/api/AlarmReport",
       //{ name: name, type: LayerType.IMAGE, forecast: 100, interval: -20 },
       //function (data) {
       //    console.log(data);
       //    if (!!data) {
       //        var jsonData = $.parseJSON(data);
       //        dic.push(jsonData);
       //       // rasterLayer = new RasterLayer({ name: "canvasLayer", map: app.map });
       //       // rasterLayer.setData(jsonData);
       //    }
       // });

        AjaxUtil.Request("Get", "/api/AlarmReport?name=" + name + "&type=" + LayerType.IMAGE + "&forecast=100&interval=-20", null, function (data) {
           if (!!data) {
               var jsonData = $.parseJSON(data);
               dic.push(jsonData);
           }
        });
    }
    return dic;
}


$(document).ready(function () {
    dicData = GetDataList();
    //showCanvasLayer("Canvas", null);
    //setInterval(ChangeSource, 1000);
});

var rasterLayer;
var dicData;

function UpdateLayerSource(data) {
    if (rasterLayer != null)
    {
        app.map.removeLayer(rasterLayer.layer);
    }
    rasterLayer = new RasterLayer({ name: "canvasLayer", map: app.map });
    rasterLayer.setData(data);
}
function ChangeSource(index) {

        index = index + 20;
        index = index % 20;
    
    if (dicData.length == dataList.length) {
        UpdateLayerSource(dicData[index]);
        //if (index == dataList.length - 1)
        //    index = 0;
        //else
        //    index++;
        //$("#fourCodeInput").val(index);
    }
}

LayerType.RASTER = "Raster";
LayerType.TEXT = "Text";