// Fetch the list of available flood monitoring stations
fetch("https://environment.data.gov.uk/flood-monitoring/id/stations")
  .then(response => {
    if (!response.ok) throw new Error("Network response was not OK");
    return response.json();
  })
  .then(data => {
    const stationSelect = document.getElementById("station-select");

    if (!data.items || data.items.length === 0) {
      stationSelect.innerHTML = '<option value="">No stations available</option>';
      console.error("No stations found in API response.");
      return;
    }

    stationSelect.innerHTML = '<option value="">Select a station</option>'; // Reset dropdown
    data.items.forEach(station => {
      let option = document.createElement("option");
      option.value = station.stationReference;
      option.textContent = station.label;
      stationSelect.appendChild(option);
    });

    console.log("Stations loaded successfully.");
  })
  .catch(error => {
    console.error("Error fetching stations:", error);
    document.getElementById("station-select").innerHTML = '<option value="">Error loading stations</option>';
  });

// Event listener when user selects a station
document.getElementById("station-select").addEventListener("change", function() {
  const stationId = this.value;
  if (!stationId) return;

  const now = new Date();
  const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
  const formattedYesterday = yesterday.toISOString(); // Convert to API-friendly format

  fetch(`https://environment.data.gov.uk/flood-monitoring/id/stations/${stationId}/readings?dateFrom=${formattedYesterday}`)
    .then(response => {
      if (!response.ok) throw new Error("Network response was not OK");
      return response.json();
    })
    .then(data => {
      console.log("API Data:", data); // Debugging - check if data is coming in

      let readings = data.items;

      if (!readings || readings.length === 0) {
          alert("No data found for this station in the last 24 hours.");
          return;
      }

      // Sort readings by time (sometimes API returns unordered data)
      readings.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

      const timestamps = readings.map(item => new Date(item.dateTime).toLocaleString());
      const levels = readings.map(item => item.value);

      updateChart(timestamps, levels);
      updateTable(readings);
    })
    .catch(error => {
      console.error("Error fetching station data:", error);
      alert("There was an error fetching the data.");
    });
});

// Function to update the chart
function updateChart(timestamps, levels) {
  const chartCanvas = document.getElementById("station-chart").getContext("2d");

  if (window.myChart) {
      window.myChart.destroy();
  }

  window.myChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: [{
        label: 'Flood Level (m)',
        data: levels,
        fill: false,
        borderColor: 'blue',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: { 
            title: { display: true, text: 'Time' },
            type: 'time', // Auto-adjusts X-axis for time data
            time: { unit: 'hour' }
        },
        y: { 
            title: { display: true, text: 'Flood Level (m)' }, 
            beginAtZero: false 
        }
      }
    }
  });
}

// Function to update the table
function updateTable(readings) {
  const tableBody = document.querySelector("#station-table tbody");
  tableBody.innerHTML = ""; // Clear old data

  readings.forEach(reading => {
    const row = document.createElement("tr");

    const timestampCell = document.createElement("td");
    timestampCell.textContent = new Date(reading.dateTime).toLocaleString();

    const levelCell = document.createElement("td");
    levelCell.textContent = reading.value;

    row.appendChild(timestampCell);
    row.appendChild(levelCell);
    tableBody.appendChild(row);
  });
}
