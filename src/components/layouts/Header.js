import React from 'react'

import './Header.css'
import NavLinks from './NavLinks'

const Header = () => {
  return (
    <header className='header flex-sbt'>
      <div className='logo'>
        <h3>Vet Instant</h3>
      </div>
      <nav className='nav'>
        <NavLinks />
      </nav>
    </header>
  )
}

export default Header
