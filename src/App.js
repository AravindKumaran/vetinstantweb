import React, { useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PrivateRoute from 'routing/PrivateRoute'

import LoginPage from 'pages/auth/LoginPage'
import RegisterPage from 'pages/auth/RegisterPage'
import HomePage from 'pages/doctor/HomePage'
import NotFound from 'pages/NotFound'
import { useAuth } from 'context/use-auth'
import PatientListPage from 'pages/doctor/PatientListPage'

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
        <Route path='/register' component={RegisterPage} />
        <Route path='/login' component={LoginPage} />
        <Route path='/*' component={NotFound} />
      </Switch>
    </>
  )
}

export default App
