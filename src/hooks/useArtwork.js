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

            if (options.museum === 'both' || options.museum === 'rijksmuseum') {
                rijksResult = await fetchRijksArtworks(searchQuery, page, options);
            }
            
            if (options.museum === 'both' || options.museum === 'harvard') {
                harvardResult = await fetchHarvardArtworks(searchQuery, page, options);
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
            const totalPages = Math.max(
                options.museum === 'both' ? rijksResult.totalPages : 0,
                options.museum === 'both' ? harvardResult.totalPages : 0,
                options.museum === 'rijksmuseum' ? rijksResult.totalPages : 0,
                options.museum === 'harvard' ? harvardResult.totalPages : 0
            );
            
            return {
                data: combinedArtworks,
                fullData: combinedArtworks,
                totalResults: totalResults,
                totalPages: totalPages,
                currentPage: page
            };
        }
    });
}


