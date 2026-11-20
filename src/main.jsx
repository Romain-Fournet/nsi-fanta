import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Polices incluses dans le projet : le site marche sans connexion.
import '@fontsource-variable/inter/index.css'
import '@fontsource/source-code-pro/400.css'
import '@fontsource/source-code-pro/600.css'
import './styles.css'

import { StoreProvider } from './store.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
