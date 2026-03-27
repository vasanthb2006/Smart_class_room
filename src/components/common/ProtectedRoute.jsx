import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!user) return <Navigate to="/login" replace />

  if (profile && allowedRole && profile.role !== allowedRole) {
    // Redirect to correct dashboard
    return <Navigate to={`/${profile.role}`} replace />
  }

  return children
}
