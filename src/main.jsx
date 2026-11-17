import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './design/theme.css'
import './design/howto.css'
import { installHelpBubbles } from './design/helpBubbles'
import MlnDemoApp from './App.jsx'

installHelpBubbles()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MlnDemoApp />
  </StrictMode>,
)
