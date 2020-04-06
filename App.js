import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, ScrollView, Button } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import { NativeRouter, Link, Route } from 'react-router-native';
import items from './items.js';
import { useHistory } from 'react-router-dom';
import { render } from 'react-dom';

export default function App() {
  const [clicks, setClicks] = useState(49);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [gameItems, setGameItems] = useState(items);
  const [clickValue, setClickValue] = useState(1);
  
  function clickHandler() {
    setClicks(clicks + clickValue);
  }

  /*
  useEffect(() => {
    let result = 1;
    for (let i=0; i<gameItems.length; i++) {
      result = result * gameItems[i].click;
    }
    setClickValue(result);
  }, [gameItems]);  
  */
 
  function upgradeButtonHandler(index) {
    const originalPrice = gameItems[index].price;
    gameItems[index].price = Math.floor(originalPrice * gameItems[index].factorPrice);
    gameItems[index].level = gameItems[index].level + 1;
    gameItems[index].click = gameItems[index].click * gameItems[index].factorClick;
    
    let result = 1;
    for (let i=0; i<gameItems.length; i++) {
      result = result * gameItems[i].click;
    }
    setClickValue(result);

    setGameItems(gameItems);
    setClicks(clicks - originalPrice);
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
          <Game clicks={clicks} clickHandler={clickHandler} clickValue={clickValue} />
        </Route>
        <Route path='/shop'>
          <Shop items={gameItems} clicks={clicks} 
                buttonHandler={upgradeButtonHandler} />
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
      <Booster clickValue={props.clickValue} />
    </View>
  );
}

function Stats(props) {
  return (
    <View style={styles.stats}>
      <Text style={styles.stats_text}>Burgers</Text>
      <Text style={styles.stats_value}>{Math.floor(props.clicks)}</Text>
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

function Booster(props) {
  return (
    <View>
      <Text style={styles.booster}>{props.clickValue} burger / click</Text>
    </View>
  );
}

function Shop(props) {

  let result = props.items.map((item, index) => {
    return (
      <View style={styles.item} key={item.id} >

        <View style={styles.item_groupName}>
          <Text style={styles.item_title}>{item.name}</Text>
          <Text style={styles.item_text}>{item.desc}</Text>
        </View>

        
        <Text style={styles.item_text}>Level: {item.level}</Text>

        <ShopButton onPress={() => {props.buttonHandler(index)}} >
           <Text>{item.price}</Text>
           <Text>UPGRADE</Text>
        </ShopButton> 

        <Text style={styles.item_text}>Hinta {item.price} burgeria</Text>
        <Button title='OSTA' 
                color='#ffa500' 
                disabled={item.price > props.clicks} 
                onPress={() => {props.buttonHandler(index)}} />
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

function ShopButton(props) {
  return (
    <TouchableOpacity onPress={props.onPress} >
      <View style={styles.shopbutton}>
        {props.children}
      </View>
    </TouchableOpacity>
  );
}

function Menu() {
  return (
    <View style={styles.menu} >
      <MenuItem to='/' icon={require('./assets/icon-burger.png')} />
      <MenuItem to='/shop' icon={require('./assets/icon-coupon.png')} />
    </View>
  );
}

function MenuItem(props) {
  let history = useHistory();
  return (
    
    <TouchableOpacity onPress={() => {history.push(props.to)}} 
                      style={styles.menuitem} >
      <Image style={styles.menu_img} 
             source={props.icon} 
             resizeMode='contain' /> 
    </TouchableOpacity>
    
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
    flexDirection: 'column'
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
  item_title: {
    color: '#ccc',
    fontFamily: 'londrina-regular',
    fontSize: 0.07 * Dimensions.get("window").width
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
  menuitem: {
    width: '20%',
    height: '100%'
  },
  menu_img: {
    width: '100%',
    height: '100%'
  }

});
