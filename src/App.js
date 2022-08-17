import React, { Component, useState } from 'react';
import Amplify, { Auth, Storage, API } from 'aws-amplify';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { NavbarBrand, Navbar, Nav, NavItem, NavLink } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Devices from './components/devices';
import DeviceDetails from './components/device-details';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';

function App() {
  
  const [show, setShow] = useState(true);
 
  
  const handleClose = () => {
      setShow(false);
  }
  
  return (
  <Authenticator>
    {({ signOut, user }) => (
      <div>
        <Router>
          <div>
            <Navbar color="dark">
              <NavbarBrand tag={Link} to="/">Digital Twin Sample</NavbarBrand>
              <Nav className="ml-auto">
                <NavItem color="white">
                  <NavLink tag={Link} to="/" className="text-light">Devices</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/" className="text-light">Logout</NavLink>
                </NavItem>
              </Nav>
            </Navbar>
            <hr />
            <Routes>
                <Route exact path='/' element={<Devices />} />
                <Route exact path='/devices/:deviceId' element={<DeviceDetails />} />
            </Routes>
          </div>
        </Router>
        <hr />
      </div>
      )}
  </Authenticator>
  );
}

export default App;
