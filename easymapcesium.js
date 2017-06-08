/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class EasyMapCesium
{
    static get OFFLINE_MAP()
    {
        return 'images/offline/{z}/{x}/{y}.jpg';
    }
    
    static get ONLINE_MAP()
    {
        return  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    }
    
    constructor(refTarget, refZoom, coordinates)
    {
        var maxZoom = 20;
        var minZoom = 1;
        
        var firstDragCoord = null;
        var lastDragCoord = null;
        var dragEndCallBack = null;
        var dragStartCallBack = null;
        var redrawCallBack = null;
        var mapClickCallBack = null;
        var mapDoubleClickCallback = null;
        var tileLoadErrorCallBack = null;
        var isZooming = false;
        var callDragStartOnce = true;
        
        var currentCoords = coordinates;
        
        var mapIsOnline = false;
        
        var localTileProvider = new Cesium.UrlTemplateImageryProvider(
                {
                    url : EasyMapCesium.ONLINE_MAP
                });
                
        var viewer = new Cesium.Viewer(refTarget, {imageryProvider: localTileProvider, 
                                        baseLayerPicker: false,
                                        animation: false,
                                        fullscreenButton: false,
                                        geocoder: false,
                                        homeButton: false,
                                        infoBox: false,
                                        sceneModePicker: false,
                                        selectionIndicator: false,
                                        timeline: false,
                                        navigationHelpButton: false,
                                        navigationInstructionsInitiallyVisible: false});
        
        viewer.flyTo(
                        {
                            destination : Cesium.Cartesian3.fromDegrees(currentCoords.longitude, currentCoords.latitude)
                        });
        
        
        // var lastLeftLong = getBounds().bottomLeft.longitude;
        // var lastRightLong = getBounds().topRight.longitude;
        
        // setTileLoadError();
        
        /*
         * Makes sure value is inside circle 360.0 degrees!
         * @param {Number} value
         * @returns {Number}
         */
        function rev(/* Number */ value)
        {
            if (value > 360.0 || value < 0.0)
            {
                return (value - (Math.floor(value / 360.0) * 360.0));
            }
            
            if(value > 180)
            {
                value -= 360;
            }

            return value;
        }
        
        /*
         * Convert an array of javaScript Coordinates to OpenLayer point array.
         * @param {Coordinates} coords -- Array of javaScript Coordinates
         * @returns {Array|EasyMap.constructor.coordsToOpenLayers.points}
         */
        function coordinatesToOpenLayers(coords)
        {
            var points = [];
            var lastLong = 0;
            var longFix = 0;
            var fixedLong = 0;
            var leftLong = getBounds().bottomLeft.longitude;
                                                            
            for (var i = 0; i < coords.length; i++)
            {
                if(i === 0 && typeof(leftLong) === 'number') // To get large polygons to display correctly use coordinate "system" of the left side of the current view.
                {
                    if (leftLong > 90 && coords[i].longitude < -90)
                    {
                        longFix = 360;
                    } else if (leftLong < -90 && coords[i].longitude > 90)
                    {
                        longFix = -360;
                    }
                }               
                if (i > 0 && longFix === 0)
                {
                    if (lastLong > 90 && coords[i].longitude < -90)
                    {
                        longFix = 360;
                    } else if (lastLong < -90 && coords[i].longitude > 90)
                    {
                        longFix = -360;
                    }
                }
               
                fixedLong = coords[i].longitude + longFix;
                
                if(fixedLong > 360)
                {
                    fixedLong -= 360;
                }
                if(fixedLong < -360)
                {
                    fixedLong += 360;
                }
                                
                points.push([fixedLong, coords[i].latitude]);
                lastLong = coords[i].longitude;
            }
            
             return points;
        }
        
        /*
         * Splits big array into small arrays.
         * @param {Array} arr -- Array to be split
         * @param {Number} chunkSize - How big each smaller array should be.
         * @returns {Array}
         */
        function chunckArray(arr, chunkSize) 
        {
            var groups = [], i;
            
            for (i = 0; i < arr.length; i += chunkSize) 
            {
                groups.push(arr.slice(i, i + chunkSize));
            }
            
            return groups;
        }
        
        /*
         * Convert an array of javaScript Coordinates to OpenLayer point array.
         * @param {Coordinates} coords -- Array of javaScript Coordinates
         * @returns {Array|EasyMap.constructor.coordsToOpenLayers.points}
         */
        function coordinatesToOpenLayers2(coords)
        {
            var points = [];
                      
            for (var i = 0; i < coords.length; i++)
            {                               
                points.push([coords[i].longitude, coords[i].latitude]);
            }
            
            return points;
        }
        
        function setTileLoadError()
        {
            /***
            mapSource.on("tileloaderror", function(ev)
            {
                if(tileLoadErrorCallBack)
                {
                    tileLoadErrorCallBack();
                }
                var zoom = view.getZoom();
                console.log("Tile load error. Zoom: " + zoom);
            });
            ***/
        }
        
        function degToRad(angleDeg) 
        {
            if(isNaN(angleDeg))
            {
                return 0.0;
            }
            return (Math.PI * angleDeg / 180.0);
        }
        
        /* Creates a great circle between 
         * Two inputed coordinate points.
         * @param {Position} pos1
         * @param {Position} pos2
         * @returns {EasyMap.addGreatCircle.polyLine|EasyMap@call | null}
         */
        this.addGreatCircle = function(pos1, pos2)
        {
            var coords = [];
            var generator = new arc.GreatCircle({x: pos1.longitude, y: pos1.latitude}, {x: pos2.longitude, y: pos2.latitude});
            var line = generator.Arc(50, {offset: 10});
            for(var x = 0; x < line.geometries.length; x++)
            {
                for(var y = 0; y < line.geometries[x].coords.length; y++)
                {
                    var pos = new Position(line.geometries[x].coords[y][1], line.geometries[x].coords[y][0]);
                    if(isNaN(pos.latitude) || isNaN(pos.longitude))
                    {
                        return null;
                    }
                    coords.push(pos);
                }
            }
            
            if(coords.length > 1)
            {
                var polyLine = this.addPolyLine(coords);
                               
                return polyLine;
            }
            else
            {
                console.log("Not enough points created for great circle line.");
            }
            
            return null;
        };
        
        /*
         * Add a polyline to the map.  Returns handle to feature or null on failure.
         * @param {Array} coords - Array of coordinates for line.
         * @returns {ol.Feature | null}  
         */
        this.addPolyLine = function(coords, options)
        {
            /***
            var strokeColor = 'black';
            var strokeWidth = 1;
            
            if(options)
            {
                if(options.stroke_color)
                {
                    strokeColor = options.stroke_color;
                }
                if(typeof(options.stroke_width) === "number")
                {
                    strokeWidth = options.stroke_width;
                }
            }

            var style = new ol.style.Style(
                {
                    stroke: new ol.style.Stroke(
                    {
                        color: strokeColor,
                        width: strokeWidth
                    })
                });
                
            if(coords)
            {
                var points = coordinatesToOpenLayers(coords);
                
                var lineString = new ol.geom.LineString(points);
                lineString.transform('EPSG:4326', 'EPSG:3857');
                
                var feature = new ol.Feature({
                    geometry: lineString
                });
                
                feature.setStyle(style);
            
                drawSource.addFeature(feature);
                
                feature.reDraw = function()
                {
                    feature.setCoordinates(coords);
                }; 
                
                feature.setCoordinates = function(coords)
                {
                    var points = coordinatesToOpenLayers(coords);
                    var lineString = new ol.geom.LineString(points);
                    lineString.transform('EPSG:4326', 'EPSG:3857');
                    
                    this.setGeometry(lineString);                    
                };
                            
                return feature;            
            }
            ***/
            
            return null;
        };
        
        /*
         * Returns an array of line features created from a large amount of coordinates.
         * @param {Array} coords - Array of Positions to draw
         * @returns {Array}
         */
        this.addMultiPolyLine = function(coords, options)
        {
            var lineArray = [];
            
            if(coords)
            {
                var multiCoords = chunckArray(coords, 100);
                
                for(var i = 0; i < multiCoords.length; i++)
                {
                    if(i <  (multiCoords.length - 1))
                    {
                       multiCoords[i].push(multiCoords[i + 1][0]);
                    }
                    lineArray.push(this.addPolyLine(multiCoords[i], options));
                }
            }
            
            lineArray.reDraw = function()
            {
                for(var i = 0; i < lineArray.length; i++)
                {
                    if(lineArray[i])
                    {
                        lineArray[i].reDraw();
                    }
                }
            };
                        
            lineArray.isValid = function()
            {
                if(lineArray.length > 1)
                {
                    return true;
                }
                return false;
                    
            };
            
            return lineArray;
        };
        
        this.addPolygon = function(coords, options)
        {
            /***
            if(coords)
            {
                var fillColor = 'rgba(0, 0, 0, .5)';
                var strokeColor = 'black';
                var strokeWidth = 0.1;
                
                var fill = new ol.style.Fill();
                
                if(options)
                {
                    if(options.fill_color)
                    {
                        fillColor = options.fill_color;
                    }
                    if(options.stroke_color)
                    {
                        strokeColor = options.stroke_color;
                    }
                    if(typeof(options.stroke_width) === "number")
                    {
                        strokeWidth = options.stroke_width;
                    }
                }
                
                var style = new ol.style.Style(
                    {
                        stroke: new ol.style.Stroke(
                        {
                            color: strokeColor,
                            width: strokeWidth
                        }),
                        fill: new ol.style.Fill(
                        {
                            color: fillColor
                        })
                    });
                
                var points = coordinatesToOpenLayers(coords);
               
                var lineRing = new ol.geom.LinearRing(points);
                lineRing.transform('EPSG:4326', 'EPSG:3857');
                
                var polygon = new ol.geom.Polygon();
                polygon.appendLinearRing(lineRing);
                               
                var feature = new ol.Feature({
                    geometry: polygon
                });
                
                feature.setStyle(style);
                
                drawSource.addFeature(feature);
                
                feature.setCoordinates = function(coords)
                {
                    var points = coordinatesToOpenLayers(coords);                    
                    
                    var lineRing = new ol.geom.LinearRing(points);
                    lineRing.transform('EPSG:4326', 'EPSG:3857');
                    var polygon = new ol.geom.Polygon();
                    polygon.appendLinearRing(lineRing);
                                        
                    this.setGeometry(polygon);
                };
                                          
                return feature;            
            }
            ***/
            
            return null;
        };
        
        this.setRotation = function(angle)
        {
            viewer.camera.lookRight(degToRad(angle));
        };
        
        /*
         * Enables globe mode for Openlayers Cesium
         * @returns {undefined}
         */
        this.enableGlobe = function()
        {
            /***       
            ol3d.setEnabled(true);
            var scene = ol3d.getCesiumScene();
            console.log("GLOBE");
            
            
            var redPolygon = viewer.entities.add({
                name : 'Red polygon on surface',
                polygon : {
                    hierarchy : Cesium.Cartesian3.fromDegreesArray([-115.0, 37.0,
                                                                    -115.0, 32.0,
                                                                    -107.0, 33.0,
                                                                    -102.0, 31.0,
                                                                    -102.0, 35.0]),
                    material : Cesium.Color.RED
                }
            });
            ***/
        };
        
        /*
         * Disables globe mode for Openlayers Cesium
         * @returns {undefined}
         */
        this.disableGlobe = function()
        {
            ol3d.setEnabled(false);
            this.setRotation(0);
        };
        
        /* Add a marker to the map. 
         * @param {Coordinate} coords -- Coordinates of marker.
         * @param {String} imgSrc -- Image URL
         * @returns {ol.Feature}
         */
        this.addMarker = function(coords, imgSrc)
        {
            /***
            var iconStyle = new ol.style.Style(
                    {
                        image: new ol.style.Icon(
                        {
                            src: imgSrc
                        })
                    });
                    
            var point = new ol.geom.Point([coords.longitude, coords.latitude]);
            point.transform('EPSG:4326', 'EPSG:3857');
            
            var iconFeature = new ol.Feature(
                    {
                        geometry: point
                    });
                    
            iconFeature.setStyle(iconStyle);
            
            drawSource.addFeature(iconFeature);
            ***/
           
            var iconFeature = new Object();
            iconFeature.setLocation = function(coords)
            {
                /***
                var point = new ol.geom.Point([coords.longitude, coords.latitude]);
                point.transform('EPSG:4326', 'EPSG:3857');
                
                this.setGeometry(point);
                ****/
            };
            
            return iconFeature;
           
        };
        
        /*
         * Returns the center of the current map view.
         * @returns {Position}
         */
        this.getCenter = function()
        {
            var center = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
            
            return new Position(center[1], center[0]);
        };
        
        /*
         * Returns the bottom left and top right corner positions on the current view of the map.
         * @returns {Object} - {bottomLeft: {Postion}, topRight: {Position}
         */
        function getBounds()
        {
            /***
            var viewExtent = view.calculateExtent(map.getSize());
            var bL = ol.proj.transform([viewExtent[0], viewExtent[1]], 'EPSG:3857', 'EPSG:4326');
            var tR = ol.proj.transform([viewExtent[2], viewExtent[3]], 'EPSG:3857', 'EPSG:4326');
            
            return{
                bottomLeft: new Position(bL[1], bL[0]),
                topRight: new Position(tR[1], tR[0])
            };
            ***/
           
           return{
                bottomLeft: new Position(-90, -180),
                topRight: new Position(90, 0)
            };
        };
        
        function removeFeature(feature)
        {
            /***
            if(feature)
            {
                if(Array.isArray(feature))
                {
                    while(feature.length > 0)
                    {
                        drawSource.removeFeature(feature.pop());
                    }
                    
                    return feature;
                }
                drawSource.removeFeature(feature);
            }
            ***/
            
            return null;
        }
        
        /*
         * Remove a feature (Polyline, polygon, etc. from map. 
         * @param {ol.Feature} feature
         * @returns {null}
         */
        this.removeFeature = function(feature)
        {
            return removeFeature(feature);
        };
        
        /*
         * Re-render map.
         * @returns {undefined}
         */
        this.render = function()
        {
            viewer.render();
        };
        
        /*
         * Clears the map of all drawn features.
         * @returns {undefined}
         */
        this.clearMap = function()
        {
            // drawSource.clear(true);
        };
        
        /*
         * 
         * @param {function} func - Callback function when a tile fails to load.
         * @returns {undefined}
         */
        this.onTileLoadError = function(func)
        {
            if(func)
            {
                if(typeof(func) === "function")
                {
                    tileLoadErrorCallBack = func;
                    return;
                }
            }
            
            throw new Error("Input function for tile load error.");
        };
        
        /***
        map.on("pointermove", function(ev)
        {
            if(ev.dragging)
            {
                if(!firstDragCoord)
                {
                    firstDragCoord = ev.pixel;
                }
            
                lastDragCoord = ev.pixel;
                
                if(dragStartCallBack)
                {
                    if(callDragStartOnce)
                    {
                        callDragStartOnce = false;
                        dragStartCallBack(ev);
                    }
                }
            }
        });
        
        map.on("moveend", function(ev)
        {
            console.log("MOVE END");
            
            var leftLong = getBounds().bottomLeft.longitude;
            var rightLong = getBounds().topRight.longitude;
            
            if(redrawCallBack) // Check if the left corner of view crossed a change over point to trigger redraw of polygons.
            {
                if(lastLeftLong > 0 && leftLong < 0)
                {
                    redrawCallBack(ev);
                }
                else if(lastLeftLong < 0 && leftLong > 0)
                {
                    redrawCallBack(ev);
                }
                else if(lastLeftLong < -180 && leftLong > -180)
                {
                    redrawCallBack(ev);
                }
                else if(lastLeftLong > -180 && leftLong < -180)
                {
                    redrawCallBack(ev);
                }
                else if(lastLeftLong > 180 && leftLong < 180)
                {
                    redrawCallBack(ev);
                }
                else if(lastLeftLong < 180 && leftLong > 180)
                {
                    redrawCallBack(ev);
                }
                
                if(lastRightLong > 0 && rightLong < 0)
                {
                    redrawCallBack(ev);
                }
                else if(lastRightLong < 0 && rightLong > 0)
                {
                    redrawCallBack(ev);
                }
                else if(lastRightLong < -180 && rightLong > -180)
                {
                    redrawCallBack(ev);
                }
                else if(lastRightLong > -180 && rightLong < -180)
                {
                    redrawCallBack(ev);
                }
                else if(lastRightLong > 180 && rightLong < 180)
                {
                    redrawCallBack(ev);
                }
                else if(lastRightLong < 180 && rightLong > 180)
                {
                    redrawCallBack(ev);
                }
            }
            lastLeftLong = leftLong;
            lastRightLong = rightLong;
            
            callDragStartOnce = true;
            if(firstDragCoord && lastDragCoord)
            {
                if(dragEndCallBack)
                {
                    var distance = 0;
                    if(!isZooming)
                    {
                        var a = firstDragCoord[0] - lastDragCoord[0];
                        var b = firstDragCoord[1] - lastDragCoord[1];
                        a *= a;
                        b *= b;
               
                        distance = Math.sqrt(a + b);
                    }
                    else
                    {
                        isZooming = false;
                    }
                    ev.distance = Math.round(distance);
                    dragEndCallBack(ev);
                }
            }

           firstDragCoord = null;
           lastDragCoord = null;
        });
        ***/
        
        function mapClick(ev)
        {
           if(mapClickCallBack)
           {
               // var clickPlace = ol.proj.toLonLat(ev.coordinate);

               mapClickCallBack(new Position(clickPlace[1], clickPlace[0]));
           } 
        }
        
        this.onDoubleClick = function(callback)
        {
            // mapDoubleClickCallback = callback;
            
            // map.on("doubleclick", mapDoubleClickCallback);
        };
        
        this.onClick = function(callback)
        {
           // mapClickCallBack = callback;
           // map.on("singleclick", mapClick);
        };
        
        this.clickOff = function()
        {
            /***
            if(mapClickCallBack)
            {
                map.un("singleclick", mapClick);
                mapClickCallBack = null;
            }
            ***/
        };
        
        this.doubleClickOff = function()
        {
            /***
            if(mapDoubleClickCallback)
            {
                map.un("doubleclick", mapDoubleClickCallback);
                mapDoubleClickCallback = null;
            }
            ***/
        };
        
        this.onDragEnd = function(callback)
        {
            // dragEndCallBack = callback;
        };
        
        this.onDragStart = function(callback)
        {
            // dragStartCallBack = callback;            
        };
        
        this.onRedrawCall = function(callback)
        {
            // redrawCallBack = callback;
        };
        
        this.on = function(event, func, thisref)
        {
           // return map.on(event, func, thisref);
        };
        
        this.onZoomEnd = function(func, thisRef)
        {
            /***
            return view.on("change:resolution", function(ev)
            {
                isZooming = true;
                map.once("moveend", func, thisRef);                
            }, thisRef);
            ***/
        };
        
        /*
         * Update the size of the map.
         * @returns {undefined}
         */
        this.updateSize = function()
        {
            viewer.forceResize();
        };
         
        /*
         * Zoom in by one step.
         * @returns {undefined}
         */
        this.zoomIn = function()
        {
            viewer.camera.zoomIn(1);
        };
        
        /*
         * Zoom out by 1 step.
         * @returns {undefined}
         */
        this.zoomOut = function()
        {
            viewer.camera.zoomOut(1);
        };
        
        /*
         * Sets the URL for the source of the map.
         * @param {String} src - URL for map source
         * @returns {undefined}
         */
        this.setSource = function(src)
        {
            /***
            mapSource = new ol.source.OSM({url: src});
            mapLayer.setSource(mapSource);
            this.render();
            var wasEnabled = ol3d.getEnabled();
            
            ol3d = new olcs.OLCesium({map: map, sceneOptions: SCENE_OPTS});
            ol3d.setTargetFrameRate(Number.POSITIVE_INFINITY);
            
            ol3d.setEnabled(wasEnabled);
            setTileLoadError();
            ***/
        };
        
        this.setOfflineMap = function()
        {
            /***
            mapIsOnline = false;
            this.setSource(EasyMap.OFFLINE_MAP);
            maxZoom = 7;
            ***/
        };

        this.setOnlineMap = function()
        {
            /***
            mapIsOnline = true;
            this.setSource(EasyMap.ONLINE_MAP);
            maxZoom = 20;
            ***/
        };
        
        /*
         * Tests where map is online or offline. 
         * @returns {Boolean}
         */
        this.isMapOnline = function()
        {
            return mapIsOnline;
        };
                       
        
        /*
         * Set map center from Coordinate Object
         * @param {Coordinates} coords
         * @returns {undefined}
         */
        this.setCenter = function(coords)
        {
            if(coords)
            {
                currentCoords = coords;
                viewer.flyTo(
                        {
                            destination : Cesium.Cartesian3.fromDegrees(coords.longitude, coords.latitude)
                        });
            }
        };
        
        /*
         * Zooms map to inputed value.
         * @param {Number} zoomVal - Value of zoom to set.
         * @returns {undefined}
         */
        this.setZoom = function(zoomVal)
        {
            if(typeof(zoomVal) === "number")
            {
                var actualZoom = zoomVal;
                if(zoomVal > maxZoom)
                {
                   actualZoom = maxZoom;
                }
                else if(zoomVal < minZoom)
                {
                   actualZoom = minZoom;
                }
                
                viewer.zoomTo({position: Cesium.Cartesian3.fromDegrees(currentCoords.longitude, currentCoords.latitude, actualZoom * 1000)});
            }
            else
            {
                throw new Error("setZoom needs a number value input.");
            }
        };
        
        this.getZoom = function()
        {
            return viewer.camera.getMagnitude();
        };
        
        this.getMaxZoom = function()
        {
            return maxZoom;
        };
        
        this.getMinZoom = function()
        {
            return minZoom;
        };
    }
}



