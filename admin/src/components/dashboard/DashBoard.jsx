import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { DashboardContext } from './dashboardData';
import DashBoardHero from './DashBoardHero';
import GraphCount from './GraphCount';
import ShowCount from './ShowCount';
export default function DashBoard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setError('');
    Promise.all(['patients/all', 'doctor/all-doctor', 'appointment/all'].map(route => axios.get(API_URL + '/api/' + route, { signal: controller.signal, timeout: 15000 })))
      .then(([p, d, a]) => {
        if (![p.data, d.data, a.data].every(Array.isArray)) throw new Error('Invalid dashboard data');
        setData({ patients: p.data, doctors: d.data, appointments: a.data });
      }).catch(e => { if (!controller.signal.aborted) setError(e.response?.data?.message || 'Unable to load dashboard data. Check the server connection.'); });
    return () => controller.abort();
  }, [reload]);
  if (error) return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}<button onClick={() => setReload(r => r + 1)} className="ml-4 underline">Retry</button></div>;
  if (!data) return <p role="status" className="p-12 text-center text-gray-500">Loading dashboard...</p>;
  return <DashboardContext.Provider value={data}><div className="flex flex-col gap-6"><DashBoardHero /><GraphCount /><ShowCount /></div></DashboardContext.Provider>;
}
