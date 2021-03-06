import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from 'context/use-auth'

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, user } = useAuth()

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated && user.role === 'doctor' && user.block === false ? (
          <Component {...props} />
        ) : (
          <Redirect to='/login' />
        )
      }
    />
  )
}

export default PrivateRoute
