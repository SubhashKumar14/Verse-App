import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchUsers } from '../services/userService'
import UserCard from '../components/users/UserCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { HiSearch } from 'react-icons/hi'
import {
  pageTitleClass, pageSubtitle, sectionLabel, topicPill
} from '../styles/common'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(query)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!query) return
    const doSearch = async () => {
      setLoading(true)
      setSearched(true)
      try {
        const { data } = await searchUsers(query)
        setResults(data.payload)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    doSearch()
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() })
    }
  }

  const trendingTopics = ['#buildinpublic', '#devlife', '#writing', '#opensource', '#design', '#indie']

  return (
    <div>
      <h1 className={`${pageTitleClass} [text-wrap:balance]`}>Explore</h1>
      <p className={`${pageSubtitle} mb-8`}>Discover writers and ideas</p>

      {/* Search input — bottom border only, editorial */}
      <form onSubmit={handleSearch} className="mb-10 relative">
        <HiSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xl" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search people..."
          className="w-full bg-transparent border-0 border-b border-[var(--border)] focus:border-[var(--accent)] focus:outline-none focus:ring-0 pl-8 pr-4 py-3 text-lg text-[var(--text)] placeholder-[var(--muted)] transition-colors duration-200"
        />
      </form>

      {/* Trending topics */}
      <div className="mb-10">
        <p className={`${sectionLabel} mb-4`}>Trending</p>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setSearchInput(topic)
                setSearchParams({ q: topic })
              }}
              className={topicPill}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : results.length > 0 ? (
        <div>
          <p className={`${sectionLabel} px-1 mb-3`}>People</p>
          <div className="space-y-0.5">
            {results.map((u) => (
              <UserCard key={u._id} userData={u} />
            ))}
          </div>
        </div>
      ) : searched ? (
        <EmptyState icon="✦" message={`No one found for "${query}"`} />
      ) : (
        <EmptyState icon="✦" message="Find writers worth following." />
      )}
    </div>
  )
}

export default Search
