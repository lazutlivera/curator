import { useArtwork } from "./hooks/useArtwork";
import { useDebounce } from "./hooks/useDebounce";
import { useState } from "react";

function App() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500); // 500ms delay
  const { data, isLoading, error } = useArtwork(debouncedSearch);

  const artworksToDisplay = data?.data || [];

  if (isLoading) return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="text-xl text-gray-600 animate-pulse">Loading artworks...</div>
        <div className="text-sm text-gray-500">This might take a minute as we fetch all artworks</div>
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </main>
  );
  
  if (error) return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-xl text-red-600 bg-red-50 p-4 rounded-lg">
        Error: {error.message}
      </div>
    </main>
  );

  if (!data) return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-xl text-gray-600 bg-gray-50 p-4 rounded-lg">
        No artworks found
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="py-12 bg-white shadow-sm">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Exhibition Curation Platform
        </h1>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search artworks by title, artist, or year"
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput !== debouncedSearch && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
      </section>
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {artworksToDisplay.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No artworks found matching "{debouncedSearch}"
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworksToDisplay.map((artwork) => (
              artwork && artwork.image_url && (
                <article 
                  key={artwork.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <figure 
                    className="relative pt-[75%]"
                    style={artwork.thumbnail?.height && artwork.thumbnail?.width ? {
                      paddingTop: `${(artwork.thumbnail.height / artwork.thumbnail.width) * 100}%`
                    } : undefined}
                  >
                    <img 
                      src={artwork.image_url}
                      alt={artwork.title || 'Artwork'}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/800x600/e2e8f0/64748b?text=${encodeURIComponent('Artwork Not Available')}`;
                      }}
                    />
                  </figure>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2 hover:line-clamp-none">
                      {artwork.title}
                    </h2>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Source: {artwork.source}
                    </p>
                  </div>
                </article>
              )
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
