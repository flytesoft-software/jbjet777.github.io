/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";

class EclipseUI
{
    constructor()
    {
        var MAP_PAGE_IDX = 1;
        var SIM_PAGE_IDX = 2;
        var TOAST_TIMEOUT = 2000;
        var TIME_LOCALE = "en-US";
        var DATE_OPTIONS = {timeZone: "UTC", year: "numeric", month: "long", day: "numeric"};
        var RUN_BEFORE = "run_before";
        var IMGS_FOLDER = 'images/';
        var MASTER_TIMER_INTERVAL = 1000;
        var START_COORDS = [34, -118];
        var START_ZOOM = 10;
        var IGNORE_DRAG = 15;   // If drag movement is small, keep location centered.
        
        var material = new MaterialAddons;
        var eclipseCatalog = new Eclipses();
        var eclipseLoadWorker = null;
        var currentEclipseRef = null;
        var gEclipseTimeZone = null;    // TODO: Get timezone info from manual location.
        
        var positionWatch = new WatchPosition;
        var currentCoords;
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
        
        var selectedEclipse = -1;
        var nextVisibleEclipse = -1;
        var manualMode = true;
        var mapPositionLock = true;
        var tempIgnoreLock = false;

        var jMap = $("#map");
        var map = L.map('map');
        var locationIcon = L.icon({
                iconUrl: 'images/loc24.png',
                iconSize: [20, 20],
                iconRetinaUrl: 'images/loc48.png'                
        });
        var locationMarker = L.marker(START_COORDS, {icon: locationIcon}).addTo(map);
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
        var visibilityIcons = null;
        
        /* Eclipse STATS IDs START */
        var sunRiseTimeID = $("#sunrise_time");
        var sunSetTimeID = $("#sunset_time");
        
        var statsBlock = $("#stats_block");
        var timeBlock = $("#time_block");
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
        
        var totalBeginsID = $("#total_begins");
        var totalEndsID = $("#total_ends");
        
        var typeStartID = $("#type_div_start");
        var typeEndID = $("#type_div_ends");
        /* Eclipse STATS IDs END */
                
        var latID = $("#lat");
        var longID = $("#long");
        var altID = $("#alt");
        var timeID = $("#time");

        var headerHeight = material.getHeaderHeight();
        var footerHeight = material.getFooterHeight();
        var screenHeight = $(window).height();
        var mapHeight = screenHeight - headerHeight - footerHeight;
        
        updateCountDowns();
        
        window.setInterval(updateCountDowns, MASTER_TIMER_INTERVAL);
        
        var calculateWorker = new Worker("calculateWorker.js");
        
        jMap.height(mapHeight);
        simulationTab.height(mapHeight);
           
        function firstRun()
        {
            if(!window.localStorage.getItem(RUN_BEFORE))
            {
                window.localStorage.setItem(RUN_BEFORE, "true");
                
                var dialogBox = new DialogBox(  "Location Information Request",
                                                "This app requires the use of location information, please enable this feature when prompted.");
                                                
                dialogBox.hideCloseButton();
                dialogBox.setOKCallBack(function()
                {
                    positionWatch.startWatch();
                });
                
                material.hideSpinner();
                dialogBox.showModal();
            }
            else
            {
                positionWatch.startWatch();
            }
        }
                        
        function bindEvents()
        {
            calculateWorker.onmessage = onCalculateMsg;
            
            positionWatch.setPositionCall(onPosition);
            positionWatch.setErrorCall(onPositionError);
            
            material.onPageChange(function (event)
            {
                sun.hide();
                moon.hide();
                
                if (MAP_PAGE_IDX === event.currentPageIdx)
                {
                    console.log("Page change to map.");
                    headerHeight = material.getHeaderHeight();
                    footerHeight = material.getFooterHeight();
                    mapHeight = screenHeight - headerHeight - footerHeight;
                    jMap.height(mapHeight);
                    map.invalidateSize();
                    console.log("Map size change on page: " + event.currentPageIdx);
                }
                else if (SIM_PAGE_IDX === event.currentPageIdx)
                {
                    console.log("Page change to simulation.");
                    headerHeight = material.getHeaderHeight();
                    footerHeight = material.getFooterHeight();
                    mapHeight = screenHeight - headerHeight - footerHeight;
                    simulationTab.height(mapHeight);
                    sun.show();
                    moon.show();
                }
            });

            material.onHeaderChange(function (even)
            {
                console.log("Header change.");
                headerHeight = material.getHeaderHeight();
                footerHeight = material.getFooterHeight();
                mapHeight = screenHeight - headerHeight - footerHeight;
                jMap.height(mapHeight);
                map.invalidateSize();
            });

            $(window).resize(function (event)
            {
                console.log("Window height change.");
                screenHeight = $(window).height();
                mapHeight = screenHeight - headerHeight - footerHeight;
                jMap.height(mapHeight);
                simulationTab.height(mapHeight);
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
            
            visibleButton.click(function(event)
            {
                findNextVisibleEclipse();
            });
            
            mapLocationButton.click(function(event)
            {
                if(mapPositionLock)
                {
                    mapLocationButton.children("i").html("location_searching");
                    mapPositionLock = false;
                }
                else
                {
                    mapLocationButton.children("i").html("my_location");
                    mapPositionLock = true;
                    map.panTo(L.latLng(currentCoords.latitude, currentCoords.longitude));
                }
            });
            
            map.on("dragstart", function(ev)
            {
                tempIgnoreLock = true;
                console.log("Drag started.");
                
            });
            
            map.on("dragend", function(ev)
            {
                tempIgnoreLock = false;
                if(ev.distance > IGNORE_DRAG)
                {
                    mapPositionLock = false;
                    mapLocationButton.children("i").html("location_searching");
                }
                console.log("Drag ended.");
            });
            
            map.on("zoomend", function(ev)
            {
                if(mapPositionLock)
                {
                    map.panTo(L.latLng(currentCoords.latitude, currentCoords.longitude));
                }
            });
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
            if(selectedEclipse > -1)
            {
                $(eclipseList.children("li")[selectedEclipse]).removeClass("eclipse-selected");
            }
            selectedEclipse = newSelection;
            currentEclipseRef = eclipseCatalog.getEclipse(selectedEclipse);
            
            calculateWorker.postMessage({'cmd': 'eclipse', 'eclipse': JSON.stringify(currentEclipseRef)});
                       
            setEclipseTitle(currentEclipseRef);
            var nextSelectedEclipse = $(eclipseList.children("li")[selectedEclipse]);
            
            nextSelectedEclipse.addClass("eclipse-selected");
            
            scrollToMiddle(nextSelectedEclipse);            
        }
        
        function findNextEclipse()
        {  
            updateSelectedEclipse(eclipseCatalog.getNextEclipseIdx());
            console.log("Found next eclipse: " + selectedEclipse);
                 
           // TODO:
            /***
            getPosition();
            coordInterval = setInterval(backGroundUpdate, UPDATE_INTERVAL);
            buildEclipseList();
            ***/
           
            /*** TODO: Highlight selected eclipse.
            if (selected_eclipse < 0)
            {
                selected_eclipse = next_eclipse;
            }

            var eclipse_list_list_items = eclipse_list.children("li");
            var next_eclipse_item = eclipse_list_list_items.eq(next_eclipse);
            var selected_eclipse_item = eclipse_list_list_items.eq(selected_eclipse);

            // next_eclipse_item.children("a").append("<span class='ui-li-count'>Next Eclipse</span>");
            next_eclipse_item.append("<span class='ui-li-count'>Next Eclipse</span>");

            eclipse_list.listview("refresh");
            // selected_eclipse_item.children("a").addClass('ui-btn-b');	// Changes background color of "selected" eclipse.
            selected_eclipse_item.removeClass('ui-body-inherit');
            selected_eclipse_item.addClass('ui-body-b');
            selected_eclipse_item.children("p").css("color", "white");
            ***/

            // TODO: Implement eclipse list click handlers
            /****
            eclipse_list_list_items.click(function (event)
            {
                onEclipseClicked(event, this);
            });
            ****/

            // TODO: Call draw eclipse map function.
            // drawEclipseMap();
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
                    break;
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
            console.log("Eclipse stats updated.");
            
            var current_date = new Date();
            current_date.setTime(current_date.getTime() + dateOffset);

            if (eclipseStats.isVisible)		// TODO: Fix? CPU time costly to traverse the DOM everytime we update this.
            {
                var date_options = {year: "numeric", month: "long", day: "numeric"};
                
                c1Time = eclipseStats.circDates.getC1Date();
                midTime = eclipseStats.circDates.getMidDate();
                c4Time = eclipseStats.circDates.getC4Date();
                
                var localTimeZoneOffset = current_date.getTimezoneOffset();
                var zone_options = {};

                if (gEclipseTimeZone !== null)
                {
                    if (localTimeZoneOffset !== gEclipseTimeZone)
                    {
                        date_options.timeZone = gEclipseTimeZone;
                        zone_options = {timeZone: gEclipseTimeZone};
                    }
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
                notVisibleID.hide(0);
                
                eclipsePicID.css({ "background": "url('" + IMGS_FOLDER + eclipseStats.eclipseType.toLowerCase() + ".png')",
                                   "background-size": "contain"});
                eclipseTypeID.html(eclipseStats.eclipseType + " Eclipse Occurs");
                eclipseDateID.html(eclipseStats.circDates.getMidDate().toLocaleDateString(TIME_LOCALE, date_options));
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
                    c2Time = eclipseStats.circDates.getC2Date();
                    c3Time = eclipseStats.circDates.getC3Date();
                    
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
                } 
                else
                {
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
            } 
            else
            {
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
                return new TimeSpan(sunRise, eStats.circDates.getC4Date());
            }
            else if(!eStats.firstContactBelowHorizon && eStats.fourthContactBelowHorizon)
            {
                return new TimeSpan(eStats.circDates.getC1Date(), sunSet);
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
                return new TimeSpan(sunRise, sunSet);
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
                return eStats.c1c4TimeSpan;
            }
            
           return new TimeSpan(); 
        }
        
        function updateCountDowns()
        {
            var current_date = new Date();
            current_date.setTime(current_date.getTime() + dateOffset);
            
            timeID.html(current_date.toLocaleTimeString(TIME_LOCALE, {}));
            
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
            simulationTab.children(".simulation-content").show();
            
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
            altID.html(currentAltitude.toFixed(2));
            
            calculateWorker.postMessage({'cmd': 'coords', 'coords': JSON.stringify(localCoords)});
                        
            locationMarker.setLatLng(L.latLng(currentCoords.latitude, currentCoords.longitude));
            
            if(mapPositionLock && !tempIgnoreLock)
            {
                map.panTo(L.latLng(currentCoords.latitude, currentCoords.longitude));
            }
           
            console.log("Position updated!");
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
                    positionWatch.startWatch();
                });
                dialogBox.setCloseCallBack(function()
                {
                    manualMode = true;
                    showToast("Position in manual mode.");
                });
            }
            else if(error.code === error.POSITION_UNAVAILABLE)
            {
                dialogBox.setDescriptionText("Location services are unavailable. Press Cancel to run location in manual mode.  Press retry to try again.");
                dialogBox.setOKCallBack(function()
                {
                    positionWatch.startWatch();
                });
                dialogBox.setCloseCallBack(function()
                {
                    manualMode = true;
                    showToast("Position in manual mode.");
                });
            }
            else if(error.code === error.TIMEOUT)
            {
                dialogBox.setDescriptionText("Location services timed out. Press Cancel to run location in manual mode.  Press retry to try again.");
                dialogBox.setCloseCallBack(function()
                {
                    positionWatch.startWatch();
                });
                dialogBox.setCancelCallBack(function()
                {
                    manualMode = true;
                    showToast("Position in manual mode.");
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
        
        this.init = function()
        {
            jMap.height(mapHeight);
            material.disableSwipe(1);
            material.enableHideHeader(1);
                        
            map.setView(START_COORDS, START_ZOOM);
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            bindEvents();
            firstRun();
            
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
            console.log("Position success: " + position.toString());
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
        
        this.setErrorCall = function(callback)
        {
            errorCallBack = callback;                        
        };
        
        this.setPositionCall = function(callback)
        {
            posCallBack = callback;
        };
        
        /*
         * Start position watch.
         * @returns {undefined}
         */
        this.startWatch = function()
        {
            watchID = navigator.geolocation.watchPosition(onSuccess, onError, GEO_OPTIONS);
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
});


