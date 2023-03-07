/*--------------------------------------------------------------------
GGR472 Lab 3 - Ananmay Sharan
--------------------------------------------------------------------*/

//access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5hbm1heSIsImEiOiJjbDk0azNmY3oxa203M3huMzhyZndlZDRoIn0.1L-fBYplQMuwz0LGctNeiA'; //ADD YOUR ACCESS TOKEN HERE

// max bounds
const maxBounds = [
    [-79.6772, 43.4400], // SW coords
    [-79.04763, 44.03074] // NE coords
];

//initialize map
const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/ananmay/clb46qysm000l14kyvn8q1gjh", // custom Mapbox Studio style URL
    center: [-79.3832, 43.3432], // starting center in [lng, lat]
    zoom: 8,
    maxBounds:maxBounds,
    //bearing: -17.1,
});


/*--------------------------------------------------------------------
adding controls
--------------------------------------------------------------------*/
//add zoom and rotation controls 
map.addControl(new mapboxgl.NavigationControl());

//add fullscreen option to the map
map.addControl(new mapboxgl.FullscreenControl());

//create geocoder variable, only show Toronto area results
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca",
    place: "Toronto"
});

//position geocoder on page
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));



/*--------------------------------------------------------------------
ADD Toronto Neighbourhood DATA AS CHOROPLETH MAP ON MAP LOAD
Use get expression to categorise data based on air pollition values
--------------------------------------------------------------------*/
//Add data source and draw initial visiualization of layer
map.on('load', () => {
    map.addSource('toronto-neighbourhoods', {
        'type': 'vector',
        'url': 'mapbox://ananmay.71rqpd8z'
    });

    map.addLayer({
        'id': 'neighbourhood-fill',
        'type': 'fill',
        'source': 'toronto-neighbourhoods',
        'paint': {
            'fill-color': [
                'step', // STEP expression produces stepped results based on value pairs
                ['get', 'pm25_2016'], // GET expression retrieves property value from 'pm25_2016' data field
                '#fd8d3c', // Colour assigned to any values < first step
                6.5, '#fc4e2a', // Colours assigned to values >= each step
                6.93, '#e31a1c',
                7.19, '#bd0026',
                7.36, '#800026',
                7.48, '#2C000D'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'white'
        },
        'source-layer': 'ggr-472-lab-3-air-pollution-8rwfzb'
    });
});



/*--------------------------------------------------------------------
CREATE LEGEND IN JAVASCRIPT
--------------------------------------------------------------------*/
//Declare arrayy variables for labels and colours
const legendlabels = [
    '0-6.5',
    '6.5-6.93',
    '6.93-7.19',
    '7.19-7.36',
    '7.36-7.48',
    '>7.48'
];

const legendcolours = [
    '#fd8d3c',
    '#fc4e2a',
    '#e31a1c',
    '#bd0026',
    '#800026',
    '#2C000D'

];

//Declare legend variable using legend div tag
const legend = document.getElementById('legend');

//For each layer create a block to put the colour and label in
legendlabels.forEach((label, i) => {
    const color = legendcolours[i];

    const item = document.createElement('div'); //each layer gets a 'row' - this isn't in the legend yet, we do this later
    const key = document.createElement('span'); //add a 'key' to the row. A key will be the color circle

    key.className = 'legend-key'; //the key will take on the shape and style properties defined in css
    key.style.backgroundColor = color; // the background color is retreived from teh layers array

    const value = document.createElement('span'); //add a value variable to the 'row' in the legend
    value.innerHTML = `${label}`; //give the value variable text based on the label

    item.appendChild(key); //add the key (color cirlce) to the legend row
    item.appendChild(value); //add the value to the legend row

    legend.appendChild(item); //add row to the legend
});



/*--------------------------------------------------------------------
adding interactivity
--------------------------------------------------------------------*/

//add event listener for full screen on button click
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({
        center: [-79.3832, 43.6932],
        zoom: 10,
        essential: true
    });
});

//change display of layers based on check box
let legendcheck = document.getElementById('legendcheck');

legendcheck.addEventListener('click', () => {
    if (legendcheck.checked) {
        legendcheck.checked = true;
        legend.style.display = 'block';
    }
    else {
        legend.style.display = "none";
        legendcheck.checked = false;
    }
});

document.getElementById('layercheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'neighbourhood-fill',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

//  adding popup

// When a click event occurs on a feature in the neighbourhood layer, open a popup at the
// location of the feature, with description HTML from its properties.
map.on('click', 'neighbourhood-fill', (e) => {
    const name = e.features[0].properties.AREA_NAME;
    const level = e.features[0].properties.pm25_2016;

    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML("<h5>" + name + "</h5>" + "Air Pollution Fine Particulate Matter (PM 2.5) 2016 Level: " + level)
        .addTo(map);
});

// Change the cursor to a pointer when hovering over the fill layer
map.on('mouseenter', 'fill-layer', function () {
    map.getCanvas().style.cursor = 'pointer';
});

// Change the cursor back to the default when no longer hovering over the fill layer
map.on('mouseleave', 'fill-layer', function () {
    map.getCanvas().style.cursor = '';
});


