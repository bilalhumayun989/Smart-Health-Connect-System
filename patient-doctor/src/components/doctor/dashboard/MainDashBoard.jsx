import { Routes, Route, Navigate, Link } from "react-router-dom";
import { FaUserMd } from "react-icons/fa";
import SideBar from "./SideBar";
import Home from "./Home";
import About from "./About";
import DoctorChat from "./Chat";
import Appointment from "./Appointment";
import DoctorSession from './DoctorSession';
export default function MainDashBoard() {
  return (
    <DoctorSession>
      <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fffe] text-slate-900 md:flex-row">
        <SideBar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="hidden h-16 shrink-0 items-center justify-between border-b border-[#e2f4f2] bg-white px-6 md:flex lg:px-8">
            <p className="text-sm font-medium text-gray-500">
              Your practice, connected.
            </p>
            <Link
              to="/dashboard/about"
              className="flex items-center gap-2 text-sm font-medium text-teal-700"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50">
                <FaUserMd size={16} />
              </span>{" "}
              My profile
            </Link>
          </header>
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto h-full max-w-6xl">
              <Routes>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="chat" element={<DoctorChat />} />
                <Route path="appointment" element={<Appointment />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </DoctorSession>
  );
}
