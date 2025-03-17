import SearchSuggestions from '../components/SearchSuggestions';

const SearchPage = () => {
    

    const handleSuggestionClick = (term) => {
        setSearchQuery(term);
        handleSearch(term);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
                    Art Explorer
                </h1>
                
             
                <div className="mb-8">
                 
                </div>

            
                {!isLoading && !error && artworks.length === 0 && !searchQuery && (
                    <SearchSuggestions onSuggestionClick={handleSuggestionClick} />
                )}
            </div>
        </div>
    );
};

export default SearchPage; 