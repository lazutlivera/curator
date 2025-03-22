import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AddToCollection({ artwork, userId, onClose }) {
  const [collections, setCollections] = useState([])
  const [newCollectionName, setNewCollectionName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchCollections()
  }, [])

  async function fetchCollections() {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) throw error
      setCollections(data || [])
    } catch (error) {
      console.error('Error fetching collections:', error)
      setError(error.message)
    }
  }

  async function handleAddToCollection(collectionId) {
    try {
      setLoading(true)
      setError(null)

      // Check if artwork already exists in collection
      const { data: existing } = await supabase
        .from('collection_artworks')
        .select('*')
        .eq('collection_id', collectionId)
        .eq('artwork_id', artwork.id)
        .single()

      if (existing) {
        setError('This artwork is already in the collection')
        return
      }

      // Add artwork to collection
      const { error } = await supabase
        .from('collection_artworks')
        .insert([
          {
            collection_id: collectionId,
            artwork_id: artwork.id,
            artwork_data: artwork
          }
        ])

      if (error) throw error

      setSuccess(true)
      setTimeout(() => onClose(), 1500)
    } catch (error) {
      console.error('Error adding to collection:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCollection() {
    try {
      setLoading(true)
      setError(null)

      if (!newCollectionName.trim()) {
        setError('Please enter a collection name')
        return
      }

      // Create new collection
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .insert([
          {
            name: newCollectionName.trim(),
            user_id: userId
          }
        ])
        .select()
        .single()

      if (collectionError) throw collectionError

      // Add artwork to the new collection
      const { error: artworkError } = await supabase
        .from('collection_artworks')
        .insert([
          {
            collection_id: collection.id,
            artwork_id: artwork.id,
            artwork_data: artwork
          }
        ])

      if (artworkError) throw artworkError

      setSuccess(true)
      setTimeout(() => onClose(), 1500)
    } catch (error) {
      console.error('Error creating collection:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-gray-800 rounded-t-xl sm:rounded-lg p-4 sm:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-gray-800 pb-2 border-b border-emerald-900/30">
          <h3 className="text-lg sm:text-xl font-bold text-emerald-300">
            Add to Collection
          </h3>
          <button
            onClick={onClose}
            className="text-emerald-100/70 hover:text-emerald-100 p-2 -mr-2"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="text-emerald-300 text-lg mb-2">✓ Added successfully!</div>
            <p className="text-emerald-100/70">Closing in a moment...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-emerald-300 text-sm font-medium mb-2">
                Create New Collection
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection name"
                  className="flex-1 bg-gray-900 text-emerald-100 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                />
                <button
                  onClick={handleCreateCollection}
                  disabled={loading}
                  className="px-4 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 text-base whitespace-nowrap"
                >
                  Create
                </button>
              </div>
            </div>

            <div>
              <label className="block text-emerald-300 text-sm font-medium mb-2">
                Or Add to Existing Collection
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto rounded-lg">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleAddToCollection(collection.id)}
                    disabled={loading}
                    className="w-full text-left px-4 py-3 bg-gray-900/50 text-emerald-100 rounded-lg hover:bg-gray-700/50 transition-colors disabled:opacity-50 text-base"
                  >
                    {collection.name}
                  </button>
                ))}
                {collections.length === 0 && (
                  <p className="text-emerald-100/70 text-sm text-center py-3 bg-gray-900/30 rounded-lg">
                    No collections yet
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 