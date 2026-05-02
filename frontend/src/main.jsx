import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from "react-router"
const PublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PublishableKey) {
  throw new Error("Missing clerk publishable key.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <BrowserRouter>
    <ClerkProvider publishableKey={PublishableKey}>
     <App />
    </ClerkProvider>
   </BrowserRouter>
  </StrictMode>,
)
