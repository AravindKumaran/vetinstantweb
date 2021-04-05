import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { AuthProvider } from './context/use-auth'
import { BrowserRouter } from 'react-router-dom'
import reportWebVitals from './reportWebVitals'

import { registerServiceWorker } from './serviceWorker'

import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

registerServiceWorker()
reportWebVitals()
