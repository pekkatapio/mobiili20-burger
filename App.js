import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, ScrollView, Button } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import { NativeRouter, Link, Route } from 'react-router-native';
import items from './items.js';

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
    <NativeRouter>
      <View style={styles.container}> 
        <Route exact path='/'>
          <Game clicks={clicks} clickHandler={clickHandler} />
        </Route>
        <Route path='/shop'>
          <Shop />
        </Route>
        <Menu />
      </View>
    </NativeRouter>
  );
}

function Game(props) {
  return (
    <View style={styles.game}>
      <Text style={styles.title}>Burger Clicker</Text>
      <Stats clicks={props.clicks} />
      <Burger onClick={props.clickHandler} /> 
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

function Shop(props) {

  let result = items.map((item) => {
    return (
      <View style={styles.item} key={item.id} >
        <Text style={styles.item_text}>{item.desc}</Text>
        <Button title='OSTA' color='#ffa500' />
      </View>
    );
  });

  return (
    <View style={styles.game}>
      <Text style={styles.title}>Shop</Text>
      <ScrollView style={styles.shop_items}>
        {result}
      </ScrollView>
    </View>
  );
}

function Menu() {
  return (
    <View style={styles.menu} >
      <Link to='/'>
        <Text>Game</Text>
      </Link>
      <Link to='/shop'>
        <Text>Shop</Text>
      </Link>
    </View>
  );
}
// Kuvat odottamaan, että löytyy, miten ne toimivat Linkin kanssa.. 
// <Image style={styles.menu_img} source={require('./assets/icon-burger.png')} resizeMode='contain' />
// <Image style={styles.menu_img} source={require('./assets/icon-coupon.png')} resizeMode='contain' />

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
    paddingTop: Constants.statusBarHeight,
  },
  game: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20
  },
  title: {
    color: '#ccc',
    fontSize: 0.16*Dimensions.get("window").width,
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
  },
  shop_items: {
    flex: 1,
    paddingTop: 10,
  },
  item: {
    backgroundColor: '#666',
    borderWidth: 2,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  item_text: {
    color: '#ccc'
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', 
    width: '100%',
    height: 0.2*Dimensions.get("window").width,
    paddingTop: 10,
    paddingBottom: 10
  },
  menu_img: {
    width: '20%',
    height: '100%'
  }

});
