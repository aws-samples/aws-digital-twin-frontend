import React, { Component, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button } from 'reactstrap';
import thingImage from './../assets/golf-cart-295168_1280.png';
import dot from './../assets/dot.svg';
import { Auth } from 'aws-amplify';
import AWS from 'aws-sdk';

import Amplify, { PubSub } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub';


Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_endpoint: 'wss:ag99k0ihnetn9-ats.iot.eu-central-1.amazonaws.com/mqtt',
    aws_pubsub_region: 'eu-central-1'
  })
)

var subscriber = null;
const iotBufferSize = 200;
var buffer = new Array(iotBufferSize).fill(null);
const ioTDataLabels = [...Array(iotBufferSize).keys()];



function DeviceDetails() {
  
  
  let logvar = '';
  
  const [lights,setLights] = useState('');
  const [engine,setEngine] = useState('');
  const [temperature,setTemperature] = useState('');
  const [log,setLog] = useState();
  
  useEffect(() => {

    const subscribe = () => {
      subscriber = PubSub.subscribe('$aws/things/'+deviceId+'/shadow/update/documents', { provider: 'AWSIoTProvider' }).subscribe({
        next: data => {
          try {
            // sub and parse data from IoT 
            console.log('message ', data.value.current.state.reported)
            logvar = JSON.stringify(data.value.current.state.reported) + "\n" + logvar.match(/(?:^.*$\n?){1,9}/mg)[0]; // cut to 10 lines max.
            setLog(logvar)
            if(data.value.current.state.reported.Lights) {
              setLights("on");
            } else {
              setLights("off");
            }
            setEngine(data.value.current.state.reported.Drehzahl+" RPM");
            setTemperature(data.value.current.state.reported.Temperatur+"°C");

          } catch (error) {
            console.log(error)
          }
        },
        error: error => console.log(error),
        complete: () => console.log('Done')
      })

    }

    subscribe();

    return () => {
      console.log('unsubscribe IoT by clean up user effect...')
      subscriber.unsubscribe();
    }

  }, [])

  
    const [message, setMessage] = useState('');
    const { deviceId } = useParams();
    
    return (
    <>
    <div className='imageContainer'>
      <img src={thingImage} alt="Logo" className="vehicle"/>
      <div className="iot-dot iot-lights">
        <img src={dot} alt="Dot" className="iot-img" onMouseOver={()=>{setMessage('Lights: '+lights)}} onMouseOut={()=>{setMessage('')}}/>
      </div>
      <div className="iot-dot iot-engine">
        <img src={dot} alt="Dot" className="iot-img" onMouseOver={()=>{setMessage('Engine: '+engine)}} onMouseOut={()=>{setMessage('')}}/>
      </div>
      <div className="iot-dot iot-temp">
        <img src={dot} alt="Dot" className="iot-img" onMouseOver={()=>{setMessage('Temperature: '+temperature)}} onMouseOut={()=>{setMessage('')}}/>
      </div>
      <div className="iot-message-container">
        <p>{message}</p>
      </div>
    </div>
    <div className='details-container'>
      <div className='details-left'>
        Device: {deviceId}<br/>
        Lights: {lights}<br/>
        Engine: {engine}<br/>
        Temperature: {temperature}
      </div>
      <div className='details-right'>
        <textarea value={log} />
      </div>
    </div>
    </>
    );
 
}

export default DeviceDetails;