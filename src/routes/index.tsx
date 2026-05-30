import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { MedicalStaffPage } from '../features/medical-staff/MedicalStaffPage'
import { ParamedicPage } from '../features/paramedic/ParamedicPage'
import { PatientPage } from '../features/patient/PatientPage'
import { PatientRegistrationPage } from '../features/patient/PatientRegistrationPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/paramedic" replace /> },
      { path: 'patient', element: <PatientPage /> },
      { path: 'patient/register', element: <PatientRegistrationPage /> },
      { path: 'paramedic', element: <ParamedicPage /> },
      { path: 'medical-staff', element: <MedicalStaffPage /> },
    ],
  },
])
