import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IntroScreen from './pages/IntroScreen';
import MapScreen from './pages/MapScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IntroScreen />} />
        <Route path="/map" element={<MapScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;