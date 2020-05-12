
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

const useAnimate = (fromValue = 0, toValue = 1, listeningTo = [], avoidFirst = true) => {
  const scale = useRef(new Animated.Value(fromValue)).current;

  const animate = () => {
    scale.setValue(fromValue);
    Animated.timing(scale, { toValue: toValue, duration: 200 }).start();
  };

  const interpolate = range => scale.interpolate({ inputRange: [0, 1], outputRange: range });

  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    console.log("useeffectin trigger!");
    (!avoidFirst || !isFirst) && animate();
    setIsFirst(false);
  }, listeningTo);

  return interpolate;
};

export default useAnimate;