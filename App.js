import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Vibration, Platform, TouchableOpacity } from 'react-native';

import RNBluetoothClassic, { BluetoothEventType, BluetoothDevice, BluetoothErrors } from 'react-native-bluetooth-classic';
import { sub } from 'react-native-reanimated';

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
      deviceConnected: false,
      buttonText: "Connect",
    };
  }

  async componentDidMount() {
    
    console.log("Adding Bluetooth enable/disable listeners.");
    this.enabledSubscription = RNBluetoothClassic
      .onBluetoothEnabled((event) => this.onStateChanged(event));
    console.log("test1");
      this.disabledSubscription = RNBluetoothClassic
      .onBluetoothDisabled((event) => this.onStateChanged(event));
    console.log("test2");
    this.disconnectedSubscription = RNBluetoothClassic
      .onDeviceDisconnected((event) => this.onDeviceDisconnected(event));
    console.log("test3");

    try {

      console.log("Checking if Bluetooth is enabled.");
      let enabled = await RNBluetoothClassic.isBluetoothEnabled();

      console.log(`Bluetooth enabled status => ${enabled}`);
      this.setState({ bluetoothEnabled: enabled});
    
    } catch (error) {

      console.log(`componentDidMount error`, error);
      this.setState({ bluetoothEnabled: false});

    }
  }

  /*
  componentWillUnmount() {
    console.log("Removing Bluetooth enabled/disable listeners.");
    
    let subscriptions = [
      this.enabledSubscription,
      this.disabledSubscription,
      this.disconnectedSubscription
    ]

    subscriptions.forEach( (subscription) => {
      try {
        subscription.remove();
      } catch (error) {
        console.warn("Failed to remove", subscription);
        console.log(error);
      }
    })
    
  }
  */

  onStateChanged(stateChangedEvent) {
    console.log("Bluetooth state changed.")
    console.log(stateChangedEvent);
    
    this.setState({
      bluetoothEnabled: stateChangedEvent.enabled,
      device: stateChangedEvent.enabled ? this.state.device : undefined
    });
  }

  onDeviceDisconnected(disconnectedEvent) {
    console.log("Device disconnected.");
    console.log(disconnectedEvent);

    this.readSubscription.remove();

    this.setState( { device: undefined, deviceConnected: false, buttonText: "Connect" } )
  }

  async setUpBluetooth () {
    
    console.log("BUTTON");

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

    if (!this.state.deviceConnected) {

      console.log("No device connected.");

      if (this.state.bluetoothEnabled) {

        console.log("Bluetooth is enabled. Proceeding with connection.");

        console.log("IF YOU SEE THIS, GOOD");

        let targetAddress = "98D351FD797A";
        
        // Get the list of bonded devices
        const bonded = RNBluetoothClassic.getBondedDevices();

        // Filter for your address / class
        const targetDevice = bonded.find( (device) => device.address == targetAddress);

        let connected = false;
        // Connect to the device
        if (targetDevice != undefined) {
          
          console.log("IF YOU SEE THIS, VERY GOOD")

          connected = targetDevice.connect().then(connectedToDevice, connectToDeviceError);
        
          // Set the final state once completed
          this.setState({
            device: targetDevice,
            deviceConnected: connected
          });
        } else {

          console.warn("Target device not found.");

        }

      } else {
        
        console.log("Bluetooth not enabled.");
      
      }

    } else {

      console.log("Device connected already. Disconnecting.");

      this.state.device.disconnect();

      // State changes handled by listener.

    }

    function readIncomingData(data) {
    
      console.log("VICTORY!!!")

      console.log("Receiving data:");
      console.log(data);

      // Vibrate regardless of the data received (CHANGE)
      Vibration.vibrate(PATTERN);
    
    }

    function connectedToDevice (device) {

      this.readSubscription = device.onDataReceived((data) => readIncomingData(data));

      this.setState({ buttonText: "Disconnect" })

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
