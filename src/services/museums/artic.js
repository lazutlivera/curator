export const fetchArticArtworks = async () => {
    try {
        const response = await fetch(
            "https://api.artic.edu/api/v1/artworks?" + 
            new URLSearchParams({
                limit: 20,
                fields: "id,title,image_id",
                has_images: 1
            })
        );

        const data = await response.json();
        
        // Only return artworks that have valid image_ids
        return data.data
            .filter(artwork => artwork && artwork.image_id)
            .map(artwork => ({
                id: `artic-${artwork.id}`,
                title: artwork.title || 'Untitled',
                source: 'artic',
                // Use the correct image URL format
                image_url: `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
            }));
    } catch (error) {
        console.error('Error fetching Art Institute artworks:', error);
        return [];
    }
}; 