import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/contextoAuth.js'

function RotaPrivada() {
  const { estaLogado } = useAuth()
  const local = useLocation()

  if (!estaLogado) {
    return <Navigate to="/login" replace state={{ de: local }} />
  }

  return <Outlet />
}

export default RotaPrivada
