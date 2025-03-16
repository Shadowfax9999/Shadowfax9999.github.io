// Function to fetch data from the selected station
async function fetchStationData(stationId) {
    try {
        // Get the current date and subtract 24 hours to get data from the last 24 hours
        const dateFrom = new Date();
        dateFrom.setHours(dateFrom.getHours() - 24);  // Subtract 24 hours
        const apiUrl = `https://environment.data.gov.uk/flood-monitoring/id/stations/${stationId}/readings?dateFrom=${dateFrom.toISOString()}`;
        
        console.log("Fetching data from API:", apiUrl);  // Debugging the URL

        const response = await fetch(apiUrl);
        
        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON data from the API response
        const data = await response.json();
        
        // Check if data is available
        if (data && data.items && data.items.length > 0) {
            displayData(data.items);  // Call the function to display data (like a graph and table)
        } else {
            throw new Error("No data found for the selected station in the last 24 hours.");
        }
    } catch (error) {
        console.error("Error fetching station data:", error);
        alert("There was an error fetching the data. Trying to fetch the latest data instead.");
        
        // Fallback: fetch the current data in case of an error (e.g., CORS issue or no data for 24 hours)
        fetchCurrentData(stationId);
    }
}

// Function to fetch just the current data
async function fetchCurrentData(stationId) {
    try {
        const apiUrl = `https://environment.data.gov.uk/flood-monitoring/id/stations/${stationId}/readings`;
        
        console.log("Fetching current data from API:", apiUrl);  // Debugging the URL

        const response = await fetch(apiUrl);
        
        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON data from the API response
        const data = await response.json();
        
        // Check if data is available
        if (data && data.items && data.items.length > 0) {
            displayData(data.items);  // Call the function to display data (like a graph and table)
        } else {
            throw new Error("No data found for the selected station.");
        }
    } catch (error) {
        console.error("Error fetching current data:", error);
        alert("There was an error fetching the current data.");
    }
}

// Function to display data on the page (e.g., table and graph)
function displayData(items) {
    // Example code to display data (this could be customized further to show graphs and tables)
    const dataTable = document.getElementById("data-table");
    dataTable.innerHTML = ''; // Clear the previous data

    items.forEach(item => {
        const row = dataTable.insertRow();
        const timeCell = row.insertCell(0);
        const valueCell = row.insertCell(1);
        timeCell.textContent = new Date(item.dateTime).toLocaleString(); // Format the date-time
        valueCell.textContent = item.value; // Assume the reading is in the "value" property
    });

    // Optionally, create a graph (e.g., using Chart.js) based on the data
    const chartData = {
        labels: items.map(item => new Date(item.dateTime).toLocaleString()), // Date-time labels
        datasets: [{
            label: 'Flood Reading',
            data: items.map(item => item.value), // Data points
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: chartData,
    });
}

// Example function call (assuming you have a stationId)
fetchStationData('531118');  // Replace with your station ID
