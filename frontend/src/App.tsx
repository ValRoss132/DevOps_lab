import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Chat from './pages/Chat';
import Registration from './pages/Registration';
import Auth from './pages/Auth';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="profile" element />
                <Route path="/auth" element={<Auth />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/chat" element={<Chat />} />
                <Route
                    path="*"
                    element={<Navigate to="/registration" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
