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

            // Determine which APIs to fetch from based on museum selection
            let rijksResult = { artworks: [], totalResults: 0, totalPages: 0 };
            let harvardResult = { artworks: [], totalResults: 0, totalPages: 0 };

            // For 'both' museums, split the request to get 5 from each
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
            
            // Combine artworks from selected sources
            const combinedArtworks = [
                ...rijksResult.artworks,
                ...harvardResult.artworks
            ];

            // Sort combined results if needed
            if (options.sortBy) {
                combinedArtworks.sort((a, b) => {
                    switch (options.sortBy) {
                        case 'chronologic':
                            return (a.dating || 0) - (b.dating || 0);
                        case 'achronologic':
                            return (b.dating || 0) - (a.dating || 0);
                        case 'artist':
                            return a.artist.localeCompare(b.artist);
                        default: // 'relevance' - keep original order which is based on each API's relevance
                            return 0;
                    }
                });
            }

            // Calculate combined totals
            const totalResults = rijksResult.totalResults + harvardResult.totalResults;
            const totalPages = Math.ceil(totalResults / 10); // Always use 10 as total per page
            
            return {
                data: combinedArtworks.slice(0, 10), // Ensure we only return 10 results
                fullData: combinedArtworks,
                totalResults: totalResults,
                totalPages: totalPages,
                currentPage: page
            };
        }
    });
}


