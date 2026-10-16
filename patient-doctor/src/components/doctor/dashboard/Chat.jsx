import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  FaArrowLeft,
  FaComments,
  FaPaperPlane,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { API_URL, uploadUrl } from "../../../config/api";
import { profileName } from "../../../utils/profileName";

const messageDate = (message) => {
  const date = new Date(message.timestamp || message.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
};
const mergeMessages = (previous, incoming) => {
  const result = [...previous];
  for (const item of incoming)
    if (!item._id || !result.some((message) => message._id === item._id))
      result.push(item);
  return result.sort(
    (a, b) =>
      (messageDate(a)?.getTime() || 0) - (messageDate(b)?.getTime() || 0),
  );
};
function PatientAvatar({ patient }) {
  const [failed, setFailed] = useState(false);
  const photo = uploadUrl(patient.profileImage);
  useEffect(() => setFailed(false), [photo]);
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-50 text-teal-700">
      {photo && !failed ? (
        <img
          src={photo}
          alt=""
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <FaUser size={15} />
      )}
    </span>
  );
}

export default function DoctorChat() {
  const doctorId = localStorage.getItem("doctor-id");
  const token = localStorage.getItem("doctorToken");
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("patient");
  const [patients, setPatients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);
  const [reload, setReload] = useState(0);
  const [reloadMessages, setReloadMessages] = useState(0);
  const socketRef = useRef(null);
  const selectedRef = useRef(selectedId);
  const listRef = useRef(null);
  const sendingRef = useRef(false);
  selectedRef.current = selectedId;
  const selectedPatient = patients.find(
    (patient) => patient.patientId === selectedId,
  );

  useEffect(() => {
    const controller = new AbortController();
    const config = {
      signal: controller.signal,
      timeout: 15000,
      headers: { Authorization: "Bearer " + token },
    };
    setLoading(true);
    setError("");
    Promise.all([
      axios.get(API_URL + "/api/chat/received/" + doctorId, config),
      axios.get(API_URL + "/api/appointment/doctor/" + doctorId, config),
    ])
      .then(async ([received, bookings]) => {
        if (!Array.isArray(received.data) || !Array.isArray(bookings.data))
          throw new Error("Invalid patient data");
        const ids = [
          ...new Set([
            ...received.data.map((message) => String(message.senderId)),
            ...bookings.data.map((booking) => String(booking.patientId)),
          ]),
        ];
        const roster = await Promise.all(
          ids.map(async (id) => {
            const booking = bookings.data.find(
              (item) => String(item.patientId) === id,
            );
            const latest = received.data
              .filter((message) => String(message.senderId) === id)
              .sort(
                (a, b) =>
                  (messageDate(b)?.getTime() || 0) -
                  (messageDate(a)?.getTime() || 0),
              )[0];
            let details = {};
            try {
              details = (
                await axios.get(API_URL + "/api/patients/" + id, config)
              ).data;
            } catch {
              /* Saved appointment details are available if a profile cannot load. */
            }
            const name = profileName(
              details.firstName ? details : { firstName: booking?.patientName },
            );
            return {
              patientId: id,
              patientName: name === "Your account" ? "Patient" : name,
              profileImage: details.profileImage || booking?.patientImage,
              lastMessage: latest?.message || "Start a conversation",
            };
          }),
        );
        if (!controller.signal.aborted) setPatients(roster);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e.response?.data?.message ||
              "Unable to load patients. Please retry.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [doctorId, token, reload]);

  useEffect(() => {
    const socket = io(API_URL);
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("joinRoom", { userId: doctorId }));
    socket.on("receiveMessage", (message) => {
      if (
        String(message.receiverId) !== doctorId ||
        message.senderModel !== "Patient"
      )
        return;
      const id = String(message.senderId);
      if (selectedRef.current === id)
        setMessages((previous) => mergeMessages(previous, [message]));
      setPatients((previous) => {
        const existing = previous.find((patient) => patient.patientId === id);
        return [
          {
            ...(existing || { patientId: id, patientName: "Patient" }),
            lastMessage: message.message,
          },
          ...previous.filter((patient) => patient.patientId !== id),
        ];
      });
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [doctorId]);

  useEffect(() => {
    setMessages([]);
    setInput("");
    setSendError("");
    setMessageError("");
    if (!selectedId) return;
    const controller = new AbortController();
    setLoadingMessages(true);
    axios
      .get(API_URL + "/api/chat/conversation/" + doctorId + "/" + selectedId, {
        signal: controller.signal,
        timeout: 15000,
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        if (!Array.isArray(response.data))
          throw new Error("Invalid conversation");
        setMessages((previous) => mergeMessages(response.data, previous));
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setMessageError(
            e.response?.data?.message || "Unable to load this conversation.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingMessages(false);
      });
    return () => controller.abort();
  }, [selectedId, doctorId, token, reloadMessages]);

  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loadingMessages]);

  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (
      !text ||
      !selectedPatient ||
      sendingRef.current ||
      loadingMessages ||
      messageError
    )
      return;
    sendingRef.current = true;
    setSending(true);
    setSendError("");
    try {
      const response = await axios.post(
        API_URL + "/api/chat/send",
        {
          senderId: doctorId,
          senderModel: "Doctor",
          receiverId: selectedId,
          receiverModel: "Patient",
          message: text,
        },
        { headers: { Authorization: "Bearer " + token }, timeout: 15000 },
      );
      setMessages((previous) => mergeMessages(previous, [response.data]));
      setPatients((previous) =>
        previous.map((patient) =>
          patient.patientId === selectedId
            ? { ...patient, lastMessage: text }
            : patient,
        ),
      );
      socketRef.current?.emit("sendMessage", response.data);
      setInput("");
    } catch {
      setSendError("Your message could not be sent. Please try again.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };
  const filtered = patients.filter((patient) =>
    patient.patientName.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <section
      aria-label="Patient messages"
      className="flex h-full min-h-[420px] overflow-hidden rounded-2xl border border-[#e2f4f2] bg-white"
    >
      <div
        className={
          (selectedId ? "hidden md:flex " : "flex ") +
          "w-full shrink-0 flex-col border-r border-[#e2f4f2] md:w-64 lg:w-72"
        }
      >
        <div className="border-b border-[#e2f4f2] p-4">
          <h1 className="text-xl font-semibold">Messages</h1>
          <p className="mt-1 text-xs text-gray-500">
            Your patient conversations
          </p>
          <div className="relative mt-4">
            <FaSearch
              size={12}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              aria-label="Search patients"
              placeholder="Search patients"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#e2f4f2] bg-[#f8fffe] py-2.5 pl-8 pr-3 text-xs outline-none focus:border-teal-600"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {loading ? (
            <p role="status" className="p-5 text-sm text-gray-500">
              Loading patients...
            </p>
          ) : error ? (
            <p role="alert" className="p-4 text-sm text-red-600">
              {error}
              <button
                className="mt-2 block underline"
                onClick={() => setReload((r) => r + 1)}
              >
                Retry
              </button>
            </p>
          ) : !filtered.length ? (
            <p className="p-5 text-sm text-gray-500">
              {patients.length
                ? "No matching patients."
                : "Booked patients and incoming conversations will appear here."}
            </p>
          ) : (
            filtered.map((patient) => (
              <button
                key={patient.patientId}
                disabled={sending}
                onClick={() => setParams({ patient: patient.patientId })}
                className={
                  "mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors " +
                  (selectedId === patient.patientId
                    ? "bg-[#e8f8f6]"
                    : "hover:bg-teal-50")
                }
              >
                <PatientAvatar patient={patient} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {patient.patientName}
                  </span>
                  <span className="mt-1 block truncate text-xs text-gray-500">
                    {patient.lastMessage}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
      <div
        className={
          (selectedId ? "flex " : "hidden md:flex ") + "min-w-0 flex-1 flex-col"
        }
      >
        {selectedPatient ? (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-[#e2f4f2] px-4 py-4">
              <button
                aria-label="Back to patients"
                disabled={sending}
                onClick={() => setParams({})}
                className="rounded-full p-2 text-gray-500 hover:bg-teal-50 md:hidden"
              >
                <FaArrowLeft size={14} />
              </button>
              <PatientAvatar patient={selectedPatient} />
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">
                  {selectedPatient.patientName}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Patient consultation
                </p>
              </div>
            </header>
            <div
              ref={listRef}
              role="log"
              aria-label="Conversation messages"
              aria-live="polite"
              aria-busy={loadingMessages}
              className="min-h-0 flex-1 overflow-y-auto bg-[#fbfefd] p-4 sm:p-5"
            >
              {loadingMessages ? (
                <p
                  role="status"
                  className="p-8 text-center text-sm text-gray-500"
                >
                  Loading conversation...
                </p>
              ) : messageError ? (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
                >
                  {messageError}
                  <button
                    className="ml-3 underline"
                    onClick={() => setReloadMessages((r) => r + 1)}
                  >
                    Retry conversation
                  </button>
                </p>
              ) : !messages.length ? (
                <p className="py-12 text-center text-sm text-gray-500">
                  No messages yet. Send a message to start the conversation.
                </p>
              ) : (
                messages.map((message, index) => {
                  const mine = String(message.senderId) === doctorId;
                  const date = messageDate(message);
                  return (
                    <div
                      key={message._id || index}
                      className={
                        "mb-3 flex " + (mine ? "justify-end" : "justify-start")
                      }
                    >
                      <div
                        className={
                          "max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[80%] " +
                          (mine
                            ? "rounded-br-md bg-teal-700 text-white"
                            : "rounded-bl-md border border-[#e2f4f2] bg-white text-slate-700")
                        }
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">
                          {message.message}
                        </p>
                        {date && (
                          <time
                            dateTime={date.toISOString()}
                            title={date.toLocaleDateString()}
                            className={
                              "mt-1.5 block text-right text-[10px] " +
                              (mine ? "text-teal-100" : "text-gray-400")
                            }
                          >
                            {date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form
              onSubmit={sendMessage}
              className="shrink-0 border-t border-[#e2f4f2] p-3 sm:p-4"
            >
              {sendError && (
                <p role="alert" className="mb-3 text-sm text-red-600">
                  {sendError}
                </p>
              )}
              <div className="flex items-end gap-2 rounded-xl border border-[#d4f0ec] bg-[#f8fffe] p-2 focus-within:border-teal-600">
                <textarea
                  aria-label="Message your patient"
                  rows={2}
                  disabled={sending || loadingMessages || !!messageError}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Write your message..."
                  className="min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={
                    !input.trim() ||
                    sending ||
                    loadingMessages ||
                    !!messageError
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white hover:bg-teal-600 disabled:opacity-40"
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <FaComments size={32} className="text-teal-600" />
            <h2 className="mt-2 text-lg font-semibold">Your conversations</h2>
            <p className="max-w-xs text-sm text-gray-500">
              Select a patient to view messages or start a consultation.
            </p>
            {selectedId && (
              <button
                onClick={() => setParams({})}
                className="text-sm text-teal-700 underline"
              >
                Back to patients
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
