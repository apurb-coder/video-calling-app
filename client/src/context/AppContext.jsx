// Function: This file handles all states for the app. This file provides access of all states globally.
import {createContext,useContext} from 'react'

const AppContext = createContext(null);


export const useAppContext = ()=>{
    const context = useContext(AppContext);
    if (context === null) {
      throw new Error("useAppContext must be used within a AppContextProvider");
    }
    return context;
}

export const AppContextProvider = ({children})=>{
    // TODO: Define All the states used in the App like room_id , user ID, participants list
    return (<AppContext.Provider value={{}}>
        {children}
    </AppContext.Provider>);
}

