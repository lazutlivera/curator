import { useQuery } from "@tanstack/react-query";
import { fetchRijksArtworks } from "../services/museums/rijks";

export function useArtwork(searchQuery = '', page = 1) {
    return useQuery({
        queryKey: ["artworks", searchQuery, page],
        queryFn: async () => {
            if (!searchQuery.trim()) {
                return {
                    data: [],
                    fullData: [],
                    totalResults: 0,
                    totalPages: 0
                };
            }

            const result = await fetchRijksArtworks(searchQuery, page);
            
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


