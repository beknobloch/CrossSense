import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Vibration, Platform, TouchableOpacity } from 'react-native';

import RNBluetoothClassic, { BluetoothEventType, BluetoothDevice, BluetoothErrors } from 'react-native-bluetooth-classic';

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
      bluetoothEnabled: true,
      buttonText: "Connect",
    };
  }

  async componentDidMount() {
    
    console.log("Adding Bluetooth enable/disable listeners.");
    this.enabledSubscription = RNBluetoothClassic
      .onBluetoothEnabled((event) => this.onStateChanged(event));
    this.disabledSubscription = RNBluetoothClassic
      .onBluetoothDisabled((event) => this.onStateChanged(event));

    try {
      console.log("Checking if Bluetooth is enabled.");
      let enabled = await RNBluetoothClassic.isBluetoothEnabled();

      console.log(`Bluetooth enabled status => ${enabled}`);
      this.setState({ bluetoothEnabled: enabled, buttonText: "Connected" });
    } catch (error) {
      console.log(`componentDidMount error`, error);
      this.setState({ bluetoothEnabled: false, buttonText: "Connect" });
    }
  }

  componentWillUnmount() {
    console.log("Removing Bluetooth enabled/disable subscriptions.");
    this.enabledSubscription.remove();
    this.disabledSubscription.remove();
  }

  onStateChanged(stateChangedEvent) {
    console.log("Bluetooth state changed.")
    console.log(stateChangedEvent);
    
    this.setState({
      bluetoothEnabled: stateChangedEvent.enabled,
      buttonText: stateChangedEvent.enabled ? "Connected" : "Connect",
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

    if(this.state.bluetoothEnabled) {

      let address = "98D351FD797A";
      let device = await RNBluetoothClassic.getConnectedDevice(address);
      device.then(connectToDevice, connectToDeviceError);
    
    }


    function readIncomingData(data) {
    
      console.log("Receiving data:");
      console.log(data);

      // Vibrate regardless of the data received (CHANGE)
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

          console.log("No connection. Attempting to connect.");
    
          device.connect().then( (connectionResult) => {
          
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

          console.log("Connection. Attempting to disconnect.");
    
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
