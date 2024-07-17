import React from 'react'
import VideoCallingUi from './pages/VideoCallingUi';
import JoinRoom from './pages/JoinRoom';


const App = () => {
  return (
    <div className="min-h-screen">
      {/* TODO: This will also be conditional rendering , will only render when user doesn't exist */}
      {/* <JoinRoom/> */}
      {/* TODO: This will be a conditional rendering, it will only render if user exist */}
      <VideoCallingUi />
    </div>
  );
}

export default App