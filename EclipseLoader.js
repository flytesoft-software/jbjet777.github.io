/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


"use strict";

class EclipseLoader
{
    constructor()
    {
        var ECLIPSE_CATALOG_URL = "data/eclipses/catsmall.txt";
        var ECLIPSE_ELEMENTS_URL = "data/eclipses/SECOMB.js";
        var TIME_LOCALE = "en-US";
        
        importScripts("EclipseCalc.js");
        
        var eclipseInfo = new Eclipses();
        
        this.init = function()
        {
            console.log("Initing eclipse loader thread.");
            eclipseInfo.loadEclipseElements(ECLIPSE_CATALOG_URL, ECLIPSE_ELEMENTS_URL, onEclipseLoadComplete, onEclipseLoadError);            
        };
        
        function buildEclipseList()
        {
            console.log("Building eclipse list.");

            var list_html = "";
            var date_options = {timeZone: "UTC", year: "numeric", month: "long", day: "numeric"};
           
            for (var i = 0; i < eclipseInfo.getEclipseCount(); i++)
            {
                var eclipseType = eclipseInfo.getEclipse(i).type;
                list_html += "<li eclipse-index='" + i + "' class='mdl-list__item mdl-list__item--two-line'>" +
                        "<span class='mdl-list__item-primary-content'>" +
                        "<i class='" + eclipseType.toLocaleLowerCase() + 
                        "-eclipse-icon mdl-list__item-avatar'>" + eclipseType +  " Eclipse</i>" +
                        "<span>" + eclipseType + " Eclipse</span>" +
                        "<span class='mdl-list__item-sub-title'>" +
                        eclipseInfo.getEclipse(i).maxEclipseDate.toLocaleDateString(TIME_LOCALE, date_options) + "</span></span>" +
                        "<span class='mdl-list__item-secondary-content'><i class='material-icons visible-class' style='display: none;'>visibility</i></span>" + 
                        "</li>";
            }
            
            onBuildEclipseListComplete(list_html);
        }
        
        function onBuildEclipseListComplete(list_html)
        {
            console.log("Build html list complete.");
            postMessage({'cmd': 'eclipse_html_complete', 
                        'eclipse_data': list_html});
        }
        
        function onEclipseLoadComplete()
        {
            var eclipseString = eclipseInfo.eclipseToJSON();
            
            console.log("Eclipse thread load complete: " + eclipseInfo.getEclipseCount() + " eclipses loaded.");
            postMessage({'cmd': 'eclipse_load_complete', 
                        'eclipse_data': eclipseString});
            buildEclipseList();
        }
        
        function onEclipseLoadError(status)
        {
            console.log("Eclipse loader error: " + status);
            postMessage({'cmd': 'eclipse_load_error', 
                        'status': status});
        }
    }
};

var el = new EclipseLoader;

el.init();