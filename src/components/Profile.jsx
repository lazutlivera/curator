import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Profile({ session }) {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCollections()
  }, [session])

  async function fetchCollections() {
    try {
      setLoading(true)
      
      // First, get all collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('id, name, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (collectionsError) throw collectionsError

      // Then, for each collection, get its artworks
      const collectionsWithArtworks = await Promise.all(
        collectionsData.map(async (collection) => {
          const { data: artworksData, error: artworksError } = await supabase
            .from('collection_artworks')
            .select('artwork_data')
            .eq('collection_id', collection.id)

          if (artworksError) throw artworksError

          return {
            ...collection,
            artworks: artworksData.map(item => item.artwork_data)
          }
        })
      )

      setCollections(collectionsWithArtworks)
    } catch (error) {
      console.error('Error fetching collections:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* User Info Section */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-emerald-900/30">
        <div className="flex items-center gap-4">
          {session.user.user_metadata?.avatar_url ? (
            <img
              src={session.user.user_metadata.avatar_url}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-emerald-500/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center text-2xl text-white">
              {session.user.email?.[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-emerald-300">
              {session.user.user_metadata?.full_name || session.user.email?.split('@')[0]}
            </h2>
            <p className="text-emerald-100/70">{session.user.email}</p>
          </div>
        </div>
      </div>

      {/* Collections Section */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-300 mb-4">My Collections</h3>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-8 text-emerald-100/70">
            <p>You haven't created any collections yet.</p>
            <p className="text-sm mt-2">Add artworks to collections while browsing to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                onClick={() => setSelectedCollection(collection)}
                className="bg-gray-800/50 rounded-lg p-4 border border-emerald-900/30 cursor-pointer hover:bg-gray-700/50 transition-colors"
              >
                <h4 className="text-lg font-medium text-emerald-300 mb-2">
                  {collection.name}
                </h4>
                <p className="text-emerald-100/70 text-sm">
                  {collection.artworks?.length || 0} artworks
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Collection Modal */}
      {selectedCollection && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-emerald-300">
                {selectedCollection.name}
              </h3>
              <button
                onClick={() => setSelectedCollection(null)}
                className="text-emerald-100/70 hover:text-emerald-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {selectedCollection.artworks?.length === 0 ? (
              <p className="text-center py-8 text-emerald-100/70">
                No artworks in this collection yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCollection.artworks?.map((artwork) => (
                  <div
                    key={artwork.id}
                    className="bg-gray-900/50 rounded-lg overflow-hidden border border-emerald-900/30"
                  >
                    {artwork.image_url && (
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/800x600/1f2937/4ade80?text=${encodeURIComponent('Artwork Not Available')}`;
                        }}
                      />
                    )}
                    <div className="p-4">
                      <h4 className="text-lg font-medium text-emerald-300 mb-2">
                        {artwork.title}
                      </h4>
                      <p className="text-emerald-100/70 text-sm">
                        {artwork.artist || 'Unknown Artist'}
                      </p>
                      <div className="mt-4 pt-4 border-t border-emerald-900/30 flex justify-between items-center">
                        <span className="text-xs text-emerald-500/80 uppercase">{artwork.source}</span>
                        <a 
                          href={artwork.source === 'rijksmuseum' 
                            ? `https://www.rijksmuseum.nl/en/collection/${artwork.id.replace('rijks-', '')}`
                            : `https://harvardartmuseums.org/collections/object/${artwork.id.replace('harvard-', '')}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View in museum →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 