export const fetchHarvardArtworks = async (searchQuery = '*', page = 1, { sortBy = 'relevance', type = null } = {}) => {
    try {
        const resultsPerPage = 10;
        const apiKey = import.meta.env.VITE_HARVARD_API_KEY;
        
        if (!apiKey) {
            throw new Error('Harvard API key is not configured');
        }

        // Build query parameters
        const params = {
            apikey: apiKey,
            size: resultsPerPage,
            page: page - 1, // Harvard API uses 0-based pagination
            fields: 'id,title,people,images,dated,classification,url,datebegin'
        };

        // Handle search query
        if (searchQuery && searchQuery !== '*') {
            params.q = searchQuery;
        }

        // Add sorting based on Rijksmuseum compatibility
        switch (sortBy) {
            case 'chronologic':
                params.sort = 'datebegin';
                params.sortorder = 'asc';
                break;
            case 'achronologic':
                params.sort = 'datebegin';
                params.sortorder = 'desc';
                break;
            default: // 'relevance'
                // Default Harvard sorting is by rank/score
                break;
        }

        // Add type filter if specified
        if (type) {
            const typeMap = {
                'painting': 'Paintings',
                'drawing': 'Drawings',
                'sculpture': 'Sculptures',
                'photograph': 'Photographs',
                'print': 'Prints'
            };
            if (typeMap[type]) {
                params.classification = typeMap[type];
            }
        }
        
        const url = 'https://api.harvardartmuseums.org/object?' + new URLSearchParams(params);
        console.log('Harvard API Request URL:', url, 'Page:', page);
        
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Harvard API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Harvard API Response Data:', {
            totalrecords: data.info?.totalrecords,
            records: data.records?.length,
            page: data.info?.page,
            pages: Math.ceil(data.info?.totalrecords / resultsPerPage)
        });

        if (!data.records || !data.records.length) {
            return {
                artworks: [],
                totalResults: data.info.totalrecords,
                totalPages: Math.ceil(data.info.totalrecords / resultsPerPage),
                currentPage: page
            };
        }

        // Map the artworks (only filter by title)
        const artworks = data.records
            .filter(artwork => artwork.title)
            .map(artwork => {
                // Get image URL if available, otherwise null
                let imageUrl = null;
                if (artwork.images && artwork.images.length > 0) {
                    // First try primaryimageurl if available
                    if (artwork.primaryimageurl) {
                        imageUrl = artwork.primaryimageurl;
                    } 
                    // Then try getting from images array
                    else {
                        const primaryImage = artwork.images.find(img => img.primarydisplay) || artwork.images[0];
                        
                        // Try IIIF service first
                        if (primaryImage.iiifbaseuri) {
                            imageUrl = `${primaryImage.iiifbaseuri}/full/full/0/default.jpg`;
                        }
                        // Fallback to base image URL
                        else if (primaryImage.baseimageurl) {
                            imageUrl = primaryImage.baseimageurl;
                        }
                    }

                    // If we have an image URL that's not IIIF, append size parameters
                    if (imageUrl && !imageUrl.includes('/full/full/0/default.jpg')) {
                        imageUrl += '?height=800&width=800';
                    }
                }
                
                // Get artist name from people array
                let artist = 'Unknown Artist';
                if (artwork.people && artwork.people.length > 0) {
                    artist = artwork.people[0].name;
                }

                // Format the year/date information
                let year = 'Date unknown';
                if (artwork.dated) {
                    year = artwork.dated;
                } else if (artwork.datebegin) {
                    year = `c. ${artwork.datebegin}`;
                }

                return {
                    id: `harvard-${artwork.id}`,
                    title: artwork.title,
                    source: 'harvard',
                    image_url: imageUrl,
                    artist: artist,
                    year: year,
                    type: artwork.classification || 'Unknown Type',
                    dating: artwork.datebegin || null
                };
            });

        // Use the API's total records and calculate pages
        const totalResults = data.info.totalrecords;
        const totalPages = Math.ceil(totalResults / resultsPerPage);
        
        console.log('Harvard API Final Results:', {
            artworksCount: artworks.length,
            totalResults,
            totalPages,
            currentPage: page
        });
            
        return {
            artworks,
            totalResults,
            totalPages,
            currentPage: page
        };
    } catch (error) {
        console.error('Error fetching Harvard artworks:', error);
        throw error;
    }
}; 