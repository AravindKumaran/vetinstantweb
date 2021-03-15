import React from 'react'
import { useAuth } from 'context/use-auth'
import { NavLink } from 'react-router-dom'
import Button from 'components/shared/Forms/Button'

const NavLinks = () => {
  const { isAuthenticated, logoutUser } = useAuth()
  return (
    <>
      <ul className='nav__list'>
        <li>
          <NavLink exact to='/'>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to='/patientList'>Patient List</NavLink>
        </li>
        <li>
          <NavLink to='/prescription'>Prescription</NavLink>
        </li>
        <li>
          <NavLink to='/call-log'>Call Log</NavLink>
        </li>
        {isAuthenticated && (
          <li>
            <Button onClick={() => logoutUser()}>Logout</Button>
          </li>
        )}
      </ul>
    </>
  )
}

export default NavLinks
