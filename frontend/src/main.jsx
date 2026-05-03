import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from "react-router"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const PublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PublishableKey) {
  throw new Error("Missing clerk publishable key.");
}

// Create a client
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ClerkProvider publishableKey={PublishableKey}>
       <App />
      </ClerkProvider>
    </BrowserRouter>
   </QueryClientProvider>
  </StrictMode>,
)
