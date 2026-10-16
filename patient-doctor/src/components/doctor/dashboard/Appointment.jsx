import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClock,
  FaCommentAlt,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { API_URL } from "../../../config/api";
import { profileName } from "../../../utils/profileName";
export default function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    axios
      .get(
        API_URL +
          "/api/appointment/doctor/" +
          localStorage.getItem("doctor-id"),
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("doctorToken"),
          },
          signal: controller.signal,
          timeout: 15000,
        },
      )
      .then((r) => {
        if (!Array.isArray(r.data)) throw new Error("Invalid appointments");
        setAppointments(r.data);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e.response?.data?.message ||
              "Unable to load appointments. Please retry.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reload]);
  const filtered = appointments
    .filter((a) =>
      (a.patientName + " " + a.patientEmail + " " + a.appointmentDate)
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    )
    .sort((a, b) =>
      (a.appointmentDate + "T" + a.appointmentTime).localeCompare(
        b.appointmentDate + "T" + b.appointmentTime,
      ),
    );
  return (
    <section className="space-y-6 pb-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
            Your schedule
          </p>
          <h1 className="mt-2 text-3xl font-bold">My Appointments</h1>
          <p className="mt-2 text-sm text-gray-500">
            Review booked consultations and contact your patients.
          </p>
        </div>
        <div className="relative">
          <FaSearch
            className="absolute left-3 top-3.5 text-gray-400"
            size={13}
          />
          <input
            aria-label="Search appointments"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients or dates"
            className="w-full rounded-xl border border-[#e2f4f2] bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-teal-600 sm:w-64"
          />
        </div>
      </div>
      {loading ? (
        <p role="status" className="p-12 text-center text-sm text-gray-500">
          Loading appointments...
        </p>
      ) : error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700"
        >
          {error}
          <button
            className="ml-4 underline"
            onClick={() => setReload((r) => r + 1)}
          >
            Retry
          </button>
        </p>
      ) : !filtered.length ? (
        <div className="rounded-2xl border border-[#e2f4f2] bg-white px-5 py-12 text-center">
          <FaCalendarAlt className="mx-auto mb-4 text-teal-600" size={28} />
          <h2 className="font-semibold">
            {appointments.length
              ? "No matching appointments"
              : "No appointments yet"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {appointments.length
              ? "Try another patient name or date."
              : "Your booked consultations will appear here."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500">
            {filtered.length} appointments
          </p>
          <div className="space-y-3">
            {filtered.map((a) => {
              const name = profileName({ firstName: a.patientName });
              return (
                <article
                  key={a._id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e2f4f2] bg-white p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                      <FaUser size={15} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="break-words text-sm font-semibold">
                        {name === "Your account" ? "Patient" : name}
                      </h2>
                      <p className="mt-1 break-all text-xs text-gray-500">
                        {a.patientEmail || "Email not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
                    <span className="flex items-center gap-2">
                      <FaCalendarAlt className="text-teal-700" />
                      {a.appointmentDate}
                    </span>
                    <span className="flex items-center gap-2">
                      <FaClock className="text-teal-700" />
                      {a.appointmentTime}
                    </span>
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-700">
                      {a.paymentMethod || "Not provided"}
                    </span>
                  </div>
                  {a.patientId && (
                    <Link
                      to={"/dashboard/chat?patient=" + a.patientId}
                      className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-teal-700 hover:underline"
                    >
                      <FaCommentAlt size={13} /> Message
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
