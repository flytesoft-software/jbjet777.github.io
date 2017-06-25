var LineWorkers=function(d,M){function t(l){l=l.data;var d="null",k="null";switch(l.cmd){case "eclipse_central_line_update":h++;B({type:"central_line",line:JSON.parse(l.line),times:JSON.parse(l.times)});break;case "eclipse_north_umbra_line_update":h++;B({type:"north_umbra_line",line:JSON.parse(l.line),times:JSON.parse(l.times)});break;case "eclipse_south_umbra_line_update":h++;B({type:"south_umbra_line",line:JSON.parse(l.line),times:JSON.parse(l.times)});break;case "eclipse_south_penumbra_line_update":h++;
d=l.line;n=!0;N&&(N=n=!1,Z.postMessage({cmd:"east_penumbra_line",eclipse:D,south_pen_line:d,north_pen_line:k}),pa.postMessage({cmd:"west_penumbra_line",eclipse:D,south_pen_line:d,north_pen_line:k}));B({type:"south_penumbra_line",line:JSON.parse(l.line)});break;case "eclipse_north_penumbra_line_update":h++;k=l.line;N=!0;n&&(N=n=!1,Z.postMessage({cmd:"east_penumbra_line",eclipse:D,south_pen_line:d,north_pen_line:k}),pa.postMessage({cmd:"west_penumbra_line",eclipse:D,south_pen_line:d,north_pen_line:k}));
B({type:"north_penumbra_line",line:JSON.parse(l.line)});break;case "eclipse_east_penumbra_line_update":h++;B({type:"east_penumbra_line",line:JSON.parse(l.line),times:JSON.parse(l.times)});break;case "eclipse_west_penumbra_line_update":h++;B({type:"west_penumbra_line",line:JSON.parse(l.line),times:JSON.parse(l.times)});break;case "eclipse_central_line_error":p++;console.log("LINE WORKER: Central line error.");break;case "eclipse_north_umbra_line_error":p++;console.log("LINE WORKER: North umbra line error.");
break;case "eclipse_south_umbra_line_error":p++;console.log("LINE WORKER: South ubmra line error.");break;case "eclipse_south_penumbra_line_error":p++;console.log("LINE WORKER: South penumbra line error.");break;case "eclipse_north_penumbra_line_error":p++;console.log("LINE WORKER: North penumbra line error.");break;case "eclipse_east_penumbra_line_error":p++;console.log("LINE WORKER: East penumbra line error.");break;case "eclipse_west_penumbra_line_error":p++;console.log("LINE WORKER: West penumbra line error.");
break;default:p++,console.log("LINE WORKER: Invalid line command.")}7===h+p&&(0===h-p&&console.log("LINE ERROR: No lines drawn."),S(h),h=p=0)}if("function"!==typeof d)throw Error("Must use callback function for single line complete updaterr.");if("function"!==typeof M)throw Error("Must use callback function for all lines complete fucntion.");var h=0,p=0,D=null,B=d,S=M,N=!1,n=!1,k=new Worker("calculateWorker.js"),xa=new Worker("calculateWorker.js"),ya=new Worker("calculateWorker.js"),za=new Worker("calculateWorker.js"),
qa=new Worker("calculateWorker.js"),Z=new Worker("calculateWorker.js"),pa=new Worker("calculateWorker.js");k.onmessage=t;xa.onmessage=t;ya.onmessage=t;za.onmessage=t;qa.onmessage=t;Z.onmessage=t;pa.onmessage=t;this.updateLines=function(d){D=d;n=N=!1;k.postMessage({cmd:"central_line",eclipse:d});xa.postMessage({cmd:"north_umbra_line",eclipse:d});ya.postMessage({cmd:"south_umbra_line",eclipse:d});za.postMessage({cmd:"south_penumbra_line",eclipse:d});qa.postMessage({cmd:"north_penumbra_line",eclipse:d})}},
EclipseUI=function(){function d(){window.setTimeout(function(){y=!0},500)}function M(){var a=e.getHeaderHeight(),c=e.getFooterHeight();return $(window).height()-a-c}function t(){aa.css("flex-direction","");Hb.css("flex","");Ib.css("flex","");Pa.css("top","");Qa.removeClass("eclipse-time-block-shift")}function h(){var a=M(),c=$(window).height(),J=$(window).width();aa.height(a);aa.css("min-height",a+"px");var g=$(document).width();z.height(a);a<g&&(g=a);O.width("100%");O.height("100%");ra.width(.5*
g);ra.height(.5*g);0===e.getCurrentPageIndex()?J>c&&500>c?(aa.css("flex-direction","row"),Hb.css("flex","1"),Ib.css("flex","1"),Pa.css("top","1.5em"),Qa.addClass("eclipse-time-block-shift")):t():t();Aa.is(":checked")&&1===e.getCurrentPageIndex()?Z():(E.height(a),b.updateSize());console.log("Updated content sizes.")}function p(){if(window.localStorage.getItem("run_before"))F(!0);else{window.localStorage.setItem("run_before","true");var a=new DialogBox("Welcome!","Welcome to the Eclipse Explorer App, may your skies be clear! Never look at the Sun, eclipsed or not, without proper and certificated eye protection. ");
a.hideCloseButton();e.hideSpinner();a.setOKCallBack(function(){var a=new DialogBox("Location Information Request","This app requires the use of location information, please enable this feature when prompted.");a.hideCloseButton();a.setOKCallBack(function(){F(!0)});a.showModal()});a.showModal()}}function D(){b.getZoom()>=b.getMaxZoom()?nb.prop("disabled",!0):nb.prop("disabled",!1);b.getZoom()<=b.getMinZoom()?ob.prop("disabled",!0):ob.prop("disabled",!1)}function B(){var a=sa.width(),c=$(document).width();
return.6<a/c?!0:!1}function S(){Jb=Intl.DateTimeFormat().resolvedOptions().timeZone}function N(){Ba.hide();pb.hide();qb.show();rb.show();sb.show()}function n(){Ra.hide();Sa.hide()}function k(){pb.show();Ba.show();qb.hide();rb.hide();sb.hide();n()}function xa(){q.isAnimating()||(K?(N(),ya()):Kb())}function ya(){if(2===e.getPageIndex())if(P)switch(Ra.show(),Sa.show(),da){case 0:Ca();break;case 1:tb();break;case 2:Lb();break;case 3:Mb();break;case 4:ub();break;default:goMidConactPoint()}else switch(n(),
da){case 0:Ca();break;case 1:tb();break;case 4:ub();break;default:Ca()}else k()}function za(){b.setOnlineMap();Gb();1===e.getCurrentPageIndex()&&sa.show();Ta.removeClass("eclipse-offline-button-placement-transition")}function qa(){ta.removeClass("eclipse-card-text-show");ua.removeClass("eclipse-card-text-show");va.removeClass("eclipse-card-text-show")}function Z(){var a=$(window).width(),c=M(),J=c,g=$(window).height(),d=c,f=!1;console.log("Map extras shown.");u.hasClass("eclipse-show-circumstances-vertical")||
u.hasClass("eclipse-show-circumstances-horizontal")||u.hasClass("eclipse-show-circumstances-vertical-clean")||r.css("visibility","hidden");g>a?(f=!0,e.isHeaderFooterShown()?(u.removeClass("eclipse-show-circumstances-vertical-clean"),u.addClass("eclipse-show-circumstances-vertical"),J*=.75):(u.removeClass("eclipse-show-circumstances-vertical"),u.addClass("eclipse-show-circumstances-vertical-clean"),J*=.6),u.removeClass("eclipse-show-circumstances-horizontal"),E.removeClass("eclipse-map-circumstances-horizontal"),
aa.height(J),aa.css("min-height",J+"px"),z.removeClass("eclipse-simulation-map-show-horizontal"),z.removeClass("eclipse-simulation-map-show-horizontal-tablet"),z.addClass("eclipse-simulation-map-show"),G.css("left",""),v.css("left",""),v.css("transform","")):(u.addClass("eclipse-show-circumstances-horizontal"),u.removeClass("eclipse-show-circumstances-vertical"),u.removeClass("eclipse-show-circumstances-vertical-clean"),E.addClass("eclipse-map-circumstances-horizontal"),aa.height("calc("+J+"px + 5em)"),
aa.css("min-height","calc("+J+"px + 5em)"),z.removeClass("eclipse-simulation-map-show"),1024>a?(z.removeClass("eclipse-simulation-map-show-horizontal-tablet"),z.addClass("eclipse-simulation-map-show-horizontal")):(z.removeClass("eclipse-simulation-map-show-horizontal"),z.addClass("eclipse-simulation-map-show-horizontal-tablet")));r.addClass("eclipse-move-eclipse-type");Ua.hide();Va.hide();a=0;ea.is(":visible")?(a=ea.offset().top,r.css("float",""),r.css("transform","")):(a=r.offset().top,r.css("float",
"none"),r.css("transform","translateX(0)"));f?(d=a-e.getHeaderHeight()-6,fa.css("bottom","calc("+(g-d)+"px - 2em)")):(d=c,fa.css("bottom","5em"));E.height(d);b.updateSize();ra.css("box-shadow","4px 4px 4px 4px #888888");Wa();u.transitionEndOff();u.transitionEndOne(function(){if(ea.is(":visible")){var a=ea.offset().top;r.css("float","");r.css("transform","")}else a=r.offset().top,r.css("float","none"),r.css("transform","translateX(0)");var J=a-24;f?(T.css("top","calc("+J+"px - 1.2em"),G.css("top",
"calc("+J+"px - 1.2em"),d=a-e.getHeaderHeight()-6,fa.css("bottom","calc("+(g-d)+"px - 2em)")):(a=ea.width(),0===a&&(a=r.width()),T.css("top",""),G.css("top",""),G.css("left","calc("+a+"px + 3em"),d=c,fa.css("bottom","5em"),v.css("left","calc("+a+"px + 25%"),v.css("transform","translateX(0%)"));E.height(d);b.updateSize();r.css("visibility","");console.log("Delayed map resize: "+d)})}function pa(){u.removeClass("eclipse-show-circumstances-vertical");u.removeClass("eclipse-show-circumstances-vertical-clean");
u.removeClass("eclipse-show-circumstances-horizontal");E.removeClass("eclipse-map-circumstances-horizontal");r.removeClass("eclipse-move-eclipse-type");z.removeClass("eclipse-simulation-map-show");z.removeClass("eclipse-simulation-map-show-horizontal");z.removeClass("eclipse-simulation-map-show-horizontal-tablet");T.css("top","");G.css("top","");G.css("left","");v.css("left","");v.css("transform","");r.css("float","");r.css("transform","");Ua.show();Va.show();ra.css("box-shadow","")}function l(){Da.removeClass("material-other-page-show");
Da.transitionEndOne(function(){Da.height("0");qa()})}function wa(){"undefined"!==typeof cordova&&$(document).off("backbutton")}function Gb(){Xa.show();Ya.show();Za.show();Nb.is(":checked")?b.wxRadarOn():b.wxRadarOff();Ob.is(":checked")?b.wxVisSatOn():b.wxVisSatOff();Pb.is(":checked")?b.wxIRSatOn():b.wxIRSatOff()}function Cc(a){if(360<a||0>a)a-=360*Math.floor(a/360);180<a&&(a-=360);return a}function Dc(a){90<a?a=90-(a-90):-90>a&&(a=-90+(a+90));return a}function Ec(){console.log("Binding Eclipse UI events.");
window.setInterval(S,3E4);Fc.click(qa);Gc.click(qa);Nb.click(function(){console.log("Radar click");$(this).is(":checked")?(console.log("Showing Wx Radar."),b.wxRadarOn()):b.wxRadarOff()});Ob.click(function(){console.log("Sat Vis click");$(this).is(":checked")?(console.log("Showing Sat Vis."),b.wxVisSatOn()):b.wxVisSatOff()});Pb.click(function(){console.log("Sat IR click.");$(this).is(":checked")?(console.log("Showing Sat IR."),b.wxIRSatOn()):b.wxIRSatOff()});Aa.click(function(){$(this).is(":checked")?
console.log("Box is checked."):(console.log("Box is not checked."),pa(),fa.css("bottom",""));h()});Hc.click(function(){va.removeClass("eclipse-card-text-show");ua.removeClass("eclipse-card-text-show");ta.hasClass("eclipse-card-text-show")?ta.removeClass("eclipse-card-text-show"):ta.addClass("eclipse-card-text-show")});Ic.click(function(){ta.removeClass("eclipse-card-text-show");va.removeClass("eclipse-card-text-show");ua.hasClass("eclipse-card-text-show")?ua.removeClass("eclipse-card-text-show"):
ua.addClass("eclipse-card-text-show")});Jc.click(function(){ta.removeClass("eclipse-card-text-show");ua.removeClass("eclipse-card-text-show");va.hasClass("eclipse-card-text-show")?va.removeClass("eclipse-card-text-show"):va.addClass("eclipse-card-text-show")});Kc.click(function(){Da.height("100vh");Da.addClass("material-other-page-show");if("undefined"!==typeof cordova)$(document).one("backbutton",function(a){$(window).off("keydown");a.preventDefault();a.stopPropagation();l();return!1});$(window).one("keydown",
function(a){if(27===a.which)return a.preventDefault(),a.stopPropagation(),wa(),l(),!1})});Lc.click(function(){$(window).off("keydown");wa();l()});Ba.click(function(){vb?(vb=!1,Ba.html("3D Globe (Experimental)"),b.disableGlobe()):(vb=!0,Ba.html("2D Map"),b.enableGlobe())});Ta.click(function(){console.log("Attempt to restart online map.");Ea=!0;za();window.setTimeout(function(){Ea=!1},500)});b.onTileLoadError(function(){!Ea&&b.isMapOnline()&&(Ea=!0,console.log("Map possibly gone offline."),b.setOfflineMap(),
Xa.hide(),Ya.hide(),Za.hide(),1===e.getCurrentPageIndex()&&sa.hide(),Ta.hasClass("eclipse-offline-button-placement-transition")||Ta.addClass("eclipse-offline-button-placement-transition"),H("Connection lost. Going to offline mode."),window.setTimeout(function(){Ea=!1},1E3))});e.onBeforePageChange(function(a){console.log("Before page change.");pa()});e.onPageChange(function(a){console.log("Page change fired.");k();Xa.hide();Ya.hide();Za.hide();wb.hide();sa.hide();e.enableYScroll();h();console.log("Removing contact point.");
m.css("visibility","hidden");1===a.currentPageIdx?(console.log("Map page displayed."),console.log("Page change to map."),e.disableYScroll(),b.updateSize(),b.isMapOnline()&&(sa.show(),Gb()),wb.show(),U()&&(v.hasClass("eclipse-realtime-shadow-trans")||v.addClass("eclipse-realtime-shadow-trans")),Aa.is(":checked")&&Z()):2===a.currentPageIdx?(console.log("Simulation page displayed."),m.css("visibility",""),e.disableYScroll(),wb.show(),xa(),Wa(),v.removeClass("eclipse-realtime-shadow-trans")):(v.removeClass("eclipse-realtime-shadow-trans"),
console.log("Circumstances page displayed."),A())});qb.click(function(){y&&(y=!1,A(),tb(),d())});Ra.click(function(){y&&(y=!1,A(),Lb(),d())});rb.click(function(){y&&(y=!1,A(),Ca(),d())});Sa.click(function(){y&&(y=!1,A(),Mb(),d())});sb.click(function(){y&&(y=!1,A(),ub(),d())});Fa.onmessage=Mc;C.setPositionCall(Nc);C.setErrorCall(Oc);Qb.click(function(){console.log("Location icon clicked.");C.isOn()?F(!1):F(!0)});E.longPress(Pc);window.oncontextmenu=function(a){a.preventDefault();a.stopPropagation();
return!1};Ga.click(function(a){y&&(y=!1,Rb.transitionEndOne(function(a){Sb()}),d())});e.onHeaderChange(function(a){console.log("Header change.");h()});e.onWindowResize(function(a){console.log("UI: Window height change.");h();Wa();Q.is(":focus")?B()?(ga.hasClass("eclipse-hide-header-text")||ga.addClass("eclipse-hide-header-text"),ha.hasClass("eclipse-hide-header-text")||ha.addClass("eclipse-hide-header-text"),e.isDrawerButtonSpun()||e.spinBackDrawerButton(),Ha.parent("label").hide()):(ga.removeClass("eclipse-hide-header-text"),
ha.removeClass("eclipse-hide-header-text"),Ha.parent("label").show(),e.unSpinDrawerButton()):(ga.removeClass("eclipse-hide-header-text"),ha.removeClass("eclipse-hide-header-text"),e.unSpinDrawerButton(),Ha.parent("label").show())});e.onDrawerOpen(function(a){console.log("Drawer opened.");Tb($(Ia.children("li")[ba]))});e.onDrawerClosed(function(a){console.log("Drawer closed.")});Qc.click(function(a){Ub()});Rc.click(function(a){0!==w&&(w=0,ia.removeClass("eclipse-time-travel-font"),H("Returning to present time!"),
A());U()});Sc.longPress(function(a){R&&(w=0,A(),w=R.getTime()-(new Date).getTime()-1E4,ia.addClass("eclipse-time-travel-font"),e.changePage(1),H("Time traveling to partial eclipse begins!"),U())});xb.longPress(function(a){P&&(w=0,A(),w=P.getTime()-(new Date).getTime()-1E4,ia.addClass("eclipse-time-travel-font"),e.changePage(1),H("Time traveling to "+g.type+" eclipse begins!"),U())});Tc.longPress(function(a){K&&(w=0,A(),w=K.getTime()-(new Date).getTime()-1E4,ia.addClass("eclipse-time-travel-font"),
e.changePage(1),H("Time traveling to mid eclipse!"),U())});yb.longPress(function(a){ca&&(w=0,A(),w=ca.getTime()-(new Date).getTime()-1E4,ia.addClass("eclipse-time-travel-font"),e.changePage(1),H("Time traveling to "+g.type+" eclipse ends!"),U())});Uc.longPress(function(a){V&&(w=0,A(),w=V.getTime()-(new Date).getTime()-1E4,ia.addClass("eclipse-time-travel-font"),e.changePage(1),H("Time traveling to end of eclipse!"),U())});Vc.click(function(a){-1<zb&&Ab(zb)});Bb.click(function(a){Ja?$a():(Bb.children("i").html("my_location"),
Ja=!0,b.setCenter(f))});nb.click(function(a){b.zoomIn()});ob.click(function(a){b.zoomOut()});b.onDragStart(function(a){ab=!0});b.onDragEnd(function(a){$a();ab=!1});E.keydown(function(a){40>=a.keyCode&&37<=a.keyCode&&($a(),console.log("Map arrow key event."))});b.onZoomEnd(function(a){console.log("ZOOM LEVEL: "+b.getZoom());D();Ja&&b.setCenter(f)});b.onRedrawCall(function(a){console.log("Redraw call!");bb.reDraw();cb.reDraw();db.reDraw();eb.reDraw();fb.reDraw();gb.reDraw();hb.reDraw();Ka&&Ka.reDraw();
La&&La.reDraw();for(a=0;a<L.length;a++)L[a].reDraw()});e.onMDLComplete(function(){console.log("MDL Complete callback.");e.toggleHeaderFooter(!0);p()});Q.focus(function(a){G.hide();T.hide();v.hide();B()&&(ga.addClass("eclipse-hide-header-text"),ha.addClass("eclipse-hide-header-text"),e.spinBackDrawerButton(),Ha.parent("label").hide());I=null;Cb.addClass("eclipse-map-search-list-show");Q.val("");Wc();if("undefined"!==typeof cordova)$(document).one("backbutton",function(a){$(window).off("keydown");a.preventDefault();
a.stopPropagation();Q.blur();E.focus();return!1});$(window).on("keydown",function(a){console.log("KEY: "+a.which);if(27===a.which)return $(window).off("keydown"),wa(),a.preventDefault(),a.stopPropagation(),Q.blur(),E.focus(),!1;if(13===a.which||14===a.which)return $(window).off("keydown"),wa(),a.preventDefault(),a.stopPropagation(),I?0<I.length&&(a=new PositionObj(parseFloat(I[0].lat),parseFloat(I[0].lon)),a.altitude=1,F(!1),W(a),C.getOnlineElevation(a,function(a){console.log("Updating position with elevation data.");
W(a)}),I=null):H("No valid location selected."),Q.blur(),E.focus(),!1})});Q.focusout(function(a){$(window).off("keydown");wa();G.show();T.show();v.show();Q.val("");sa.removeClass("is-dirty");Cb.removeClass("eclipse-map-search-list-show");ga.removeClass("eclipse-hide-header-text");ha.removeClass("eclipse-hide-header-text");e.unSpinDrawerButton();Ha.parent("label").show()});X.click(function(a){console.log("Map search click fired.");I?(a=$(this).index(),a<I.length&&(console.log("Item: "+a),a=new PositionObj(parseFloat(I[a].lat),
parseFloat(I[a].lon)),a.altitude=1,F(!1),W(a),C.getOnlineElevation(a,function(a){console.log("Updating position with elevation data.");W(a)}),I=null)):H("No valid location selected.")});Q.on("input",function(a){a=encodeURIComponent(Q.val());console.log("Search box value: "+a);a="https://nominatim.openstreetmap.org/search?q=QUERY&format=json&limit=3".replace("QUERY",a);$.getJSON(a,function(){console.log("Initial JSON success.")}).done(function(a){I=a;X.eq(0).removeClass("eclipse-disabled-text");for(var c=
0;c<a.length;c++)X.eq(c).children("span").html(a[c].display_name);for(c=X.length;c>a.length&&0<c;c--)X.eq(c-1).children("span").html("");console.log("Second JSON success.")}).fail(function(){console.log("JSON error.")}).always(function(){console.log("JSON complete.")})})}function Wc(){X.eq(0).addClass("eclipse-disabled-text");X.eq(0).children("span").html("Searching locations...");for(var a=1;a<X.length;a++)X.eq(a).children("span").html("")}function $a(){Ja=!1;Bb.children("i").html("location_searching")}
function Xc(){Ia.children("li").click(function(a){Ab(parseInt($(this).attr("eclipse-index"),10));e.toggleDrawer();console.log("Selected eclipse: "+ba)})}function Ab(a){Ga.hide();ja.clickOff();ja.attr("disabled",!0);-1<ba&&($(Ia.children("li")[ba]).removeClass("eclipse-selected"),g.destroy());ba=a;g=Ma.getEclipse(ba);A();q.reset();Vb();a=JSON.stringify(g);Fa.postMessage({cmd:"eclipse",eclipse:a});console.time("DrawLines");Yc.updateLines(a);a=g;ga.html(a.type+" Solar Eclipse");ha.html(a.maxEclipseDate.toLocaleDateString("en-US",
Zc));a=$(Ia.children("li")[ba]);a.addClass("eclipse-selected");Tb(a)}function Ub(){Ab(Ma.getNextEclipseIdx());console.log("Found next eclipse: "+ba)}function Mc(a){var c=a.data;switch(c.cmd){case "eclipse_stats_update":a=new ObserverCircumstances(JSON.parse(c.eclipse_stats));var b=new Date;b.setTime(b.getTime()+w);if(a.isVisible){R=g.toDate(a.circDates.getC1Date());K=g.toDate(a.circDates.getMidDate());V=g.toDate(a.circDates.getC4Date());b={};x&&("Etc"===x.substr(0,3)&&(x="UTC"),b={timeZone:x,timeZoneName:"short"});
var d=parseFloat(c.solar_elevation);if(null===JSON.parse(c.sunrise)){ka=null;var f=0<=d?"Sun is Up":"Sun is Down"}else ka=new Date(JSON.parse(c.sunrise)),f=ka.toLocaleTimeString("en-US",b);null===JSON.parse(c.sunset)?(la=null,c=0<=d?"Sun is Up":"Sun is Down"):(la=new Date(JSON.parse(c.sunset)),c=la.toLocaleTimeString("en-US",b));$c.html(f);ad.html(c);ea.show(0);Qa.show(0);Pa.show(0);Wb.hide(0);Xb.css({background:"url('images/"+a.eclipseType.toLowerCase()+".png')","background-size":"contain"});Ua.html(a.eclipseType+
" Eclipse Occurs");Va.html(K.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}));Yb.html(a.coverage.toFixed(1)+"%");Zb.html(a.magnitude.toFixed(1)+"%");bd.html(R.toLocaleTimeString("en-US",b));cd.html(K.toLocaleTimeString("en-US",b));dd.html(V.toLocaleTimeString("en-US",b));c=ka;f=la;c=a.firstContactBelowHorizon&&a.fourthContactBelowHorizon?new TimeSpan(c,f):a.firstContactBelowHorizon&&!a.fourthContactBelowHorizon?new TimeSpan(c,g.toDate(a.circDates.getC4Date())):!a.firstContactBelowHorizon&&
a.fourthContactBelowHorizon?new TimeSpan(g.toDate(a.circDates.getC1Date()),f):a.c1c4TimeSpan;ed.html(c.toTimeString());a.firstContactBelowHorizon?$b.show(0):$b.hide(0);a.midEclipseBelowHorizon?ac.show(0):ac.hide(0);a.fourthContactBelowHorizon?bc.show(0):bc.hide(0);"Annular"===a.eclipseType||"Total"===a.eclipseType?(P=g.toDate(a.circDates.getC2Date()),ca=g.toDate(a.circDates.getC3Date()),c=a.depth.toFixed(1)+"%",c=a.northOfCenter?c+" N":c+" S",xb.show(0),yb.show(0),ib.show(0),Db.show(0),ib.html(c),
fd.html(a.eclipseType+" Phase Begins"),gd.html(a.eclipseType+" Phase Ends"),hd.html(P.toLocaleTimeString("en-US",b)),id.html(ca.toLocaleTimeString("en-US",b)),b=ka,c=la,b=a.secondContactBelowHorizon&&a.thirdContactBelowHorizon?new TimeSpan:a.secondContactBelowHorizon&&!a.thirdContactBelowHorizon?new TimeSpan(b,a.circDates.getC3Date()):!a.secondContactBelowHorizon&&a.thirdContactBelowHorizon?new TimeSpan(a.circDates.getC2Date(),c):a.c2c3TimeSpan,jd.html(b.toTimeString()),a.secondContactBelowHorizon?
cc.show(0):cc.hide(0),a.thirdContactBelowHorizon?dc.show(0):dc.hide(0),2===e.getPageIndex()?(Ra.show(),Sa.show()):n()):(n(),ca=P=null,ec.html(""),fc.html(""),ib.hide(0),Db.hide(0),xb.hide(0),yb.hide(0));Eb();q.isAnimating()||ya();2===e.getPageIndex()&&N()}gc!==a.eclipseType&&(gc=a.eclipseType,console.log("Eclipse type change."),a.isVisible?O.removeClass("eclipse-moon-invisible"):(hc(),k(),Kb(),V=K=R=null,ic.html(""),jc.html(""),kc.html(""),lc.html(""),mc.html(""),ea.hide(0),Qa.hide(0),Pa.hide(0),
Ua.html("No Eclipse Occurs"),Wb.show(0),Yb.html("0.0%"),Zb.html("0.0%"),ib.hide(0),Db.hide(0),Va.html(""),Xb.css({background:"url('images/no-eclipse.png')","background-size":"contain"})),h());break;case "visible_index_update":jb=JSON.parse(c.visible_array);zb=parseInt(c.next_visible,10);Na&&nc();break;default:console.log("Unknow calculate message command.")}}function kd(){var a=g.getNorthUmbraLine(),c=g.getSouthUmbraLine(),d=g.getNorthPenumbraLine(),e=g.getSouthPenumbraLine(),f=g.getEastLimitLine(),
h=g.getWestLimitLine(),k={stroke_color:"red"};a&&c&&(La=b.addGreatCircle(a[0],c[0],k),Ka=b.addGreatCircle(a[a.length-1],c[c.length-1],k));e&&h&&(a=b.addGreatCircle(h[0],e[0],k))&&L.push(a);e&&f&&(a=b.addGreatCircle(e[e.length-1],f[0],k))&&L.push(a);f&&d&&(a=b.addGreatCircle(f[f.length-1],d[d.length-1],k))&&L.push(a);d&&h&&(a=b.addGreatCircle(d[0],h[h.length-1],k))&&L.push(a);!d&&h&&f&&(a=b.addGreatCircle(h[h.length-1],f[f.length-1],k))&&L.push(a);!e&&h&&f&&(a=b.addGreatCircle(h[0],f[0],k))&&L.push(a)}
function Vb(){bb=b.removeFeature(bb);cb=b.removeFeature(cb);db=b.removeFeature(db);eb=b.removeFeature(eb);fb=b.removeFeature(fb);gb=b.removeFeature(gb);hb=b.removeFeature(hb);La=b.removeFeature(La);Ka=b.removeFeature(Ka);for(var a=0;a<L.length;a++)b.removeFeature(L[a]);L.length=0;console.log("Eclipse lines removed.")}function Pc(){console.log("Toggle click fired.");kb=!0;window.setTimeout(function(){kb=!1},2E3);e.toggleHeaderFooter()?(oc.removeClass("eclipse-main-expand"),pc.removeClass("eclipse-section-expand"),
fa.addClass("eclipse-map-button-placement-transition"),qc.addClass("eclipse-zoom-button-placement-transition"),z.css("top",""),G.css("bottom",""),T.css("bottom",""),v.css("top",""),Aa.is(":checked")&&Z()):(oc.addClass("eclipse-main-expand"),fa.removeClass("eclipse-map-button-placement-transition"),qc.removeClass("eclipse-zoom-button-placement-transition"),pc.addClass("eclipse-section-expand"),Aa.is(":checked")&&Z(),z.css("top","calc(0px - 90vh)"),G.css("bottom","0.2em"),T.css("bottom","0.25em"),v.css("top",
"1em"))}function U(a){var c=!1;g&&(c=new Date,c.setTime(c.getTime()+w),(c=g.isEclipseOccurring(c))&&!q.isAnimating()?(Ga.show(),a||q.isAnimating()||Sb()):(a||q.isAnimating()||A(),Ga.hide(),Ca()));return c}function rc(){m.removeClass("eclipse-sim-info-trans")}function Kb(){k();m.hasClass("eclipse-sim-info-trans")||m.addClass("eclipse-sim-info-trans");m.children("span").html("Eclipse Not Visible");hc()}function tb(){da=1;R&&(q.getMoonPosition(R,f,ma),m.hasClass("eclipse-sim-info-trans")||m.addClass("eclipse-sim-info-trans"),
m.children("span").html("First Contact"))}function Lb(){da=2;P&&(q.getMoonPosition(P,f,ma),m.hasClass("eclipse-sim-info-trans")||m.addClass("eclipse-sim-info-trans"),m.children("span").html("Second Contact"))}function Ca(){console.log("Mid contact point simulation.");da=0;K&&(q.getMoonPosition(K,f,ma),m.hasClass("eclipse-sim-info-trans")||m.addClass("eclipse-sim-info-trans"),m.children("span").html("Mid Eclipse"))}function Mb(){da=3;R&&(q.getMoonPosition(ca,f,ma),m.hasClass("eclipse-sim-info-trans")||
m.addClass("eclipse-sim-info-trans"),m.children("span").html("Third Contact"))}function ub(){da=4;V&&(q.getMoonPosition(V,f,ma),m.hasClass("eclipse-sim-info-trans")||m.addClass("eclipse-sim-info-trans"),m.children("span").html("Fourth Contact"))}function Eb(){var a=new Date;a.setTime(a.getTime()+w);var c={timeZone:Jb,timeZoneName:"short"};x&&("Etc"===x.substr(0,3)&&(x="UTC"),c={timeZone:x,timeZoneName:"short"});var c=a.toLocaleTimeString("en-US",c),b=c.slice(-3),c=c.slice(0,-4);ia.html(c);ld.html(b);
b=c="--:--:--";ka&&(c=(new TimeSpan(ka,a)).toTimeString());la&&(b=(new TimeSpan(la,a)).toTimeString());ic.html(c);mc.html(b);R&&(c=new TimeSpan(R,a),jc.html(c.toTimeString()));K&&(c=new TimeSpan(K,a),kc.html(c.toTimeString()));V&&(c=new TimeSpan(V,a),lc.html(c.toTimeString()));P&&(c=new TimeSpan(P,a),ec.html(c.toTimeString()));ca&&(a=new TimeSpan(ca,a),fc.html(a.toTimeString()))}function md(a){a=a.data;switch(a.cmd){case "eclipse_load_complete":Ma.copyEclipsesIn(JSON.parse(a.eclipse_data));Fa.postMessage({cmd:"update_catalog",
catalog:Ma.eclipseToJSON()});console.log("Eclipse UI load complete: "+Ma.getEclipseCount()+" eclipses loaded.");break;case "eclipse_html_complete":Ia.html(a.eclipse_data);null!==Y&&(Y.terminate(),Y=null,console.log("Terminated eclipse loader thread."));e.hideSpinner();E.show();z.css("visibility","");Na=$(".visible-class");console.log("Icon count: "+Na.length);Xc();jb&&nc();Ub();break;case "eclipse_load_error":null!==Y&&(Y.terminate(),Y=null),console.log("Eclipse loader error: "+a.status),e.hideSpinner()}}
function nc(){Na.hide();for(var a=0;a<jb.length;a++)$(Na[jb[a]]).show()}function Nc(a){W(a)}function W(a){f.longitude=Cc(a.longitude);f.latitude=Dc(a.latitude);f.altitude=a.altitude;f.altitude&&(lb=1===f.altitude?0:f.altitude);a={latitude:f.latitude,longitude:f.longitude,altitude:lb};sc.html(f.latitude.toFixed(2));tc.html(f.longitude.toFixed(2));uc.html((3.28084*lb).toFixed(0));q.setCoords(a);Fa.postMessage({cmd:"coords",coords:JSON.stringify(a)});nd.setLocation(f);Ja&&!ab&&b.setCenter(f);if(C.isOn())S(),
x&&(x="");else try{x=vc.lookup(f.latitude,f.longitude),console.log("New timezone: "+x)}catch(c){console.log("Time zone DB not ready... trying again in 1 second."),window.setTimeout(function(){x=vc.lookup(f.latitude,f.longitude);console.log("New timezone: "+x)},1E3)}console.log("Position updated!")}function F(a){a?C.isOn()||(wc.html("location_on"),H("Aquiring GPS position..."),console.log("Aquiring GPS position..."),b.clickOff(),C.onFirstPostion(function(a){H("GPS Mode On.");console.log("GPS Mode on.");
a.altitude||C.getOnlineElevation(a,function(a){W(a)})}),C.startWatch()):(C.isOn()&&C.clearWatch(),b.clickOff(),b.onClick(function(a){console.log("Map click fired.");ab=!1;kb?(console.log("Map ignoring long click."),kb=!1):(console.log("Clicked at: "+a.latitude+", "+a.longitude),a.altitude=1,W(a),C.getOnlineElevation(f,function(a){console.log("Updating position with elevation data.");W(a)}))}),wc.html("location_off"),H("Position in manual mode."),console.log("Position in manual mode."))}function Oc(a){C.clearWatch();
console.log("Position UI error:"+a.code);var c=new DialogBox("Location Error");c.setOKText("Retry");c.setCloseText("Cancel");a.code===a.PERMISSION_DENIED?(c.setDescriptionText("This app requires the use of location information, please enable this feature in the app's permission settings. Click Retry to try again. Otherwise click Cancel."),c.setOKCallBack(function(){F(!0)}),c.setCloseCallBack(function(){F(!1)})):a.code===a.POSITION_UNAVAILABLE?(c.setDescriptionText("Location services are unavailable. Press Cancel to run location in manual mode.  Press retry to try again."),
c.setOKCallBack(function(){F(!0)}),c.setCloseCallBack(function(){F(!1)})):a.code===a.TIMEOUT&&(c.setDescriptionText("Location services timed out. Press Cancel to run location in manual mode.  Press retry to try again."),c.setCloseCallBack(function(){F(!0)}),c.setCloseCallBack(function(){F(!1)}));e.hideSpinner();c.showModal()}function Tb(a){var c=a.parent();a[0].scrollIntoView();var b=Math.round(c.scrollTop()),d=c[0].scrollHeight,e=Math.round(c.height()/2),f=d-Math.round(c.height())-Math.round(a.height());
a=Math.round(a.position().top);b<e?c.scrollTop(0):b>e&&b<f?c.scrollTop(b-e):a<e?c.scrollTop(b-e+(b-f)):c.scrollTop(d)}function H(a){try{xc.MaterialSnackbar.showSnackbar({message:a,timeout:2E3,actionText:"Dismiss",actionHandler:function(){xc.classList.remove("mdl-snackbar--active")}})}catch(c){console.log("Toast: "+a),console.log("Unable to show toast, MDL probably not yet ready.")}}function yc(){G.addClass("eclipse-map-times-local-trans");T.addClass("eclipse-map-times-zulu-trans")}function Fb(a){x?
zc.html(a.toLocaleTimeString("en-US",{timeZone:x,timeZoneName:"short"})):zc.html(a.toLocaleTimeString());a=a.toLocaleTimeString("en-US",{timeZone:"UTC",timeZoneName:"short"});a=a.replace(" GMT","");od.html(a)}function Sb(){rc();Ga.hide();v.addClass("eclipse-realtime-shadow-trans");ja.html("Stop Animation");Fb(g.getPenumbraStartTime());yc();q.start(Ac,ma,{realTime:!0,dateOffset:w})}function A(){U(!0);v.removeClass("eclipse-realtime-shadow-trans");G.removeClass("eclipse-map-times-local-trans");T.removeClass("eclipse-map-times-zulu-trans");
ja.html("Animate Shadow");q.stop();na=b.removeFeature(na);oa=b.removeFeature(oa);2===e.getCurrentPageIndex()&&xa();console.log("Animation stopped.")}function ma(a){mb=a.moon_pos;Oa=a.sun_pos;Wa()}function Wa(){var a=ra.width(),b=ra.offset();var d=mb.diameter/Oa.diameter*100;var e=a/Oa.diameter,f=mb.ra-Oa.ra;b.top=-1*(mb.decl-Oa.decl)*e/a*100+"%";b.left=-1*f*e/a*100+"%";O.width(d+"%");O.height(d+"%");O.css("top",b.top);O.css("left",b.left);a=(100-d)/2+"%";O.css("transform","translate("+a+", "+a+")")}
function hc(){O.hasClass("eclipse-moon-invisible")||O.addClass("eclipse-moon-invisible")}function Ac(a){null!==a.umb_shadow?oa?oa.setCoordinates(a.umb_shadow):oa=b.addPolygon(a.umb_shadow,{fill_color:"rgba(0, 0, 0, 0.75)"}):oa=b.removeFeature(oa);null!==a.pen_shadow?na?na.setCoordinates(a.pen_shadow):na=b.addPolygon(a.pen_shadow,{fill_color:"rgba(0, 0, 0, 0.2)"}):na=b.removeFeature(na);Fb(a.date)}var Zc={timeZone:"UTC",year:"numeric",month:"long",day:"numeric"},Bc={latitude:34,longitude:-118,altitude:0},
da=0,vc=new TimeZone,x="",Jb=Intl.DateTimeFormat().resolvedOptions().timeZone,e=new MaterialAddons,Ma=new Eclipses,b=new EasyMap("map",4,Bc),Y=null,g=null,I=null,gc="",C=new WatchPosition,f=Bc,lb=0,w=0,ka=null,la=null,R=null,P=null,K=null,ca=null,V=null,jb=null,mb=0,Oa=0,ba=-1,zb=-1,kb=!1,Ja=!0,ab=!1,Ea=!1,E=$("#map"),aa=$("#circumstances"),oc=$("#app-content"),z=$("#simulation-tab"),ra=$("#sun"),O=$("#moon"),Ia=$("#eclipse_list"),ga=$("#eclipse-title"),ha=$("#eclipse-title-date"),Qc=$("#next-button"),
Vc=$("#visible-button"),xc=document.querySelector("#snackbar"),Bb=$("#map-location-button"),nb=$("#map-zoom-in-button"),ob=$("#map-zoom-out-button"),pc=$("#map-tab"),fa=$("#map-buttons"),qc=$("#zoom-buttons"),Ta=$("#map-offline-button"),Rc=$("#time-button"),Kc=$("#about-link"),Da=$("#about-page"),Lc=$("#about-back-button"),u=$("#circumstances-tab"),r=$("#eclipse-type-header"),wb=$("#map-menu-button"),ja=$("#animate-shadow"),Ga=$("#realtime-animate"),qb=$("#first-contact-sim"),Ra=$("#second-contact-sim"),
rb=$("#mid-eclipse-sim"),Sa=$("#third-contact-sim"),sb=$("#fourth-contact-sim"),Ba=$("#globe"),pb=$("#show-extras"),Aa=pb.children("label").children("input"),Xa=$("#show-wx-radar"),Nb=Xa.children("label").children("input"),Ya=$("#show-vis-sat"),Ob=Ya.children("label").children("input"),Za=$("#show-ir-sat"),Pb=Za.children("label").children("input"),y=!0,vb=!1,G=$("#local-time-pop"),T=$("#zulu-time-pop"),zc=$("#local-animate-time"),od=$("#zulu-animate-time"),v=$("#realtime-shadow"),m=$("#contact-point"),
Rb=$("#map-menu"),Qb=$("#location-icon"),wc=Qb.children("i"),sa=$("#map-search-box"),Q=$("#map-search-input"),Cb=$("#map-search-menu"),X=Cb.children("li"),Ha=$("#search-icon"),Hb=$("#top"),Ib=$("#bottom"),Na=null,$c=$("#sunrise_time"),ad=$("#sunset_time"),ea=$("#stats_block"),Qa=$("#time_block"),Pa=$("#time_block2"),Wb=$("#not_visible"),Xb=$("#eclipse_pic"),Ua=$("#eclipse_type"),Va=$("#eclipse_date"),Yb=$("#coverage"),Zb=$("#magnitude"),ib=$("#depth"),Db=$("#depth_title"),bd=$("#c1_time"),hd=$("#c2_time"),
cd=$("#mid_time"),id=$("#c3_time"),dd=$("#c4_time"),$b=$("#c1_horiz"),cc=$("#c2_horiz"),ac=$("#mid_horiz"),dc=$("#c3_horiz"),bc=$("#c4_horiz"),ic=$("#sunrise_count"),jc=$("#c1_count"),ec=$("#c2_count"),kc=$("#mid_count"),fc=$("#c3_count"),lc=$("#c4_count"),mc=$("#sunset_count"),ed=$("#entire_duration"),jd=$("#total_duration");$("#sunrise");var Sc=$("#partial-begins"),xb=$("#total_begins"),Tc=$("#mid-eclipse"),yb=$("#total_ends"),Uc=$("#partial-ends");$("#sunset");var fd=$("#type_div_start"),gd=$("#type_div_ends"),
sc=$("#lat"),tc=$("#long"),uc=$("#alt"),ia=$("#time"),ld=$("#zone"),Fc=$("#help-info"),Gc=$("#more-info"),Hc=$("#disclaimer"),ta=$("#disclaimer-text"),Ic=$("#privacy"),ua=$("#privacy-text"),Jc=$("#open-source"),va=$("#open-source-text"),bb=b.addMultiPolyLine(),cb=b.addMultiPolyLine(),db=b.addMultiPolyLine(),eb=b.addMultiPolyLine(),fb=b.addMultiPolyLine(),gb=b.addMultiPolyLine(),hb=b.addMultiPolyLine(),La=null,Ka=null,L=[],oa=null,na=null;Eb();sc.html(f.latitude.toFixed(2));tc.html(f.longitude.toFixed(2));
uc.html((3.28084*lb).toFixed(2));window.setInterval(Eb,1E3);var Fa=new Worker("calculateWorker.js"),q=new ShadowAnimator,Yc=new LineWorkers(function(a){switch(a.type){case "central_line":bb=b.addMultiPolyLine(a.line);g.setCentralLine(a.line);g.setCentralLineTimes(a.times);break;case "south_umbra_line":cb=b.addMultiPolyLine(a.line);g.setSouthUmbraLine(a.line);g.setSouthUmbraTimes(a.times);break;case "north_umbra_line":db=b.addMultiPolyLine(a.line);g.setNorthUmbraLine(a.line);g.setNorthUmbraTimes(a.times);
break;case "south_penumbra_line":eb=b.addMultiPolyLine(a.line,{stroke_color:"red"});g.setSouthPenumbraLine(a.line);break;case "north_penumbra_line":fb=b.addMultiPolyLine(a.line,{stroke_color:"red"});g.setNorthPenumbraLine(a.line);break;case "east_penumbra_line":gb=b.addMultiPolyLine(a.line,{stroke_color:"red"});g.setEastLimitLine(a.line);g.setEastLineTimes(a.times);break;case "west_penumbra_line":hb=b.addMultiPolyLine(a.line,{stroke_color:"red"});g.setWestLimitLine(a.line);g.setWestLineTimes(a.times);
break;default:console.log("Unknown or invalid line type returned from line workers.")}console.log(a.type+" line drawn.")},function(a){console.log("Eclipse lines drawing now complete: "+a);10<g.getPointCount()?(kd(),q.setEclipse(g),g.getEastLimitLine(),console.timeEnd("DrawLines"),ja.click(function(a){y&&(y=!1,Rb.transitionEndOne(function(a){q.isAnimating()?(A(),U(!0)):(rc(),$a(),ja.html("Stop Animation"),Fb(g.getPenumbraStartTime()),yc(),q.start(Ac,ma),a={latitude:g.midEclipsePoint.latitude,longitude:g.midEclipsePoint.longitude},
45<a.latitude&&(a.latitude=45),-45>a.latitude&&(a.latitude=-45),b.setCenter(a),b.setZoom(3))}),d())}),ja.removeAttr("disabled")):(console.log("Not enough points"),Vb(),a=new DialogBox("Pardon Our Error","Unfortunately the eclipse circumstance lines could not be displayed for this eclipse. This usually occurs with a partial eclipse that only occurs near the poles. This is a known error and limitation. It is currently being investigated.Circumstance data, timings, and simulations should still work.",
"OK"),a.hideCloseButton(),a.showModal())});Fa.postMessage({cmd:"coords",coords:JSON.stringify(f)});var nd=b.addMarker(f,"images/loc24.png");W(f);h();this.init=function(){e.disableSwipe(1);Ec();D();za();console.log("Spawning eclipse loader thread.");e.showSpinner();null===Y&&(Y=new Worker("EclipseLoader.js"),Y.onmessage=md)};this.forceResize=function(){h()}},WatchPosition=function(){function d(){n&&(navigator.geolocation.clearWatch(n),n=null)}function M(d){S&&(S(d.coords),S=null);p=d.coords;B&&B(d.coords)}
function t(h){console.log(h.message);d();D&&D(h)}var h={laitude:34,longitude:-118,altitude:0},p,D,B,S=null,N={enableHighAccuracy:!0,maximumAge:6E4,timeout:65E3},n=null;this.getError=function(){return 0};this.getPosition=function(){return p?p:h};this.isOn=function(){return n?!0:!1};this.setErrorCall=function(d){D=d};this.setPositionCall=function(d){B=d};this.onFirstPostion=function(d){S=d};this.startWatch=function(){n||(n=navigator.geolocation.watchPosition(M,t,N))};this.clearWatch=function(){d()}};
WatchPosition.prototype.getOnlineElevation=function(d,M){if("number"===typeof d.latitude&&"number"===typeof d.longitude&&"function"===typeof M){var t="https://nationalmap.gov/epqs/pqs.php?x=LONG&y=LAT&units=Meters&output=json".replace("LONG",d.longitude.toString());t=t.replace("LAT",d.latitude.toString());console.log("Getting elevation data.");$.getJSON(t,function(){console.log("Initial elevation success.")}).done(function(h){console.log("Elevation callback success.");"number"===typeof h.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation||
"string"===typeof h.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation?(h=parseFloat(h.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation),-999<h?M(new PositionObj(d.latitude,d.longitude,h)):console.log("Bad elevation number, possibly non covered area or oceanic.")):console.log("Elevation returned malformed data.")}).fail(function(){console.log("Elevation error.")}).always(function(){console.log("Elevation complete.")})}else throw Error("Invalid input to getOnlineElevation function.");
};$(function(){function d(d){(new EclipseUI).init();d&&$.getScript("ad_script.js");console.log("VERSION: 013")}"undefined"!==typeof cordova?document.addEventListener("deviceready",function(){d(!0)},!1):d(!1)});