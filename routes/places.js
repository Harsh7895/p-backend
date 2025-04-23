const router = require('express').Router();
const axios = require('axios');

const API_KEY = "AIzaSyCRNCjEZpQqJUWV1NVj_V1-JDnqRl0qekU";

// Search doctors by location and specialty (improved: queries each disease separately and aggregates results)
router.get('/search-doctors', async (req, res) => {
    try {
        let { lat, lng, disease } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                message: 'Missing required parameters: lat and lng are required'
            });
        }

        // Ensure disease is always an array if provided
        if (disease && !Array.isArray(disease)) {
            if (typeof disease === 'string') {
                disease = disease.split(',').map(d => d.trim());
            } else {
                disease = [disease];
            }
        }

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
        let radius = 5000;
        const maxRadius = 20000; // 20km max
        let allPlaces = [];
        let found = false;

        while (radius <= maxRadius && !found) {
            let placesMap = new Map();
            if (disease && disease.length > 0) {
                for (const d of disease) {
                    const params = {
                        location: `${lat},${lng}`,
                        radius,
                        key: API_KEY,
                        type: 'doctor',
                        keyword: d
                    };
                    const response = await axios.get(url, { params });
                    const results = response.data.results || [];
                    for (const place of results) {
                        // Use place_id as unique key
                        if (!placesMap.has(place.place_id)) {
                            place.matchDiseases = [d];
                            placesMap.set(place.place_id, place);
                        } else {
                            // Add to matched diseases
                            placesMap.get(place.place_id).matchDiseases.push(d);
                        }
                    }
                }
            } else {
                // If no disease provided, search for all medical facilities
                const params = {
                    location: `${lat},${lng}`,
                    radius,
                    key: API_KEY,
                    type: ['doctor', 'hospital', 'health'],
                    keyword: 'medical|clinic|hospital|doctor'
                };
                const response = await axios.get(url, { params });
                const results = response.data.results || [];
                for (const place of results) {
                    placesMap.set(place.place_id, place);
                }
            }
            allPlaces = Array.from(placesMap.values());
            if (allPlaces.length > 0) {
                found = true;
            } else {
                radius += 5000;
            }
        }

        // If disease is provided, sort by number of matched diseases
        if (disease && disease.length > 0 && allPlaces.length > 0) {
            allPlaces = allPlaces.map(place => ({
                ...place,
                matchScore: place.matchDiseases ? place.matchDiseases.length : 0
            })).sort((a, b) => b.matchScore - a.matchScore);
        }

        // Extract relevant information from each place
        const formattedPlaces = (allPlaces || []).map(place => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            location: place.geometry.location,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            openNow: place.opening_hours?.open_now,
            photos: place.photos?.map(photo => ({
                photoReference: photo.photo_reference,
                photoUrl: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`
            })),
            placeTypes: place.types,
            icon: place.icon,
            businessStatus: place.business_status,
            matchDiseases: place.matchDiseases,
            matchScore: place.matchScore
        }));

        res.json({
            message: disease && disease.length > 0 ? 
                `Successfully fetched doctors for ${disease.join(', ')}` : 
                'Successfully fetched all medical facilities',
            results: formattedPlaces,
            totalResults: formattedPlaces.length,
            radiusUsed: radius
        });

    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({
            message: 'Error fetching places',
            error: error.message
        });
    }
});

// Get detailed information about a specific place
router.get('/place-details/:placeId', async (req, res) => {
    try {
        const { placeId } = req.params;

        if (!placeId) {
            return res.status(400).json({
                message: 'Place ID is required'
            });
        }

        const url = 'https://maps.googleapis.com/maps/api/place/details/json';
         
        const response = await axios.get(url, {
            params: {
                place_id: placeId,
                key: API_KEY,
                fields: 'name,formatted_address,formatted_phone_number,opening_hours,website,rating,reviews,photos,user_ratings_total,takeout,reservable,price_level,editorial_summary,wheelchair_accessible_entrance,address_components,adr_address,current_opening_hours,icon,icon_mask_base_uri,icon_background_color,geometry,place_id,types'
            }
        });

        const place = response.data.result;
        
        // Format the response with all fields requested in the API call
        const formattedPlace = {
            placeId: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phoneNumber: place.formatted_phone_number,
            openingHours: place.opening_hours?.weekday_text,
            currentOpeningHours: place.current_opening_hours,
            website: place.website,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            takeout: place.takeout,
            reservable: place.reservable,
            priceLevel: place.price_level,
            editorialSummary: place.editorial_summary,
            wheelchairAccessibleEntrance: place.wheelchair_accessible_entrance,
            addressComponents: place.address_components,
            adrAddress: place.adr_address,
            icon: place.icon,
            iconMaskBaseUri: place.icon_mask_base_uri,
            iconBackgroundColor: place.icon_background_color,
            geometry: place.geometry,
            types: place.types,
            photos: place.photos?.map(photo => ({
                photoReference: photo.photo_reference,
                photoUrl: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`
            })),
            reviews: place.reviews?.map(review => ({
                authorName: review.author_name,
                rating: review.rating,
                profilePhotoUrl: review.profile_photo_url,
                text: review.text,
                time: review.time,
                relativeTime: review.relative_time_description
            }))
        };

        res.json({
            message: 'Successfully fetched place details',
            place: formattedPlace
        });

    } catch (error) {
        console.error('Error fetching place details:', error);
        res.status(500).json({
            message: 'Error fetching place details',
            error: error.message
        });
    }
});

module.exports = router;
