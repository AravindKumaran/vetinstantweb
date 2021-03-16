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
import ChatPage from 'pages/doctor/ChatPage'
import CallLogPage from 'pages/doctor/CallLogPage'
import ForgotPasswordPage from 'pages/auth/ForgotPasswordPage'
import ResetPasswordPage from 'pages/auth/ResetPasswordPage'
import PendingCallPage from 'pages/doctor/PendingCallPage'

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
        <PrivateRoute exact path='/chat/:id' component={ChatPage} />
        <PrivateRoute exact path='/call-log' component={CallLogPage} />
        <PrivateRoute
          exact
          path='/call-log/pending'
          component={PendingCallPage}
        />
        <Route path='/register' component={RegisterPage} />
        <Route path='/login' component={LoginPage} />
        <Route path='/forgotPassword' component={ForgotPasswordPage} />
        <Route path='/passwordreset/:token' component={ResetPasswordPage} />
        <Route path='/*' component={NotFound} />
      </Switch>
    </>
  )
}

export default App
