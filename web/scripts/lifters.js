// vim: set ts=4 sts=4 sw=4 et:
'use strict';

var grid; // The SlickGrid.
var sortCol = {id: 'date'}; // Initial column sorting information.
var sortAsc = false; // Initial column sorting information.

// TODO: Actually have a toggle for this.
var usingLbs = true;

// TODO: Share this with app.js. A bunch of functions can be shared, actually.
function weight(kg) {
    if (kg === undefined)
        return '';
    if (!usingLbs)
        return String(kg);
    return String(Math.round(kg * 2.2042262 * 100) / 100);
}


function number(num) {
    if (num === undefined)
        return '';
    return String(num);
}


function string(str) {
    if (str === undefined)
        return '';
    return str;
}


function maketd(str) {
    var td = document.createElement('td');
    td.appendChild(document.createTextNode(str));
    return td;
}


function weightMax(row, cola, colb) {
    var a = row[cola];
    var b = row[colb];
    if (a === undefined)
        return weight(b);
    if (b === undefined)
        return weight(a);
    return weight(Math.max(a,b));
}


// Fills in the <tbody> given the current query.
function getIndices(query) {
    // No query: nothing to draw.
    if (query.q === undefined) {
        return [];
    }

    function filter(row) {
        return row[opldb.NAME] === query.q;
    }

    var indices = db_make_indices_list();
    indices = db_filter(indices, filter);

    var sortFn = common.getSortFn(sortCol.id, sortAsc);
    indices.sort(sortFn);
    return indices;
}


function makeItem(row, index) {
    var meetrow = meetdb.data[row[opldb.MEETID]];
    var name = row[opldb.NAME];

    var country = common.string(meetrow[meetdb.MEETCOUNTRY]);
    var state = common.string(meetrow[meetdb.MEETSTATE]);

    var location = country;
    if (country && state) {
        location = location + "-" + state;
    }

    return {
        place:       common.string(row[opldb.PLACE]),
        name:        common.string(name),
        fed:         common.string(meetrow[meetdb.FEDERATION]),
        date:        common.string(meetrow[meetdb.DATE]),
        location:    location,
        meetname:    common.string(meetrow[meetdb.MEETNAME]),
        sex:         common.string(row[opldb.SEX]),
        age:         common.string(row[opldb.AGE]),
        equip:       common.parseEquipment(row[opldb.EQUIPMENT]),
        bw:          weight(row[opldb.BODYWEIGHTKG]),
        class:       common.parseWeightClass(row[opldb.WEIGHTCLASSKG]),
        squat:       weightMax(row, opldb.BESTSQUATKG, opldb.SQUAT4KG),
        bench:       weightMax(row, opldb.BESTBENCHKG, opldb.BENCH4KG),
        deadlift:    weightMax(row, opldb.BESTDEADLIFTKG, opldb.DEADLIFT4KG),
        total:       weight(row[opldb.TOTALKG]),
        wilks:       common.number(row[opldb.WILKS]),
        mcculloch:   common.number(row[opldb.MCCULLOCH]),
    };
}


function makeDataProvider(query) {
    var indices = getIndices(query);

    return {
        getLength: function () { return indices.length; },
        getItem: function(index) { return makeItem(opldb.data[indices[index]], index); }
    }
}


function onload() {
    var query = common.getqueryobj();

    var rankWidth = 40;
    var nameWidth = 200;
    var shortWidth = 40;
    var dateWidth = 80;
    var numberWidth = 56;

    function urlformatter(row, cell, value, columnDef, dataContext) {
        return value;
    }

    var columns = [
        {id: "filler", width: 20, minWidth: 20, focusable: false,
                       selectable: false, resizable: false},
        {id: "place", name: "Place", field: "place", width: rankWidth},
        {id: "name", name: "Name", field: "name", width: nameWidth, formatter: urlformatter},
        {id: "fed", name: "Fed", field: "fed", width: numberWidth,
                    sortable: true, defaultSortAsc: true},
        {id: "date", name: "Date", field: "date", width: dateWidth,
                     sortable: true, defaultSortAsc: false},
        {id: "location", name: "Location", field: "location", width:dateWidth},
        {id: "meetname", name: "Meet Name", field: "meetname", width: nameWidth},
        {id: "sex", name: "Sex", field: "sex", width: shortWidth},
        {id: "age", name: "Age", field: "age", width: shortWidth},
        {id: "equip", name: "Equip", field: "equip", width: shortWidth},
        {id: "class", name: "Class", field: "class", width: numberWidth},
        {id: "bw", name: "Weight", field: "bw", width: numberWidth,
                   sortable: true, defaultSortAsc: true},
        {id: "squat", name: "Squat", field: "squat", width: numberWidth,
                      sortable: true, defaultSortAsc: false},
        {id: "bench", name: "Bench", field: "bench", width: numberWidth,
                      sortable: true, defaultSortAsc: false},
        {id: "deadlift", name: "Deadlift", field: "deadlift", width: numberWidth,
                         sortable: true, defaultSortAsc: false},
        {id: "total", name: "Total", field: "total", width: numberWidth,
                      sortable: true, defaultSortAsc: false},
        {id: "wilks", name: "Wilks", field: "wilks", width: numberWidth,
                      sortable: true, defaultSortAsc: false},
        {id: "mcculloch", name: "McCulloch", field: "mcculloch", width: numberWidth+10,
                          sortable: true, defaultSortAsc: false},
    ];

    var options = {
        enableColumnReorder: false,
        forceSyncScrolling: true,
        forceFitColumns: true,
        rowHeight: 23,
        topPanelHeight: 23,
        cellFlashingCssClass: "searchflashing",
    };

    var data = makeDataProvider(query);
    grid = new Slick.Grid("#theGrid", data, columns, options);

    function redraw() {
        var source = makeDataProvider(query);
        grid.setData(source);
        grid.invalidateAllRows();
        grid.render();
    }

    grid.onSort.subscribe(function(e, args) {
        sortCol = args.sortCol;
        sortAsc = args.sortAsc;
        redraw();
    });

    window.addEventListener("resize", function(e) { grid.resizeCanvas(); }, false);
}


document.addEventListener("DOMContentLoaded", onload);
