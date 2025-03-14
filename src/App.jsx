import { useState } from "react";
import { useArtwork } from "./hooks/useArtwork";
import SearchSuggestions from "./components/SearchSuggestions";

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedImage, setExpandedImage] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [artworkType, setArtworkType] = useState(null);
  const [selectedMuseum, setSelectedMuseum] = useState('both');
  
  const { data, isLoading, error } = useArtwork(activeSearch, currentPage, {
    sortBy,
    type: artworkType,
    museum: selectedMuseum
  });

  const handleSearch = () => {
    setActiveSearch(searchInput);
    setCurrentPage(1); // Reset to first page on new search
    setExpandedImage(null); // Reset expanded image
  };

  // Add handlers for filter and sort changes
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when sort changes
    setExpandedImage(null);
  };

  const handleTypeChange = (newType) => {
    setArtworkType(newType || null);
    setCurrentPage(1); // Reset to first page when type filter changes
    setExpandedImage(null);
  };

  const handleMuseumChange = (newMuseum) => {
    setSelectedMuseum(newMuseum);
    setCurrentPage(1); // Reset to first page when museum changes
    setExpandedImage(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setExpandedImage(null); // Reset expanded image when changing pages
  };

  const toggleExpandImage = (artworkId) => {
    if (expandedImage === artworkId) {
      setExpandedImage(null);
    } else {
      setExpandedImage(artworkId);
    }
  };

  const artworksToDisplay = data?.data || [];
  const totalPages = data?.totalPages || 0;
  const totalResults = data?.totalResults || 0;

  if (isLoading) return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-xl text-emerald-300 animate-pulse">Discovering masterpieces...</div>
        <div className="text-sm text-emerald-100/70">Exploring the collection</div>
        <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </main>
  );
  
  if (error) return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-xl text-red-400 bg-red-900/20 p-6 rounded-lg border border-red-800">
        {error.message}
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      {/* Subtle border frame */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-5">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 py-16 min-h-screen flex flex-col relative z-10">
        <div className="text-center mb-16 relative">
          {/* Subtle horizontal lines beside title */}
          <div className="absolute top-1/2 left-0 w-16 h-px bg-gradient-to-r from-transparent to-emerald-500/30 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-16 h-px bg-gradient-to-l from-transparent to-emerald-500/30 transform -translate-y-1/2"></div>
          
          <h1 className="text-6xl font-serif text-emerald-300 mb-4 tracking-tight">
            CuratorEx
          </h1>
          <p className="text-emerald-100/70 text-lg max-w-2xl mx-auto">
            Discover masterpieces from the Rijksmuseum and Harvard Art Museums through a curator's eye
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-16">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search for artworks, artists, or periods..."
              className="flex-1 p-6 text-lg bg-gray-800/50 border-2 border-emerald-800/50 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-100"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSearch}
              className="px-8 py-6 bg-emerald-700 text-emerald-100 rounded-full font-medium hover:bg-emerald-600 transition-colors duration-200 shadow-lg"
            >
              Search
            </button>
          </div>

          {/* Show search suggestions only when no active search */}
          {!activeSearch && !isLoading && (
            <SearchSuggestions 
              onSuggestionClick={(term) => {
                setSearchInput(term);
                setActiveSearch(term);
                setCurrentPage(1);
              }} 
            />
          )}
          
          {activeSearch && (
            <div className="flex flex-wrap gap-4 justify-center items-center p-4 bg-gray-800/30 rounded-xl border border-emerald-900/20">
              <div className="flex items-center gap-2">
                <label className="text-emerald-200">Museum:</label>
                <select
                  value={selectedMuseum}
                  onChange={(e) => handleMuseumChange(e.target.value)}
                  className="bg-gray-800 border border-emerald-900/30 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="both">Both Museums</option>
                  <option value="rijksmuseum">Rijksmuseum</option>
                  <option value="harvard">Harvard Art Museums</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-emerald-200">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-gray-800 border border-emerald-900/30 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="chronologic">Date (Oldest First)</option>
                  <option value="achronologic">Date (Newest First)</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-emerald-200">Type:</label>
                <select
                  value={artworkType || ''}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="bg-gray-800 border border-emerald-900/30 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Types</option>
                  <option value="painting">Paintings</option>
                  <option value="drawing">Drawings</option>
                  <option value="sculpture">Sculptures</option>
                  <option value="photograph">Photographs</option>
                  <option value="print">Prints</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {activeSearch && artworksToDisplay.length > 0 && (
          <>
            <div className="mb-8 text-emerald-300 font-serif text-xl pb-4 relative">
              <div className="divider absolute bottom-0 left-0 w-full"></div>
              Found {totalResults} results for "{activeSearch}"
            </div>
            
            <div className="flex flex-col gap-16 flex-grow mb-12 artwork-grid relative">
              {/* Background grid pattern */}
              <div className="absolute inset-0 bg-grid-pattern"></div>
              
              {artworksToDisplay.map((artwork, index) => (
                <article 
                  key={artwork.id}
                  className={`flex flex-col md:flex-row gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} relative`}
                >
                  {/* Vertical connector to next artwork */}
                  {index < artworksToDisplay.length - 1 && (
                    <div className="connector-vertical absolute left-1/2 -ml-px bottom-0 h-16 -mb-16"></div>
                  )}
                  
                  {/* Image Section */}
                  <div 
                    className={`relative overflow-hidden rounded-xl shadow-xl transition-all duration-500 cursor-pointer
                      ${expandedImage === artwork.id ? 'md:w-3/4' : 'md:w-1/2'}`}
                    onClick={() => toggleExpandImage(artwork.id)}
                  >
                    <div className={`relative ${expandedImage === artwork.id ? 'pt-[75%]' : 'pt-[100%]'} transition-all duration-500`}>
                      {artwork.image_url ? (
                        <img 
                          src={artwork.image_url}
                          alt={artwork.title || 'Artwork'}
                          className="artwork-image absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = `https://placehold.co/800x600/1f2937/4ade80?text=${encodeURIComponent('Artwork Not Available')}`;
                          }}
                        />
                      ) : (
                        <a 
                          href={`https://harvardartmuseums.org/collections/object/${artwork.id.replace('harvard-', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-gray-800 text-emerald-300 hover:text-emerald-200 transition-colors"
                        >
                          <div className="text-center p-4">
                            <p>Artwork is available on</p>
                            <p className="font-medium">Harvard Art Museums website →</p>
                          </div>
                        </a>
                      )}
                      <div className="absolute bottom-4 right-4 bg-emerald-900/80 text-emerald-100 text-xs px-3 py-1 rounded-full">
                        {expandedImage === artwork.id ? 'Click to shrink' : 'Click to expand'}
                      </div>
                    </div>
                    
                    {/* Corner accents */}
                    <div className="corner-accent corner-tl"></div>
                    <div className="corner-accent corner-tr"></div>
                    <div className="corner-accent corner-bl"></div>
                    <div className="corner-accent corner-br"></div>
                  </div>

                  {/* Info Card Section */}
                  <div className={`flex flex-col justify-center md:w-1/2 ${expandedImage === artwork.id ? 'md:w-1/4' : 'md:w-1/2'} transition-all duration-500`}>
                    <div className="info-card bg-gray-800/50 p-8 rounded-xl border border-emerald-900/30 shadow-lg h-full flex flex-col relative">
                      {/* Corner accents */}
                      <div className="corner-accent corner-tl rounded-tl-xl"></div>
                      <div className="corner-accent corner-tr rounded-tr-xl"></div>
                      <div className="corner-accent corner-bl rounded-bl-xl"></div>
                      <div className="corner-accent corner-br rounded-br-xl"></div>
                      
                      <h2 className="text-2xl font-serif text-emerald-200 mb-4 leading-tight">
                        {artwork.title}
                      </h2>
                      
                      <div className="mb-6 flex items-center">
                        <span className="text-emerald-400 font-medium">{artwork.artist || 'Unknown Artist'}</span>
                      </div>
                      
                      <p className="text-gray-400 mb-6 flex-grow">
                        {artwork.year}
                      </p>
                      
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-emerald-900/30">
                        <span className="uppercase tracking-wide text-xs text-emerald-500/80">{artwork.source}</span>
                        <a 
                          href={artwork.source === 'rijksmuseum' 
                            ? `https://www.rijksmuseum.nl/en/collection/${artwork.id.replace('rijks-', '')}`
                            : `https://harvardartmuseums.org/collections/object/${artwork.id.replace('harvard-', '')}`
                          } 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 text-sm"
                        >
                          View in museum →
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12 pb-8 relative">
                {/* Thin vertical connector to pagination */}
                <div className="absolute top-0 left-1/2 w-px h-8 -mt-8 bg-gradient-to-b from-transparent to-emerald-500/30"></div>
                
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-5 py-3 bg-gray-800 border-2 border-emerald-900/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-600 transition-colors duration-200 text-emerald-300"
                >
                  Previous
                </button>
                <span className="px-5 py-3 text-emerald-200 bg-gray-800/50 rounded-lg border border-emerald-900/30">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-5 py-3 bg-gray-800 border-2 border-emerald-900/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-600 transition-colors duration-200 text-emerald-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {activeSearch && artworksToDisplay.length === 0 && (
          <div className="text-center text-gray-400 mt-12 flex-grow flex items-center justify-center">
            <div className="info-card bg-gray-800/50 p-10 rounded-xl border border-emerald-900/30 shadow-lg relative">
              {/* Corner accents */}
              <div className="corner-accent corner-tl rounded-tl-xl"></div>
              <div className="corner-accent corner-tr rounded-tr-xl"></div>
              <div className="corner-accent corner-bl rounded-bl-xl"></div>
              <div className="corner-accent corner-br rounded-br-xl"></div>
              
              <p className="text-xl text-emerald-300 mb-2">No artworks found</p>
              <p className="text-emerald-100/50">Try different search terms or explore our collection</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
