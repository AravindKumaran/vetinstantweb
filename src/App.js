import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path='/register' component={RegisterPage} />
        <Route path='/' component={LoginPage} />
      </Switch>
    </Router>
  )
}

export default App
