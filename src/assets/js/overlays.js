//
//   Copyright 2012 David Ciarletta
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

class Point {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const pointsOfInterest = {
    "Fire extinguisher": {
        backgroundColor: "#ff0000",
        d: "M395.798,100.768c-13.76-19.496-33.884-33.587-56.892-39.875L303.113,51.1c20.978-6.854,39.364-20.032,52.151-38.141c1.948-2.751,2.012-6.41,0.18-9.232c-1.837-2.823-5.209-4.234-8.522-3.56L242.751,21.331c-2.922,0.594-4.999,3.143-4.999,6.11v1.135V54.19h-9.688c-3.441,0-6.23,2.792-6.23,6.231v1.532c-64.405,1.671-116.311,54.466-116.311,119.266V273.9c-5.063,4.558-8.311,11.096-8.311,18.456V401.74c0,13.77,11.147,24.923,24.925,24.923c13.777,0,24.924-11.153,24.924-24.923V292.356c0-7.36-3.248-13.898-8.306-18.456V181.22c0-46.466,37.012-84.192,83.078-85.87v1.071c0,3.439,2.789,6.229,6.23,6.229h9.688v31.138c-39.753,12.853-68.541,50.134-68.541,94.18v242.142c0,13.475,10.938,24.403,24.406,24.403h149.2c13.486,0,24.406-10.929,24.406-24.403V227.969c0-44.046-28.771-81.328-68.542-94.18V95.528l88.743,18.037c3.313,0.672,6.685-0.74,8.534-3.562C397.812,107.178,397.743,103.519,395.798,100.768zM313.562,275.392v129.812c0,8.221-6.655,14.88-14.881,14.88h-60.929c-8.212,0-14.88-6.659-14.88-14.88V275.392c0-8.22,6.668-14.882,14.88-14.882h60.929C306.906,260.511,313.562,267.173,313.562,275.392z",
        viewBox: [0, 0, 494.515, 494.515]
    },
    "Defibrillator": {
        backgroundColor: "#009b00",
        d: "M145.649,2c0,0-36.497,0-36.298,0C99.978,2,92,7.513,92,16.275V41H27.165C14.138,41,2,52.056,2,66.666c0,0.395,0,117.569,0,117.569C2,200.523,14.171,211,27,211h201.947c12.772,0,25.053-9.589,25.053-26.07c0,0,0-118.461,0-118.961C253.902,51.187,241.817,40,228.849,40H163V16.275C163,7.513,155.222,2,145.649,2zM105,16h45v25h-45V16zM180.735,85.037c12.328,14.224,10.589,35.613-3.372,47.888L127.21,182.71l-48.573-49.785c-13.961-12.275-15.699-33.875-3.372-47.888c12.275-13.961,33.927-15.647,47.888-3.372L128,85.88l4.847-4.215C147.071,69.338,168.46,71.077,180.735,85.037zM134.059,121.902h17.334l-40.282,41.246l12.234-29.674h-16.451l24.689-41.246h19.81L134.059,121.902z",
        viewBox: [0, 0, 256, 213]
    },
    "Coffee": {
        d: "M151.444,95.421c0.965,0.655,2.095,1.001,3.268,1.001h0.011c3.215,0,5.831-2.614,5.831-5.827c0-0.547-0.075-1.086-0.223-1.607c-2.695-11.825-1.439-21.313,3.733-28.204c6.484-8.638,9.354-19.733,7.677-29.677c-1.487-8.856-6.248-16.217-13.755-21.278c-1.948-1.321-4.628-1.314-6.578,0.026c-1.985,1.367-2.916,3.769-2.369,6.132c2.918,12.451,0.244,20.377-6.455,32.426c-4.358,7.839-6.136,16.654-5.008,24.821C138.859,82.519,143.661,90.195,151.444,95.421zM200.501,91.563c0.913,0.623,1.979,0.952,3.084,0.952h0.005c3.025,0,5.486-2.461,5.486-5.486c0-0.504-0.069-1.002-0.205-1.485c-1.885-8.314-1.029-14.945,2.545-19.707c4.959-6.604,7.153-15.104,5.868-22.732c-1.15-6.838-4.826-12.522-10.628-16.438c-1.828-1.233-4.311-1.246-6.19,0.035c-1.851,1.28-2.739,3.609-2.216,5.763c2.068,8.822,0.244,14.219-4.627,22.979c-3.33,5.989-4.687,12.734-3.821,18.99C190.792,81.607,194.502,87.537,200.501,91.563zM102.765,91.563c0.913,0.623,1.979,0.952,3.084,0.952h0.005c3.025,0,5.486-2.461,5.486-5.486c0-0.501-0.069-0.998-0.204-1.481c-1.887-8.316-1.031-14.948,2.543-19.711c4.96-6.605,7.153-15.104,5.868-22.732c-1.149-6.838-4.825-12.522-10.628-16.438c-1.827-1.234-4.306-1.249-6.19,0.035c-1.851,1.28-2.739,3.609-2.216,5.763c2.068,8.823,0.244,14.22-4.627,22.979c-3.33,5.99-4.687,12.734-3.82,18.99C93.055,81.607,96.765,87.537,102.765,91.563zM286.554,235.363c30.169,0,54.714-24.545,54.714-54.714s-24.544-54.714-54.714-54.714c-3.844,0-7.596,0.403-11.218,1.161H31.338c-6.5,0-10.244,2.8-12.241,5.147c-4.089,4.809-4.652,12.008-3.817,17.143c3.513,21.583,13.221,65.331,37.582,101.711c-2.049,0.521-4.066,1.054-6.03,1.609C16.195,261.357,0,272.954,0,286.247s16.195,24.891,46.833,33.54c28.866,8.149,67.184,12.638,107.895,12.638s79.029-4.488,107.895-12.638c30.638-8.649,46.833-20.247,46.833-33.54s-16.195-24.891-46.833-33.54c-1.867-0.527-3.777-1.037-5.722-1.534c3.949-5.917,7.667-12.266,11.146-19.039C273.831,234.22,280.061,235.363,286.554,235.363zM311.268,180.65c0,13.627-11.086,24.714-24.714,24.714c-2.26,0-4.448-0.311-6.529-0.882c5.394-14.878,9.741-30.971,12.866-47.719C303.457,159.568,311.268,169.213,311.268,180.65z",
        viewBox: [0, 0, 341.268, 341.268]
    },
    "WC": {
        d: "M30.39,35.84v66.43a4.87,4.87,0,0,1-4.85,4.86h0a4.88,4.88,0,0,1-4.86-4.86V63.21H18.77v39.06a4.87,4.87,0,0,1-4.85,4.86h0a4.88,4.88,0,0,1-4.86-4.86V35.84H7.37V60.25a3.7,3.7,0,0,1-3.69,3.68h0A3.7,3.7,0,0,1,0,60.25V34c0-4.27,1.44-7.27,4.05-9.24,4.5-3.39,26.72-3.39,31.22,0,2.62,2,4.07,5,4.06,9.24V60.25a3.7,3.7,0,0,1-3.68,3.68h0A3.7,3.7,0,0,1,32,60.25V35.84ZM53.51,2.78a2.81,2.81,0,0,1,5.62,0V107.13a2.81,2.81,0,0,1-5.62,0V2.78ZM115,33c.06.15.11.3.16.46l7.59,27a3.77,3.77,0,1,1-7.27,2L108,35.81l-.11,0H106.3v1.69l10,39.74h-10v25a4.87,4.87,0,0,1-4.85,4.86h0a4.88,4.88,0,0,1-4.85-4.86v-25H94.68v25a4.88,4.88,0,0,1-4.86,4.86h0A4.87,4.87,0,0,1,85,102.27v-25H74.38L85,36.48v-.64h-1.7l-.14,0L75.64,62.46a3.77,3.77,0,1,1-7.27-2L75.8,34l-.08,0c1.14-4.25,2.09-7.27,4.71-9.24,4.5-3.39,26.24-3.39,30.75,0C113.6,26.56,114,29,115,33ZM95.57,2.78a8.78,8.78,0,1,1-8.78,8.78,8.78,8.78,0,0,1,8.78-8.78Zm-75.91,0a8.78,8.78,0,1,1-8.78,8.78,8.78,8.78,0,0,1,8.78-8.78Z",
        viewBox: [0, 0, 122.88, 109.91]
    },
    "Disabled WC": {
        d: "M285,250h-29.19l-16.58-49.744C237.187,194.131,231.456,190,225,190h-75v-49.871h75c8.283,0,15-6.716,15-15s-6.717-15-15-15h-75V87.42c17.458-6.192,30-22.865,30-42.42c0-24.813-20.188-45-45-45c-24.814,0-45,20.188-45,45c0,19.555,12.541,36.228,30,42.42v24.396C68.521,121.24,30,166.277,30,220c0,60.654,49.346,110,110,110c39.826,0,75.394-21.537,94.712-54.096C237.434,278.471,241.08,280,245,280h40c8.283,0,15-6.716,15-15S293.283,250,285,250zM140,300c-44.113,0-80-35.888-80-80c0-37.155,25.328-68.595,60-77.483V205c0,8.284,6.715,15,15,15h79.187l4.613,13.84C212.189,271.782,178.889,300,140,300z",
        viewBox: [0, 0, 330, 330]
    },
    "Stairs": {
        d: "M1.648 56.572h11.205V45.168h11.134V33.686h11.308v-11.27h11.233V11.222h16.677v5.711H52.118V28.17H40.872v11.397H29.65v11.336H18.383v11.432H1.648z",
        viewBox: [-0, 4, 64, 64]
    },
    "Lift": {
        d: "M434.216,188.885l3.115-3.115v38.251c0,5.888,4.779,10.667,10.667,10.667c5.888,0,10.667-4.779,10.667-10.667v-38.251l3.115,3.115c2.091,2.091,4.821,3.115,7.552,3.115c2.731,0,5.461-1.045,7.552-3.115c4.16-4.16,4.16-10.923,0-15.083l-21.312-21.312c-0.981-0.981-2.176-1.771-3.477-2.325c-2.603-1.088-5.547-1.088-8.149,0c-1.323,0.533-2.496,1.323-3.477,2.325l-21.312,21.312c-4.16,4.16-4.16,10.923,0,15.083C423.315,193.045,430.035,193.045,434.216,188.885zM362.664,0H63.997c-17.643,0-32,14.357-32,32v448c0,17.643,14.357,32,32,32h298.667c17.643,0,32-14.357,32-32V32C394.664,14.357,380.307,0,362.664,0zM309.331,309.333c0,17.643-14.357,32-32,32c-3.733,0-7.339-0.64-10.667-1.813v97.813c0,17.643-14.357,32-32,32c-8.192,0-15.659-3.093-21.333-8.171c-5.675,5.077-13.141,8.171-21.333,8.171c-17.643,0-32-14.357-32-32V339.52c-3.328,1.173-6.933,1.813-10.667,1.813c-17.643,0-32-14.357-32-32V202.667c0-29.397,23.936-53.333,53.333-53.333h42.667c-29.397,0-53.333-23.936-53.333-53.333s23.936-53.333,53.333-53.333S266.664,66.603,266.664,96s-23.936,53.333-53.333,53.333h42.667c29.397,0,53.333,23.936,53.333,53.333V309.333zM461.779,323.115l-3.115,3.115v-38.251c0-5.888-4.779-10.667-10.667-10.667c-5.888,0-10.667,4.779-10.667,10.667v38.251l-3.115-3.115c-4.16-4.16-10.923-4.16-15.083,0c-4.16,4.16-4.16,10.923,0,15.083l21.312,21.312c0.981,0.981,2.176,1.771,3.477,2.325c1.301,0.533,2.688,0.811,4.075,0.811c1.387,0,2.773-0.277,4.075-0.811c1.323-0.533,2.496-1.323,3.477-2.325l21.312-21.312c4.16-4.16,4.16-10.923,0-15.083C472.701,318.955,465.96,318.955,461.779,323.115z",
        viewBox: [0, 0, 512, 512]
    },
    "Parking": {
        backgroundColor: "#4242ff",
        d: "M11.85,8.37c-0.9532,0.7086-2.1239,1.0623-3.31,1H5.79V14H3V1h5.72c1.1305-0.0605,2.244,0.2952,3.13,1c0.8321,0.8147,1.2543,1.9601,1.15,3.12C13.1271,6.3214,12.7045,7.5159,11.85,8.37zM9.75,3.7C9.3254,3.3892,8.8052,3.237,8.28,3.27H5.79v3.82h2.49c0.5315,0.0326,1.056-0.1351,1.47-0.47c0.3795-0.3947,0.5693-0.9346,0.52-1.48C10.324,4.606,10.1327,4.0763,9.75,3.7z",
        viewBox: [0, 0, 15, 15]
    },
    "Vending machine": {
        d: "M306.77,0H79.119c-5.523,0-10,4.477-10,10v365.889c0,5.523,4.477,10,10,10H306.77c5.523,0,10-4.477,10-10V10C316.77,4.477,312.293,0,306.77,0zM213.46,243.741h-14.236c-5.523,0-10,4.477-10,10c0,0.006,0.001,0.012,0.001,0.019h-7.652c0-0.006,0.001-0.012,0.001-0.019c0-5.523-4.477-10-10-10h-14.235c-5.523,0-10,4.477-10,10c0,0.006,0.001,0.012,0.001,0.019h-7.652c0-0.006,0.001-0.012,0.001-0.019c0-5.523-4.477-10-10-10h-14.235c-5.523,0-10,4.477-10,10c0,0.006,0.001,0.012,0.001,0.019H89.119v-21.793h149.509v21.793h-15.168c0-0.006,0.001-0.012,0.001-0.019C223.46,248.218,218.983,243.741,213.46,243.741zM238.627,78.728v31.08h-25.092V97.15c0-5.523-4.477-10-10-10s-10,4.477-10,10v12.657h-9.361V97.15c0-5.523-4.477-10-10-10s-10,4.477-10,10v12.657h-9.361V97.15c0-5.523-4.477-10-10-10s-10,4.477-10,10v12.657h-9.36V97.15c0-5.523-4.477-10-10-10s-10,4.477-10,10v12.657H89.119v-31.08H238.627zM203.536,184.166c-5.523,0-10,4.477-10,10v16.867c0,0.315,0.019,0.626,0.047,0.935h-3.52c0.029-0.308,0.047-0.619,0.047-0.935c0-5.523-4.477-10-10-10h-11.871c-5.523,0-10,4.477-10,10c0,0.315,0.019,0.626,0.047,0.935h-3.519c0.029-0.308,0.047-0.619,0.047-0.935v-16.867c0-5.523-4.477-10-10-10s-10,4.477-10,10v16.867c0,0.315,0.019,0.626,0.047,0.935h-9.455c0.029-0.308,0.047-0.619,0.047-0.935v-16.867c0-5.523-4.477-10-10-10s-10,4.477-10,10v16.867c0,0.315,0.019,0.626,0.047,0.935H89.119v-31.08h149.509v31.08h-25.139c0.029-0.308,0.047-0.619,0.047-0.935v-16.867C213.536,188.643,209.059,184.166,203.536,184.166zM238.627,129.807v31.08h-25.092v-15.229c0-5.523-4.477-10-10-10s-10,4.477-10,10v15.229h-9.361v-15.229c0-5.523-4.477-10-10-10s-10,4.477-10,10v15.229h-13.776c-0.783-4.742-4.891-8.362-9.854-8.362h-25.09c-4.964,0-9.071,3.62-9.854,8.362h-16.48v-31.08H238.627zM238.627,20v38.728H208.52c0.478-1.167,0.745-2.443,0.745-3.782c0-5.523-4.477-10-10-10h-25.091c-5.523,0-10,4.477-10,10c0,1.339,0.268,2.615,0.745,3.782h-15.122c0.478-1.167,0.745-2.443,0.745-3.782c0-5.523-4.477-10-10-10h-25.09c-5.523,0-10,4.477-10,10c0,1.339,0.268,2.615,0.745,3.782h-17.08V20H238.627zM296.77,365.889H89.119V273.76h159.509c5.523,0,10-4.477,10-10V20h38.143V365.889zM241.075,293.922h-96.261c-5.523,0-10,4.477-10,10v30.009c0,5.523,4.477,10,10,10h96.261c5.523,0,10-4.477,10-10v-30.009C251.075,298.399,246.598,293.922,241.075,293.922zM231.075,323.932h-76.261v-10.009h76.261V323.932zM278.543,119.213c5.523,0,10-4.477,10-10V96.668c0-5.523-4.477-10-10-10s-10,4.477-10,10v12.545C268.543,114.736,273.02,119.213,278.543,119.213zM278.543,155.175c5.523,0,10-4.477,10-10V132.63c0-5.523-4.477-10-10-10s-10,4.477-10,10v12.545C268.543,150.698,273.02,155.175,278.543,155.175z",
        viewBox: [0, 0, 385.889, 385.889]
    },
    "Water fountain": {
        d: "M318.002,137.333l-39.004-75.667C275.974,55.8,268.1,51,261.5,51h-49c-6.6,0-14.474,4.8-17.498,10.667l-39.004,75.667c-2.149,4.169-4.015,10.296-4.918,15.667h171.84C322.017,147.63,320.151,141.503,318.002,137.333zM150.5,462c0,6.6,5.4,12,12,12h149c6.6,0,12-5.4,12-12V341.5h-173V462zM209.5,42h55c6.6,0,12-5.4,12-12V12c0-6.6-5.4-12-12-12h-55c-6.6,0-12,5.4-12,12v18C197.5,36.6,202.9,42,209.5,42zM327,216c1.925,0,3.5-5.4,3.5-12v-22c0-3.579-0.466-6.796-1.197-9H144.697c-0.731,2.204-1.197,5.421-1.197,9v22c0,6.6,1.575,12,3.5,12s3.5,1.913,3.5,4.25s-1.575,4.25-3.5,4.25s-3.5,5.4-3.5,12v22c0,6.6,1.575,12,3.5,12s3.5,1.913,3.5,4.25S148.925,279,147,279s-3.5,5.4-3.5,12v22c0,3.314,0.398,6.323,1.036,8.5h184.928c0.639-2.177,1.036-5.186,1.036-8.5v-22c0-6.6-1.575-12-3.5-12s-3.5-1.913-3.5-4.25s1.575-4.25,3.5-4.25s3.5-5.4,3.5-12v-22c0-6.6-1.575-12-3.5-12s-3.5-1.913-3.5-4.25S325.075,216,327,216zM234.125,294.973c-20.875,0-37.797-16.922-37.797-37.797S234.125,193,234.125,193s37.797,43.301,37.797,64.176S255,294.973,234.125,294.973z",
        viewBox: [0, 0, 474, 474]
    },
    "Hand sanitizer": {
        d: "M17 2v2l-4-.001V6h3v2c2.21 0 4 1.79 4 4v8c0 1.105-.895 2-2 2H6c-1.105 0-2-.895-2-2v-8c0-2.21 1.79-4 4-4V6h3V3.999L7.5 4c-.63 0-1.37.49-2.2 1.6L3.7 4.4C4.87 2.84 6.13 2 7.5 2H17zm-1 8H8c-1.105 0-2 .895-2 2v8h12v-8c0-1.105-.895-2-2-2zm-3 2v2h2v2h-2.001L13 18h-2l-.001-2H9v-2h2v-2h2z",
        viewBox: [0, 0, 24, 24]
    }
}

d3.floorplan.overlays = function () {
    var x = d3.scale.linear(),
        y = d3.scale.linear(),
        id = "fp-overlays-" + new Date().valueOf(),
        name = "overlays",
        canvasCallbacks = [],
        selectCallbacks = [],
        moveCallbacks = [],
        editMode = false,
        line = d3.svg.line()
            .x(function (d) {
                return x(d.x);
            })
            .y(function (d) {
                return y(d.y);
            }),
        dragBehavior = d3.behavior.drag()
            .on("dragstart", __dragItem)
            .on("drag", __mousemove)
            .on("dragend", __mouseup),
        dragged = null;

    function overlays(g) {
        g.each(function (data) {
            if (!data) return;
            var g = d3.select(this);

            // setup rectangle for capturing events
            var canvas = g.selectAll("rect.overlay-canvas").data([0]);

            canvas.enter().append("rect")
                .attr("class", "overlay-canvas")
                .style("opacity", 0)
                .attr("pointer-events", "all")
                .on("click", function () {
                    if (editMode) {
                        var p = d3.mouse(this);
                        canvasCallbacks.forEach(function (cb) {
                            cb(x.invert(p[0]), y.invert(p[1]));
                        });
                    }
                })
                .on("mouseup.drag", __mouseup)
                .on("touchend.drag", __mouseup);

            canvas.attr("x", x.range()[0])
                .attr("y", y.range()[0])
                .attr("height", y.range()[1] - y.range()[0])
                .attr("width", x.range()[1] - x.range()[0]);

            // draw polygons (currently only type supported)
            var polygons = g.selectAll("path.polygon")
                .data(data.polygons || [], function (d) {
                    return d.id;
                });

            polygons.enter().append("path")
                .attr("class", "polygon")
                .attr("vector-effect", "non-scaling-stroke")
                .attr("pointer-events", "all")
                .on("mousedown", function (d) {
                    selectCallbacks.forEach(function (cb) {
                        cb(d.id);
                    });
                })
                .call(dragBehavior)
                .append("title");

            for (let i = 0; i < polygons[0].length; i++) {
                polygons[0][i].id = data.polygons[i].id;
                const elem = document.querySelector("[id='" + data.polygons[i].id + "']");
                elem.setAttribute("id", data.polygons[i].id);
                elem.setAttribute("type", data.polygons[i].type);
                if (data.polygons[i].type === "Floor") {
                    elem.setAttribute("fill", "#0004ff");
                } else {
                    elem.setAttribute("removable", "");
                    const index = data.polygons.map(elem => parseInt(elem.id)).indexOf(parseInt(polygons[0][i].id));
                    if (data.polygons[index].color) {
                        elem.setAttribute("fill", "rgb(" +  data.polygons[index].color.join(",") + ")");
                    }
                }
            }

            polygons.exit().transition().style("opacity", 1e-6).remove();
            g.attr("id", function (a) {
                return a.id;
            });
            g.attr("floor", function (a) {
                return a.floor;
            })
            polygons
                .attr("d", function (d) {
                    return line(d.points) + "Z";
                })
                .style("cursor", editMode ? "move" : "pointer")
                .select("title")
                .text(function (d) {
                    return d.name || d.id;
                });

            // draw nodes (currently only type supported)
            var nodes = g.selectAll("svg.pointOfInterest")
                .data(data.nodes || [], function (d) {
                    return d.id;
                });

            const nodeGroup = nodes.enter().append("svg")
                .attr("height", "30px")
                .attr("width", "30px")
                .attr("removable", "")
                .attr("node", "")
                .attr("class", "pointOfInterest")
                .attr("vector-effect", "non-scaling-stroke")
                .attr("pointer-events", "all")
                .on("mousedown", function (d) {
                    selectCallbacks.forEach(function (cb) {
                        cb(d.id);
                    });
                })
                .call(d3.behavior.drag().on("drag", function () {
                    const node = data.nodes.find((elem) => elem.id === parseInt(this.id));
                    let x = d3.event.x - (parseInt(d3.select(this).attr("width").split("px")) / 2);
                    let y = d3.event.y - (parseInt(d3.select(this).attr("height").split("px")) / 2);

                    node.point = new Point(x, y);
                    node.displayPoints = [];

                    // Apply the translation to the shape:
                    d3.select(this)
                        .attr("x", x + (parseInt(d3.select(this).attr("width").split("px")) / 2))
                        .attr("y", y + (parseInt(d3.select(this).attr("height").split("px")) / 2))
                }));

            for (let i = 0; i < nodes[0].length; i++) {
                nodes[0][i].id = data.nodes[i].id;
                const elem = document.querySelector("[id='" + data.nodes[i].id + "']");
                elem.setAttribute("id", data.nodes[i].id);
                elem.setAttribute("pointsOfInterestId", data.nodes[i].id);
                elem.setAttribute("type", data.nodes[i].type);
                elem.setAttribute("x", data.nodes[i].point.x + 15);
                elem.setAttribute("y", data.nodes[i].point.y + 15);
            }

            nodeGroup.append("rect")
                .attr("height", "100%")
                .attr("width", "100%")
                .attr("rx", "7");

            nodeGroup.append("svg")
                .attr("height", "100%")
                .attr("width", "100%")
                .append("path")
                .attr("fill", "#fff");

            for (let i = 0; i < nodes[0].length; i++) {
                const pointOfInterest = document.querySelector("[id='" + data.nodes[i].id + "']");
                pointOfInterest.setAttribute("floor", data.nodes[i].floor);
                pointOfInterest.setAttribute("neighbors", data.nodes[i].neighbors.join(","));
                const logo = pointsOfInterest[data.nodes[i].type];
                if (logo.backgroundColor !== undefined) {
                    pointOfInterest.setAttribute("fill", logo.backgroundColor);
                }
                pointOfInterest.getElementsByTagName("svg")[0].setAttribute("viewBox", `${logo.viewBox[0] + (logo.viewBox[2] * -.1)} ${logo.viewBox[1] + (logo.viewBox[3] * -.1)} ${logo.viewBox[2] * 1.2} ${logo.viewBox[3] * 1.2}`);
                pointOfInterest.getElementsByTagName("path")[0].setAttribute("d", logo.d);
                // Needed for when user selects child instead of parent for remove element
                pointOfInterest.getElementsByTagName("rect")[0].setAttribute("pointsOfInterestId", data.nodes[i].id);
                pointOfInterest.getElementsByTagName("svg")[0].setAttribute("pointsOfInterestId", data.nodes[i].id);
                pointOfInterest.getElementsByTagName("path")[0].setAttribute("pointsOfInterestId", data.nodes[i].id);
            }

            nodes.exit().transition().style("opacity", 1e-6).remove();
            g.attr("id", function (a) {
                return a.id;
            });
            g.attr("floor", function (a) {
                return a.floor;
            })

            if (editMode) {
                var pointData = [];
                if (data.polygons) {
                    data.polygons.forEach(function (polygon) {
                        if (polygon.type !== "Floor") {
                            polygon.points.forEach(function (pt, i) {
                                pointData.push({
                                    "index": i,
                                    "parent": polygon
                                });
                            });
                        }
                    });
                }

                // determine current view scale to make appropriately
                // sized points to drag
                var scale = 1;
                var node = g.node();
                while (node.parentNode) {
                    node = node.parentNode;
                    if (node.__scale__) {
                        scale = node.__scale__;
                        break;
                    }
                }

                var points = g.selectAll("circle.vertex")
                    .data(pointData, function (d) {
                        return d.parent.id + "-" + d.index;
                    });

                points.exit().transition()
                    .attr("r", 1e-6).remove();

                points.enter().append("circle")
                    .attr("class", "vertex")
                    .attr("pointer-events", "all")
                    .attr("vector-effect", "non-scaling-stroke")
                    .style("cursor", "move")
                    .attr("r", 1e-6)
                    .call(dragBehavior);

                points
                    .attr("cx", function (d) {
                        return x(d.parent.points[d.index].x);
                    })
                    .attr("cy", function (d) {
                        return y(d.parent.points[d.index].y);
                    })
                    .attr("r", 4 / scale);
            } else {
                g.selectAll("circle.vertex").transition()
                    .attr("r", 1e-6).remove();
            }
        });
    }

    overlays.xScale = function (scale) {
        if (!arguments.length) return x;
        x = scale;
        return overlays;
    };

    overlays.yScale = function (scale) {
        if (!arguments.length) return y;
        y = scale;
        return overlays;
    };

    overlays.id = function () {
        return id;
    };

    overlays.title = function (n) {
        if (!arguments.length) return name;
        name = n;
        return overlays;
    };

    overlays.editMode = function (enable) {
        if (!arguments.length) return editMode;
        editMode = enable;
        return overlays;
    };

    overlays.registerCanvasCallback = function (cb) {
        if (arguments.length) canvasCallbacks.push(cb);
        return overlays;
    };

    overlays.registerSelectCallback = function (cb) {
        if (arguments.length) select.Callbacks.push(cb);
        return overlays;
    };

    overlays.registerMoveCallback = function (cb) {
        if (arguments.length) moveCallbacks.push(cb);
        return overlays;
    };

    function __dragItem(d) {
        if (editMode) dragged = d;
    }

    function __mousemove() {
        if (dragged) {
            var dx = x.invert(d3.event.dx) - x.invert(0);
            var dy = y.invert(d3.event.dy) - y.invert(0);
            if (dragged.parent) { // a point
                dragged.parent.points[dragged.index].x += dx;
                dragged.parent.points[dragged.index].y += dy;
            } else if (dragged.points) { // a composite object
                dragged.points.forEach(function (pt) {
                    pt.x += dx;
                    pt.y += dy;
                });
            }
            // parent is container for overlays
            overlays(d3.select(this.parentNode));
        }
    }

    function __mouseup() {
        if (dragged) {
            moveCallbacks.forEach(function (cb) {
                dragged.parent ? cb(dragged.parent.id, dragged.parent.points, dragged.index) :
                    cb(dragged.id, dragged.points);
            });
            dragged = null;
        }
    }

    return overlays;
};
