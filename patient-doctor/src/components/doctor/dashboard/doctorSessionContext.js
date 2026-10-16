import { createContext, useContext } from 'react';

export const DoctorSessionContext = createContext(null);
export const useDoctorSession = () => useContext(DoctorSessionContext);
