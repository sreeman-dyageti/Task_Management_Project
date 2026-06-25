import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './index.css'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TaskList from './pages/TaskList'
import CreateTask from './pages/CreateTask'
import EditTask from './pages/EditTask'
import ProtectedRoute from './components/ProtectedRoute'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute><TaskList adminView={false} /></ProtectedRoute>
          } />
          <Route path="/tasks/all" element={
            <ProtectedRoute><TaskList adminView={true} /></ProtectedRoute>
          } />
          <Route path="/tasks/create" element={
            <ProtectedRoute><CreateTask /></ProtectedRoute>
          } />
          <Route path="/tasks/edit/:task_id" element={
            <ProtectedRoute><EditTask /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)