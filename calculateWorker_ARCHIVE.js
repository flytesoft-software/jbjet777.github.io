/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";

class CalculateWorker
{
    constructor()
    {
        var MIN_UPDATE_RATE = 250;  // Minimum number of milliseconds allowed between coordinate updates.
        var DAY_BUFFER = 2;         // Number of days after current eclipse app starts to focus on next eclipse.
                
        var m_coords = null;
        var m_eclipse = null;
        var m_lastUpdateTime = null;
        var m_DateOffset = 0;
        var pointCount = 0;
                        
        importScripts("EclipseCalc.js");
        importScripts("SolarElevation.js");
        
        var m_eclipseCatalog = new Eclipses();
        var solarCalc = new SolarCalc;
        
        var centralLineWorker = new Worker("calculateWorker.js");
        var northernUmbraLineWorker = new Worker("calculateWorker.js");
        var southernUmbraLineWorker = new Worker("calculateWorker.js");

        var southernPenumbraLineWorker = new Worker("calculateWorker.js");
        var northernPenumbraLineWorker = new Worker("calculateWorker.js");
        var eastEclipseLineWorker = new Worker("calculateWorker.js");
        var westEclipseLineWorker = new Worker("calculateWorker.js");
        
        self.addEventListener('message', function(e) 
        {
            var data = e.data;
            switch (data.cmd)
            {
                case 'coords':
                    updateCoordinates(data.coords);
                    break;
                    
                case 'eclipse':
                    updateEclipse(data.eclipse);
                    break;
                    
                case 'update_catalog':
                    updateCatalog(data.catalog);
                    break;
                    
                case 'date_offset':
                    updateDateOffset(data.offset);
                    break;
                
                case 'central_line':
                    updateCentralLine(data.eclipse);
                    break;                    
                
                case 'north_umbra_line':
                    updateNorthUmbraLine(data.eclipse);
                    break;
                    
                case 'south_umbra_line':
                    updateSouthUmbraLine(data.eclipse);
                    break;
                    
                case 'south_penumbra_line':
                    updateSouthPenUmbraLine(data.eclipse);
                    break;
                    
                case 'north_penumbra_line':
                    updateNorthhPenUmbraLine(data.eclipse);
                    break;
                    
                case 'east_penumbra_line':
                    updateEastPenUmbraLine(data.eclipse);
                    break;
                    
                case 'west_penumbra_line':
                    updateWestPenUmbraLine(data.eclipse);
                    break;
                    
                default:
                    break;
            }
        }, false);
        
        console.log("CALCULATE WORKER: Thread spawned.");
        
        function updateCatalog(cat)
        {
            m_eclipseCatalog.deleteEclipses();
            m_eclipseCatalog.copyEclipsesIn(JSON.parse(cat));
            
            if(m_coords)
            {
                updateVisibleListAndPost();
            }
        }
        
        function updateCoordinates(coords)
        {
            var timeDiff = 0;
            
            if(!m_lastUpdateTime)
            {
                timeDiff = MIN_UPDATE_RATE;
            }
            else
            {
                timeDiff = (new Date().getTime()) - m_lastUpdateTime.getTime();
            }
            
            if(timeDiff >= MIN_UPDATE_RATE)
            {
                m_lastUpdateTime = new Date();
                
                m_coords = JSON.parse(coords);
            
                console.log("CALCULATE WORKER: Coords udpated.");
            
                if(m_eclipse)
                {
                    updateStatsAndPost();
                }
                
                if(m_eclipseCatalog.getEclipseCount() > 0)
                {
                    updateVisibleListAndPost();
                }
            }
        }
        
        function updateDateOffset(offset)
        {
            m_DateOffset = JSON.parse(offset);
        }
        
        function updateEclipse(eclipse)
        {
            m_eclipse = new EclipseData(JSON.parse(eclipse));
            
            console.log("CALCULATE WORKER: Eclipse updated.");
            
            if(m_coords)
            {
                updateStatsAndPost();
            }
            
            updateLinesAndPost();
        }
        
        function updateLinesAndPost()
        {
            try  // TODO: Fix line drawing for partial eclipses near the poles.
            {
                var centralLine = m_eclipse.drawCentralLine();
                var northernUmbraLine = m_eclipse.drawUmbraLimit(true);
                var southernUmbraLine = m_eclipse.drawUmbraLimit(false);
                
                var southernPenumbraLine = m_eclipse.drawPenumbralLimit(false);
                var northernPenumbraLine = m_eclipse.drawPenumbralLimit(true);
                var eastEclipseLine = m_eclipse.drawEastWestLimit(false);
                var westEclipseLine = m_eclipse.drawEastWestLimit(true);
               
                var msg = { 'cmd': 'eclipse_lines_update',
                            'central_line': JSON.stringify(centralLine),
                            'south_umbra_line': JSON.stringify(southernUmbraLine),
                            'north_umbra_line': JSON.stringify(northernUmbraLine),
                            'south_penumbra_line': JSON.stringify(southernPenumbraLine),
                            'north_penumbra_line': JSON.stringify(northernPenumbraLine),
                            'east_eclipse_line': JSON.stringify(eastEclipseLine),
                            'west_eclipse_line': JSON.stringify(westEclipseLine)};
            }
            catch(error)
            {
                var msg = { 'cmd': 'eclipse_lines_error'};
                console.log("LINE DRAW ERROR: " + error.message);
            }
                    
            postMessage(msg);
            console.log("CALC THREAD: Lines drawn.");
        }
        
        function updateCentralLine(eclipse)
        {
            m_eclipse = new EclipseData(JSON.parse(eclipse));
            
            try
            {
                var centralLine = m_eclipse.drawCentralLine();
                
                var msg = { 'cmd': 'eclipse_central_line_update',
                            'central_line': JSON.stringify(centralLine)};
            }
            catch(error)
            {
                var msg = { 'cmd': 'eclipse_central_line_error'};
                console.log("Central LINE DRAW ERROR: " + error.message);
            }
            
            postMessage(msg);
            console.log("CALC THREAD: Central line drawn.");
        }
        
        /* Inputs an array of Lat / Long points from Eclipse Calculator
         * and converts them into a Leaflet usable Lat/Long array.
         * Returns empty array if invalid.
         * @returns {Array} Leaflet usable Lat/Long array.
         */
        function positionToLeafArray(posArray)
        {
            var retArray = [];
            
            if(posArray)
            {
                if(Array.isArray(posArray))
                {
                    var lastLng = 0.0;
                    var currentLng = 0.0;
                    var doRev = false;
                    var isNegative = false;
                    for(var i = 0; i < posArray.length; i++)
                    {
                        currentLng = posArray[i].longitude;
                        
                        if(!doRev && (Math.abs(lastLng - currentLng) > 180.0))
                        {
                            console.log("Pushing new array.");                            
                            doRev = true;
                            if(lastLng < 0)
                            {
                                isNegative = true;
                            }                                   
                        }
                        lastLng = currentLng;                        
                        if(doRev)
                        {
                            // currentLng = rev(currentLng);
                            if(isNegative)
                            {
                                currentLng = -1 * rev(Math.abs(360 - currentLng));
                            }
                            else
                            {
                                currentLng = rev(Math.abs(360 - currentLng));
                            }
                        }
                        pointCount++;
                        retArray.push({lat: posArray[i].latitude, lng: currentLng});
                    }
                   
                }
            }
                  
            return retArray;
        }
        
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

            return value;
        }
        
        function updateStatsAndPost()
        {
            var eclipseStats = m_eclipse.calculateLocalCircumstances(m_coords.latitude, m_coords.longitude, m_coords.altitude);
            var msg = { 'cmd': 'eclipse_stats_update',
                        'eclipse_stats': JSON.stringify(eclipseStats)};

            if (eclipseStats.isVisible)
            {
                var sunrise = solarCalc.calcSunriseSetUTC(true, eclipseStats.circDates.getMidDate(), m_coords.latitude, m_coords.longitude);
                var sunset = solarCalc.calcSunriseSetUTC(false, eclipseStats.circDates.getMidDate(), m_coords.latitude, m_coords.longitude);
                var midSolarElevation = solarCalc.getSolarElevation(m_coords.latitude, m_coords.longitude, eclipseStats.circDates.getMidDate());

                msg['sunrise'] = JSON.stringify(sunrise);
                msg['sunset'] = JSON.stringify(sunset);
                msg['solar_elevation'] = midSolarElevation.toString();
            }

            postMessage(msg);

            console.log("CALCULATE WORKER: Eclipse stats updated.");
        }
        
        function updateVisibleListAndPost()
        {
            var nextVisible = -1;
            var current_date = new Date();
            current_date.setTime(current_date.getTime() + m_DateOffset);
            current_date.setDate(DAY_BUFFER + current_date.getDate());
            
            var visibleIndices = [];
                        
            for(var i = 0; i < m_eclipseCatalog.getEclipseCount(); i++)
            {
               var eclipseStats = m_eclipseCatalog.getEclipse(i).calculateLocalCircumstances(m_coords.latitude, m_coords.longitude, m_coords.altitude);
               if(eclipseStats.isVisible)
               {
                   visibleIndices.push(i);
                   if(nextVisible === -1)
                   {
                        if(eclipseStats.circDates.getC1Date() > current_date)
                        {
                            nextVisible = i;
                        }
                    }
               }
            }
            var msg = { 'cmd': 'visible_index_update',
                        'visible_array': JSON.stringify(visibleIndices),
                        'next_visible': nextVisible.toString()};
                    
            postMessage(msg);

            console.log("CALCULATE WORKER: Eclipse visible array updated.");            
        }
    }
};

var calc = new CalculateWorker();