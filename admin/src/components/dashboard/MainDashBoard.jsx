import React from 'react'
import { Routes, Route } from 'react-router-dom'
import DashBoardSideBar from './DashBoardSideBar'
import AdminNavbar from './AdminNavbar'
import AdminFooter from './AdminFooter'

import './MainDashBoard.css'
import DashBoard from './DashBoard'
import ShowDoctor from '../doctor/ShowDoctor'
import ShowPatient from '../patient/ShowPatient'
import ShowAppointments from '../appointment/ShowAppointments'
import ShowBlog from '../blogs/ShowBlog'
import InsertBlog from '../blogs/InsertBlog'
import PrivacyPolicy from '../privacy/PrivacyPolicy'
import SecurityPolicy from '../security/SecurityPolicy'
import Logout from '../logout/Logout'

export default function MainDashBoard() {
  return (
    <div className="flex min-h-screen bg-white">
      <DashBoardSideBar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <AdminNavbar />
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<DashBoard />} />
              <Route path='/doctor' element={<ShowDoctor />}></Route>
              <Route path='/patient' element={<ShowPatient />}></Route>
              <Route path='/appointments' element={<ShowAppointments />}></Route>
              <Route path='/show-blog' element={<ShowBlog />}></Route>
              <Route path='/insert-blog' element={<InsertBlog />}></Route>
              <Route path='/privacy-policy' element={<PrivacyPolicy />}></Route>
              <Route path='/security-policy' element={<SecurityPolicy />}></Route>
              <Route path='/logout' element={<Logout />}></Route>
            </Routes>
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  )
}
