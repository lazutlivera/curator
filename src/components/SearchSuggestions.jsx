import React from 'react';
import { motion } from 'framer-motion';

const curatedSuggestions = {
    "Artistic Movements": [
        "Impressionism",
        "Baroque",
        "Renaissance",
        "Abstract",
        "Modernism"
    ],
    "Emotions & Moods": [
        "Melancholy",
        "Joy",
        "Serenity",
        "Drama",
        "Mystery"
    ],
    "Subjects & Themes": [
        "Portrait",
        "Landscape",
        "Still Life",
        "Mythology",
        "Nature"
    ],
    "Colors & Techniques": [
        "Gold",
        "Chiaroscuro",
        "Watercolor",
        "Vibrant",
        "Monochrome"
    ]
};

const SearchSuggestions = ({ onSuggestionClick }) => {
    return (
        <div className="my-12">
            <h2 className="text-2xl font-serif text-emerald-300 mb-8 text-center">
                Curator's Suggestions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(curatedSuggestions).map(([category, terms]) => (
                    <div 
                        key={category}
                        className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-emerald-900/30 relative"
                    >
                      
                        <div className="corner-accent corner-tl"></div>
                        <div className="corner-accent corner-tr"></div>
                        <div className="corner-accent corner-bl"></div>
                        <div className="corner-accent corner-br"></div>
                        
                        <h3 className="text-lg font-medium mb-4 text-emerald-200">
                            {category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {terms.map((term) => (
                                <motion.button
                                    key={term}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onSuggestionClick(term)}
                                    className="px-3 py-1 text-sm bg-gray-700/50 
                                             text-emerald-300 rounded-full 
                                             hover:bg-emerald-900/30 
                                             transition-colors duration-200
                                             border border-emerald-800/30"
                                >
                                    {term}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchSuggestions; 