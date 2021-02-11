import React from 'react'
import Header from './Header'

import './Layout.css'

const Layout = ({ children }) => {
  return (
    <div className='layout'>
      <Header />
      <main className='container content'>{children}</main>
    </div>
  )
}

export default Layout
