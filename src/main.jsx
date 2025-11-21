import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
    onregistered(r) {},
    onNeedRefresh() {
        showNotification('info','Recargar para aplicar nueva sesión');
    },
    onOfflineReady() {}  
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
) 