// DOM Elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");

// Initialize Leaflet map
let map;
try {
    map = L.map("map").setView([20, 0], 2);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    console.log("Map initialized successfully");
} catch (error) {
    console.error("Error initializing map:", error);
    // Create an error message element
    const mapError = document.createElement("div");
    mapError.className = "alert alert-danger";
    mapError.textContent = "Error loading map. Please refresh the page.";
    document.getElementById("map").appendChild(mapError);
}

let markersLayer = map ? L.layerGroup().addTo(map) : null;

async function fetchSearch(query = "") {
    try {
        console.log("Fetching search with query:", query);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        console.log("Search response status:", res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Search results:", data);
        return data;
    } catch (error) {
        console.error("Error in fetchSearch:", error);
        throw error;
    }
}

function createCard(person) {
    try {
        console.log("Creating card for person:", person);
        const col = document.createElement("div");
        col.className = "col-sm-6";
        col.innerHTML = `
            <div class="card h-100 text-center">
                <div class="row g-0 h-100">
                    <div class="col-4">
                        <img src="${person.photo}" class="img-fluid rounded-start" alt="${person.name}" 
                            onerror="this.src='https://via.placeholder.com/150?text=No+Image'"/>
                    </div>
                    <div class="col-8 d-flex flex-column justify-content-center p-2">
                        <h5 class="card-title mb-1">${person.name}</h5>
                        <p class="small mb-1"><i class="bi bi-telephone"></i> ${person.phone || "N/A"}</p>
                        <p class="small mb-0"><i class="bi bi-envelope"></i> ${person.email || "N/A"}</p>
                    </div>
                </div>
            </div>`;
        return col;
    } catch (error) {
        console.error("Error creating card:", error);
        return null;
    }
}

function renderResults(list) {
    try {
        console.log("Rendering results:", list);
        resultsContainer.innerHTML = "";
        if (markersLayer) {
            markersLayer.clearLayers();
        }

        if (!Array.isArray(list) || list.length === 0) {
            resultsContainer.innerHTML = `<p class="text-muted">No results found.</p>`;
            return;
        }

        list.forEach((p) => {
            const card = createCard(p);
            if (card) {
                resultsContainer.appendChild(card);
                if (map && markersLayer && p.lat && p.lon) {
                    const marker = L.marker([p.lat, p.lon])
                        .bindPopup(`<strong>${p.name}</strong>`);
                    markersLayer.addLayer(marker);
                }
            }
        });

        // Fit map to markers
        if (map && markersLayer && markersLayer.getLayers().length > 0) {
            const group = new L.featureGroup(markersLayer.getLayers());
            map.fitBounds(group.getBounds().pad(0.2));
        }
    } catch (error) {
        console.error("Error rendering results:", error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                Error displaying results. Please try again.
            </div>`;
    }
}

// Initial load: load all people
console.log("Starting initial data load");
fetchSearch()
    .then(renderResults)
    .catch(error => {
        console.error("Error during initial load:", error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                Error loading initial data. Please refresh the page.
            </div>`;
    });

searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    console.log("Search form submitted with query:", query);
    
    try {
        resultsContainer.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>`;
            
        const data = await fetchSearch(query);
        renderResults(data);
    } catch (error) {
        console.error("Error during search:", error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                Error performing search. Please try again.
            </div>`;
    }
}); 