import React from 'react'
import { useAuth } from 'context/use-auth'
import { NavLink } from 'react-router-dom'

import './Header.css'
import Button from 'components/shared/Forms/Button'

const Header = () => {
  const { isAuthenticated, logoutUser } = useAuth()
  return (
    <header className='header flex-sbt'>
      <div className='logo'>
        <h3>Vet Instant</h3>
      </div>
      <nav className='nav'>
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
            <NavLink to='/call-log'>CallLogs</NavLink>
          </li>
          {isAuthenticated && (
            <li>
              <Button onClick={() => logoutUser()}>Logout</Button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Header
