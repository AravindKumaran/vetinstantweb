import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from 'context/use-auth'

const AdminRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, user } = useAuth()

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated && user.role === 'admin' ? (
          <Component {...props} />
        ) : (
          <Redirect to='/login' />
        )
      }
    />
  )
}

export default AdminRoute
