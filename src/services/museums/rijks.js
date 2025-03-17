export const fetchRijksArtworks = async (searchQuery = '*', page = 1, { sortBy = 'relevance', type = null, resultsPerPage = 10 } = {}) => {
    try {
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

        if (type) {
            params.type = type; 
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
                const dutchWords = ['van', 'de', 'het', 'een', 'en', 'met', 'door', 'op', 'voor'];
                const hasDutchWords = dutchWords.some(word => 
                    artwork.title.toLowerCase().split(' ').includes(word)
                );
                
                let title = artwork.title;
                if (hasDutchWords && artwork.longTitle) {
                    const commaIndex = artwork.longTitle.indexOf(',');
                    if (commaIndex > 0) {
                        const possibleEnglishTitle = artwork.longTitle.substring(commaIndex + 1).trim();
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