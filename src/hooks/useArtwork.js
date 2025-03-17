import { useQuery } from "@tanstack/react-query";
import { fetchRijksArtworks } from "../services/museums/rijks";
import { fetchHarvardArtworks } from "../services/museums/harvard";

export function useArtwork(searchQuery = '', page = 1, options = {}) {
    return useQuery({
        queryKey: ["artworks", searchQuery, page, options.sortBy, options.type, options.museum],
        queryFn: async () => {
            if (!searchQuery.trim()) {
                return {
                    data: [],
                    fullData: [],
                    totalResults: 0,
                    totalPages: 0
                };
            }

            
            let rijksResult = { artworks: [], totalResults: 0, totalPages: 0 };
            let harvardResult = { artworks: [], totalResults: 0, totalPages: 0 };

            
            const perMuseumLimit = options.museum === 'both' ? 5 : 10;

            if (options.museum === 'both' || options.museum === 'rijksmuseum') {
                rijksResult = await fetchRijksArtworks(searchQuery, page, {
                    ...options,
                    resultsPerPage: perMuseumLimit
                });
            }
            
            if (options.museum === 'both' || options.museum === 'harvard') {
                harvardResult = await fetchHarvardArtworks(searchQuery, page, {
                    ...options,
                    resultsPerPage: perMuseumLimit
                });
            }
            
            
            const combinedArtworks = [
                ...rijksResult.artworks,
                ...harvardResult.artworks
            ];

            
            if (options.sortBy) {
                combinedArtworks.sort((a, b) => {
                    switch (options.sortBy) {
                        case 'chronologic':
                            return (a.dating || 0) - (b.dating || 0);
                        case 'achronologic':
                            return (b.dating || 0) - (a.dating || 0);
                        case 'artist':
                            return a.artist.localeCompare(b.artist);
                        default: 
                            return 0;
                    }
                });
            }

            
            const totalResults = rijksResult.totalResults + harvardResult.totalResults;
            const totalPages = Math.ceil(totalResults / 10); 
            
            return {
                data: combinedArtworks.slice(0, 10), 
                fullData: combinedArtworks,
                totalResults: totalResults,
                totalPages: totalPages,
                currentPage: page
            };
        }
    });
}


