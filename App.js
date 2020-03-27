import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}> 
      <Text style={styles.title}>Burger Clicker</Text>
      <Stats />
      <Booster />
    </View>
  );
}

function Stats() {
  return (
    <View style={styles.stats}>
      <Text style={styles.stats_text}>Burgers</Text>
      <Text style={styles.stats_value}>147</Text>
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
    fontSize: 50
  },
  stats: {
    alignItems: 'flex-end',
    width: '80%'
  },
  stats_text: {
    color: '#ccc',
    fontSize: 24
  },
  stats_value: {
    color: '#ccc',
    fontSize: 48
  },
  booster: {
    color: '#ccc',
    fontSize: 14
  }

});
