import { useQuery } from "@tanstack/react-query";
import { fetchRijksArtworks } from "../services/museums/rijks";
import { fetchMetArtworks } from "../services/museums/met";

export function useArtwork(searchQuery = '') {
    return useQuery({
        queryKey: ["artworks", searchQuery],
        queryFn: async () => {
            const [rijksArtworks, metArtworks] = await Promise.allSettled([
                fetchRijksArtworks(searchQuery),
                fetchMetArtworks(searchQuery)
            ]);

            const allArtworks = [
                ...(rijksArtworks.status === 'fulfilled' ? rijksArtworks.value : []),
                ...(metArtworks.status === 'fulfilled' ? metArtworks.value : [])
            ];

            if (allArtworks.length === 0) {
                throw new Error('No artworks could be fetched from either source');
            }

            // If no search query, show random selection
            if (!searchQuery.trim()) {
                const initialDisplay = [...allArtworks]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 10);

                return {
                    data: initialDisplay,
                    fullData: allArtworks
                };
            }

            // If searching, return all results
            return {
                data: allArtworks,
                fullData: allArtworks
            };
        }
    });
}


