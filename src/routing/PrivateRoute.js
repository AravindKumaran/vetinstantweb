import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from 'context/use-auth'

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useAuth()

  return (
    <Route
      {...rest}
      render={(props) =>
        !isAuthenticated ? <Redirect to='/login' /> : <Component {...props} />
      }
    />
  )
}

export default PrivateRoute
