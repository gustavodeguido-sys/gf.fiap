import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RotaPrivada from './components/RotaPrivada.jsx'
import FormularioConta from './pages/contas/FormularioConta.jsx'
import ListaContas from './pages/contas/ListaContas.jsx'
import Home from './pages/Home.jsx'
import FormularioInvestimento from './pages/investimentos/FormularioInvestimento.jsx'
import ListaInvestimentos from './pages/investimentos/ListaInvestimentos.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import FormularioUsuario from './pages/usuarios/FormularioUsuario.jsx'
import ListaUsuarios from './pages/usuarios/ListaUsuarios.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RotaPrivada />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          <Route path="/usuarios" element={<ListaUsuarios />} />
          <Route path="/usuarios/novo" element={<FormularioUsuario />} />
          <Route path="/usuarios/:id/editar" element={<FormularioUsuario />} />

          <Route path="/contas" element={<ListaContas />} />
          <Route path="/contas/novo" element={<FormularioConta />} />
          <Route path="/contas/:id/editar" element={<FormularioConta />} />

          <Route path="/investimentos" element={<ListaInvestimentos />} />
          <Route path="/investimentos/novo" element={<FormularioInvestimento />} />
          <Route path="/investimentos/:id/editar" element={<FormularioInvestimento />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
