// Function: import all Providers from context API and define in one place. USE THIS COMPONENT AS A SINGLE WRAPPER FOR ALL PROVIDERS.
import React from 'react'
import { AppContextProvider } from './AppContext.jsx'
import { SocketProvider } from './SocketContext.jsx'
import { ChatProvider } from './ChatContext.jsx'


const GlobalProvider = ({children}) => {
  return (
    <AppContextProvider>
        <SocketProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </SocketProvider>
    </AppContextProvider>
  )
}

export default GlobalProvider