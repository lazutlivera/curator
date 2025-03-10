import { useQuery } from "@tanstack/react-query";
import { fetchRijksArtworks } from "../services/museums/rijks";

export function useArtwork(searchQuery = '', page = 1, options = {}) {
    return useQuery({
        queryKey: ["artworks", searchQuery, page, options.sortBy, options.type],
        queryFn: async () => {
            if (!searchQuery.trim()) {
                return {
                    data: [],
                    fullData: [],
                    totalResults: 0,
                    totalPages: 0
                };
            }

            const result = await fetchRijksArtworks(searchQuery, page, options);
            
            return {
                data: result.artworks,
                fullData: result.artworks,
                totalResults: result.totalResults,
                totalPages: result.totalPages,
                currentPage: result.currentPage
            };
        }
    });
}


