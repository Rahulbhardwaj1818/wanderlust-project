(function() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        return;
    }

    const mapData = window.mapData;

    if (!mapData) {
        console.error('Map data not found in window.mapData');
        return;
    }

    const mapToken = mapData.token;

    if (!mapToken || mapToken === 'null' || mapToken === '' || mapToken === 'undefined') {
        console.error('Map token not found');
        return;
    }

    mapboxgl.accessToken = mapToken;

    if (mapData.coordinates) {
        // Single listing map
        const coordinates = mapData.coordinates;
        const listingLocation = mapData.location;

        if (!coordinates || coordinates.length !== 2) {
            console.error('Invalid coordinates');
            return;
        }

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: coordinates,
            zoom: 9,
        });

        const marker = new mapboxgl.Marker({ color: "red" })
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<h4>${listingLocation}</h4><p>EXACT Location provided after booking</p>`))
            .addTo(map);
    } else if (mapData.listings) {
        // Multiple listings map
        const listings = mapData.listings;

        if (!listings || listings.length === 0) {
            console.error('No listings found');
            return;
        }

        const validListings = listings.filter(listing => listing.geometry && listing.geometry.coordinates);
        if (validListings.length === 0) {
            console.error('No listings with valid geometry found');
            return;
        }

        let totalLng = 0;
        let totalLat = 0;
        validListings.forEach(listing => {
            totalLng += listing.geometry.coordinates[0];
            totalLat += listing.geometry.coordinates[1];
        });

        const centerLng = totalLng / validListings.length;
        const centerLat = totalLat / validListings.length;

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [centerLng, centerLat],
            zoom: 5,
        });

        listings.forEach(listing => {
            if (listing.geometry && listing.geometry.coordinates) {
                const marker = new mapboxgl.Marker({ color: "red" })
                    .setLngLat(listing.geometry.coordinates)
                    .setPopup(new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`<h4>${listing.title}</h4><p>${listing.location}</p><a href="/listings/${listing._id}">View Details</a>`))
                    .addTo(map);
            }
        });
    }
})();