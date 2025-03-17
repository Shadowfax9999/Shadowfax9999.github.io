$(document).ready(function() {
  $('#station-select').select2({
      placeholder: 'Select a station',
      allowClear: true
  });

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

  // Event listener for station selection
  $('#station-select').on("change", function() {
      const stationId = $(this).val();
      if (!stationId) return;

      // Fetch 24 hours of data
      fetch(`https://environment.data.gov.uk/flood-monitoring/id/stations/${stationId}/readings?_sorted&_limit=100`)
      .then(response => response.json())
      .then(data => {
          const readings = data.items.filter(reading => {
              const now = new Date();
              const readingTime = new Date(reading.dateTime);
              return now - readingTime <= 24 * 60 * 60 * 1000; // Only last 24 hours
          });

          if (readings.length > 0) {
              const timestamps = readings.map(item => new Date(item.dateTime).toLocaleTimeString());
              const levels = readings.map(item => item.value);

              updateChart(timestamps, levels);
              updateTable(readings);
          } else {
              alert("No data found for this station in the last 24 hours.");
          }
      })
      .catch(error => {
          console.error("Error fetching station data:", error);
          alert("There was an error fetching the data.");
      });
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
              y: { title: { display: true, text: 'Flood Level (m)' }, beginAtZero: false }
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
