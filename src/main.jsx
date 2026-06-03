import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TeacherDashboard from "./TeacherDashboard";

const isTeacher = window.location.pathname.startsWith("/teacher");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isTeacher ? <TeacherDashboard /> : <App />}
  </StrictMode>
);
