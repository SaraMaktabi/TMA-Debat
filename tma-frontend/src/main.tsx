import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'


import { ModuleRegistry, AllCommunityModule } from "ag-charts-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
