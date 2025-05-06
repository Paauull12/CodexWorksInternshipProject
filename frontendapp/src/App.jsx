import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HeroComponent from './components/HeroComponent'
import Navigation from './components/Navigation.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Register from './pages/Register.jsx'
import ProtectedRoutes from './middleware/ProtectedRoutes.jsx'
import ChatbotComponent from './pages/ChatBot.jsx'
import TodoBoard from './pages/ToDoPage.jsx'
import TodoForm from './pages/ToDoPageAdd.jsx'
import ProfilePage from './pages/Profile.jsx'
import TodoDetailPage from './pages/ToDoDetail.jsx'

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<HeroComponent />} />
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/register" element={<Register />}/>

        <Route 
          path='/dashboard'
          element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>}
        />

        <Route
          path='/todos'
          element={<ProtectedRoutes><TodoBoard/></ProtectedRoutes>}
        />

        <Route
          path='/addtodo'
          element={<ProtectedRoutes><TodoForm/></ProtectedRoutes>}
        />

        <Route
          path='/profile'
          element={<ProtectedRoutes><ProfilePage/></ProtectedRoutes>}
        />

        <Route
          path='/todo/:id'
          element={<ProtectedRoutes><TodoDetailPage/></ProtectedRoutes>}
        />

      </Routes>
      <ChatbotComponent/>
    </BrowserRouter>
  )
}

export default App