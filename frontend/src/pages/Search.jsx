import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchUsers } from '../services/userService'
import UserCard from '../components/users/UserCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { pageTitleClass, inputClass } from '../styles/common'

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
      <h1 className={pageTitleClass}>Explore</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by username or email..."
          className={inputClass}
        />
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : results.length > 0 ? (
        <div className="space-y-1">
          {results.map((u) => (
            <UserCard key={u._id} userData={u} />
          ))}
        </div>
      ) : searched ? (
        <EmptyState icon="🔍" message={`No users found for "${query}"`} />
      ) : (
        <EmptyState icon="👥" message="Search for users to connect with" />
      )}
    </div>
  )
}

export default Search
