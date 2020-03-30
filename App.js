import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';

export default function App() {
  const [clicks, setClicks] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  function clickHandler() {
    setClicks(clicks+1);
  }
 
  const fetchFonts = () => {
    return Font.loadAsync({
      'londrina-regular': require('./assets/fonts/LondrinaSolid-Regular.ttf')
    });
  } 

  if (!fontsLoaded) {
    return (
      <AppLoading 
        startAsync={fetchFonts} 
        onFinish={() => {setFontsLoaded(true)}} />
    );
  }

  return (
    <View style={styles.container}> 
      <Text style={styles.title}>Burger Clicker</Text>
      <Stats clicks={clicks} />
      <Burger onClick={clickHandler} /> 
      <Booster />
    </View>
  );
}

function Stats(props) {
  return (
    <View style={styles.stats}>
      <Text style={styles.stats_text}>Burgers</Text>
      <Text style={styles.stats_value}>{props.clicks}</Text>
    </View>
  );
}

function Burger(props) {
  return (
    <View style={styles.burger}>
      <TouchableOpacity activeOpacity={0.8} onPress={props.onClick} >
        <Image style={styles.burger_img} source={require('./assets/burger.png')} resizeMode='contain' />
      </TouchableOpacity>
    </View>
  );
}

function Booster() {
  return (
    <View>
      <Text style={styles.booster}>1 burger / click</Text>
    </View>
  );
}

// Muokatkaa sovellusta niin, että se tulostaa sivulle seuraavat tekstit:
//   - Burger Clicker
//   - Burgers
//   - 1 burger / click
//
// Muokkaa myös sivun ulkoasua niin, että sivun taustaväri on tumman harmaa ja 
// tekstin väri on vaalean harmaa. Tekstin värin pystyi määrittelemään color-määreellä.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    color: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ccc',
    fontSize: 50,
    fontFamily: 'londrina-regular'
  },
  stats: {
    alignItems: 'flex-end',
    width: '80%'
  },
  stats_text: {
    color: '#ccc',
    fontSize: 24,
    fontFamily: 'londrina-regular'
  },
  stats_value: {
    color: '#fff',
    fontSize: 48,
    fontFamily: 'londrina-regular'
  },
  burger: {
    width: '100%',
    
    flexDirection: 'row',
    justifyContent: 'center'
  },
  burger_img: {
    width: 0.8*Dimensions.get("window").width,
    height: 0.8*Dimensions.get("window").width
  },
  booster: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'londrina-regular'
  }

});
