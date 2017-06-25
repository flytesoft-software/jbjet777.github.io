'use strict';class EasyMap{static get RADAR(){return'rad_rala'}static get VIS_SAT(){return'sat_vis'}static get IR_SAT(){return'sat_ir'}static get OFFLINE_MAP(){return'images/offline/{z}/{x}/{y}.jpg'}static get ONLINE_MAP(){return'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'}constructor(c,d,e){function g(oa){return 10>oa?'0'+oa:oa.toString()}function h(){var oa=new Date,pa=''+oa.getUTCFullYear()+g(oa.getUTCMonth()+1)+g(oa.getUTCDate())+g(oa.getUTCHours())+g(oa.getUTCMinutes());return pa}function k(){return p(EasyMap.RADAR,3,0.75)}function l(){return p(EasyMap.IR_SAT,1,I)}function m(){return p(EasyMap.VIS_SAT,2,I)}function n(oa){return'https://www.aviationweather.gov/gis/scripts/tc.php?product='+oa+'&date='+h()+'&x={x}&y={-y}&z={z}'}function o(oa){return new ol.source.XYZ({url:n(oa)})}function p(oa,pa,qa){var sa=new ol.layer.Tile({source:o(oa),opacity:qa});return sa.setZIndex(pa),sa.updateTimer=window.setInterval(function(){var ta=o(oa);sa.setSource(ta),ta.refresh(),console.log('WX '+oa+' layer updated.')},3e5),sa}function q(oa){return oa&&(window.clearInterval(oa.updateTimer),ja.removeLayer(oa),oa=null),oa}function r(oa){for(var pa=[],qa=0,ra=0,sa=0,ta=u().bottomLeft.longitude,ua=0;ua<oa.length;ua++)0===ua&&'number'==typeof ta&&(90<ta&&-90>oa[ua].longitude?ra=360:-90>ta&&90<oa[ua].longitude&&(ra=-360)),0<ua&&0==ra&&(90<qa&&-90>oa[ua].longitude?ra=360:-90>qa&&90<oa[ua].longitude&&(ra=-360)),sa=oa[ua].longitude+ra,360<sa&&(sa-=360),-360>sa&&(sa+=360),pa.push([sa,oa[ua].latitude]),qa=oa[ua].longitude;return pa}function s(oa,pa){var ra,qa=[];for(ra=0;ra<oa.length;ra+=pa)qa.push(oa.slice(ra,ra+pa));return qa}function t(){ha.on('tileloaderror',function(){X&&(P>=3?(P=0,X()):P++);var pa=fa.getZoom();console.log('Tile load error. Zoom: '+pa)})}function u(){var oa=fa.calculateExtent(ja.getSize()),pa=ol.proj.transform([oa[0],oa[1]],'EPSG:3857','EPSG:4326'),qa=ol.proj.transform([oa[2],oa[3]],'EPSG:3857','EPSG:4326');return{bottomLeft:new PositionObj(pa[1],pa[0]),topRight:new PositionObj(qa[1],qa[0])}}function v(oa){if(oa){if(Array.isArray(oa)){for(;0<oa.length;)ga.removeFeature(oa.pop());return oa}ga.removeFeature(oa)}return null}function w(oa){if(V){var pa=ol.proj.toLonLat(oa.coordinate);V(new PositionObj(pa[1],pa[0]))}}const z={scene3DOnly:!0,contextOptions:{webgl:{alpha:!0,depth:!0,stencil:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!0,failIfMajorPerformanceCaveat:!1},allowTextureFilterAnisotropic:!1}},A=10,I=0.5;var K=null,L=null,M=null,N=20,O=1,P=0,Q=null,R=null,S=null,T=null,U=null,V=null,W=null,X=null,Y=null,Z=null,_=!1,aa=!0,ba=null,ca=!0,da=!1,ea=ol.interaction.defaults({altShiftDragRotate:!1,pinchRotate:!1,shiftDragZoom:!1}),fa=new ol.View({center:ol.proj.fromLonLat([e.longitude,e.latitude]),zoom:d}),ga=new ol.source.Vector({wrapX:!0}),ha=new ol.source.OSM({url:EasyMap.OFFLINE_MAP}),ia=new ol.layer.Tile({source:ha}),ja=new ol.Map({target:c,layers:[ia],view:fa,controls:[new ol.control.Attribution({collapsible:!1,label:' ',collapseLabel:' '})],interactions:ea,loadTilesWhileAnimating:!0,loadTilesWhileInteracting:!0,moveTolerance:A}),ka=new ol.layer.Vector({source:ga,style:new ol.style.Style({stroke:new ol.style.Stroke({color:'black',width:2})}),updateWhileAnimating:!0,updateWhileInteracting:!0,renderBuffer:500});ka.setZIndex(4),ja.addLayer(ka);var la=new olcs.OLCesium({map:ja,sceneOptions:z});la.setTargetFrameRate(Number.POSITIVE_INFINITY);var ma=u().bottomLeft.longitude,na=u().topRight.longitude;t(),function(){var oa=$('.ol-attribution');oa.css('white-space','nowrap'),oa.children('ul').children('li').eq(0).remove()}(),this.addGreatCircle=function(oa,pa,qa){for(var ra=[],sa=new arc.GreatCircle({x:oa.longitude,y:oa.latitude},{x:pa.longitude,y:pa.latitude}),ta=sa.Arc(50,{offset:10}),ua=0;ua<ta.geometries.length;ua++)for(var wa,va=0;va<ta.geometries[ua].coords.length;va++){if(wa=new PositionObj(ta.geometries[ua].coords[va][1],ta.geometries[ua].coords[va][0]),isNaN(wa.latitude)||isNaN(wa.longitude))return null;ra.push(wa)}if(1<ra.length){var xa=this.addPolyLine(ra,qa);return xa}return console.log('Not enough points created for great circle line.'),null},this.addPolyLine=function(oa,pa){var qa='black',ra=1;pa&&(pa.stroke_color&&(qa=pa.stroke_color),'number'==typeof pa.stroke_width&&(ra=pa.stroke_width));var sa=new ol.style.Style({stroke:new ol.style.Stroke({color:qa,width:ra})});if(oa){var ta=r(oa),ua=new ol.geom.LineString(ta);ua.transform('EPSG:4326','EPSG:3857');var va=new ol.Feature({geometry:ua});return va.setStyle(sa),ga.addFeature(va),va.reDraw=function(){va.setCoordinates(oa)},va.setCoordinates=function(wa){var xa=r(wa),ya=new ol.geom.LineString(xa);ya.transform('EPSG:4326','EPSG:3857'),this.setGeometry(ya)},va}return null},this.addMultiPolyLine=function(oa,pa){var qa=[];if(oa)for(var ra=s(oa,100),sa=0;sa<ra.length;sa++)sa<ra.length-1&&ra[sa].push(ra[sa+1][0]),qa.push(this.addPolyLine(ra[sa],pa));return qa.reDraw=function(){for(var ta=0;ta<qa.length;ta++)qa[ta]&&qa[ta].reDraw()},qa.isValid=function(){return!!(1<qa.length)},qa},this.addPolygon=function(oa,pa){if(oa){var qa='rgba(0, 0, 0, .5)',ra='black',sa=0.1,ta=new ol.style.Fill;pa&&(pa.fill_color&&(qa=pa.fill_color),pa.stroke_color&&(ra=pa.stroke_color),'number'==typeof pa.stroke_width&&(sa=pa.stroke_width));var ua=new ol.style.Style({stroke:new ol.style.Stroke({color:ra,width:sa}),fill:new ol.style.Fill({color:qa})}),va=r(oa),wa=new ol.geom.LinearRing(va);wa.transform('EPSG:4326','EPSG:3857');var xa=new ol.geom.Polygon;xa.appendLinearRing(wa);var ya=new ol.Feature({geometry:xa});return ya.setStyle(ua),ga.addFeature(ya),ya.setCoordinates=function(za){var Aa=r(za),Ba=new ol.geom.LinearRing(Aa);Ba.transform('EPSG:4326','EPSG:3857');var Ca=new ol.geom.Polygon;Ca.appendLinearRing(Ba),this.setGeometry(Ca)},ya}return null},this.setRotation=function(oa){fa.rotate(oa)},this.enableGlobe=function(){la.setEnabled(!0)},this.disableGlobe=function(){la.setEnabled(!1),this.setRotation(0)},this.addMarker=function(oa,pa){var qa=new ol.style.Style({image:new ol.style.Icon({src:pa})}),ra=new ol.geom.Point([oa.longitude,oa.latitude]);ra.transform('EPSG:4326','EPSG:3857');var sa=new ol.Feature({geometry:ra});return sa.setStyle(qa),ga.addFeature(sa),sa.setLocation=function(ta){var ua=new ol.geom.Point([ta.longitude,ta.latitude]);ua.transform('EPSG:4326','EPSG:3857'),this.setGeometry(ua)},sa},this.getCenter=function(){var oa=ol.proj.transform(fa.getCenter(),'EPSG:3857','EPSG:4326');return new PositionObj(oa[1],oa[0])};this.removeFeature=function(oa){return v(oa)},this.render=function(){ja.render()},this.clearMap=function(){ga.clear(!0)},this.onTileLoadError=function(oa){if(oa&&'function'==typeof oa)return void(X=oa);throw new Error('Input function for tile load error.')},ja.on('pointermove',function(oa){oa.dragging&&(!ba&&ca?(ca=!1,ba=window.setTimeout(function(){ba=null,ca=!0,Z=null,Y=null,w(oa),console.log('TODO: Remove isoloated pointermove with new OL 4.2+?')},100)):(window.clearTimeout(ba),ba=null),Z=oa.frameState.time,Y=oa.coordinate,!Q&&(Q=oa.pixel),R=oa.pixel,T&&aa&&(aa=!1,T(oa)))}),ja.on('moveend',function(oa){ca=!0,ba&&(window.clearTimeout(ba),ba=null);var pa=u().bottomLeft.longitude,qa=u().topRight.longitude;if(U&&(0<ma&&0>pa?U(oa):0>ma&&0<pa?U(oa):-180>ma&&-180<pa?U(oa):-180<ma&&-180>pa?U(oa):180<ma&&180>pa?U(oa):180>ma&&180<pa&&U(oa),0<na&&0>qa?U(oa):0>na&&0<qa?U(oa):-180>na&&-180<qa?U(oa):-180<na&&-180>qa?U(oa):180<na&&180>qa?U(oa):180>na&&180<qa&&U(oa)),ma=pa,na=qa,aa=!0,Q&&R&&S){var ra=0,sa=!1;if(!_){var ta=Q[0]-R[0],ua=Q[1]-R[1];ta*=ta,ua*=ua,ra=Math.sqrt(ta+ua)}else sa=!0,_=!1;if(oa.distance=Math.round(ra),Z){var va=oa.frameState.time,wa=va-Z;wa<250&&oa.distance<A&&null!==Y&&!sa&&(oa.coordinate=Y,console.log('TODO: Remove drag click call with OL 4.2+'),Z=null,Y=null,w(oa))}oa.distance>=A&&S(oa)}Q=null,R=null}),this.onDoubleClick=function(oa){W=oa,ja.on('doubleclick',W)},this.onClick=function(oa){V=oa,ja.on('click',w)},this.clickOff=function(){V&&(ja.un('click',w),V=null)},this.doubleClickOff=function(){W&&(ja.un('doubleclick',W),W=null)},this.onDragEnd=function(oa){S=oa},this.onDragStart=function(oa){T=oa},this.onRedrawCall=function(oa){U=oa},this.on=function(oa,pa,qa){return ja.on(oa,pa,qa)},this.onZoomEnd=function(oa,pa){return fa.on('change:resolution',function(){_=!0,ja.once('moveend',function(){oa();var ra=fa.getZoom();ra>N&&fa.setZoom(N),ra<O&&fa.setZoom(O)},pa)},pa)},this.updateSize=function(){ja.updateSize()},this.zoomIn=function(){fa.getZoom()<N&&fa.setZoom(fa.getZoom()+1)},this.zoomOut=function(){fa.getZoom()>O&&fa.setZoom(fa.getZoom()-1)},this.setSource=function(oa){ha=new ol.source.OSM({url:oa}),ia.setSource(ha),ha.refresh(),this.render();var pa=la.getEnabled();la=new olcs.OLCesium({map:ja,sceneOptions:z}),la.setTargetFrameRate(Number.POSITIVE_INFINITY),la.setEnabled(pa),t()},this.setOfflineMap=function(){da=!1,this.setSource(EasyMap.OFFLINE_MAP),ha.setAttributions('<a href=\'https://nationalmap.gov/\' target=\'_blank\'>The USGS National Map</a>'),N=7,this.getZoom()>N&&this.setZoom(N),this.getZoom()<O&&this.setZoom(O),this.clearAllWx(),this.render()},this.setOnlineMap=function(){da=!0,this.setSource(EasyMap.ONLINE_MAP),ha.setAttributions('&copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'),N=20,this.getZoom()>N&&this.setZoom(N),this.getZoom()<O&&this.setZoom(O),this.render()},this.isMapOnline=function(){return da},this.setCenter=function(oa){oa&&fa.setCenter(ol.proj.fromLonLat([oa.longitude,oa.latitude]))},this.setZoom=function(oa){if('number'==typeof oa)oa>N?fa.setZoom(N):oa<O?fa.setZoom(O):fa.setZoom(oa);else throw new Error('setZoom needs a number value input.')},this.getZoom=function(){return fa.getZoom()},this.getMaxZoom=function(){return N},this.getMinZoom=function(){return O},this.wxRadarOff=function(){K=q(K)},this.wxRadarOn=function(){this.wxRadarOff(),K=k(),ja.addLayer(K)},this.wxVisSatOff=function(){L=q(L)},this.wxVisSatOn=function(){this.wxVisSatOff(),L=m(),ja.addLayer(L)},this.wxIRSatOff=function(){M=q(M)},this.wxIRSatOn=function(){this.wxIRSatOff(),M=l(),ja.addLayer(M)},this.clearAllWx=function(){this.wxRadarOff(),this.wxVisSatOff(),this.wxIRSatOff()}}}