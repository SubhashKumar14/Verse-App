import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchUsers } from '../services/userService'
import UserCard from '../components/users/UserCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { HiSearch } from 'react-icons/hi'
import { pageTitleClass } from '../styles/common'

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

  return (
    <div>
      <h1 className={`${pageTitleClass} [text-wrap:balance]`}>Explore</h1>

      <form onSubmit={handleSearch} className="mb-10 mt-6 relative">
        <HiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-[color:var(--muted)] text-xl" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search people..."
          className="w-full bg-transparent border-0 border-b border-[color:var(--border)] focus:border-[color:var(--accent)] focus:outline-none focus:ring-0 pl-10 pr-4 py-3 text-lg text-[color:var(--text)] placeholder-[color:var(--muted)] transition-colors duration-200"
        />
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : results.length > 0 ? (
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[color:var(--muted)] px-3 mb-3">
            People
          </h2>
          <div className="space-y-0.5">
            {results.map((u) => (
              <UserCard key={u._id} userData={u} />
            ))}
          </div>
        </div>
      ) : searched ? (
        <EmptyState icon="✦" message={`No one found for "${query}"`} />
      ) : (
        <EmptyState icon="✦" message="Search for people to read." />
      )}
    </div>
  )
}

export default Search
