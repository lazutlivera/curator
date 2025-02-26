export const fetchMetArtworks = async (searchQuery = '') => {
    try {
        const searchTerm = searchQuery.trim() || 'painting';
        const response = await fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${searchTerm}`
        );
        const data = await response.json();
        
        const promises = data.objectIDs.slice(0, 50).map(id => 
            fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
                .then(res => res.json())
                .then(artwork => artwork.primaryImage ? artwork : null)
                .catch(() => null)
        );

        const artworks = await Promise.all(promises);
        
        return artworks
            .filter(artwork => artwork !== null)
            .map(artwork => ({
                id: `met-${artwork.objectID}`,
                title: artwork.title || 'Untitled',
                source: 'met',
                image_url: artwork.primaryImage,
                artist: artwork.artistDisplayName,
                year: artwork.period
            }));
    } catch (error) {
        console.error('Error fetching Met artworks:', error);
        return [];
    }
}; 