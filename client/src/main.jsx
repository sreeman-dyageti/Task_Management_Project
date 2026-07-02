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
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetails'
import ProtectedRoute from './components/ProtectedRoute'
import TaskDetail from './pages/TaskDetail'



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
          <Route path="/tasks/create" element={
            <ProtectedRoute><CreateTask /></ProtectedRoute>
          } />
          <Route path="/tasks/all" element={
            <ProtectedRoute><TaskList adminView={true} /></ProtectedRoute>
          } />
          <Route path="/tasks/edit/:task_id" element={
            <ProtectedRoute><EditTask /></ProtectedRoute>
          } />
          <Route path="/tasks/:task_id" element={
            <ProtectedRoute><TaskDetail /></ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute><Projects /></ProtectedRoute>
          } />
          <Route path="/projects/:projectId" element={
            <ProtectedRoute><ProjectDetail /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)