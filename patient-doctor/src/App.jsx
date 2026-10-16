import React from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import UserNavbar from './components/navbar/UserNavbar'
import HomeMain from './components/home/HomeMain'
import DoctorSignup from './components/doctor/form/DoctorSignup'
import DoctorLogin from './components/doctor/form/DoctorLogin'
import ShowDoctor from './components/doctor/ShowDoctor'
import PatientLogin from './components/patient/PatientLogin'
import PatientSignup from './components/patient/PatientSignup'
import PatientAppointments from './components/patient/PatientAppointments'
import MainDashBoard from './components/doctor/dashboard/MainDashBoard'
import ViewServices from './components/home/ViewServices'
import PatientChat from './components/patient/PatientChat'
import ShowBlog from './components/blog/ShowBlog'
import BlogDetail from './components/blog/BlogDetail'
import Chatbot from './components/chatbot/Chatbot'

const AUTH_ROUTES = ['/doctor-login', '/login', '/patient-signup', '/doctor-signup']

function AppLayout() {
  const location = useLocation()
  const isAuthPage = AUTH_ROUTES.includes(location.pathname)
  const isDashboard = location.pathname.startsWith('/dashboard')
  const isPatientChat = location.pathname.startsWith('/patient-chat/')

  return (
    <>
      {!isAuthPage && !isDashboard && <UserNavbar />}
      {!isAuthPage && !isPatientChat && !isDashboard && <Chatbot />}
      <Routes>
        <Route path='/' element={<HomeMain />} />
        <Route path='/doctor-signup' element={<DoctorSignup />} />
        <Route path='/doctor-login' element={<DoctorLogin />} />
        <Route path='/show-doctor' element={<ShowDoctor />} />
        <Route path='/login' element={<PatientLogin />} />
        <Route path='/patient-signup' element={<PatientSignup />} />
        <Route path='/appointments' element={<PatientAppointments />} />
        <Route path='/dashboard/*' element={<MainDashBoard />} />
        <Route path='/viewservices' element={<ViewServices />} />
        <Route path='/patient-chat/:doctorId' element={<PatientChat />} />
        <Route path='/Blog' element={<ShowBlog />} />
        <Route path='/blog-detail/:id' element={<BlogDetail />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
