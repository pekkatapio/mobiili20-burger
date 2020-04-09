import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, TextInput, ScrollView, Button, Modal } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import { NativeRouter, Link, Route } from 'react-router-native';
import items from './items.js';
import { useHistory } from 'react-router-dom';
import { AsyncStorage } from 'react-native';
import { scale, verticalScale, moderateScale } from './scaling_utils';

export default function App() {
  const [clicks, setClicks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [gameItems, setGameItems] = useState(items);
  const [clickValue, setClickValue] = useState(1);
  
  async function clickHandler() {
    const newClicks = clicks + clickValue;
    const newTotalClicks = totalClicks + 1;
    setClicks(newClicks);
    setTotalClicks(newTotalClicks);
    storeClicks(newClicks+'');
    storeTotalClicks(newTotalClicks+'');
  }

  async function getClicks() {
    const clicks = parseFloat(await AsyncStorage.getItem('clicks'));
    return clicks;
  }

  async function getTotalClicks() {
    const totalclicks = parseInt(await AsyncStorage.getItem('totalclicks'));
    return totalclicks;
  }

  async function getItems() {
    const items = JSON.parse(await AsyncStorage.getItem('items'));
    return items;
  }

  async function storeClicks(clicks) {
    await AsyncStorage.setItem('clicks', clicks);
  }

  async function storeTotalClicks(totalclicks) {
    await AsyncStorage.setItem('totalclicks', totalclicks);
  }

  async function storeItems(items) {
    await AsyncStorage.setItem('items', JSON.stringify(items));
  }

  useEffect(() => {
    async function fetchData() {
      const clicks = await getClicks();
      if (clicks) {
        setClicks(clicks);
      } else {
        setClicks(0);
      }
      const totalclicks = await getTotalClicks();
      if (totalclicks) {
        setTotalClicks(totalclicks);
      } else {
        setTotalClicks(0);
      }
      const storedItems = await getItems();
      if (storedItems) {
        let result = 1;
        for (let i=0; i<storedItems.length; i++) {
          result = result * storedItems[i].click;
        }
        setClickValue(result);        
        setGameItems(storedItems);
      } 
    } 
    fetchData();
  }, []);

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
    storeItems(gameItems);

    setClicks(clicks - originalPrice);
    storeClicks((clicks - originalPrice)+'');
  }

  function resetHandler() {
    setClicks(0);
    storeClicks('0');
    setGameItems(items);
    storeItems(items);
    setClickValue(1);
    setTotalClicks(0);
    storeTotalClicks('0');
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
                buttonHandler={upgradeButtonHandler} 
                resetGame={resetHandler} />
        </Route>
        <Route path='/settings'>
          <Settings resetGame={resetHandler} totalClicks={totalClicks} clicks={clicks} />
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
      <Text style={styles.booster}>{props.clickValue.toFixed(2)} burger / click</Text>
    </View>
  );
}

function Shop(props) {
  const [modalVisible, setModalVisible] = useState(false);

  let result = props.items.map((item, index) => {
    return (
      <View style={styles.item} key={item.id} >


        <View style={styles.item_groupName}>
          <View style={styles.item_titlerow}>
            <Text style={styles.item_title}>{item.name}</Text>
            <Text style={styles.item_level}>(level {item.level})</Text>
          </View>
          <Text style={styles.item_text}>{item.desc}</Text>
        </View>

        <ShopButton onPress={() => {props.buttonHandler(index)}} 
                    disabled={item.price > props.clicks} >
           <Text style={styles.upgrade_price}>{item.price}</Text>
           <Text style={styles.upgrade_action}>UPGRADE</Text>
        </ShopButton> 

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

function Settings(props) {
  const [modalVisible, setModalVisible] = useState(false);
  const value = props.totalClicks % 1000;
  const [inputvalue, setInputvalue] = useState('');

  return (
    <View style={styles.game}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.shop_items}>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setInputvalue('');
          setModalVisible(false);
        }}>
        <View style={styles.resetmodal}>
          
            <Text style={styles.title}>Reset game</Text>

            <Text style={styles.settings_text}>Do you really want to reset the game?</Text>
            <Text style={styles.settings_text}>If you are, please type value {value} in text box below.</Text>
            <TextInput style={styles.resetmodal_input} 
                       value={inputvalue} 
                       onChangeText={(text) => {setInputvalue(text)}} 
                       textAlign='center' />
            
            <View style={styles.settings_button}>
              <Button color={buttoncolor} 
                      title="RESET GAME" 
                      onPress={() => { 
                        props.resetGame(); 
                        setInputvalue('');
                        setModalVisible(false); 
                      }} 
                      disabled={value.toString() != inputvalue} />
            </View>
            <View style={styles.settings_button}>
              <Button color={buttoncolor} title="CANCEL" onPress={() => {
                setModalVisible(!modalVisible);
                setInputvalue('');
              }}
              />
            </View>
          
        </View>
      </Modal>

        <Text style={styles.settings_text}>Total clicks clicked: {props.totalClicks}</Text>
        <Text style={styles.settings_text}>Burgers: {Math.floor(props.clicks)}</Text>
      
        <View style={styles.settings_button}>
          <Button title="RESET GAME" color={buttoncolor} onPress={() => {setModalVisible(true)}} />
        </View>
        </View>
    </View>
  );
}

function ShopButton(props) {
  return (
    props.disabled ?
    <View style={styles.shopbutton} opacity={0.3}>
      {props.children}
    </View> :
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
      <MenuItem to='/settings' icon={require('./assets/icon-settings.png')} />
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


/* ------------- Tyylimääritykset ------------- */

const sizeFactor = Dimensions.get("window").height / Dimensions.get("window").width;

const darkbg = '#333';
const mediumbg = '#666';
const lighttext = '#ccc';
const brighttext = '#fff';
const mainfont = 'londrina-regular';
const buttoncolor = '#ffa500';
const scaleToScreen = (size) => {
  const widthSize = Math.round((factor/50*0.16) * Dimensions.get("window").width);
}
const scaleToWidth = (factor) => Math.round((factor/50*0.16) * Dimensions.get("window").width);
console.log("------");
console.log(Dimensions.get("window").width);
console.log(Dimensions.get("window").height);
console.log(scaleToWidth(50));
console.log(sizeFactor);
console.log("------");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkbg,
    color: lighttext,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
  },
  game: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: scaleToWidth(20),
    paddingBottom: scaleToWidth(20)
  },
  title: {
    color: lighttext,
    fontSize: moderateScale(55),
    fontFamily: mainfont
  },
  stats: {
    alignItems: 'flex-end',
    width: '80%'
  },
  stats_text: {
    color: lighttext,
    fontSize: moderateScale(24),
    fontFamily: mainfont
  },
  stats_value: {
    color: brighttext,
    fontSize: moderateScale(48),
    fontFamily: mainfont
  },
  burger: {
    width: '100%',
    
    flexDirection: 'row',
    justifyContent: 'center'
  },
  burger_img: {
    width: moderateScale(250),
    height: moderateScale(250)
  },
  booster: {
    color: lighttext,
    fontSize: moderateScale(14),
    fontFamily: mainfont
  },
  shop_items: {
    flex: 1,
    paddingTop: moderateScale(10),
    flexDirection: 'column'
  },
  item: {
    backgroundColor: mediumbg,
    borderWidth: 2,
    padding: moderateScale(10),
    marginBottom: moderateScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  item_groupName: {
    width: '75%' 
  },
  item_title: {
    color: brighttext,
    fontFamily: mainfont,
    fontSize: moderateScale(24)
  },
  item_text: {
    color: lighttext,
    fontFamily: mainfont,
    fontSize: moderateScale(16)
  },
  item_titlerow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  item_level: {
    color: lighttext,
    marginLeft: 5,
    fontFamily: mainfont,
    fontSize: moderateScale(16)
  },
  shopbutton: {
    backgroundColor: buttoncolor,
    padding: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  shopbutton_disabled: {
    backgroundColor: mediumbg,
    padding: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },  
  upgrade_price: {
    color: brighttext,
    fontFamily: mainfont,
    fontSize: scaleToWidth(16)
  },
  upgrade_action: {
    color: brighttext,
    fontFamily: mainfont
  },
  settings_text: {
    color: lighttext,
    fontFamily: mainfont,
    fontSize: moderateScale(20),
    marginBottom: moderateScale(5)
  },
  settings_button: {
    marginTop: moderateScale(20)
  },
  resetmodal: {
    backgroundColor: darkbg,
    flex: 1,
    padding: moderateScale(20),
    alignItems: 'center'
  },
  resetmodal_input: {
    backgroundColor: mediumbg,
    borderColor: lighttext,
    borderWidth: 1,
    width: '50%',
    color: lighttext,
    fontFamily: mainfont,
    fontSize: moderateScale(25),
    padding: moderateScale(5)
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', 
    width: '100%',
    height: verticalScale(90),
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(10)
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
