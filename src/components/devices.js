import React, { Component, useState, useEffect } from 'react';
import { Table, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import AWS from 'aws-sdk';



async function getThings() {
  AWS.config.update({
    region: 'eu-central-1',
    credentials: await Auth.currentCredentials()
  });
  const iot = new AWS.Iot();
  return await iot.listThingsInThingGroup({thingGroupName:"iot-twin-demo"}).promise();
}

Auth.currentCredentials().then((info) => {
      console.log(info.identityId);
    });

function Devices() {
  
    const [things, setThings] = useState([]);
    //const [loaded, setLoaded] = useState(false);
    
    useEffect(() => {
      let mounted = true;
      getThings()
        .then(result => {
          console.log(result);
          if(mounted) {
          console.log(setThings);
            setThings(result.things);
            //setLoaded(true);
            console.log(things);
          }
        })
      return () => mounted = false;
    }, [])
    
    
    return (
    <div className='centeredTable'>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>DeviceID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            { things.map(thing => 
              <tr>
              <td>{thing}</td>
              <td><Link to={"/devices/"+thing}>View</Link></td>
            </tr>
            ) }
          </tbody>
        </Table>
    </div>
    );
 
}

export default Devices;