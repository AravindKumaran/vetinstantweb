import React, { useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from 'context/use-auth'
import PrivateRoute from 'routing/PrivateRoute'

import LoginPage from 'pages/auth/LoginPage'
import RegisterPage from 'pages/auth/RegisterPage'
import HomePage from 'pages/doctor/HomePage'
import PatientListPage from 'pages/doctor/PatientListPage'
import NotFound from 'pages/NotFound'
import PrescriptionPage from 'pages/doctor/PrescriptionPage'
import VideoCallPage from 'pages/doctor/VideoCallPage'

const App = () => {
  const { loadUser } = useAuth()

  useEffect(() => {
    if (localStorage.token) {
      loadUser()
    }
  }, [])

  return (
    <>
      <Toaster />
      <Switch>
        <PrivateRoute exact path='/' component={HomePage} />
        <PrivateRoute exact path='/patientList' component={PatientListPage} />
        <PrivateRoute exact path='/prescription' component={PrescriptionPage} />
        <PrivateRoute exact path='/video-call/:id' component={VideoCallPage} />
        <Route path='/register' component={RegisterPage} />
        <Route path='/login' component={LoginPage} />
        <Route path='/*' component={NotFound} />
      </Switch>
    </>
  )
}

export default App
