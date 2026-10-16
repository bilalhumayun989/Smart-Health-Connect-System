import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, Navigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FaArrowLeft, FaCommentAlt, FaPaperPlane, FaUserMd } from 'react-icons/fa';
import { API_URL, doctorName, uploadUrl } from '../../config/api';

function messageDate(message) {
  const date = new Date(message.timestamp || message.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateLabel(date) {
  if (!date) return '';
  return date.toDateString() === new Date().toDateString()
    ? 'Today'
    : date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function mergeMessages(previous, incoming) {
  const result = [...previous];
  for (const message of incoming) {
    if (!message._id || !result.some(item => item._id === message._id)) result.push(message);
  }
  return result.sort((a, b) => (messageDate(a)?.getTime() || 0) - (messageDate(b)?.getTime() || 0));
}

export default function PatientChat() {
  const { doctorId } = useParams();
  const patientId = localStorage.getItem('patientId');
  const token = localStorage.getItem('token');
  const [messages, setMessages] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [reload, setReload] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (!patientId || !token) return;
    const socket = io(API_URL);
    socketRef.current = socket;
    const join = () => socket.emit('joinRoom', { userId: patientId });
    const receive = message => {
      if (String(message.senderId) === doctorId && String(message.receiverId) === patientId) {
        setMessages(previous => mergeMessages(previous, [message]));
      }
    };
    socket.on('connect', join);
    socket.on('receiveMessage', receive);
    return () => {
      socket.off('connect', join);
      socket.off('receiveMessage', receive);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [patientId, token, doctorId]);

  useEffect(() => {
    if (!patientId || !token) return;
    const controller = new AbortController();
    setMessages([]); setInput(''); setLoadError(''); setSendError(''); setLoading(true);
    axios.get(API_URL + '/api/chat/conversation/' + patientId + '/' + doctorId, {
      headers: { Authorization: 'Bearer ' + token }, signal: controller.signal, timeout: 15000,
    }).then(response => {
      if (!Array.isArray(response.data)) throw new Error('Invalid conversation');
      setMessages(previous => mergeMessages(response.data, previous));
    }).catch(error => {
      if (!controller.signal.aborted) setLoadError(error.response?.data?.message || 'Unable to load this conversation. Please try again.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [patientId, token, doctorId, reload]);

  useEffect(() => {
    if (!patientId || !token) return;
    const controller = new AbortController();
    setDoctor(null); setImageFailed(false);
    axios.get(API_URL + '/api/doctor/all-doctor', { signal: controller.signal, timeout: 15000 })
      .then(response => {
        if (Array.isArray(response.data)) setDoctor(response.data.find(item => item._id === doctorId) || null);
      }).catch(() => { /* A missing profile should not prevent using the conversation. */ });
    return () => controller.abort();
  }, [doctorId, patientId, token]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async event => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || sendingRef.current || loading || loadError) return;
    sendingRef.current = true;
    setSending(true); setSendError('');
    try {
      const response = await axios.post(API_URL + '/api/chat/send', {
        senderId: patientId, senderModel: 'Patient', receiverId: doctorId, receiverModel: 'Doctor', message: text,
      }, { headers: { Authorization: 'Bearer ' + token }, timeout: 15000 });
      setMessages(previous => mergeMessages(previous, [response.data]));
      socketRef.current?.emit('sendMessage', response.data);
      setInput('');
    } catch {
      setSendError('Your message could not be sent. Please try again.');
    } finally {
      sendingRef.current = false;
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  if (!patientId || !token) return <Navigate to="/login" replace />;
  const name = doctor ? doctorName(doctor) : 'Your doctor';
  const photo = uploadUrl(doctor?.profileImage, 'doctors');

  return (
    <main className="flex h-dvh min-h-[480px] flex-col bg-[#f8fffe] px-3 pb-3 pt-24 sm:px-6 sm:pb-6">
      <section aria-label="Doctor conversation" className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-2xl border border-[#e2f4f2] bg-white shadow-[0_4px_24px_rgba(15,118,110,0.05)]">
        <header className="flex shrink-0 items-center gap-3 border-b border-[#e2f4f2] px-4 py-4 sm:px-6">
          <Link to="/appointments" aria-label="Back to appointments" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-teal-50 hover:text-teal-700"><FaArrowLeft size={14} /></Link>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f8f6] text-[#0f766e]">
            {photo && !imageFailed ? <img src={photo} alt={name} onError={() => setImageFailed(true)} className="h-full w-full object-cover" /> : <FaUserMd size={21} />}
          </div>
          <div className="min-w-0"><h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{name}</h1><p className="mt-0.5 truncate text-xs text-gray-500">{doctor?.specialty || 'Doctor consultation'}</p></div>
          <span className="ml-auto hidden shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 sm:inline-flex">Consultation</span>
        </header>

        <div ref={listRef} role="log" aria-label="Conversation messages" aria-live="polite" aria-busy={loading} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#fbfefd] px-4 py-5 sm:px-6">
          {loading ? <p role="status" className="py-12 text-center text-sm text-gray-500">Loading conversation...</p> : loadError ? (
            <div role="alert" className="mx-auto mt-8 max-w-sm rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-700"><p>{loadError}</p><button onClick={() => setReload(value => value + 1)} className="mt-3 font-semibold underline">Retry</button></div>
          ) : !messages.length ? (
            <div className="flex min-h-full flex-col items-center justify-center px-3 py-10 text-center"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700"><FaCommentAlt size={19} /></div><h2 className="text-base font-semibold text-slate-900">Start a conversation</h2><p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">Send a message to {name} about your appointment or follow-up questions.</p></div>
          ) : messages.map((message, index) => {
            const mine = String(message.senderId) === patientId;
            const date = messageDate(message);
            const label = dateLabel(date);
            const showDate = label && (index === 0 || label !== dateLabel(messageDate(messages[index - 1])));
            return <div key={message._id || index}>
              {showDate && <div className="my-5 text-center"><span className="rounded-full border border-[#e2f4f2] bg-white px-3 py-1 text-[11px] text-gray-400">{label}</span></div>}
              <div className={'mb-3 flex ' + (mine ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ' + (mine ? 'rounded-br-md bg-[#0f766e] text-white' : 'rounded-bl-md border border-[#e2f4f2] bg-white text-slate-700')}>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">{message.message}</p>
                  {date && <time dateTime={date.toISOString()} className={'mt-1.5 block text-right text-[10px] ' + (mine ? 'text-teal-100' : 'text-gray-400')}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>}
                </div>
              </div>
            </div>;
          })}
        </div>

        <form onSubmit={sendMessage} className="shrink-0 border-t border-[#e2f4f2] bg-white p-3 sm:px-5 sm:py-4">
          {sendError && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sendError}</p>}
          <div className="flex items-end gap-2 rounded-xl border border-[#d4f0ec] bg-[#f8fffe] p-2 focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-teal-50 sm:gap-3">
            <textarea ref={inputRef} aria-label="Message your doctor" rows={2} value={input} disabled={sending || loading || !!loadError} onChange={event => setInput(event.target.value)} onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); sendMessage(); }
            }} placeholder="Write your message..." className="max-h-32 min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed text-slate-700 outline-none placeholder:text-gray-400 disabled:opacity-60" />
            <button type="submit" aria-label={sending ? 'Sending message' : 'Send message'} disabled={!input.trim() || sending || loading || !!loadError} className="flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0f766e] text-sm font-semibold text-white transition-colors hover:bg-[#0d9488] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-4"><FaPaperPlane size={14} /><span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span></button>
          </div>
          <p className="mt-2 hidden text-center text-[11px] text-gray-400 sm:block">Enter to send. Shift + Enter for a new line.</p>
        </form>
      </section>
    </main>
  );
}
