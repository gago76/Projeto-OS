import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* O App já contém o AuthProvider internamente, então chamamos apenas o App */}
    <App />
  </React.StrictMode>,
)