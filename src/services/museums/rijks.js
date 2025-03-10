export const fetchRijksArtworks = async (searchQuery = '*', page = 1, { sortBy = 'relevance', type = null } = {}) => {
    try {
        const resultsPerPage = 10;
        
        // Build query parameters
        const params = {
            key: '0fiuZFh4',
            imgonly: true,
            ps: resultsPerPage,  // page size
            p: page,            // page number
            s: sortBy,          // sort parameter (relevance, artist, chronologic, achronologic)
            q: searchQuery,     // search query
            culture: 'en',      // get English results
            language: 'en',     // language parameter
            toppieces: true     // get top pieces for better quality results
        };

        // Add type filter if specified
        if (type) {
            params.type = type; // painting, drawing, sculpture, etc.
        }
        
        const url = 'https://www.rijksmuseum.nl/api/en/collection?' + new URLSearchParams(params);
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.artObjects || !data.artObjects.length) {
            return {
                artworks: [],
                totalResults: 0,
                totalPages: 0
            };
        }

        const artworks = data.artObjects
            .filter(artwork => 
                artwork.webImage && 
                artwork.webImage.url && 
                artwork.title && 
                artwork.principalOrFirstMaker
            )
            .map(artwork => {
                // Check if title might not be in English (contains non-English characters or Dutch words)
                const dutchWords = ['van', 'de', 'het', 'een', 'en', 'met', 'door', 'op', 'voor'];
                const hasDutchWords = dutchWords.some(word => 
                    artwork.title.toLowerCase().split(' ').includes(word)
                );
                
                // If title contains Dutch words but also has English title in longTitle, extract it
                let title = artwork.title;
                if (hasDutchWords && artwork.longTitle) {
                    // Try to extract English title from longTitle if it's in format "Dutch Title, English Description"
                    const commaIndex = artwork.longTitle.indexOf(',');
                    if (commaIndex > 0) {
                        const possibleEnglishTitle = artwork.longTitle.substring(commaIndex + 1).trim();
                        // If the part after comma is substantially different and longer, use it
                        if (possibleEnglishTitle.length > 10 && !artwork.title.includes(possibleEnglishTitle)) {
                            title = possibleEnglishTitle;
                        }
                    }
                }
                
                return {
                    id: `rijks-${artwork.objectNumber}`,
                    title: title,
                    source: 'rijksmuseum',
                    image_url: artwork.webImage.url,
                    artist: artwork.principalOrFirstMaker,
                    year: artwork.longTitle,
                    type: artwork.objectTypes?.[0] || 'Unknown Type',
                    dating: artwork.dating?.sortingDate || null
                };
            });
            
        // Calculate total pages based on count from API
        const totalResults = data.count;
        const totalPages = Math.ceil(totalResults / resultsPerPage);
            
        return {
            artworks,
            totalResults,
            totalPages,
            currentPage: page
        };
    } catch (error) {
        console.error('Error fetching Rijksmuseum artworks:', error);
        return {
            artworks: [],
            totalResults: 0,
            totalPages: 0,
            currentPage: 1
        };
    }
}; 