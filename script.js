document.addEventListener('DOMContentLoaded', () => {
    // Google Sheets API details
    const SHEET_ID = '15DWgul-u3bOtXjon6XBbFCdlp2ob1kXUTvTzwBtDVdE'; // Spreadsheet ID
    const API_KEY = 'AIzaSyAnEf_pAeiErcSndX6O9Z3gUFcnegCgj9E'; // API key for authentication
    const RANGE = 'Sheet1!A2:K100'; // The range of data to fetch (columns A to K, rows 2 to 100)

    // Construct the API URL to fetch data from the Google Sheets
    const SHEET_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    // Fetch data from the Google Sheets API
    fetch(SHEET_API_URL)
        .then(response => {
            // Check if the response is okay (status 200)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse response as JSON
        })
        .then(data => {
            const rows = data.values; // Extract the rows from the data
            if (!rows || rows.length === 0) {
                throw new Error('No data found in the specified range.');
            }
            const headers = rows[0]; // First row contains headers (column names)
            
            // Convert the remaining rows into an array of objects, checking for essential fields
            const jsonData = rows.slice(1).map(row => {
                const obj = {};
                row.forEach((value, index) => {
                    const cleanValue = value.trim(); // Clean each value
                    obj[headers[index]] = cleanValue;
                });
                if (!obj['Image URL']) {
                    console.warn('Skipping item due to missing Image URL:', obj);
                    return null; // Skip items with missing image URLs
                }
                return obj;
            }).filter(item => item !== null); // Filter out null items

            console.log('Parsed JSON Data:', jsonData);
            renderData(jsonData);
        })
        .catch(error => console.error('Error fetching data:', error));

    /**
     * Function to render the fetched data as selectable content
     */
    function renderData(data) {
        const interactiveContainer = document.querySelector('.interactive-container');
        if (!interactiveContainer) {
            console.error('Interactive container not found in the HTML.');
            return;
        }

        // Clear previous content
        interactiveContainer.innerHTML = '';

        data.forEach(item => {
            const { 'Title/Name': titleName, 'Date/Year': dateYear, 'Author': author, 'Image URL': imageUrl } = item;

            const container = document.createElement('div');
            container.className = 'image-container';

            container.setAttribute('data-name', titleName || 'Unknown');
            container.setAttribute('data-title', titleName || 'Untitled');
            container.setAttribute('data-year', dateYear || 'Unknown');
            container.setAttribute('data-description', author || 'No description available.');

            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = titleName || 'Image';
            img.onerror = () => {
                img.src = 'https://via.placeholder.com/150';
            };

            container.appendChild(img);
            interactiveContainer.appendChild(container);
        });

        interactiveContainer.addEventListener('click', event => {
            const container = event.target.closest('.image-container');
            if (container) {
                displayCenterInfo(container);
            }
        });
    }

    /**
     * Function to display detailed information in the center display area
     */
    function displayCenterInfo(container) {
        const centerImage = document.getElementById('center-image');
        const centerName = document.getElementById('center-name');
        const centerTitle = document.getElementById('center-title');
        const centerYear = document.getElementById('center-year');
        const centerBody = document.getElementById('center-body');
        const centerDisplay = document.querySelector('.center-display');

        centerImage.src = container.querySelector('img').src;
        centerName.textContent = container.getAttribute('data-name');
        centerTitle.textContent = container.getAttribute('data-title');
        centerYear.textContent = container.getAttribute('data-year');
        centerBody.textContent = container.getAttribute('data-description');

        centerDisplay.style.display = 'flex';

        // Add event listener to close the modal when clicking outside of the content
        centerDisplay.addEventListener('click', (event) => {
            if (event.target === centerDisplay) {
                centerDisplay.style.display = 'none';
            }
        });
    }
});