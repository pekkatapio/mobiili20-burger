import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, TextInput, ScrollView, Button, Modal, AsyncStorage, Animated, Easing } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import { NativeRouter, Link, Route } from 'react-router-native';
import { useHistory } from 'react-router-dom';
import items from './items.js';
import { scale, verticalScale, moderateScale } from './scaling_utils';
import { useInterval } from './useInterval';
import { Badge } from 'react-native-elements';
import useAnimate from './useAnimate';

const numberMillion = Math.pow(10,6);
const numberBillion = Math.pow(10,9);
const numberTrillion = Math.pow(10,12);
const numberQuadrillion = Math.pow(10,15);
function shortenNumber(number) {
  if (number > numberQuadrillion) {
    return (number / numberQuadrillion).toFixed(2) + " Quadrillion";
  } else if (number > numberTrillion) {
    return (number / numberTrillion).toFixed(2) + " Trillion";
  } else if (number > numberBillion) {
    return (number / numberBillion).toFixed(2) + " Billion";
  } else if (number > numberMillion) {
    return (number / numberMillion).toFixed(2) + " Million";
  } else {
    return number;
  }
}

export default function App() {

  // Määritellään pelin sisällä käytettävät state-muuttujat.
  const [burgers, setBurgers] = useState(0);                    // Varastossa olevien burgereiden määrä.
  const [totalClicks, setTotalClicks] = useState(0);            // Klikkauksien määrä koko pelin aikana.
  const [totalBurgers, setTotalBurgers] = useState(0);          // Pelin aikana kerättyjen burgereiden määrä.
  const [fontsLoaded, setFontsLoaded] = useState(false);        // Onko pelissä käytettävät fontit ladattu.
  const [gameItems, setGameItems] = useState(items);            // Ostettavien tuotteiden taulukko.
  const [clickValue, setClickValue] = useState(1);              // Yhdellä klikkauksella saatavien burgereiden määrä.
  const [dataStored, setDataStored] = useState(false);          // Määrittelee, onko tiedot tallennettu laitteen muistiin.
  const [upgrades, setUpgrades] = useState(undefined);          // Ostettavien päivitysten lukumäärä.
  const [upgradeTreshold, setUpgradeTreshold] = useState(0);    // Raja-arvo, jonka ylitettyä lasketaan ostettavien määrä.
  const [messages, setMessages] = useState([]);                 // Viestipuskuri, josta näytetään viestit yksitellen.
  const [message, setMessage] = useState("");                   // Näytettävä viesti.

  // Määritellään useEffect-hook, joka suoritetaan kerran
  // siinä vaiheessa kun App-komponentti on renderöity.
  // Ensimmäiseksi haetaan muistiin tallennetut tiedot ja 
  // viedään ne state-muuttujiin. Lisäksi alustetaan 
  // interval-ajastin, joka tallentaa 30 sekunnin välein
  // tehdyt muutokset.
  useEffect(() => {

    // fetchData-funktio, jolla haetaan talteen tallennetut tiedot.
    async function fetchData() {

      // Haetaan tallennetut tiedot.
      const data = await getStoredValue('data');

      // Jos data-tiedot löytyivät, puretaan se ensin JSON-muotoon
      // ja tallennetaan sitten state-muuttujiin.
      if (data) {
        const parsedData = JSON.parse(data);
        const clickvalue = calculateClickValue(parsedData.items);
        setBurgers(parsedData.burgers);
        setTotalClicks(parsedData.totalclicks);
        setTotalBurgers(parsedData.totalburgers);
        setClickValue(clickvalue);        
        setGameItems(parsedData.items);
        updateUpgrades(parsedData.burgers);
        setDataStored(true);
      }

    } 

    // Käynnistetään tietojen nouto.
    fetchData();

  }, []);

  // Luodaan interval, joka tallentaa 30 sekunnin välein
  // pelitilanteen.  
  useInterval(async () => {

    // Tarkistetaan, onko tilanne muuttunut viimeisimmän
    // tallennuksen jälkeen. Jos on, niin silloin
    // tallennetaan nykyinen pelitilanne talteen.
    if (!dataStored) {
      // Luodaan olio, joka sisältää tallennettavat tiedot ja
      // tallennetaan se data-tunnisteella.
      const data = {
        burgers: burgers,
        totalclicks: totalClicks,
        totalburgers: totalBurgers,
        items: gameItems
      }
      await storeValue('data', JSON.stringify(data));
      setDataStored(true);
      addMessage("Game saved.");
      console.log("Välitallennus suoritettu!");
    }

  }, 3000);  

  useInterval(() => {
    const newmessage = getNextMessage();
    if (message || newmessage) {
      setMessage(newmessage ? newmessage : "");
    }
  }, 2000);

  // getStoredValue-funktio, joka hakee muistiin tallennetun
  // arvon sen tunnisteella (item). Palauttaa tallennetun arvon
  // merkkijonona. Jos arvoa ei löydy, palauttaa undefined-arvon. 
  async function getStoredValue(item) {
    return await AsyncStorage.getItem(item);
  }

  // storeValue-funktio, joka tallentaa arvon sen tunnisteella.
  // Funktio olettaa, että arvo annetaan merkkijono-muodossa.
  async function storeValue(item, value) {
    await AsyncStorage.setItem(item, value);
    console.log("stored " + item + ":" + value)
  }

  // calculateClickValue-funktio, joka laskee yhdestä klikistä 
  // saatavien burgereiden määrän. Arvo lasketaan kertomalla keskenään 
  // ostotaulukon tuotteiden click-arvot keskenään.
  function calculateClickValue(array) {
    let result = 1;
    for (let i=0; i<array.length; i++) {
      result = result * array[i].click;
    }    
    return result;
  }

  // clickHandler-funktio, joka käsittelee burgerin klikkauksen.
  // Kasvatetaan burgereiden, kokonaisklikkien ja kokonaisburgereiden
  // määrää. 
  async function clickHandler() {
    const newBurgers = burgers + clickValue;
    const newTotalClicks = totalClicks + 1;
    const newTotalBurgers = totalBurgers + clickValue;
    setBurgers(newBurgers);
    setTotalClicks(newTotalClicks);
    setTotalBurgers(newTotalBurgers);
    setDataStored(false);
    if (newBurgers > upgradeTreshold) {
      updateUpgrades(newBurgers);  
    }
  }
 
  // upgradeButtonHandler-funktio, joka laskee oston jälkeen
  // peliin vaikuttaville muuttujille uudet arvot ja 
  // tallentaa ne state-muuttujiin.
  function upgradeButtonHandler(index) {
    const originalPrice = gameItems[index].price;
    gameItems[index].price = Math.floor(originalPrice * gameItems[index].factorPrice);
    gameItems[index].level = gameItems[index].level + 1;
    gameItems[index].click = gameItems[index].click * gameItems[index].factorClick;
    let result = calculateClickValue(gameItems);
    setGameItems(gameItems);
    setBurgers(burgers => burgers - originalPrice);
    setClickValue(result);
    setDataStored(false);
    updateUpgrades(burgers - originalPrice);
  }

  function addMessage(message) {
    let array = messages.slice();
    array.push(message);
    setMessages(array); 
  } 

  function getNextMessage() {
    let array = messages.slice();
    const message = array.shift();
    setMessages(array);
    return message;
  }

  function updateUpgrades(burgers) {
    let upgradeable = 0;
    let newUpdateValue = upgradeTreshold;
    gameItems.forEach((item) => {
      if (item.price <= burgers) {
        upgradeable ++;
      }
      if ((newUpdateValue < burgers && item.price > newUpdateValue) ||
          (item.price > burgers && item.price < newUpdateValue)) {
            newUpdateValue = item.price;
      }
    }); 
    if (upgradeable > upgrades) {
      addMessage("More items to purchase.");
    }
    setUpgrades(upgradeable);
    setUpgradeTreshold(newUpdateValue);
  }  

  function resetGameHandler() {
    setBurgers(1234567);
    setGameItems(items);
    setClickValue(1);
    setTotalClicks(0);
    setTotalBurgers(0);
    setDataStored(false);
    setUpgradeTreshold(0);
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
          <Game burgers={burgers} 
                clickHandler={clickHandler} 
                clickValue={clickValue} 
                message={message} />
        </Route>
        <Route path='/shop'>
          <Shop items={gameItems} burgers={burgers} 
                buttonHandler={upgradeButtonHandler} 
                resetGame={resetGameHandler} />
        </Route>
        <Route path='/settings'>
          <Settings resetGame={resetGameHandler} 
                    totalClicks={totalClicks} 
                    burgers={burgers} 
                    totalBurgers={totalBurgers} />
        </Route>
        <Menu upgrades={upgrades} />
      </View>
    </NativeRouter>
  );
}

function Game(props) {
  return (
    <View style={styles.game}>
      <Text style={styles.title}>Burger Clicker</Text>
      <Stats burgers={props.burgers} />
      <Burger onClick={props.clickHandler} burgers={props.burgers} /> 
      <Booster clickValue={props.clickValue} />
      <Message message={props.message} />
    </View>
  );
}

function Message(props) {
  const interpolate = useAnimate(0, 1, [props.message]);
  return (
    props.message ? 
    <Animated.View style={{...styles.message, opacity: interpolate[1,0]}}>
      <Text style={styles.messagetext}>{props.message}</Text>
    </Animated.View> : 
    <View style={styles.messageempty}></View>
  );
}

function Stats(props) {
  return (
    <View style={styles.stats}>
      <Text style={styles.stats_text}>Burgers</Text>
      <Text style={styles.stats_value}>{shortenNumber(Math.floor(props.burgers))}</Text>
    </View>
  );
}

function Burger(props) {
  const interpolate = useAnimate(0, 1, [props.burgers]);
  let imageViewStyle = { ...styles.burger , transform: [{scale: interpolate([0.95, 1])}] }; 
  return (
    <Animated.View style={imageViewStyle}>
      <TouchableOpacity activeOpacity={0.95} onPressIn={() => {
          props.onClick();
        } }>
        <Image style={styles.burger_img} source={require('./assets/burger.png')} resizeMode='contain' />
      </TouchableOpacity>
    </Animated.View>
  );
}

function Booster(props) {
  return (
    <View>
      <Text style={styles.booster}>{shortenNumber(props.clickValue.toFixed(2))} burger / click</Text>
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
            <Badge value={item.level} 
                   badgeStyle={{backgroundColor: brighttext}} 
                   textStyle={{ color: mediumbg,
                                fontFamily: mainfont }} 
                   containerStyle={{marginLeft:5}} />
          </View>
          <Text style={styles.item_text}>{item.desc}</Text>
        </View>

        <ShopButton onPress={() => {props.buttonHandler(index)}} 
                    disabled={item.price > props.burgers} >
           <Text style={styles.upgrade_price}>{shortenNumber(item.price)}</Text>
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

        <Text style={styles.settings_text}>Burgers: {shortenNumber(Math.floor(props.burgers))}</Text>
        <Text style={styles.settings_text}>Total clicks clicked: {shortenNumber(props.totalClicks)}</Text>
        <Text style={styles.settings_text}>Total burgers: {shortenNumber(Math.floor(props.totalBurgers))}</Text>
      
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

function Menu(props) {
  return (
    <View style={styles.menu} >
      <MenuItem to='/' icon={require('./assets/icon-burger.png')} />
      <MenuItem to='/shop' icon={require('./assets/icon-coupon.png')} value={props.upgrades} />
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
      { props.value ?  
        <Badge
             value={props.value}
             badgeStyle={{backgroundColor: buttoncolor }}
             textStyle={{fontSize: moderateScale(15), fontFamily: mainfont }}
             containerStyle={{ position: 'absolute', top: -moderateScale(4), right: -moderateScale(4) }}
        /> : null }
    </TouchableOpacity>
    
  );
}


/* ------------- Tyylimääritykset ------------- */

const darkbg = '#333';
const mediumbg = '#666';
const lighttext = '#ccc';
const brighttext = '#fff';
const mainfont = 'londrina-regular';
const buttoncolor = '#ffa500';

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
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(20)
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
    fontSize: moderateScale(40),
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
    fontSize: moderateScale(16)
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
  },
  message: {
    backgroundColor: mediumbg,
    padding: moderateScale(5),
    borderRadius: moderateScale(5),
    height: moderateScale(30)
  },
  messagetext: {
    color: lighttext
  }, 
  messageempty: {
    height: moderateScale(30)
  }

});
