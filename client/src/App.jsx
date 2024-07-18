import React from 'react'
import VideoCallingUi from './pages/VideoCallingUi';
import { Routes,Route } from 'react-router-dom';
import JoinRoom from './pages/JoinRoom';


const App = () => {
  return (
    <div>
      <Routes>
        {/* useEffect(()=>{},[]) on 1st render check if user doesn't exist redirect it to join-page, if already exist redirect it to video-call page with room number */}
        <Route path="/" element={<JoinRoom />} />
        <Route path="/video-call/:roomId" element={<VideoCallingUi />} />
      </Routes>
    </div>
  );
}

export default App