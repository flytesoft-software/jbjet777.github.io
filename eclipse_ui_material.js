/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";

class LineWorkers
{
    constructor(lineUpdateFunc, lineCompleteFunc)
    {
        if(typeof(lineUpdateFunc) !== "function")
        {
            throw new Error("Must use callback function for single line complete updaterr.");
        }
        if(typeof(lineCompleteFunc) !== "function")
        {
            throw new Error("Must use callback function for all lines complete fucntion.");
        }
        
        const LINE_COUNT = 7;
        
        var lineCount = 0;
        var lineErrors = 0;
         
        var m_eclipse = null;
        var callback = lineUpdateFunc;
        var linesComplete = lineCompleteFunc;
        var northPenumbraDone = false;
        var southPenumbraDone = false;
        
        var centralLineWorker = new Worker("calculateWorker.js");
        var northernUmbraLineWorker = new Worker("calculateWorker.js");
        var southernUmbraLineWorker = new Worker("calculateWorker.js");

        var southernPenumbraLineWorker = new Worker("calculateWorker.js");
        var northernPenumbraLineWorker = new Worker("calculateWorker.js");
        var eastEclipseLineWorker = new Worker("calculateWorker.js");
        var westEclipseLineWorker = new Worker("calculateWorker.js");
        
        centralLineWorker.onmessage = onLineWorkerMsg;
        northernUmbraLineWorker.onmessage = onLineWorkerMsg;
        southernUmbraLineWorker.onmessage = onLineWorkerMsg;
        
        southernPenumbraLineWorker.onmessage = onLineWorkerMsg;
        northernPenumbraLineWorker.onmessage = onLineWorkerMsg;
        eastEclipseLineWorker.onmessage = onLineWorkerMsg;
        westEclipseLineWorker.onmessage = onLineWorkerMsg;
        
        function onLineWorkerMsg(msg)
        {
            var data = msg.data;
            var southPenLine = "null";
            var northPenLine = "null";
            
            switch (data.cmd)
            {
                case 'eclipse_central_line_update':
                    lineCount++;
                    callback({  type: 'central_line', 
                                line: JSON.parse(data.line),
                                times: JSON.parse(data.times)});
                    break;
                
                case 'eclipse_north_umbra_line_update':
                    lineCount++;
                    callback({  type: 'north_umbra_line', 
                                line: JSON.parse(data.line),
                                times: JSON.parse(data.times)});
                    break;
                    
                case 'eclipse_south_umbra_line_update':
                    lineCount++;
                    callback({  type: 'south_umbra_line',
                                line: JSON.parse(data.line),
                                times: JSON.parse(data.times)});
                    break;
                    
                case 'eclipse_south_penumbra_line_update':
                    lineCount++;
                    southPenLine = data.line;
                    southPenumbraDone = true;                    
                    if(northPenumbraDone)
                    {
                        southPenumbraDone = false;
                        northPenumbraDone = false;
                        eastEclipseLineWorker.postMessage({ 'cmd': 'east_penumbra_line', 
                                                            'eclipse': m_eclipse,
                                                            'south_pen_line': southPenLine,
                                                            'north_pen_line': northPenLine});
                        westEclipseLineWorker.postMessage({ 'cmd': 'west_penumbra_line', 
                                                            'eclipse': m_eclipse,
                                                            'south_pen_line': southPenLine,
                                                            'north_pen_line': northPenLine});                         
                    }
                    callback({  type: 'south_penumbra_line',
                                line: JSON.parse(data.line)});
                    break;
                    
                case 'eclipse_north_penumbra_line_update':
                    lineCount++;
                    northPenLine = data.line;
                    northPenumbraDone = true;                    
                    if(southPenumbraDone)
                    {
                        southPenumbraDone = false;
                        northPenumbraDone = false;
                        eastEclipseLineWorker.postMessage({ 'cmd': 'east_penumbra_line', 
                                                            'eclipse': m_eclipse,
                                                            'south_pen_line': southPenLine,
                                                            'north_pen_line': northPenLine});
                        westEclipseLineWorker.postMessage({ 'cmd': 'west_penumbra_line', 
                                                            'eclipse': m_eclipse,
                                                            'south_pen_line': southPenLine,
                                                            'north_pen_line': northPenLine});                         
                    }
                    callback({  type: 'north_penumbra_line',
                                line: JSON.parse(data.line)});
                    break;
                    
                case 'eclipse_east_penumbra_line_update':
                    lineCount++;
                    callback({  type: 'east_penumbra_line',
                                line: JSON.parse(data.line),
                                times: JSON.parse(data.times)
                            });
                    break;
                    
                case 'eclipse_west_penumbra_line_update':
                    lineCount++;
                    callback({  type: 'west_penumbra_line',
                                line: JSON.parse(data.line),
                                times: JSON.parse(data.times)});
                    break;
                    
                // ERROR CASES:    
                    
                case 'eclipse_central_line_error':
                    lineErrors++;
                    console.log("LINE WORKER: Central line error.");
                    break;
                
                case 'eclipse_north_umbra_line_error':
                    lineErrors++;
                    console.log("LINE WORKER: North umbra line error.");
                    break;
                    
                case 'eclipse_south_umbra_line_error':
                    lineErrors++;
                    console.log("LINE WORKER: South ubmra line error.");
                    break;
                    
                case 'eclipse_south_penumbra_line_error':
                    lineErrors++;
                    console.log("LINE WORKER: South penumbra line error.");
                    break;
                    
                case 'eclipse_north_penumbra_line_error':
                    lineErrors++;
                    console.log("LINE WORKER: North penumbra line error.");
                    break;
                    
                case 'eclipse_east_penumbra_line_error':
                    lineErrors++;
                    console.log("LINE WORKER: East penumbra line error.");
                    break;
                    
                case 'eclipse_west_penumbra_line_error':
                    lineErrors++;
                    console.log("LINE WORKER: West penumbra line error.");
                    break;
                    
                default:
                    lineErrors++;
                    console.log("LINE WORKER: Invalid line command.");
                    break;                    
            }
            
            if((lineCount + lineErrors) === LINE_COUNT)
            {
                if((lineCount - lineErrors) === 0)
                {
                    console.log("LINE ERROR: No lines drawn.");
                }
                
                linesComplete(lineCount);
                lineCount = lineErrors = 0;
            }
        }
         
        this.updateLines = function(eclipse)
        {
            m_eclipse = eclipse;
            northPenumbraDone = false;
            southPenumbraDone = false;
            
            centralLineWorker.postMessage({'cmd': 'central_line', 'eclipse': eclipse});
            northernUmbraLineWorker.postMessage({'cmd': 'north_umbra_line', 'eclipse': eclipse});
            southernUmbraLineWorker.postMessage({'cmd': 'south_umbra_line', 'eclipse': eclipse});
            
            southernPenumbraLineWorker.postMessage({'cmd': 'south_penumbra_line', 'eclipse': eclipse});
            northernPenumbraLineWorker.postMessage({'cmd': 'north_penumbra_line', 'eclipse': eclipse});                       
        };
    }
}

class EclipseUI
{
    constructor()
    {
        const MAP_PAGE_IDX = 1;
        const SIM_PAGE_IDX = 2;
        const TOAST_TIMEOUT = 2000;
        const TIME_LOCALE = "en-US";
        const LINE_COUNT = 7;
        const DATE_OPTIONS = {timeZone: "UTC", year: "numeric", month: "long", day: "numeric"};
        const STARTING_COORDS = {latitude: 34, longitude: -118, altitude: 0};
        const LOCATION_MARKER_URL = 'images/loc24.png';
        const DIRTY_MAP_SPILT = 0.75;
        const CLEAN_MAP_SPLIT = 0.5;
        
        const MID_SELECTION = 0;
        const C1_SELECTION = 1;
        const C2_SELECTION = 2;
        const C3_SELECTION = 3;
        const C4_SELECTION = 4;
        
        var simulationSelection = MID_SELECTION;
        
        var RUN_BEFORE = "run_before";
        var IMGS_FOLDER = 'images/';
        var MASTER_TIMER_INTERVAL = 1000;
        var IGNORE_DRAG = 15;   // If drag movement is small, keep location centered.
        var METERS_TO_FEET = 3.28084;
        
        var timeZone = new TimeZone;
        var selectedTimeZone = "";
        var localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        var material = new MaterialAddons;
        var eclipseCatalog = new Eclipses();
        var map = new EasyMap('map', 4, STARTING_COORDS);
        var eclipseLoadWorker = null;
        var currentEclipseRef = null;
        var mapSearchData = null;
        var lastEclipseType = "";
        
        var positionWatch = new WatchPosition;
        var currentCoords = STARTING_COORDS;
        var currentAltitude = 0.0;
        var dateOffset = 0; // TODO: Time travel functionality.
        
        var sunRiseTime = null;
        var sunSetTime = null;
        var c1Time = null;
        var c2Time = null;
        var midTime = null;
        var c3Time = null;
        var c4Time = null;
        var visibleArray = null;
        
        var moonPos = 0;
        var sunPos = 0;
        var sunMoonSizeRatio = 1;
        
        var selectedEclipse = -1;
        var nextVisibleEclipse = -1;
        var longCickFired = false; // Set true during map click press, long presses are not clicks, so ignore them.
        var mapPositionLock = true;
        var tempIgnoreLock = false;
        var tempIgnoreOfflineMap = false;
               
        var jMap = $("#map");
        var circumstances = $("#circumstances");
        var main = $("#app-content");       
        var simulationTab = $("#simulation-tab");
        var sun = $("#sun");
        var moon = $("#moon");
        var eclipseList = $("#eclipse_list");
        var eclipseTitle = $("#eclipse-title");
        var eclipseTitleDate = $("#eclipse-title-date");
        var nextButton = $("#next-button");
        var visibleButton = $("#visible-button"); // TODO: Visible button functionality.
        var snackBar = document.querySelector("#snackbar");
        var mapLocationButton = $("#map-location-button");
        var mapZoomInButton = $("#map-zoom-in-button");
        var mapZoomOutButton = $("#map-zoom-out-button");
        var mapSection = $("#map-tab");
        var mapButtons = $("#map-buttons");
        var zoomButtons = $("#zoom-buttons");
        var mapOfflineButton = $("#map-offline-button");
        var timeButton = $("#time-button");
        var aboutLink = $("#about-link");
        var aboutPage = $("#about-page");
        var aboutBackButton = $("#about-back-button");
        var showExtras = $("#show-extras");
        var showExtraCheck = showExtras.children("label").children("input");
        var circumstanceTab = $("#circumstances-tab");
        var eclipseTypeHeader = $("#eclipse-type-header");
        
        /* Map/Sim Menu */
        var mapMenuButton = $("#map-menu-button");
        var animateShadowMenuItem = $("#animate-shadow");
        var realtimeShadowMenuItem = $("#realtime-animate");
        var firstContactItem = $("#first-contact-sim");
        var secondContactItem = $("#second-contact-sim");
        var midEclipseItem = $("#mid-eclipse-sim");
        var thirdContactItem = $("#third-contact-sim");
        var fourthContactItem = $("#fourth-contact-sim");
        var globeMenuItem = $("#globe");
        var bRegisterMenuClick = true; //  Temporay value to protect against other menu items being "fat fingered" during menu animations.
        var bGlobeMode = false;
        /* Map/Sim Menu End */
        
        var localTimeDiv = $("#local-time-pop");
        var zuluTimeDiv = $("#zulu-time-pop");
        var localAnimateTime = $("#local-animate-time");
        var zuluAnimateTime = $("#zulu-animate-time");
        var realTimeInfoID = $("#realtime-shadow");
        var contactPointID = $("#contact-point");
        var mapMenuID = $("#map-menu");
        var locationIconButton = $("#location-icon");
        var locationIcon =  locationIconButton.children("i");
        var mapSearchBoxID = $("#map-search-box");
        var mapSearchInputID = $("#map-search-input");
        var mapSearchMenuID = $("#map-search-menu");
        var mapSearchList = mapSearchMenuID.children("li");
        var mapSearchIcon = $("#search-icon");
                
        var visibilityIcons = null;
        
        /* Eclipse STATS IDs START */
        var sunRiseTimeID = $("#sunrise_time");
        var sunSetTimeID = $("#sunset_time");
        
        var statsBlock = $("#stats_block");
        var timeBlock = $("#time_block");
        var timeBlock2 = $("#time_block2");
        var notVisibleID = $("#not_visible");
        
        var eclipsePicID = $("#eclipse_pic");
        var eclipseTypeID = $("#eclipse_type");
        var eclipseDateID = $("#eclipse_date");
        
        var coverageID = $("#coverage");
        var magnitudeID = $("#magnitude");
        var depthID = $("#depth");
        var depthTitleID = $("#depth_title");
        
        var c1TimeID = $("#c1_time");
        var c2TimeID = $("#c2_time");
        var midTimeID = $("#mid_time");
        var c3TimeID = $("#c3_time");
        var c4TimeID = $("#c4_time");
        
        var c1HorizID = $("#c1_horiz");
        var c2HorizID = $("#c2_horiz");
        var midHorizID = $("#mid_horiz");
        var c3HorizID = $("#c3_horiz");
        var c4HorizID = $("#c4_horiz");
        
        var sunRiseCountID = $("#sunrise_count");
        var c1CountID = $("#c1_count");
        var c2CountID = $("#c2_count");
        var midCountID = $("#mid_count");
        var c3CountID = $("#c3_count");
        var c4CountID = $("#c4_count");
        var sunSetCountID = $("#sunset_count");
        
        var entireDurationID = $("#entire_duration");
        var totalDurationID = $("#total_duration");
        
        /* BLOCK IDS */
        var sunRiseBlock = $("#sunrise");
        var partialBeginsBlock = $("#partial-begins");
        var totalBeginsID = $("#total_begins");
        var midEclipseBlock = $("#mid-eclipse");
        var totalEndsID = $("#total_ends");
        var paritalEndsBlcok = $("#partial-ends");
        var sunSetBlock = $("#sunset");
        /* BLOCK IDS END */
        
        var typeStartID = $("#type_div_start");
        var typeEndID = $("#type_div_ends");
        /* Eclipse STATS IDs END */
         
        /* FOORTER IDs */
        var latID = $("#lat");
        var longID = $("#long");
        var altID = $("#alt");
        var timeID = $("#time");
        var zoneID = $("#zone");
        /* FOOTER IDs END */
        
        /* ABOUT IDs */
        var helpInfo = $("#help-info");
        var moreInfo = $("#more-info");
        var disclaimer = $("#disclaimer");
        var disclaimerText = $("#disclaimer-text");
        var privacy =$("#privacy");
        var privacyText = $("#privacy-text");
        var openSource = $("#open-source");
        var openSourceText = $("#open-source-text");
        /* ABOUT IDs END */
        
        /* Map Poly Lines */
        var centralLine = map.addMultiPolyLine();
        var southernUmbraLine = map.addMultiPolyLine();
        var northernUmbraLine = map.addMultiPolyLine();
        var southernPenumbraLine = map.addMultiPolyLine(); 
        var northernPenumbraLine = map.addMultiPolyLine(); 
        var eastEclipseLine = map.addMultiPolyLine();
        var westEclipseLine = map.addMultiPolyLine();
        
        var westUmbraLine = null;
        var eastUmbraLine = null;
        
        var penumbraLineConnects = [];
        /* Map Poly Lines END */
        
        /* Map Shadow Polygons */
        var umbraShadow = null;
        var penumbraShadow = null;
        /* Map Shadow Polygons END */
        
        
        
        updateCountDowns();
        latID.html(currentCoords.latitude.toFixed(2));
        longID.html(currentCoords.longitude.toFixed(2));
        altID.html((currentAltitude * METERS_TO_FEET).toFixed(2));
        
        window.setInterval(updateCountDowns, MASTER_TIMER_INTERVAL);
        
        var calculateWorker = new Worker("calculateWorker.js");
        var shadowAnimator = new ShadowAnimator;
        var lineWorkers = new LineWorkers(onEclipseLinesUpdate, onEclipseLinesComplete);
        
        
        calculateWorker.postMessage({'cmd': 'coords', 'coords': JSON.stringify(currentCoords)});
        
        var locationMarker = map.addMarker(currentCoords, LOCATION_MARKER_URL);
        
        setLocation(currentCoords);
        
        setPageHeights();
        
        function resetMenu()
        {
            window.setTimeout(function()
            {
                bRegisterMenuClick = true;
            }, 500);
        }
        
        function getScreenHeight()
        {
            var screenHeight = $(window).height();
            
            return screenHeight;
        }
        
        function getScreenWidth()
        {
            return $(window).width();
        }
        
        function getContentHeight()
        {            
            var headerHeight = material.getHeaderHeight();
            var footerHeight = material.getFooterHeight();
            var screenHeight = getScreenHeight();
            var contentHeight = screenHeight - headerHeight - footerHeight;
            
            return contentHeight;
        }
        
        function setPageHeights()
        {
            var contentHeight = getContentHeight();
            var screenHeight = getScreenHeight();
            
            
            circumstances.height(contentHeight);
            var timeBlockTop = timeBlock.offset().top;
             var circumstancesTop = circumstances.offset().top;
             var minHeight =  timeBlockTop + circumstancesTop;
            
            var top = $("#top").height();
            var bottom = $("#bottom").height();
            
            console.log("Top height: " + top);
            console.log("Bottom height: " + bottom);
            console.log("Total height: " + (top + bottom));
            console.log("Content height: " + contentHeight);
            
            if((top + bottom) <= (contentHeight + 1))
            {
                minHeight = contentHeight;
            }
            else
            {
                minHeight = screenHeight;
            } 
           
            circumstances.css("min-height", minHeight + "px");
            updateSimMetrics(contentHeight);
            
            if(showExtraCheck.is(":checked")  && material.getCurrentPageIndex() === MAP_PAGE_IDX)
            {
                sunMoonSizeRatio = 0.2;
                showMapExtras();
            }
            else
            {
                sunMoonSizeRatio = 1;
                jMap.height(contentHeight);
            
                map.updateSize();
            }
            
            console.log("Updated content sizes.");
        }
           
        function firstRun()
        {
            if(!window.localStorage.getItem(RUN_BEFORE))
            {
                window.localStorage.setItem(RUN_BEFORE, "true");
                
                var warningBox = new DialogBox(  "WARNING!!!",
                                                "Never look at the Sun, eclipsed or not, without proper and certificated eye protection.  \n\
                                                Looking at the Sun without such protection will result in permanent eye damage and possible blindness.  \n\
                                                100% UVA/UVB sunglasses do <u>NOT</u> provide eye protection for looking at the Sun.");
                                                
                warningBox.hideCloseButton();
                
                material.hideSpinner();
                
                warningBox.setOKCallBack(function()
                {
                    var dialogBox = new DialogBox(  "Location Information Request",
                                                "This app requires the use of location information, please enable this feature when prompted.");

                    dialogBox.hideCloseButton();
                    dialogBox.setOKCallBack(function()
                    {
                        setLocationMode(true);
                    });

                    dialogBox.showModal();
                });
                
                warningBox.showModal();
            }
            else
            {
                setLocationMode(true);
            }
        }
        
        function checkZooms()
        {
            if(map.getZoom() >= map.getMaxZoom())
            {
                mapZoomInButton.prop("disabled", true);
            }
            else
            {
                mapZoomInButton.prop("disabled", false);
            }
            
            if(map.getZoom() <= map.getMinZoom())
            {
                mapZoomOutButton.prop("disabled", true);
            }
            else
            {
                mapZoomOutButton.prop("disabled", false);
            }
        }
        
        function onMapDisplay()
        {
            console.log("Page change to map.");
            material.disableYScroll();
            map.updateSize();
            
            if(map.isMapOnline())
            {
               mapSearchBoxID.show(); 
            }
            
            mapMenuButton.show();            
            checkIfEclipseIsOccurring();
            if(showExtraCheck.is(":checked"))
            {
                showMapExtras();
            }
        }
        
        function isSmallScreen()
        {               
            var searchBoxWidth = mapSearchBoxID.width();
            var docWidth = $(document).width();
            var ratio = searchBoxWidth / docWidth;

            if(ratio > .6)
            {
                return true;
            }

            return false;
        }
        
        function updateSimMetrics(mapHeight)
        {
            var width = $(document).width();
            simulationTab.height(mapHeight);
            
            if(mapHeight < width)
            {
                width = mapHeight;
            }
            
            moon.width("100%");
            moon.height("100%");
            sun.width(width * .5);
            sun.height(width * .5);            
        }
        
        function checkLocalTimeZone()
        {
            localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        
        function displaySimMenuItems()
        {
            globeMenuItem.hide();
            showExtras.hide();
            firstContactItem.show();
            midEclipseItem.show();
            fourthContactItem.show();
        }
        
        function displayCentralSimMenuItems()
        {
            secondContactItem.show();
            thirdContactItem.show();
        }
        
        function hideCentralSimMenuItems()
        {
            secondContactItem.hide();
            thirdContactItem.hide();
        }
        
        function hideSimMenuItems()
        {
            showExtras.show();
            globeMenuItem.show();
            firstContactItem.hide();            
            midEclipseItem.hide();           
            fourthContactItem.hide();
            hideCentralSimMenuItems();
        }
        
        function setSimMenuOverFlow()
        {
            if (!shadowAnimator.isAnimating())
            {
                if (midTime)
                {
                    displaySimMenuItems();
                    setSimulationDisplay();                    
                } else
                {
                    noSimEclipse();
                }
            }
        }
        
        function setSimulationDisplay()
        {
            if (c2Time)
            {
                displayCentralSimMenuItems();
                switch (simulationSelection)
                {
                    case MID_SELECTION:
                        goMidContactPoint();
                        break;
                    case C1_SELECTION:
                        goC1ContactPoint();
                        break;
                    case C2_SELECTION:
                        goC2ContactPoint();
                        break;
                    case C3_SELECTION:
                        goC3ContactPoint();
                        break;
                    case C4_SELECTION:
                        goC4ContactPoint();
                        break;
                    default:
                        goMidConactPoint();
                        break;
                }
            } else
            {
                hideCentralSimMenuItems();
                switch (simulationSelection)
                {
                    case MID_SELECTION:
                        goMidContactPoint();
                        break;
                    case C1_SELECTION:
                        goC1ContactPoint();
                        break;
                    case C4_SELECTION:
                        goC4ContactPoint();
                        break;
                    default:
                        goMidContactPoint();
                        break;
                }
            }
        }
        
        function setOfflineMap()
        {
            map.setOfflineMap();
            if (MAP_PAGE_IDX === material.getCurrentPageIndex())
            {
                mapSearchBoxID.hide(); 
            }
            
            if(!mapOfflineButton.hasClass("eclipse-offline-button-placement-transition"))
            {
                mapOfflineButton.addClass("eclipse-offline-button-placement-transition");
            }
            showToast("Connection lost. Going to offline mode.");
        }
        
        function setOnlineMap()
        {
            map.setOnlineMap();
            if (MAP_PAGE_IDX === material.getCurrentPageIndex())
            {
                mapSearchBoxID.show(); 
            }
            mapOfflineButton.removeClass("eclipse-offline-button-placement-transition");
        }
        
        function collapseAboutPageSections()
        {
            disclaimerText.removeClass("eclipse-card-text-show");
            privacyText.removeClass("eclipse-card-text-show");
            openSourceText.removeClass("eclipse-card-text-show");
        }
        
        function showMapExtras()
        {
            var screenWidth =  getScreenWidth();
            var contentHeight = getContentHeight();
            var circumstanceHeight = contentHeight;
            var screenHeight = getScreenHeight();
            var mapHeight = contentHeight;
            var updateImmediately = false;
            var vertical = false;
            const TABLE_PADDING = 6; 
            
            console.log("Map extras shown.");
            
            if(!circumstanceTab.hasClass("eclipse-show-circumstances-vertical") &&
                   !circumstanceTab.hasClass("eclipse-show-circumstances-horizontal") &&
                        !circumstanceTab.hasClass("eclipse-show-circumstances-vertical-clean"))
            {
               eclipseTypeHeader.css("visibility", "hidden");
               updateImmediately = true;
            }
            
            if( screenHeight > screenWidth)
            {
                vertical = true;
                if(circumstanceTab.hasClass("eclipse-show-circumstances-vertical") || circumstanceTab.hasClass("eclipse-show-circumstances-vertical-clean"))
                {
                    updateImmediately = true;
                }
               
                if(material.isHeaderFooterShown())
                {
                    circumstanceTab.removeClass("eclipse-show-circumstances-vertical-clean");
                    circumstanceTab.addClass("eclipse-show-circumstances-vertical");
                    circumstanceHeight *= 0.75;
                }
                else
                {
                    circumstanceTab.removeClass("eclipse-show-circumstances-vertical");
                    circumstanceTab.addClass("eclipse-show-circumstances-vertical-clean");
                    circumstanceHeight *= 0.6;
                }
                
                
                circumstanceTab.removeClass("eclipse-show-circumstances-horizontal");
                jMap.removeClass("eclipse-map-circumstances-horizontal");
                                
                circumstances.height(circumstanceHeight);
                circumstances.css("min-height", circumstanceHeight + "px");
                simulationTab.removeClass("eclipse-simulation-map-show-horizontal");
                simulationTab.removeClass("eclipse-simulation-map-show-horizontal-tablet");
                        
                simulationTab.addClass("eclipse-simulation-map-show");
                localTimeDiv.css("left", "");
                realTimeInfoID.css("left", "");
                realTimeInfoID.css("transform", "");
            }
            else
            {
                if(circumstanceTab.hasClass("eclipse-show-circumstances-horizontal"))
                {
                    updateImmediately = true;
                }
                circumstanceTab.addClass("eclipse-show-circumstances-horizontal");
                circumstanceTab.removeClass("eclipse-show-circumstances-vertical");
                circumstanceTab.removeClass("eclipse-show-circumstances-vertical-clean");
                jMap.addClass("eclipse-map-circumstances-horizontal");
                circumstances.height("calc(" + circumstanceHeight + "px + 5em)");
                circumstances.css("min-height", "calc(" + circumstanceHeight + "px + 5em)"); 
                
                simulationTab.removeClass("eclipse-simulation-map-show");
                if(screenWidth < 1024)
                {
                    simulationTab.removeClass("eclipse-simulation-map-show-horizontal-tablet");
                    simulationTab.addClass("eclipse-simulation-map-show-horizontal");
                }
                else
                {
                    simulationTab.removeClass("eclipse-simulation-map-show-horizontal");
                    simulationTab.addClass("eclipse-simulation-map-show-horizontal-tablet");
                }
            }
            
            eclipseTypeHeader.addClass("eclipse-move-eclipse-type");
            eclipseTypeID.hide();
            eclipseDateID.hide(); 
            
            if(true)
            {
                var statsBlockOffset = 0;
                if(statsBlock.is(":visible"))
                {
                    statsBlockOffset = statsBlock.offset().top;
                    eclipseTypeHeader.css("float", "");
                    eclipseTypeHeader.css("transform", "");
                }
                else
                {
                    statsBlockOffset = eclipseTypeHeader.offset().top;
                    eclipseTypeHeader.css("float", "none");
                    eclipseTypeHeader.css("transform", "translateX(0)");
                }
                if(vertical)
                {
                    mapHeight = statsBlockOffset - material.getHeaderHeight() - TABLE_PADDING;
                    mapButtons.css("bottom", "calc(" + (screenHeight - mapHeight) + "px - 2em)"); 
                }
                else
                {
                    mapHeight = contentHeight;
                    mapButtons.css("bottom", "5em");
                }
                
                jMap.height(mapHeight);
                map.updateSize();                               
            }
            
            sun.css("box-shadow", "4px 4px 4px 4px #888888");
            updateMoonPosition();
            
            circumstanceTab.transitionEndOff(); // Make sure we clean up previously unused callbacks.
            circumstanceTab.transitionEndOne(function()
            {
                var statsBlockOffset = 0;
                var statsBlockNoPad = 0;
            
                if(statsBlock.is(":visible"))
                {
                    statsBlockOffset = statsBlock.offset().top;
                    eclipseTypeHeader.css("float", "");
                    eclipseTypeHeader.css("transform", "");
                }
                else
                {
                    statsBlockOffset = eclipseTypeHeader.offset().top;
                    eclipseTypeHeader.css("float", "none");
                    eclipseTypeHeader.css("transform", "translateX(0)");
                }
                
                statsBlockNoPad = statsBlockOffset - 24;
                
                if(vertical)
                {
                    zuluTimeDiv.css("top", "calc(" + statsBlockNoPad + "px - 1.2em");
                    localTimeDiv.css("top", "calc(" + statsBlockNoPad + "px - 1.2em");
                
                    mapHeight = statsBlockOffset - material.getHeaderHeight() - TABLE_PADDING;
                    mapButtons.css("bottom", "calc(" + (screenHeight - mapHeight) + "px - 2em)");
                }
                else
                {
                    var statsBlockWidth = statsBlock.width();
                    if(statsBlockWidth === 0)
                    {
                        statsBlockWidth = eclipseTypeHeader.width();
                    }
                    zuluTimeDiv.css("top", "");
                    localTimeDiv.css("top", "");
                    
                    localTimeDiv.css("left", "calc(" + statsBlockWidth + "px + 3em");
                    
                    mapHeight = contentHeight;
                    mapButtons.css("bottom", "5em");
                    realTimeInfoID.css("left", "calc(" + statsBlockWidth + "px + 25%");
                    realTimeInfoID.css("transform", "translateX(0%)");                    
                }

                jMap.height(mapHeight);
                map.updateSize();
                
                eclipseTypeHeader.css("visibility", "");
                console.log("Delayed map resize: " + mapHeight);
            }); 
        }
        
        function cleanUpMapExtras()
        {
            circumstanceTab.removeClass("eclipse-show-circumstances-vertical");
            circumstanceTab.removeClass("eclipse-show-circumstances-vertical-clean");
            circumstanceTab.removeClass("eclipse-show-circumstances-horizontal");
            jMap.removeClass("eclipse-map-circumstances-horizontal");
            eclipseTypeHeader.removeClass("eclipse-move-eclipse-type");
            simulationTab.removeClass("eclipse-simulation-map-show");
            simulationTab.removeClass("eclipse-simulation-map-show-horizontal");
            simulationTab.removeClass("eclipse-simulation-map-show-horizontal-tablet");
            zuluTimeDiv.css("top", "");
            localTimeDiv.css("top", "");
            localTimeDiv.css("left", "");
            realTimeInfoID.css("left", "");
            realTimeInfoID.css("transform", "");
            eclipseTypeHeader.css("float", "");
            eclipseTypeHeader.css("transform", "");
            eclipseTypeID.show();
            eclipseDateID.show();
            sun.css("box-shadow", "");
        }
                        
        function bindEvents()
        {
            console.log("Binding Eclipse UI events.");
            
            window.setInterval(function()
            {
                // updateMoonPosition();
            }, 1000);
            
            window.setInterval(checkLocalTimeZone, 30000);
            
            helpInfo.click(collapseAboutPageSections);
            
            moreInfo.click(collapseAboutPageSections);
            
            showExtraCheck.click(function()
            {
                var box = $(this);
                if(box.is(":checked"))
                {
                    console.log("Box is checked.");
                    
                }
                else
                {
                    console.log("Box is not checked.");
                    cleanUpMapExtras();
                    mapButtons.css("bottom", ""); 
                    sunMoonSizeRatio = 1;
                }
                setPageHeights();
            });
            
            disclaimer.click(function()
            {
                openSourceText.removeClass("eclipse-card-text-show");
                privacyText.removeClass("eclipse-card-text-show");
                
                if(!disclaimerText.hasClass("eclipse-card-text-show"))
                {
                    disclaimerText.addClass("eclipse-card-text-show");
                }
                else
                {
                    disclaimerText.removeClass("eclipse-card-text-show");
                }
            });
            
            privacy.click(function()
            {
                disclaimerText.removeClass("eclipse-card-text-show");
                openSourceText.removeClass("eclipse-card-text-show");
                
                if(!privacyText.hasClass("eclipse-card-text-show"))
                {
                    privacyText.addClass("eclipse-card-text-show");
                }
                else
                {
                    privacyText.removeClass("eclipse-card-text-show");
                }
            });
            
            openSource.click(function()
            {
                disclaimerText.removeClass("eclipse-card-text-show");
                privacyText.removeClass("eclipse-card-text-show");
                
                if(!openSourceText.hasClass("eclipse-card-text-show"))
                {
                    openSourceText.addClass("eclipse-card-text-show");
                }
                else
                {
                    openSourceText.removeClass("eclipse-card-text-show");
                }                
            });
            
            aboutLink.click(function()
            {
                aboutPage.height("100vh");
                aboutPage.addClass("material-other-page-show");
            });
            
            aboutBackButton.click(function()
            {
                aboutPage.removeClass("material-other-page-show");
                aboutPage.transitionEndOne(function()
                {
                    aboutPage.height("0");
                    collapseAboutPageSections();
                });
            });
            
            globeMenuItem.click(function()
            {
                if(bGlobeMode)
                {
                    bGlobeMode = false;
                    globeMenuItem.html("3D Globe (Experimental)");
                    map.disableGlobe();
                }
                else
                {
                    bGlobeMode = true;
                    globeMenuItem.html("2D Map");
                    map.enableGlobe();
                }
            });
            
            mapOfflineButton.click(function()
            {
                console.log("Attempt to restart online map.");
                tempIgnoreOfflineMap = true;
                setOnlineMap();
                 window.setTimeout(function()
                {
                    tempIgnoreOfflineMap = false;
                }, 500);
            });
            
            map.onTileLoadError(function()
            {
               if(!tempIgnoreOfflineMap  && map.isMapOnline())
               {
                   tempIgnoreOfflineMap = true;
                   console.log("Map possibly gone offline.");
                   setOfflineMap();
                   window.setTimeout(function()
                   {
                       tempIgnoreOfflineMap = false;
                   }, 1000);
               }
            });
            
            material.onBeforePageChange(function(event)
            {
                console.log("Before page change.");
                cleanUpMapExtras();
            });
            
            material.onPageChange(function (event)
            {
                console.log("Page change fired.");
                hideSimMenuItems();
                mapMenuButton.hide();
                mapSearchBoxID.hide();                
                
                material.enableYScroll();
                // hideMoon();              
               
                setPageHeights();
                
                console.log("Removing contact point.");
                contactPointID.css("visibility", "hidden");
                
                if (MAP_PAGE_IDX === event.currentPageIdx)
                {
                    console.log("Map page displayed.");
                    onMapDisplay();                   
                }
                else if (SIM_PAGE_IDX === event.currentPageIdx)
                {
                    console.log("Simulation page displayed.");
                    contactPointID.css("visibility", "");
                    material.disableYScroll();
                    mapMenuButton.show();
                    setSimMenuOverFlow();
                    updateMoonPosition();
                }
                else
                {
                    console.log("Circumstances page displayed.");
                    stopShadowAnimation();
                }
            });
            
            firstContactItem.click(function()
            {
                if(bRegisterMenuClick)
                {
                    bRegisterMenuClick = false;
                    stopShadowAnimation();
                    goC1ContactPoint();
                    resetMenu();
                }
            });
            secondContactItem.click(function()
            {
                if(bRegisterMenuClick)
                {
                    bRegisterMenuClick = false;
                    stopShadowAnimation();
                    goC2ContactPoint(); 
                    resetMenu();
                }
            });
            midEclipseItem.click(function()
            {
                if(bRegisterMenuClick)
                {
                    bRegisterMenuClick = false;
                    stopShadowAnimation();
                    goMidContactPoint();
                    resetMenu();
                }
            });
            thirdContactItem.click(function()
            {
                if(bRegisterMenuClick)
                {
                    bRegisterMenuClick = false;
                    stopShadowAnimation();
                    goC3ContactPoint();
                    resetMenu();
                }
            });
            fourthContactItem.click(function()
            {
                if(bRegisterMenuClick)
                {
                    bRegisterMenuClick = false;
                    stopShadowAnimation();
                    goC4ContactPoint();
                    resetMenu();
                }
            });
            
            calculateWorker.onmessage = onCalculateMsg;
            
            positionWatch.setPositionCall(onPosition);
            positionWatch.setErrorCall(onPositionError);
            
            locationIconButton.click(function()
            {
                console.log("Location icon clicked.");
                if(positionWatch.isOn())
                {
                    setLocationMode(false);
                }
                else
                {
                    setLocationMode(true);
                }
            });
            
            jMap.longPress(onToggleClick);
                        
            // Prevents long press / right click context menus.
            window.oncontextmenu = function(event) 
            {
                event.preventDefault();
                event.stopPropagation();
                return false;
            };
            
            realtimeShadowMenuItem.click(function(event)
            {
                if(bRegisterMenuClick)
                {
                    bRegisterMenuClick = false;
                    mapMenuID.transitionEndOne(function(event)
                    {
                        startRealTimeAnimation();
                    });
                    resetMenu();
                };
            });
            
            material.onHeaderChange(function (event)
            {
                console.log("Header change.");
                
                setPageHeights();             
                
            });

            material.onWindowResize(function (event)
            {
                console.log("UI: Window height change.");
                
                setPageHeights();                
                
                updateMoonPosition();
               
                if(mapSearchInputID.is(":focus"))
                {
                    if(isSmallScreen())
                    {
                        if(!eclipseTitle.hasClass("eclipse-hide-header-text"))
                        {
                            eclipseTitle.addClass("eclipse-hide-header-text");
                        }
                        if(!eclipseTitleDate.hasClass("eclipse-hide-header-text"))
                        {
                            eclipseTitleDate.addClass("eclipse-hide-header-text");
                        }
                        
                        if(!material.isDrawerButtonSpun())
                        {
                            material.spinBackDrawerButton(); 
                        }
                        mapSearchIcon.parent("label").hide();
                    }
                    else
                    {
                        eclipseTitle.removeClass("eclipse-hide-header-text");
                        eclipseTitleDate.removeClass("eclipse-hide-header-text");
                        mapSearchIcon.parent("label").show();
                        material.unSpinDrawerButton();
                    }
                }
                else
                {
                    eclipseTitle.removeClass("eclipse-hide-header-text");
                    eclipseTitleDate.removeClass("eclipse-hide-header-text");
                    material.unSpinDrawerButton();
                    mapSearchIcon.parent("label").show();
                }
            });
            
            material.onDrawerOpen(function(event)
            {
                console.log("Drawer opened.");
                scrollToMiddle($(eclipseList.children("li")[selectedEclipse]));
            });
            
            material.onDrawerClosed(function(event)
            {
                console.log("Drawer closed.");
            });
            
            nextButton.click(function(event)
            {
                findNextEclipse();
            });
            
            timeButton.click(function(event)
            {
               if(dateOffset !== 0)
               {
                   dateOffset = 0;
                   timeID.removeClass("eclipse-time-travel-font");
                   showToast("Returning to present time!");
                   stopShadowAnimation();
               }
               checkIfEclipseIsOccurring();
            });
            
            partialBeginsBlock.longPress(function(event)
            {
                if(c1Time)
                {
                    dateOffset = 0;
                    stopShadowAnimation();
                    dateOffset = c1Time.getTime() - (new Date().getTime()) - 10000;
                    timeID.addClass("eclipse-time-travel-font");
                    material.changePage(1);
                    showToast("Time traveling to partial eclipse begins!");
                    checkIfEclipseIsOccurring();
                }
            });
            
            totalBeginsID.longPress(function(event)
            {
                if(c2Time)
                {  
                    dateOffset = 0;
                    stopShadowAnimation();
                    dateOffset = c2Time.getTime() - (new Date().getTime()) - 10000;
                    timeID.addClass("eclipse-time-travel-font");
                    material.changePage(1);
                    showToast("Time traveling to " + currentEclipseRef.type + " eclipse begins!");
                    checkIfEclipseIsOccurring();
                }
            });
            
            midEclipseBlock.longPress(function(event)
            {
                if(midTime)
                {
                    dateOffset = 0;
                    stopShadowAnimation();
                    dateOffset = midTime.getTime() - (new Date().getTime()) - 10000;
                    timeID.addClass("eclipse-time-travel-font");
                    material.changePage(1);
                    showToast("Time traveling to mid eclipse!");
                    checkIfEclipseIsOccurring();
                }                
            });
            
            totalEndsID.longPress(function(event)
            {
                if(c3Time)
                {
                    dateOffset = 0;
                    stopShadowAnimation();
                    dateOffset = c3Time.getTime() - (new Date().getTime()) - 10000;
                    timeID.addClass("eclipse-time-travel-font");
                    material.changePage(1);
                    showToast("Time traveling to " + currentEclipseRef.type + " eclipse ends!");
                    checkIfEclipseIsOccurring();
                }
            });
            
            paritalEndsBlcok.longPress(function(event)
            {
               if(c4Time)
               {
                    dateOffset = 0;
                    stopShadowAnimation();
                    dateOffset = c4Time.getTime() - (new Date().getTime()) - 10000;
                    timeID.addClass("eclipse-time-travel-font");
                    material.changePage(1);
                    showToast("Time traveling to end of eclipse!");
                    checkIfEclipseIsOccurring();
               }
            });
            
            visibleButton.click(function(event)
            {
                findNextVisibleEclipse();
            });
            
            mapLocationButton.click(function(event)
            {
                toggleMapPositionLock();
            });
            
            mapZoomInButton.click(function(ev)
            {
                map.zoomIn();
            });
            
            mapZoomOutButton.click(function(ev)
            {
                map.zoomOut();
            });            
            
            map.onDragStart(function(ev)
            {
                tempIgnoreLock = true;
                console.log("Map drag started.");                
            });
            
            map.onDragEnd(function(ev)
            {
                if(ev.distance > IGNORE_DRAG)
                {
                    mapPositionLockOff();
                }
                else
                {
                    if(mapPositionLock)
                    {
                        map.setCenter(currentCoords);
                    }
                }
                tempIgnoreLock = false;
                
                console.log("Map drag ended.");
            });
            
            jMap.keydown(function(ev)
            {
                if(ev.keyCode <= 40 && ev.keyCode >= 37)
                {
                    mapPositionLockOff();
                    console.log("Map arrow key event.");  
                }
            });
            
            map.onZoomEnd(function(ev)
            {
                console.log("ZOOM LEVEL: " + map.getZoom());
                
                checkZooms();
                if(mapPositionLock)
                {
                    map.setCenter(currentCoords);
                }
            });
            
            map.onRedrawCall(function(ev)
            {
                console.log("Redraw call!");
                
                centralLine.reDraw();
                southernUmbraLine.reDraw();
                northernUmbraLine.reDraw();
                southernPenumbraLine.reDraw();
                northernPenumbraLine.reDraw();
                eastEclipseLine.reDraw();                                
                westEclipseLine.reDraw();
                if(eastUmbraLine)
                {
                    eastUmbraLine.reDraw();
                }
                if(westUmbraLine)
                {
                    westUmbraLine.reDraw();
                }
                               
                for(var i = 0; i < penumbraLineConnects.length; i++)
                {
                    penumbraLineConnects[i].reDraw();
                }
            });
            
            material.onMDLComplete(function()
            {
                console.log("MDL Complete callback.");
                material.toggleHeaderFooter(true);                
            });
            
            mapSearchInputID.focus(function(event)
            {
                localTimeDiv.hide();
                zuluTimeDiv.hide();
                realTimeInfoID.hide();
                
                if(isSmallScreen())
                {
                    eclipseTitle.addClass("eclipse-hide-header-text");
                    eclipseTitleDate.addClass("eclipse-hide-header-text");
                    material.spinBackDrawerButton(); 
                    mapSearchIcon.parent("label").hide();
                }
                
                mapSearchData = null;
                
                mapSearchMenuID.addClass("eclipse-map-search-list-show");
                mapSearchInputID.val("");
                resetMapSearchMenu();
            });
            
            mapSearchInputID.focusout(function(event)
            {
                localTimeDiv.show();
                zuluTimeDiv.show();
                realTimeInfoID.show();
                
                mapSearchInputID.val("");
                mapSearchBoxID.removeClass("is-dirty");
                mapSearchMenuID.removeClass("eclipse-map-search-list-show");
                eclipseTitle.removeClass("eclipse-hide-header-text");
                eclipseTitleDate.removeClass("eclipse-hide-header-text");
                
                material.unSpinDrawerButton();
                mapSearchIcon.parent("label").show();
            });
            
            mapSearchList.click(function(event)
            {
                console.log("Map search click fired.");
                if(mapSearchData)
                {
                    var idx = $(this).index();
                    if(idx < mapSearchData.length)
                    {
                        console.log("Item: " + idx);
                        setLocationMode(false);
                        setLocation(new Position(parseFloat(mapSearchData[idx].lat), parseFloat(mapSearchData[idx].lon)));
                        mapSearchData = null;
                    }
                }
                else
                {
                    showToast("No valid city selected.");
                }
            });
           
            mapSearchInputID.on("input", function(ev)
            {
                var searchVal =  encodeURIComponent(mapSearchInputID.val());
               console.log("Search box value: " + searchVal);
               
               var searchString = "https://nominatim.openstreetmap.org/search?q=QUERY&format=json&limit=3";
               
               searchString = searchString.replace("QUERY", searchVal);
               
               var jqxhr = $.getJSON(searchString, function() 
                {
                    console.log("Initial JSON success.");
                }).done(function (data) 
                {
                    mapSearchData = data;
                    mapSearchList.eq(0).removeClass("eclipse-disabled-text");
                    for(var i = 0; i < data.length; i++)
                    {
                        mapSearchList.eq(i).children("span").html(data[i].display_name);
                    }
                    for(var x = mapSearchList.length; x > data.length && x > 0; x--)
                    {
                        mapSearchList.eq(x - 1).children("span").html("");
                    }
                                        
                    console.log("Second JSON success.");
                }).fail(function () 
                {
                    console.log("JSON error.");
                }).always(function () 
                {
                    console.log("JSON complete.");
                });
            });
        }
        
        function resetMapSearchMenu()
        {
            mapSearchList.eq(0).addClass("eclipse-disabled-text");
            mapSearchList.eq(0).children("span").html("Searching locations...");
            for(var i = 1; i < mapSearchList.length; i++)
            {
                mapSearchList.eq(i).children("span").html("");
            }
        }
        
        function toggleMapPositionLock()
        {
            if(mapPositionLock)
            {
                mapPositionLockOff();
            }
            else
            {
                mapPositionLockOn();
            }
        }
        
        function mapPositionLockOff()
        {
            mapPositionLock = false;
            mapLocationButton.children("i").html("location_searching");
        }
        
        function mapPositionLockOn()
        {
            mapLocationButton.children("i").html("my_location");
            mapPositionLock = true;
            map.setCenter(currentCoords);
        }
        
        function bindEclipseListEvent()
        {
            var eclipseListChildren = eclipseList.children("li");
            
            eclipseListChildren.click(function(event)
            {
                updateSelectedEclipse(parseInt($(this).attr("eclipse-index"), 10));                
                material.toggleDrawer();
                
                console.log("Selected eclipse: " + selectedEclipse);
            });
        }
        
        function findNextVisibleEclipse()
        {
            if(nextVisibleEclipse > -1)
            {
                updateSelectedEclipse(nextVisibleEclipse);
            }
        }
        
        function updateSelectedEclipse(newSelection)
        {
            realtimeShadowMenuItem.hide();
            animateShadowMenuItem.clickOff();
            animateShadowMenuItem.attr("disabled", true);
                       
            if(selectedEclipse > -1)
            {
                $(eclipseList.children("li")[selectedEclipse]).removeClass("eclipse-selected");
                currentEclipseRef.destroy();
            }
            selectedEclipse = newSelection;
            currentEclipseRef = eclipseCatalog.getEclipse(selectedEclipse);
            stopShadowAnimation();
            shadowAnimator.reset();            
            removeOldLines();
            var stringEclipse = JSON.stringify(currentEclipseRef);
            calculateWorker.postMessage({'cmd': 'eclipse', 'eclipse': stringEclipse});
            console.time("DrawLines");
            lineWorkers.updateLines(stringEclipse);
                       
            setEclipseTitle(currentEclipseRef);
            var nextSelectedEclipse = $(eclipseList.children("li")[selectedEclipse]);
            
            nextSelectedEclipse.addClass("eclipse-selected");
            
            scrollToMiddle(nextSelectedEclipse);            
        }
        
        function findNextEclipse()
        {  
            updateSelectedEclipse(eclipseCatalog.getNextEclipseIdx());
            console.log("Found next eclipse: " + selectedEclipse);          
        }
        
        function loadEclipseData()
        {
            console.log("Spawning eclipse loader thread.");
            material.showSpinner();
            if(eclipseLoadWorker === null)
            {
                eclipseLoadWorker = new Worker("EclipseLoader.js");
                eclipseLoadWorker.onmessage = onEclipseLoadMsg;
            }
        }
        
        function onCalculateMsg(msg)
        {
            var data = msg.data;
            
            switch (data.cmd)
            {
                case 'eclipse_stats_update':
                    onCalculateUpdate(data);
                    break;
                case 'visible_index_update':
                    onVisibleIndexUpdate(data);
                    break;
                default:
                    console.log("Unknow calculate message command.");
                    break;
            } 
        }
        
        function onEclipseLinesUpdate(data)
        {
            switch (data.type)
            {
                case 'central_line':
                    centralLine = map.addMultiPolyLine(data.line);
                    currentEclipseRef.setCentralLine(data.line);
                    currentEclipseRef.setCentralLineTimes(data.times);
                    break;
                case 'south_umbra_line':
                    southernUmbraLine = map.addMultiPolyLine(data.line);
                    currentEclipseRef.setSouthUmbraLine(data.line);
                    currentEclipseRef.setSouthUmbraTimes(data.times);
                    break;
                case 'north_umbra_line':
                    northernUmbraLine = map.addMultiPolyLine(data.line);
                    currentEclipseRef.setNorthUmbraLine(data.line);
                    currentEclipseRef.setNorthUmbraTimes(data.times);
                    break;
                case 'south_penumbra_line':
                    southernPenumbraLine = map.addMultiPolyLine(data.line, {stroke_color: 'red'});
                    currentEclipseRef.setSouthPenumbraLine(data.line);
                    break;
                case 'north_penumbra_line':
                    northernPenumbraLine = map.addMultiPolyLine(data.line, {stroke_color: 'red'});
                    currentEclipseRef.setNorthPenumbraLine(data.line);
                    break;
                case 'east_penumbra_line':                    
                    eastEclipseLine = map.addMultiPolyLine(data.line, {stroke_color: 'red'});
                    currentEclipseRef.setEastLimitLine(data.line);
                    currentEclipseRef.setEastLineTimes(data.times);
                    break;
                case 'west_penumbra_line':
                    westEclipseLine = map.addMultiPolyLine(data.line, {stroke_color: 'red'});
                    currentEclipseRef.setWestLimitLine(data.line);
                    currentEclipseRef.setWestLineTimes(data.times);
                    break;
                default:
                    console.log("Unknown or invalid line type returned from line workers.");
                    break;                    
            }
            
            console.log(data.type + " line drawn."); 
        }
        
        function onEclipseLinesComplete(lineCount)
        {
            console.log("Eclipse lines drawing now complete: " + lineCount);
            
            if(currentEclipseRef.getPointCount() > 10)
            {
                connectLines();
                shadowAnimator.setEclipse(currentEclipseRef);
                currentEclipseRef.getEastLimitLine()
                console.timeEnd("DrawLines");
                animateShadowMenuItem.click(function(ev)
                {
                    if(bRegisterMenuClick)
                    {
                        bRegisterMenuClick = false;
                        mapMenuID.transitionEndOne(function(ev)
                        {
                            if (shadowAnimator.isAnimating())
                            {
                                stopShadowAnimation();
                                checkIfEclipseIsOccurring(true);
                            } 
                            else
                            {
                                startShadowAnimation();
                            }
                        });
                        resetMenu();
                    }
                });
                
                animateShadowMenuItem.removeAttr("disabled");
            }
            else
            {
                console.log("Not enough points");
                removeOldLines();
            
                var errorDiag = new DialogBox(  "Pardon Our Error",
                                                "Unfortunately the eclipse circumstance lines could not be displayed for this eclipse. " +
                                                "This usually occurs with a partial eclipse that only occurs near the poles. " +
                                                "This is a known error and limitation. It is currently being investigated." +
                                                "Circumstance data, timings, and simulations should still work.", 
                                                "OK");
                errorDiag.hideCloseButton();

                errorDiag.showModal();
            }            
        }
        
        function connectLines()
        {
            var northUmbraLine = currentEclipseRef.getNorthUmbraLine();
            var southUmbraLine =  currentEclipseRef.getSouthUmbraLine();
            var northPenumbraLine = currentEclipseRef.getNorthPenumbraLine();
            var southPenumbraLine = currentEclipseRef.getSouthPenumbraLine();
            var eastLimitLine = currentEclipseRef.getEastLimitLine();
            var westLimitLine = currentEclipseRef.getWestLimitLine();
            var greatCircle = null;
            var redLine = {stroke_color: 'red'};
            
            if(northUmbraLine && southUmbraLine)
            {
                westUmbraLine = map.addGreatCircle(northUmbraLine[0], southUmbraLine[0], redLine);
                eastUmbraLine = map.addGreatCircle(northUmbraLine[northUmbraLine.length - 1], southUmbraLine[southUmbraLine.length - 1], redLine);
            }
            
            if(southPenumbraLine && westLimitLine)
            {
                greatCircle = map.addGreatCircle(westLimitLine[0], southPenumbraLine[0], redLine);
                
                if(greatCircle)
                {
                    penumbraLineConnects.push(greatCircle);
                }
            }
            
            if(southPenumbraLine && eastLimitLine)
            {
                greatCircle = map.addGreatCircle(southPenumbraLine[southPenumbraLine.length - 1], eastLimitLine[0], redLine);
                
                if(greatCircle)
                {
                    penumbraLineConnects.push(greatCircle);
                }
            }
            
            if(eastLimitLine && northPenumbraLine)
            {
                greatCircle = map.addGreatCircle(eastLimitLine[eastLimitLine.length - 1], northPenumbraLine[northPenumbraLine.length - 1], redLine);

                if(greatCircle)
                {
                    penumbraLineConnects.push(greatCircle);
                }
            }
            
            if(northPenumbraLine && westLimitLine)
            {
                greatCircle = map.addGreatCircle(northPenumbraLine[0], westLimitLine[westLimitLine.length - 1], redLine);

                if(greatCircle)
                {
                    penumbraLineConnects.push(greatCircle);
                }
            }
            
            if(!northPenumbraLine && (westLimitLine && eastLimitLine))
            {
                greatCircle = map.addGreatCircle(westLimitLine[westLimitLine.length - 1], eastLimitLine[eastLimitLine.length - 1], redLine);

                if(greatCircle)
                {
                    penumbraLineConnects.push(greatCircle);
                }
            }
            
            if(!southPenumbraLine && (westLimitLine && eastLimitLine))
            {
                greatCircle = map.addGreatCircle(westLimitLine[0], eastLimitLine[0], redLine);

                if(greatCircle)
                {
                    penumbraLineConnects.push(greatCircle);
                }
            }
        }
        
        /*
         * Removes all eclipse lines from map, if they exist.
         * @returns {undefined}
         */
        function removeOldLines()
        {
            centralLine = map.removeFeature(centralLine);             
            southernUmbraLine = map.removeFeature(southernUmbraLine);
            northernUmbraLine = map.removeFeature(northernUmbraLine);
            southernPenumbraLine = map.removeFeature(southernPenumbraLine);
            northernPenumbraLine = map.removeFeature(northernPenumbraLine);
            eastEclipseLine = map.removeFeature(eastEclipseLine);
            westEclipseLine = map.removeFeature(westEclipseLine);
            westUmbraLine = map.removeFeature(westUmbraLine);
            eastUmbraLine = map.removeFeature(eastUmbraLine);
            
            for(var i = 0; i < penumbraLineConnects.length; i++)
            {
                map.removeFeature(penumbraLineConnects[i]);
            }
            
            penumbraLineConnects.length = 0;
            
            console.log("Eclipse lines removed.");
        }
        
        function onToggleClick()
        {
            console.log("Toggle click fired.");
            
            longCickFired = true;
            
            window.setTimeout(function()
            {
                longCickFired = false;
            }, 1200);
            
            if(material.toggleHeaderFooter())
            {
                main.removeClass("eclipse-main-expand");
                mapSection.removeClass("eclipse-section-expand");
                mapButtons.addClass("eclipse-map-button-placement-transition");
                zoomButtons.addClass("eclipse-zoom-button-placement-transition");
                simulationTab.css("top", "");
                localTimeDiv.css("bottom", "");
                zuluTimeDiv.css("bottom", "");
                realTimeInfoID.css("top", "");
                
                if(showExtraCheck.is(":checked"))
                {
                    showMapExtras();
                }
            }
            else
            {
                main.addClass("eclipse-main-expand");
                mapButtons.removeClass("eclipse-map-button-placement-transition");
                zoomButtons.removeClass("eclipse-zoom-button-placement-transition");
                mapSection.addClass("eclipse-section-expand");
                
                if(showExtraCheck.is(":checked"))
                {
                    showMapExtras();
                }
               
                simulationTab.css("top", "calc(0px - 90vh)");
                localTimeDiv.css("bottom", "0.2em");
                zuluTimeDiv.css("bottom", "0.25em");
                realTimeInfoID.css("top", "1em");
            }
        }
        
        function onVisibleIndexUpdate(data)
        {
            visibleArray = JSON.parse(data.visible_array);
            nextVisibleEclipse = parseInt(data.next_visible, 10);
            
            if(visibilityIcons)
            {
                updateVisibleList();
            }
        }
        
        function onCalculateUpdate(data)
        {
            var eclipseStats = new ObserverCircumstances(JSON.parse(data.eclipse_stats));
            
            var current_date = new Date();
            current_date.setTime(current_date.getTime() + dateOffset);
            
            if (eclipseStats.isVisible)		// TODO: Fix? CPU time costly to traverse the DOM everytime we update this.
            {
                var date_options = {year: "numeric", month: "long", day: "numeric"};
                                
                c1Time = currentEclipseRef.toDate(eclipseStats.circDates.getC1Date());
                midTime = currentEclipseRef.toDate(eclipseStats.circDates.getMidDate());
                c4Time = currentEclipseRef.toDate(eclipseStats.circDates.getC4Date());
                
                var zone_options = {};
                
                if(selectedTimeZone)
                {
                    zone_options = { timeZone: selectedTimeZone, timeZoneName: 'short' };
                }
                
                var midSolarElevation = parseFloat(data.solar_elevation);
                
                var sunrise_time_string = "";
                var sunset_time_string = "";
               
                if (JSON.parse(data.sunrise) === null)
                {
                    sunRiseTime = null;
                    
                    if (midSolarElevation >= 0.0)
                    {
                        sunrise_time_string = "Sun is Up";
                    } 
                    else
                    {
                        sunrise_time_string = "Sun is Down";    // This situation should not be possible.
                    }
                } 
                else
                {
                    sunRiseTime = new Date(JSON.parse(data.sunrise));
                    sunrise_time_string = sunRiseTime.toLocaleTimeString(TIME_LOCALE, zone_options);
                    
                }
                if (JSON.parse(data.sunset) === null)
                {
                    sunSetTime = null;
                    
                    if (midSolarElevation >= 0.0)
                    {
                        sunset_time_string = "Sun is Up";
                    } 
                    else
                    {
                        sunset_time_string = "Sun is Down";    // This situation should not be possible.
                    }
                } 
                else
                {
                    sunSetTime = new Date(JSON.parse(data.sunset));
                    sunset_time_string = sunSetTime.toLocaleTimeString(TIME_LOCALE, zone_options);
                }
                
                sunRiseTimeID.html(sunrise_time_string);
                sunSetTimeID.html(sunset_time_string);
                
                statsBlock.show(0);
                timeBlock.show(0);
                timeBlock2.show(0);
                notVisibleID.hide(0);
                
                eclipsePicID.css({ "background": "url('" + IMGS_FOLDER + eclipseStats.eclipseType.toLowerCase() + ".png')",
                                   "background-size": "contain"});
                eclipseTypeID.html(eclipseStats.eclipseType + " Eclipse Occurs");
                eclipseDateID.html(midTime.toLocaleDateString(TIME_LOCALE, date_options));
                coverageID.html(eclipseStats.coverage.toFixed(1) + "%");
                magnitudeID.html(eclipseStats.magnitude.toFixed(1) + "%");

                c1TimeID.html(c1Time.toLocaleTimeString(TIME_LOCALE, zone_options));
                
                midTimeID.html(midTime.toLocaleTimeString(TIME_LOCALE, zone_options));
                
                c4TimeID.html(c4Time.toLocaleTimeString(TIME_LOCALE, zone_options));
                
                var eclipseDuration = checkEntireDuration(eclipseStats, sunRiseTime, sunSetTime);
                entireDurationID.html(eclipseDuration.toTimeString());

                if (eclipseStats.firstContactBelowHorizon)
                {
                    c1HorizID.show(0);
                } 
                else
                {
                    c1HorizID.hide(0);
                }

                if (eclipseStats.midEclipseBelowHorizon)
                {
                    midHorizID.show(0);
                } 
                else
                {
                    midHorizID.hide(0);
                }

                if (eclipseStats.fourthContactBelowHorizon)
                {
                    c4HorizID.show(0);
                } 
                else
                {
                    c4HorizID.hide(0);
                }

                if (eclipseStats.eclipseType === "Annular" || eclipseStats.eclipseType === "Total")
                {
                    c2Time = currentEclipseRef.toDate(eclipseStats.circDates.getC2Date());
                    c3Time = currentEclipseRef.toDate(eclipseStats.circDates.getC3Date());
                    
                    var depth_string = eclipseStats.depth.toFixed(1) + "%";
                    if (eclipseStats.northOfCenter)
                    {
                        depth_string += " N";
                    } 
                    else
                    {
                        depth_string += " S";
                    }

                    totalBeginsID.show(0);
                    totalEndsID.show(0);
                    depthID.show(0);
                    depthTitleID.show(0);
                    depthID.html(depth_string);
                    typeStartID.html(eclipseStats.eclipseType + " Phase Begins");
                    typeEndID.html(eclipseStats.eclipseType + " Phase Ends");

                    c2TimeID.html(c2Time.toLocaleTimeString(TIME_LOCALE, zone_options));
                    
                    c3TimeID.html(c3Time.toLocaleTimeString(TIME_LOCALE, zone_options));
                    
                    var centralDuration = checkCentralDuration(eclipseStats, sunRiseTime, sunSetTime);
                    totalDurationID.html(centralDuration.toTimeString());

                    if (eclipseStats.secondContactBelowHorizon)
                    {
                        c2HorizID.show(0);
                    } 
                    else
                    {
                        c2HorizID.hide(0);
                    }

                    if (eclipseStats.thirdContactBelowHorizon)
                    {
                        c3HorizID.show(0);
                    } 
                    else
                    {
                        c3HorizID.hide(0);
                    }
                    
                    if(material.getPageIndex() === SIM_PAGE_IDX)
                    {
                        displayCentralSimMenuItems();
                    }
                } 
                else
                {
                    hideCentralSimMenuItems();
                    c2Time = null;
                    c3Time = null;
                    c2CountID.html("");
                    c3CountID.html("");
                    depthID.hide(0);
                    depthTitleID.hide(0);
                    totalBeginsID.hide(0);
                    totalEndsID.hide(0);
                }
                
                updateCountDowns();
                
                if(!shadowAnimator.isAnimating())
                {
                    setSimulationDisplay();
                }
                
                if(material.getPageIndex() === SIM_PAGE_IDX)
                {
                    displaySimMenuItems();
                }
                
                // setPageHeights();
            } 
            
            if(lastEclipseType !== eclipseStats.eclipseType) // Only need to update these items in the event of eclipse type change.
            {
                lastEclipseType = eclipseStats.eclipseType;
                console.log("Eclipse type change.");
                if(eclipseStats.isVisible)
                {
                    showMoon();
                }
                else
                {
                    hideMoon();
                    hideSimMenuItems();
                    noSimEclipse();
                    c1Time = null;
                    midTime = null;
                    c4Time = null;
                    sunRiseCountID.html("");
                    c1CountID.html("");
                    midCountID.html("");
                    c4CountID.html("");
                    sunSetCountID.html("");
                    resetEclipseListStats();
                }
                setPageHeights();                
            }
            
        }
        
        /*
         * From inputed oberserver circumstances
         * return modified TimeSpan in case sun rises 
         * or sets before eclipse ends or begins.
         * @param {ObserverCircumstances} eStats
         * @param {Date} sunRise
         * @param {Date} sunSet
         * @returns {TimeSpan}
         */
        function checkEntireDuration(eStats, sunRise, sunSet)
        {
            if(eStats.firstContactBelowHorizon && eStats.fourthContactBelowHorizon)
            {
                return new TimeSpan(sunRise, sunSet);
            }
            else if(eStats.firstContactBelowHorizon && !eStats.fourthContactBelowHorizon)
            {
                return new TimeSpan(sunRise, currentEclipseRef.toDate(eStats.circDates.getC4Date()));
            }
            else if(!eStats.firstContactBelowHorizon && eStats.fourthContactBelowHorizon)
            {
                return new TimeSpan(currentEclipseRef.toDate(eStats.circDates.getC1Date()), sunSet);
            }
            else
            {
                return eStats.c1c4TimeSpan;
            }
            
           return new TimeSpan(); 
        }
        
        /*
         * From inputed oberserver circumstances
         * return modified TimeSpan incase sun rises 
         * or sets before total/annular eclipse ends or begins.
         * @param {ObserverCircumstances} eStats
         * @param {Date} sunRise
         * @param {Date} sunSet
         * @returns {TimeSpan}
         */
        function checkCentralDuration(eStats, sunRise, sunSet)
        {
            if(eStats.secondContactBelowHorizon && eStats.thirdContactBelowHorizon)
            {
                return new TimeSpan();
            }
            else if(eStats.secondContactBelowHorizon && !eStats.thirdContactBelowHorizon)
            {
                return new TimeSpan(sunRise, eStats.circDates.getC3Date());
            }
            else if(!eStats.secondContactBelowHorizon && eStats.thirdContactBelowHorizon)
            {
                return new TimeSpan(eStats.circDates.getC2Date(), sunSet);
            }
            else
            {
                return eStats.c2c3TimeSpan;
            }
            
           return new TimeSpan(); 
        }
        
        function checkIfEclipseIsOccurring(bDontAnimate)
        {
            if(currentEclipseRef)
            {
                var current_date = new Date();
                current_date.setTime(current_date.getTime() + dateOffset);
                if (currentEclipseRef.isEclipseOccurring(current_date) && !shadowAnimator.isAnimating())
                {
                    realtimeShadowMenuItem.show();
                    if(!bDontAnimate  && !shadowAnimator.isAnimating())
                    {
                        startRealTimeAnimation();
                    }
                    return true;
                } 
                else
                {
                    if(!bDontAnimate && !shadowAnimator.isAnimating())
                    {
                        stopShadowAnimation();
                    }
                    realtimeShadowMenuItem.hide();
                    realTimeInfoID.removeClass("eclipse-realtime-shadow-trans");
                    goMidContactPoint();
                }
            }
            
            return false;
        }
        
        function removeContactPoint()
        {
            contactPointID.removeClass("eclipse-sim-info-trans");
        }
        
        function noSimEclipse()
        {            
            hideSimMenuItems();
           if(!contactPointID.hasClass("eclipse-sim-info-trans"))
            {
                contactPointID.addClass("eclipse-sim-info-trans");
            }
           contactPointID.children("span").html("Eclipse Not Visible"); 
           hideMoon();       
        }
        
        function goC1ContactPoint()
        {
            simulationSelection = C1_SELECTION;
            if(c1Time)
            {
                shadowAnimator.getMoonPosition(c1Time, currentCoords, onMoonPosition);
                if(!contactPointID.hasClass("eclipse-sim-info-trans"))
                {
                    contactPointID.addClass("eclipse-sim-info-trans");
                }
                contactPointID.children("span").html("First Contact");
            }
        }
        
        function goC2ContactPoint()
        {
            simulationSelection = C2_SELECTION;
            if(c2Time)
            {
                shadowAnimator.getMoonPosition(c2Time, currentCoords, onMoonPosition);
                if(!contactPointID.hasClass("eclipse-sim-info-trans"))
                {
                    contactPointID.addClass("eclipse-sim-info-trans");
                }
                contactPointID.children("span").html("Second Contact");
            }
        }
        
        function goMidContactPoint()
        {
           console.log("Mid contact point simulation.");
            simulationSelection = MID_SELECTION;
            
            if(midTime)
            {
                shadowAnimator.getMoonPosition(midTime, currentCoords, onMoonPosition);
            
                if(!contactPointID.hasClass("eclipse-sim-info-trans"))
                {
                    contactPointID.addClass("eclipse-sim-info-trans");
                }
                
                contactPointID.children("span").html("Mid Eclipse");
            }
        }
        
        function goC3ContactPoint()
        {
            simulationSelection = C3_SELECTION;
            if(c1Time)
            {
                shadowAnimator.getMoonPosition(c3Time, currentCoords, onMoonPosition);
                if(!contactPointID.hasClass("eclipse-sim-info-trans"))
                {
                    contactPointID.addClass("eclipse-sim-info-trans");
                }
                contactPointID.children("span").html("Third Contact");
            }
        }
        
        function goC4ContactPoint()
        {
            simulationSelection = C4_SELECTION;
            if(c4Time)
            {
                shadowAnimator.getMoonPosition(c4Time, currentCoords, onMoonPosition);
                if(!contactPointID.hasClass("eclipse-sim-info-trans"))
                {
                    contactPointID.addClass("eclipse-sim-info-trans");
                }
                contactPointID.children("span").html("Fourth Contact");
            }
        }
        
        function updateCountDowns()
        {
            var current_date = new Date();
            current_date.setTime(current_date.getTime() + dateOffset);
            var zone_options = { timeZone: localTimeZone, timeZoneName: 'short' };

            if(selectedTimeZone)
            {
                zone_options = { timeZone: selectedTimeZone, timeZoneName: 'short' };
            }
            
            var timeString = current_date.toLocaleTimeString(TIME_LOCALE, zone_options);
            var zoneString = timeString.slice(-3);
            timeString = timeString.slice(0, -4);
            timeID.html(timeString);
            zoneID.html(zoneString);
            
            var rise_count_str = "--:--:--";
            var set_count_str = "--:--:--";
            
            if(sunRiseTime)
            {
                rise_count_str = new TimeSpan(sunRiseTime, current_date).toTimeString();
            }
            if(sunSetTime)
            {
                set_count_str = new TimeSpan(sunSetTime, current_date).toTimeString();
            }
            
            sunRiseCountID.html(rise_count_str);
            sunSetCountID.html(set_count_str);
            
            if(c1Time)
            {
                var c1CountDown = new TimeSpan(c1Time, current_date);
                c1CountID.html(c1CountDown.toTimeString());
            }
            
            if(midTime)
            {
                var midCountDown = new TimeSpan(midTime, current_date);
                midCountID.html(midCountDown.toTimeString());
            }
                        
            if(c4Time)
            {
                var c4CountDown = new TimeSpan(c4Time, current_date);
                c4CountID.html(c4CountDown.toTimeString());
            }
            
            if(c2Time)
            {
                var c2CountDown = new TimeSpan(c2Time, current_date);
                c2CountID.html(c2CountDown.toTimeString());    
            }
                        
            if(c3Time)
            {
               var c3CountDown = new TimeSpan(c3Time, current_date); 
               c3CountID.html(c3CountDown.toTimeString());
            }           
        }
        
        // Resets the Eclipse Countdown Stats View
        function resetEclipseListStats()
        {
            statsBlock.hide(0);
            timeBlock.hide(0);
            timeBlock2.hide(0);
            eclipseTypeID.html("No Eclipse Occurs");
            notVisibleID.show(0);
            coverageID.html("0.0%");
            magnitudeID.html("0.0%");
            depthID.hide(0);
            depthTitleID.hide(0);
            eclipseDateID.html("");
            eclipsePicID.css({ "background": "url('images/no-eclipse.png')",
                                "background-size": "contain"});
        }
        
        function onEclipseLoadMsg(msg)
        {
            var data = msg.data;

            switch (data.cmd)
            {
                case 'eclipse_load_complete':
                    onEclipseLoadComplete(data);
                    break;
                case 'eclipse_html_complete':
                    onEclipseHTMLComplete(data);
                    break;
                case 'eclipse_load_error':
                    onEclipseLoadError(data);
                    break;
                default:
                    break;
            }  
        }
        
        function onEclipseHTMLComplete(data)
        {
            eclipseList.html(data.eclipse_data);
            
            if(eclipseLoadWorker !== null)
            {
                eclipseLoadWorker.terminate();
                eclipseLoadWorker = null;
                console.log("Terminated eclipse loader thread.");
            }
            
            material.hideSpinner();
            jMap.show(); // Keep map from being displayed until loading is complete, otherwise it bleeds through during startup.
            simulationTab.css("visibility", "");
            
            visibilityIcons = $(".visible-class");
            console.log("Icon count: " + visibilityIcons.length);
            
            bindEclipseListEvent();
            if(visibleArray)
            {
                updateVisibleList();
            }
            findNextEclipse();
        }
        
        function updateVisibleList()
        {
            visibilityIcons.hide();
            for(var i = 0; i < visibleArray.length; i++)
            {
                $(visibilityIcons[visibleArray[i]]).show();
            }
        }
        
        function onEclipseLoadComplete(data)
        {
            eclipseCatalog.copyEclipsesIn(JSON.parse(data.eclipse_data));
            
            calculateWorker.postMessage({'cmd': 'update_catalog', 'catalog': eclipseCatalog.eclipseToJSON()});
            
            console.log("Eclipse UI load complete: " + eclipseCatalog.getEclipseCount() + " eclipses loaded.");
        }
        
        function onEclipseLoadError(data)
        {
            if(eclipseLoadWorker !== null)
            {
                eclipseLoadWorker.terminate();
                eclipseLoadWorker = null;
            }

            console.log("Eclipse loader error: " + data.status);
            material.hideSpinner();
            
            // TODO: Pop dialog box showing error to user.
        }
        
        function onPosition(coords)
        {
            setLocation(coords);
        }
        
        function setLocation(coords)
        {
            currentCoords = coords;
            if(currentCoords.altitude)
            {
                currentAltitude = currentCoords.altitude;
            }
            
            var localCoords = {
                "latitude": currentCoords.latitude,
                "longitude": currentCoords.longitude,
                "altitude": currentAltitude                
            };
            
            latID.html(currentCoords.latitude.toFixed(2));
            longID.html(currentCoords.longitude.toFixed(2));
            altID.html((currentAltitude * METERS_TO_FEET).toFixed(2));
            
            shadowAnimator.setCoords(localCoords);
            
            calculateWorker.postMessage({'cmd': 'coords', 'coords': JSON.stringify(localCoords)});
                        
            locationMarker.setLocation(currentCoords);
            
            if(mapPositionLock && !tempIgnoreLock)
            {
                map.setCenter(currentCoords);
            }
            
            if(!positionWatch.isOn())
            {
                try
                {
                    selectedTimeZone = timeZone.lookup(currentCoords.latitude, currentCoords.longitude);
                    console.log("New timezone: " + selectedTimeZone);
                }
                catch(error)
                {
                    console.log("Time zone DB not ready... trying again in 1 second.");
                    window.setTimeout(function()
                    {
                        selectedTimeZone = timeZone.lookup(currentCoords.latitude, currentCoords.longitude);
                        console.log("New timezone: " + selectedTimeZone);
                    }, 1000);
                }
            }
            else
            {
                checkLocalTimeZone();
                if(selectedTimeZone)
                {
                    selectedTimeZone = "";
                }
            }
           
            console.log("Position updated!");
        }
        
        function setLocationMode(bMode)
        {
            if(bMode)
            {
                if(!positionWatch.isOn())
                {
                    map.clickOff();
                    positionWatch.onFirstPostion(function()
                    {
                        locationIcon.html("location_on");
                        showToast("GPS Mode On.");                        
                    });
                    positionWatch.startWatch();
                }
            }
            else
            {
                if(positionWatch.isOn())
                {
                    positionWatch.clearWatch();                    
                }
                map.clickOff();
                map.onClick(function(position)
                {
                    console.log("Map click fired.");
                    if(!longCickFired)
                    {
                        console.log("Clicked at: " + position.latitude + ", " + position.longitude);
                        setLocation(position);
                    }
                    else
                    {
                        longCickFired = false;
                    }
                });
                
                locationIcon.html("location_off");
                showToast("Position in manual mode.");
            }
        }
        
        function onPositionError(error)
        {
            positionWatch.clearWatch();
            console.log("Position UI error:" + error.code);
            
            var dialogBox = new DialogBox("Location Error");

            dialogBox.setOKText("Retry");
            dialogBox.setCloseText("Cancel");
            
            if(error.code === error.PERMISSION_DENIED)
            {
                dialogBox.setDescriptionText("This app requires the use of location information, please enable this feature in the app's permission settings. Click Retry to try again. Otherwise click Cancel.");
                dialogBox.setOKCallBack(function()
                {
                    setLocationMode(true);
                });
                dialogBox.setCloseCallBack(function()
                {
                    setLocationMode(false);
                });
            }
            else if(error.code === error.POSITION_UNAVAILABLE)
            {
                setLocationMode(true);
                 
                dialogBox.setDescriptionText("Location services are unavailable. Press Cancel to run location in manual mode.  Press retry to try again.");
                dialogBox.setOKCallBack(function()
                {
                    setLocationMode(true);
                });
                dialogBox.setCloseCallBack(function()
                {
                   setLocationMode(false);
                });
            }
            else if(error.code === error.TIMEOUT)
            {
                dialogBox.setDescriptionText("Location services timed out. Press Cancel to run location in manual mode.  Press retry to try again.");
                dialogBox.setCloseCallBack(function()
                {
                    setLocationMode(true);
                });
                dialogBox.setCloseCallBack(function()
                {
                    setLocationMode(false);
                });
            }
            
            material.hideSpinner();
            
            dialogBox.showModal();            
        }
        
        /* Scrolls element to middle of its parent.
         * @param {jQuery} element 
         * @returns {undefined} 
         */
        function scrollToMiddle(/* jQuery */element)
        {
            var parent = element.parent();
            element[0].scrollIntoView();
            var scrollTop = Math.round(parent.scrollTop());
            var scrollHeight = parent[0].scrollHeight;
            var halfHeight = Math.round(parent.height() / 2);
            var endHeight = scrollHeight - Math.round(parent.height()) - Math.round(element.height());
            var elementHeight = Math.round(element.position().top);
            
            if(scrollTop < halfHeight)
            {
                parent.scrollTop(0);
                
            }
            else if(scrollTop > halfHeight && scrollTop < endHeight)
            {
                parent.scrollTop(scrollTop - halfHeight);
            }
            else
            {
                if(elementHeight < halfHeight)
                {
                    parent.scrollTop(scrollTop - halfHeight + (scrollTop - endHeight));
                }
                else
                {
                    parent.scrollTop(scrollHeight);
                }
            }
        }
        
        /* Sets the eclipse information in title bar of app.
         * @param {EclipseData} eclipse
         * @returns {Undefined}  
         */
        function setEclipseTitle(eclipse)
        {
            eclipseTitle.html(eclipse.type + " Solar Eclipse");
            eclipseTitleDate.html(eclipse.maxEclipseDate.toLocaleDateString(TIME_LOCALE, DATE_OPTIONS));
        }
        
        /* Show a toast message.
         * @param {String} msg -- Messae to display in toast.
         * @returns {Undefined}   
         */
        function showToast(/*String */ msg)
        {
            var closeToast = function ()
            {
                // notification.MaterialSnackbar.cleanup_();
                snackBar.classList.remove("mdl-snackbar--active");
            };

            snackBar.MaterialSnackbar.showSnackbar(
                    {
                        message: msg,
                        timeout: TOAST_TIMEOUT,
                        actionText: "Dismiss",
                        actionHandler: closeToast
                    }
            );
        }
        
        function killAnimateWorker()
        {
            shadowAnimator.stop();            
        }
        
        function showAnimationTimes()
        {
            localTimeDiv.addClass("eclipse-map-times-local-trans");
            zuluTimeDiv.addClass("eclipse-map-times-zulu-trans");
        }
        
        function hideAnimationTimes()
        {
            localTimeDiv.removeClass("eclipse-map-times-local-trans");
            zuluTimeDiv.removeClass("eclipse-map-times-zulu-trans");
        }
        
        function inputAnimationTime(date)
        {
            if(selectedTimeZone)
            {
                 localAnimateTime.html(date.toLocaleTimeString("en-US", { timeZone: selectedTimeZone, timeZoneName: 'short' }));
            }
            else
            {
                localAnimateTime.html(date.toLocaleTimeString());
            }
            
            var zuluTimeString = date.toLocaleTimeString("en-US", { timeZone: 'UTC', timeZoneName: 'short' });
            zuluTimeString = zuluTimeString.replace(" GMT", "");
            zuluAnimateTime.html(zuluTimeString);
        }
        
        function startShadowAnimation()
        {
            removeContactPoint();
            mapPositionLockOff(); 
            animateShadowMenuItem.html("Stop Animation");
            inputAnimationTime(currentEclipseRef.getPenumbraStartTime());
            
            showAnimationTimes();
            
            shadowAnimator.start(onShadowComplete, onMoonPosition);
            var centerCoords = {latitude: currentEclipseRef.midEclipsePoint.latitude,
                                longitude: currentEclipseRef.midEclipsePoint.longitude};
           
            if(centerCoords.latitude > 45.0)
            {
                centerCoords.latitude = 45.0;
            }
            if (centerCoords.latitude < -45.0)
            {
                centerCoords.latitude = -45.0;
            }

            map.setCenter(centerCoords);
            map.setZoom(3);
        }
        
        function startRealTimeAnimation()
        {
            removeContactPoint();
            realtimeShadowMenuItem.hide();
            realTimeInfoID.addClass("eclipse-realtime-shadow-trans");
            animateShadowMenuItem.html("Stop Animation");
            inputAnimationTime(currentEclipseRef.getPenumbraStartTime());
            
            showAnimationTimes();
            
            shadowAnimator.start(onShadowComplete, onMoonPosition, {realTime: true, dateOffset: dateOffset});
        }
        
        function stopShadowAnimation()
        {
            checkIfEclipseIsOccurring(true);
            realTimeInfoID.removeClass("eclipse-realtime-shadow-trans");
            hideAnimationTimes();
            animateShadowMenuItem.html("Animate Shadow");
            killAnimateWorker();
            penumbraShadow = map.removeFeature(penumbraShadow);
            umbraShadow = map.removeFeature(umbraShadow);
            
            if(material.getCurrentPageIndex() === SIM_PAGE_IDX)
            {
                setSimMenuOverFlow();
            }
            console.log("Animation stopped.");
        }
        
        function onMoonPosition(data)
        {
            moonPos = data.moon_pos;
            sunPos = data.sun_pos;
            updateMoonPosition();
        }
        
        function updateMoonPosition()
        {
            var displaySunWidth = sun.width();
            
            console.log("Sun width: " + displaySunWidth);
            
            var moonPixelCenter = sun.offset();
            var moonWidth = displaySunWidth;
            
            moonWidth = moonPos.diameter / sunPos.diameter * 100;
            var pixelPerDeg = displaySunWidth / sunPos.diameter;
            
            var deltaDecl = moonPos.decl - sunPos.decl;
            var deltaRA = moonPos.ra - sunPos.ra;
           
           
            // moonPixelCenter.top = moonPixelCenter.top - ( (deltaDecl) * pixelPerDeg) - 1;  // For some reason there's a rounding issue here, this seems to help, not sure why.
            // moonPixelCenter.left = moonPixelCenter.left - ( (deltaRA) * pixelPerDeg);
            
            moonPixelCenter.top =  ((- 1 *( (deltaDecl) * pixelPerDeg)) / displaySunWidth * 100) + "%";  // For some reason there's a rounding issue here, this seems to help, not sure why.
            moonPixelCenter.left = ((-1 * ( (deltaRA) * pixelPerDeg)) / displaySunWidth * 100) + "%";
            
             
            moon.width(moonWidth + "%");
            moon.height(moonWidth + "%");

            moon.css("top", moonPixelCenter.top);
            moon.css("left", moonPixelCenter.left);
            
            var moonTranslateFix = ((100 - moonWidth) / 2) + "%";
            moon.css("transform", "translate(" + moonTranslateFix + ", " + moonTranslateFix + ")");
                     
        }
        
        function showMoon()
        {
            moon.removeClass("eclipse-moon-invisible");           
        }
                
        function hideMoon()
        {
            if(!moon.hasClass("eclipse-moon-invisible"))
            {
                moon.addClass("eclipse-moon-invisible");
            }
        }
                       
        function onShadowComplete(data)
        {
            if (data.umb_shadow !== null)
            {
                if(!umbraShadow)
                {
                    umbraShadow = map.addPolygon(data.umb_shadow, {fill_color: 'rgba(0, 0, 0, 0.75)'});
                }
                else
                {
                    umbraShadow.setCoordinates(data.umb_shadow);
                }
            }
            else
            {
                umbraShadow = map.removeFeature(umbraShadow);
            }
            
            if (data.pen_shadow !== null)
            {
                if(!penumbraShadow)
                {
                    penumbraShadow = map.addPolygon(data.pen_shadow, {fill_color: 'rgba(0, 0, 0, 0.2)'});
                }
                else
                {
                   penumbraShadow.setCoordinates(data.pen_shadow);
                }
            }
            else
            {
                penumbraShadow = map.removeFeature(penumbraShadow);
            }
            
            inputAnimationTime(data.date);
        }
        
        this.init = function()
        {
            material.disableSwipe(1);
                       
            bindEvents();
            firstRun();
            checkZooms();
            setOnlineMap();            
            loadEclipseData();            
        };
    }
};

class WatchPosition
{
    constructor()
    {
        var errorCode = 0;
        var DEFAULT_COORDS = {  laitude: 34.0,
                                longitude: -118.0,
                                altitude: 0.0
                            };
        var coords;
        var errorCallBack;
        var posCallBack;
        var firstPositionCallBack = null;
        
        var GEO_OPTIONS = 
        {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        };
        
        var watchID = null;
       
        function _clearWatch()
        {
            if(watchID)
            {
                navigator.geolocation.clearWatch(watchID);
                watchID = null;
            }
        }
        
        function onSuccess(position) 
        {
            if(firstPositionCallBack)
            {
                firstPositionCallBack(position.coords);
                firstPositionCallBack = null;            
            }
            
            coords = position.coords;
            if(posCallBack)
            {
                posCallBack(position.coords);
            }
        }

        function onError(error) 
        {
            console.log(error.message);
            _clearWatch();
            
            if(errorCallBack)
            {
                errorCallBack(error);
            }
        }
        
        /*
         * Returns position error code.
         * @returns {Number}
         */
        this.getError = function()
        {
            return errorCode;
        };
        
        /* Return current position.
         * @returns {Coordinates} 
         */
        this.getPosition = function()
        {
            if(coords)
            {
                return coords;
            }
            
            return DEFAULT_COORDS;
        };
        
        /*
         * Is watch position currently on?
         * @returns {Boolean}
         */
        this.isOn = function()
        {
            if(watchID)
            {
                return true;
            }
            
            return false;
        };
        
        this.setErrorCall = function(callback)
        {
            errorCallBack = callback;                        
        };
        
        this.setPositionCall = function(callback)
        {
            posCallBack = callback;
        };
        
        this.onFirstPostion = function(callback)
        {
            firstPositionCallBack = callback;
        };
        
        /*
         * Start position watch.
         * @returns {undefined}
         */
        this.startWatch = function()
        {
            if(!watchID)
            {
                watchID = navigator.geolocation.watchPosition(onSuccess, onError, GEO_OPTIONS);
            }
        };
        
        /*
         * Stops position watch.
         * @returns {undefined}
         */
        this.clearWatch = function()
        {
            _clearWatch();
        };
    }
};

$(function()
{
    var eclipse = new EclipseUI;
    
    eclipse.init();
    
    console.log("VERSION: 001");
    
});


