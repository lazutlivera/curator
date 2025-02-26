export const fetchRijksArtworks = async (searchQuery = '*') => {
    try {
        const response = await fetch(
            'https://www.rijksmuseum.nl/api/en/collection?' +
            new URLSearchParams({
                key: 'yW6uq3BV',
                imgonly: true,
                ps: 50,          // page size
                p: 1,           // page number
                s: 'relevance', // sort by relevance
                q: searchQuery,  // Use the search query
                type: 'schilderij', // Dutch word for painting
                culture: 'en',   // get English results
                langauge: 'en'  // Added explicit language parameter
            })
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Rijksmuseum response:', data);

        if (!data.artObjects || !data.artObjects.length) {
            console.warn('No artworks found in Rijksmuseum response');
            return [];
        }

        const artworks = data.artObjects
            .filter(artwork => artwork.webImage && artwork.webImage.url)
            .map(artwork => ({
                id: `rijks-${artwork.objectNumber}`,
                title: artwork.title || 'Untitled',
                source: 'rijksmuseum',
                image_url: artwork.webImage.url,
                artist: artwork.principalOrFirstMaker,
                year: artwork.longTitle
            }));

        console.log('Processed Rijksmuseum artworks:', artworks);
        return artworks;
    } catch (error) {
        console.error('Error fetching Rijksmuseum artworks:', error);
        return [];
    }
}; 