// Fetch the list of available flood monitoring stations
fetch("https://environment.data.gov.uk/flood-monitoring/id/stations")
  .then(response => response.json())
  .then(data => {
    const stationSelect = document.getElementById("station-select");
    stationSelect.innerHTML = '<option value="">Select a station</option>'; // Reset dropdown

    data.items.forEach(station => {
      let option = document.createElement("option");
      option.value = station.stationReference;
      option.textContent = station.label;
      stationSelect.appendChild(option);
    });
  })
  .catch(error => console.error("Error fetching stations:", error));

// When user selects a station, fetch the latest readings
document.getElementById("station-select").addEventListener("change", function() {
  const stationId = this.value;
  if (!stationId) return;

  fetch(`https://environment.data.gov.uk/flood-monitoring/id/stations/${stationId}/readings?latest=1000`)
    .then(response => response.json())
    .then(data => {
      // Filter data for the past 24 hours
      const now = new Date();
      const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000); // 24 hours in milliseconds

      const filteredReadings = data.items.filter(item => {
        const itemDate = new Date(item.dateTime);
        return itemDate >= twentyFourHoursAgo; // Keep only readings within the last 24 hours
      });

      console.log("Filtered Readings:", filteredReadings);  // Logs filtered readings from the last 24 hours
      console.log("Number of Readings in Last 24 Hours:", filteredReadings.length);  // Logs how many readings are in the last 24 hours

      if (filteredReadings.length > 0) {
        const timestamps = filteredReadings.map(item => new Date(item.dateTime).toLocaleString());
        const levels = filteredReadings.map(item => item.value);

        updateChart(timestamps, levels);
        updateTable(filteredReadings);
      } else {
        alert("No data found for the past 24 hours.");
      }
    })
    .catch(error => {
      console.error("Error fetching station data:", error);
      alert("There was an error fetching the data.");
    });
});

// Function to update the chart
function updateChart(timestamps, levels) {
  const chartCanvas = document.getElementById("station-chart").getContext("2d");

  // Destroy the old chart if it exists
  if (window.myChart) {
    window.myChart.destroy();
  }

  // Create a new chart
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
        x: { title: { display: true, text: 'Time' }},
        y: { title: { display: true, text: 'Flood Level (m)' }, beginAtZero: true }
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
