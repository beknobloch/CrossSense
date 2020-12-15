import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Vibration, Platform, TouchableOpacity } from 'react-native';

import RNBluetoothClassic, { BluetoothEventType, BluetoothDevice } from 'react-native-bluetooth-classic';

// BluetoothButton is a custom module. It takes up the whole screen, and is what the user presses to connect to or disconnect from the CrossSense device.
const BluetoothButton = (props) => {

  // props.onPress is the passed-in function that pressing the button calls. props.text changes based on the state of connection.
  return (
  <TouchableOpacity onPress={props.onPress} style={styles.button}>
    
      <Image source={require("./assets/CrossSenseLogo.png")} />
      <Text style={styles.text}>{props.text}</Text>
    
  </TouchableOpacity>
  );

}


class CrossSenseApp extends Component {
  
  constructor () {
    super();

    this.state = {
      device: undefined,
      bluetoothEnabled: true
    };
  }

  async componentDidMount() {
    
    console.log(`App::componentDidMount adding listeners`)
    this.enabledSubscription = RNBluetoothClassic
      .onBluetoothEnabled((event) => this.onStateChanged(event));
    this.disabledSubscription = RNBluetoothClassic
      .onBluetoothDisabled((event) => this.onStateChanged(event));

    try {
      console.log(`App::componentDidMount checking bluetooth status`);
      let enabled = await RNBluetoothClassic.isBluetoothEnabled();

      console.log(`App::componentDidMount status => ${enabled}`);
      this.setState({ bluetoothEnabled: enabled });
    } catch (error) {
      console.log(`App::componentDidMount error`, error);
      this.setState({ bluetoothEnabled: false});
    }
  }

  componentWillUnmount() {
    console.log(`App:componentWillUnmount removing subscriptions`)
    this.enabledSubscription.remove()
    this.disabledSubscription.remove();
  }

  onStateChanged(stateChangedEvent) {
    console.log(`App::onStateChanged`)
    console.log(stateChangedEvent);
    
    this.setState({
      bluetoothEnabled: stateChangedEvent.enabled,
      device: stateChangedEvent.enabled ? this.state.device : undefined
    });
  }

  async setUpBluetooth () {
    
    let PATTERN;
    
    if (Platform.OS === "android") {
        PATTERN = [
        0,
        400,
        50,
        400,
        50,
        400
      ];
    } else{
      PATTERN = [
        0,
        50,
        50,
        50
      ]
    }

    let enabled = false;

    try {

      enabled = await RNBluetoothClassic.isBluetoothEnabled();

    } catch (error) {
        console.log("Failed to check if Bluetooth is enabled.");
        console.log(error);
    }

    if(enabled) {

      let address = "98D351FD797A";
      let device = RNBluetoothClassic.getConnectedDevice(address);
      device.then(connectToDevice, connectToDeviceError);
    }


    function readIncomingData(data) {
    
      console.log("Receiving data:");
      console.log(data);

      Vibration.vibrate(PATTERN);
    
    }
    
    async function connectToDevice(device) {
    
      let connection;
      let readSubscription;
    
      try {
        
        try{
          
          Vibration.cancel();

        }catch(error){

          console.log("No vibration to cancel.");

        }

        connection = await device.isConnected();
        
        if (!connection) {

          console.log("State says no connection. Attempting to connect.");
    
          connection = device.connect().then( (connectionResult) => {
          
            if (connectionResult) {
              
              console.log("Successful connection to device.");
              
              readSubscription = device.onDataReceived((data) => readIncomingData(data));

              Vibration.vibrate(1000);
            }
            else {

              console.log("Connection to device failed.");
              
              Vibration.vibrate(3000);

            }
          }
          );
    
        }
        else {

          console.log("State says connection. Attempting to disconnect.");
    
          readSubscription.remove();
          
          try {
            device.disconnect().then( (disconnectedResult) => {
            
              if(disconnectedResult) {
                
                console.log("Successful disconnection from device.");
                
                Vibration.vibrate(1000);
              } else {
                console.log("Disconnection from device failed.");
              }

            }
            )
          } catch(error) {
            console.log("Error disconnecting device.");
            console.log(error);
          }
        }
    
      } catch (error) {
        console.log("Error connecting to device.");
        console.log(error);
      }
    }

    function connectToDeviceError (error) {
      console.log("Error retrieving device.");
      console.log(error);

      Vibration.vibrate(3000);
    }
  }
  
  render () {
    return (
      <View style={styles.container}>
        <BluetoothButton onPress={this.setUpBluetooth} text={"Connect"}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%"
  },
  button: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'powderblue'},
  text: {
    fontSize: 80,
    fontFamily: "Gill Sans",
    color: "darkblue"
  },
  
});

export default CrossSenseApp;
