// Select DOM elements
const stationSelect = document.getElementById("station-select");
const chartCanvas = document.getElementById("station-chart").getContext("2d");
const tableBody = document.querySelector("#station-table tbody");

let stationChart; // Global variable for the chart

// CORS Proxy (if needed)
const proxyUrl = "https://corsproxy.io/?";

// Fetch list of available stations
async function fetchStations() {
    const url = "https://environment.data.gov.uk/flood-monitoring/id/stations";

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        populateStationDropdown(data.items);
    } catch (error) {
        console.error("Error fetching stations:", error);
        alert("Failed to load stations.");
    }
}

// Populate dropdown with station names
function populateStationDropdown(stations) {
    stationSelect.innerHTML = ""; // Clear existing options
    stations.forEach(station => {
        const option = document.createElement("option");
        option.value = station.stationReference;
        option.textContent = `${station.label} (${station.riverName || "Unknown"})`;
        stationSelect.appendChild(option);
    });
}

// Fetch data for selected station (Last 24 Hours)
async function fetchStationData(stationId) {
    const now = new Date();
    const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    
    const apiUrl = `https://environment.data.gov.uk/flood-monitoring/id/stations/${stationId}/readings?dateFrom=${past24Hours}`;
    const url = proxyUrl + encodeURIComponent(apiUrl); // Add proxy to bypass CORS

    console.log("Fetching data from:", url); // Debugging

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Fetched data:", data);

        if (!data.items || data.items.length === 0) {
            alert("No data available for the last 24 hours.");
            return;
        }

        updateChart(data.items);
        updateTable(data.items);

    } catch (error) {
        console.error("Error fetching station data:", error);
        alert("There was an error fetching the data.");
    }
}

// Update Chart with Data
function updateChart(data) {
    const timestamps = data.map(item => new Date(item.dateTime).toLocaleString());
    const levels = data.map(item => item.value);

    if (stationChart) stationChart.destroy(); // Destroy existing chart

    stationChart = new Chart(chartCanvas, {
        type: "line",
        data: {
            labels: timestamps,
            datasets: [{
                label: "Water Level (m)",
                data: levels,
                borderColor: "blue",
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Water Level (m)" } }
            }
        }
    });
}

// Update Table with Data
function updateTable(data) {
    tableBody.innerHTML = ""; // Clear existing table

    data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${new Date(item.dateTime).toLocaleString()}</td>
            <td>${item.value.toFixed(2)} m</td>
        `;
        tableBody.appendChild(row);
    });
}

// Event Listener for Station Selection
stationSelect.addEventListener("change", () => {
    const stationId = stationSelect.value;
    if (stationId) fetchStationData(stationId);
});

// Fetch Stations on Page Load
fetchStations();
