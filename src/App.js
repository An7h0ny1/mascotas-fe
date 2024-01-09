import './App.css';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import MascotasComponent from './Components/MascotasComponent.js';
import SolicitudesComponent from './Components/SolicitudesComponent.js';
import SolicitantesComponent from './Components/SolicitantesComponent.js';
import Login from './Components/login.js';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mascotas" element={<MascotasComponent />} />
        <Route path="/solicitantes" element={<SolicitantesComponent />} />
        <Route path="/solicitudes" element={<SolicitudesComponent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
