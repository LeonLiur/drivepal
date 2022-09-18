import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import * as Speech from 'expo-speech';

const Buffer = require("buffer").Buffer;

const App = () => {
  const [tracking, setTracking] = useState(false);
  const DEVICE_ID = "D40FDE6E-E9E8-4DBE-86DC-F669BF29EDB6"
  const ACCOUNT_ID = "KvIVjtlDQZyr-WZoAt4IGvYhN4o"
  const SECRET_KEY = "s_Q1xmaQhFAdO9bXlVDnZmiNutw1AvVZgOFrhKgxwn4hgHKdUA32fg"
  const [intervalVar, setIntervalVar] = useState(null);
  const [speedCount, setSpeedCount] = useState(0);
  const [pv, setPv] = useState(0);
  const speedSenteces = ["watch the speed!", "be careful, slower!", "you are above the speed limit.", "beware of the speed limit!"]

  handleClick = () => {
    if (!tracking) {
      Speech.speak("Tracking started")
      fetch(`https://v3.api.hypertrack.com/devices/${DEVICE_ID}/start`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(ACCOUNT_ID + ":" + SECRET_KEY).toString("base64")
        }
      }).then((response) => response.json()).then((data) => { console.log('Success: ', data) })

      setIntervalVar(setInterval(function () {
        (fetch(`https://v3.api.hypertrack.com/devices/${DEVICE_ID}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(ACCOUNT_ID + ":" + SECRET_KEY).toString("base64")
          }
        }).then((response) => response.json()).then((data) => {
          console.log(data.location); if (Math.abs(pv - data.location.speed) > 15) {
            Speech.speak("jerk detected, try to be smooth on the gas!")
          }; setPv(Math.abs(pv - data.location.speed));
          if (data.location.speed > 20) {
            setSpeedCount(speedCount + 1);
            Speech.speak(speedSenteces[Math.floor(Math.random * 4)])
          }
        }))
      }, 2500));
      console.log("NEW INTERVAL")

    } else {
      Speech.speak("Tracking over")
      fetch(`https://v3.api.hypertrack.com/devices/${DEVICE_ID}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(ACCOUNT_ID + ":" + SECRET_KEY).toString("base64")
        }
      }).then((response) => response.json()).then((data) => { console.log('Success: ', data) })
      console.log("CLEAR INTERVAL")
      clearInterval(intervalVar);
      setIntervalVar(null);
    }
    setTracking(!tracking);
  }


  return (
    <View style={styles.container}>
      <Button
        style={styles.button}
        onPress={() => handleClick()}
        title={tracking ? "end tracking" : "start tracking"}
      />
      <Text style={styles.bigred}>{`speedings: ${speedCount}`}</Text>
    </View>
  );
};

// React Native Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    backgroundColor: "black",
    color: "white",
    width: "50%",
    heihgt: "50%",
    left: "auto",
    right: "auto",
    fontSize: "30px"
  },
  bigred: {
    fontSize: "20px",
    color: "red"
  }
});

export default App;