import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// Import all styles centrally to avoid relative-path issues across component subdirs
import './styles/global.css'
import './styles/sidebar.css'
import './styles/bookshelf.css'
import './styles/modal.css'
import './styles/reader.css'
import './styles/panels.css'
import './styles/stats.css'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
