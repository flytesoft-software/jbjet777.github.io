/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class CalculateWorker
{
    constructor()
    {
        var MIN_UPDATE_RATE = 250;  // Minimum number of milliseconds allowed between coordinate updates.
        var DAY_BUFFER = 2;         // Number of days after current eclipse app starts to focus of next eclipse.
                
        var m_coords = null;
        var m_eclipse = null;
        var m_lastUpdateTime = null;
        var m_DateOffset = 0;
                        
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