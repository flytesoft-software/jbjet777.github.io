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
        var MIN_UPDATE_RATE = 0;  // Minimum number of milliseconds allowed between coordinate updates.
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
                    updateNorthPenUmbraLine(data.eclipse);
                    break;
                    
                case 'east_penumbra_line':
                    updateEastPenUmbraLine( data.eclipse,
                                            data.north_pen_line,
                                            data.south_pen_line);
                    break;
                    
                case 'west_penumbra_line':
                    updateWestPenUmbraLine( data.eclipse,
                                            data.north_pen_line,
                                            data.south_pen_line);
                    break;
                    
                default:
                    console.log("CALCULATE WORKER: Invalid command.");
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
        }
        
        function updateCentralLine(ecp)
        {
            var eclipse = new EclipseData(JSON.parse(ecp));
            
            try
            {
                var line = eclipse.drawCentralLine();
                var times = eclipse.getCentralLineTimes();
                
                var msg = { 'cmd': 'eclipse_central_line_update',
                            'line': JSON.stringify(line),
                            'times': JSON.stringify(times)};
                        
                console.log("LINE WORKER: Central line drawn.");
            }
            
            catch(error)
            {
                var msg = { 'cmd': 'eclipse_central_line_error'};
                console.log("Central LINE DRAW ERROR: " + error.message);
            }
                       
            postMessage(msg);            
        }
        
        function updateNorthUmbraLine(ecp)
        {
            var eclipse = new EclipseData(JSON.parse(ecp));
            
           try
           {
                var line = eclipse.drawUmbraLimit(true);
                var times = eclipse.getNorthUmbraTimes();
                
                var msg = { 'cmd': 'eclipse_north_umbra_line_update',
                            'line': JSON.stringify(line),
                            'times': JSON.stringify(times)};
                console.log("LINE WORKER: North umbra line drawn.");
           }
           catch(error)
           {
                var msg = { 'cmd': 'eclipse_north_umbra_line_error'};
                console.log("North umbra line DRAW ERROR: " + error.message);
           }            
            postMessage(msg);            
        }
        
        function updateSouthUmbraLine(ecp)
        {
            var eclipse = new EclipseData(JSON.parse(ecp));
            
           try
           {
                var line = eclipse.drawUmbraLimit(false);
                var times = eclipse.getSouthUmbraTimes();
                
                var msg = { 'cmd': 'eclipse_south_umbra_line_update',
                            'line': JSON.stringify(line),
                            'times': JSON.stringify(times)};
                console.log("LINE WORKER: South umbra line drawn.");
            }
            catch(error)
            {
                var msg = { 'cmd': 'eclipse_south_umbra_line_error'};
                console.log("South umbra line DRAW ERROR: " + error.message);
            }
            
            postMessage(msg);
        }
        
        function updateSouthPenUmbraLine(ecp)
        {
            var eclipse = new EclipseData(JSON.parse(ecp));
            
            try
            {
                var line = eclipse.drawPenumbralLimit(false);
               
                var msg = { 'cmd': 'eclipse_south_penumbra_line_update',
                            'line': JSON.stringify(line)};
                console.log("LINE WORKER: South penumbra line drawn.");
            }
            
            catch(error)
            {
                var msg = { 'cmd': 'eclipse_south_penumbra_line_error'};
                console.log("South penumbra line DRAW ERROR: " + error.message);
            }
            
            postMessage(msg);            
        }
        
        function updateNorthPenUmbraLine(ecp)
        {
            var eclipse = new EclipseData(JSON.parse(ecp));
            
            try
            {
                var line = eclipse.drawPenumbralLimit(true);
                
                var msg = { 'cmd': 'eclipse_north_penumbra_line_update',
                            'line': JSON.stringify(line)};
                console.log("LINE WORKER: North penumbra line drawn.");
            }
            
            catch(error)
            {
                var msg = { 'cmd': 'eclipse_north_penumbra_line_error'};
                console.log("North penumbra line DRAW ERROR: " + error.message);
            }
           
            postMessage(msg);            
        }
        
        function updateEastPenUmbraLine(ecp, northPenLine, southPenLine)
        {
            var eclipse = new EclipseData(JSON.parse(ecp));
            if(northPenLine !== "null")
            {
                eclipse.setNorthPenumbraLine(JSON.parse(northPenLine));
            }
            if(southPenLine !== "null")
            {
                eclipse.setSouthPenumbraLine(JSON.parse(southPenLine));
            }
            
           try
           {
                var line = eclipse.drawEastWestLimit(false);
                var times = eclipse.getEastLineTimes();
                
                var msg = { 'cmd': 'eclipse_east_penumbra_line_update',
                            'line': JSON.stringify(line),
                            'times': JSON.stringify(times)};
            }
            catch(error)
            {
                var msg = { 'cmd': 'eclipse_east_penumbra_line_error'};
                console.log("East penumbra line DRAW ERROR: " + error.message);
            }
                        
            postMessage(msg);
            console.log("LINE WORKER: East penumbra line drawn.");
        }
        
        function updateWestPenUmbraLine(ecp, northPenLine, southPenLine)
        {
            var eclipse = new EclipseData(JSON.parse(ecp));
            if(northPenLine !== "null")
            {
                eclipse.setNorthPenumbraLine(JSON.parse(northPenLine));
            }
            if(southPenLine !== "null")
            {
                eclipse.setSouthPenumbraLine(JSON.parse(southPenLine));
            }
            
            try
            {
                var line = eclipse.drawEastWestLimit(true);
                var times = eclipse.getWestLineTimes();                
                
                var msg = { 'cmd': 'eclipse_west_penumbra_line_update',
                            'line': JSON.stringify(line),
                            'times': JSON.stringify(times)};
                console.log("LINE WORKER: West penumbra line drawn.");
            }
           
            catch(error)
            {
                var msg = { 'cmd': 'eclipse_west_penumbra_line_error'};
                console.log("West penumbra line DRAW ERROR: " + error.message);
            }
                       
            postMessage(msg);
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
                var eclipseMidDate = m_eclipse.toDate(eclipseStats.circDates.getMidDate());
                eclipseMidDate.setUTCDate(eclipseMidDate.getUTCDate() + 1);
                
                var sunrise = solarCalc.calcSunriseSetUTC(true, eclipseMidDate, m_coords.latitude, m_coords.longitude);
                var sunset = solarCalc.calcSunriseSetUTC(false, eclipseMidDate, m_coords.latitude, m_coords.longitude);
                var midSolarElevation = solarCalc.getSolarElevation(m_coords.latitude, m_coords.longitude, m_eclipse.toDate(eclipseStats.circDates.getMidDate()));

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
               var eclipse = m_eclipseCatalog.getEclipse(i);
               var eclipseStats = eclipse.calculateLocalCircumstances(m_coords.latitude, m_coords.longitude, m_coords.altitude);
               if(eclipseStats.isVisible)
               {
                   visibleIndices.push(i);
                   if(nextVisible === -1)
                   {
                        if(eclipse.getMaxEclipseDate() > current_date)
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