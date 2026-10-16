import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserMd,
  FaComments,
  FaCalendarCheck,
  FaHeartbeat,
  FaSignOutAlt,
} from "react-icons/fa";
export default function SideBar() {
  const navigate = useNavigate();
  const signOut = () => {
    ["doctorToken", "doctor-id"].forEach((key) => localStorage.removeItem(key));
    navigate("/doctor-login", { replace: true });
  };
  const links = [
    { to: "/dashboard/home", label: "Overview", icon: FaHome },
    {
      to: "/dashboard/appointment",
      label: "Appointments",
      icon: FaCalendarCheck,
    },
    { to: "/dashboard/chat", label: "Messages", icon: FaComments },
    { to: "/dashboard/about", label: "My Profile", icon: FaUserMd },
  ];
  return (
    <aside className="flex shrink-0 flex-col border-b border-[#e2f4f2] bg-white md:h-full md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-3 px-5 py-5 md:px-6 md:py-7">
        <Link to="/dashboard/home" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white">
            <FaHeartbeat size={20} />
          </span>
          <span className="text-lg font-bold text-slate-900">
            Smart<span className="text-teal-700">Health</span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-widest text-gray-400">
              Doctor portal
            </span>
          </span>
        </Link>
        <button
          aria-label="Sign out"
          onClick={signOut}
          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 md:hidden"
        >
          <FaSignOutAlt />
        </button>
      </div>
      <nav
        aria-label="Doctor portal"
        className="grid grid-cols-4 gap-1 px-3 pb-3 md:flex md:flex-1 md:flex-col md:gap-2 md:px-4 md:pt-2"
      >
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              "flex flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-3 text-[10px] font-medium transition-colors md:flex-row md:justify-start md:gap-3 md:px-4 md:text-sm " +
              (isActive
                ? "bg-[#e8f8f6] text-teal-800"
                : "text-gray-500 hover:bg-teal-50 hover:text-teal-700")
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="hidden border-t border-[#e2f4f2] p-4 md:block">
        <Link
          to="/"
          className="block rounded-xl px-4 py-3 text-sm text-gray-500 hover:bg-teal-50 hover:text-teal-700"
        >
          Visit website
        </Link>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          <FaSignOutAlt /> Sign out
        </button>
      </div>
    </aside>
  );
}
