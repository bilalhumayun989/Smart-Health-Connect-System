import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../config/api";
export default function Home() {
  const [appointments, setAppointments] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setAppointments(null);
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
        if (!Array.isArray(r.data)) throw new Error("Invalid appointment data");
        setAppointments(r.data);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e.response?.data?.message || "Unable to load your appointments.",
          );
      });
    return () => controller.abort();
  }, [reload]);
  if (error)
    return (
      <p
        role="alert"
        className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-700"
      >
        {error}
        <button
          className="ml-4 underline"
          onClick={() => setReload((r) => r + 1)}
        >
          Retry
        </button>
      </p>
    );
  if (!appointments)
    return (
      <p role="status" className="p-8 text-gray-500">
        Loading overview...
      </p>
    );
  const upcoming = appointments.filter(
    (a) => new Date(a.appointmentDate + "T" + a.appointmentTime) >= new Date(),
  );
  const patients = new Set(appointments.map((a) => a.patientId)).size;
  return (
    <section className="space-y-8 pb-6 text-slate-900">
      <div>
        <p className="text-sm text-teal-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-bold">Your Practice Overview</h1>
        <p className="mt-3 text-sm text-gray-500">
          Review your scheduled consultations and patient activity.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total appointments", value: appointments.length },
          { label: "Upcoming visits", value: upcoming.length },
          { label: "Patients booked", value: patients },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[#e2f4f2] bg-white p-6 shadow-sm"
          >
            <p className="text-3xl font-bold text-teal-700">{item.value}</p>
            <p className="mt-2 text-sm text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          to="/dashboard/appointment"
          className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-600"
        >
          View appointments
        </Link>
        <Link
          to="/dashboard/about"
          className="rounded-xl border border-[#d4f0ec] bg-white text-teal-700 px-5 py-3 text-sm font-semibold"
        >
          My profile
        </Link>
      </div>
    </section>
  );
}
