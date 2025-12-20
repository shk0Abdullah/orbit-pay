import React, { ReactNode } from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import Animated, {
  AnimatedRef,
  runOnJS,
  scrollTo,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  animationConfig,
  COL,
  getOrder,
  getPosition,
  Positions,
  SIZE,
} from "./Config";

interface ItemProps {
  children: ReactNode;
  positions: SharedValue<Positions>;
  id: string;
  editing: boolean;
  onDragEnd: (diffs: Positions) => void;
  scrollView: AnimatedRef<Animated.ScrollView>;
  scrollY: SharedValue<number>;
}

const Item = ({
  children,
  positions,
  id,
  onDragEnd,
  scrollView,
  scrollY,
  editing,
}: ItemProps) => {
  const inset = useSafeAreaInsets();
  const containerHeight =
    Dimensions.get("window").height - inset.top - inset.bottom;
  const contentHeight = (Object.keys(positions.value).length / COL) * SIZE;
  const isGestureActive = useSharedValue(false);

  const position = getPosition(positions.value[id]!);
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);

  /* context kept across gesture callbacks */
  const ctx = useSharedValue({ x: 0, y: 0 });

  useAnimatedReaction(
    () => positions.value[id]!,
    (newOrder) => {
      if (!isGestureActive.value) {
        const pos = getPosition(newOrder);
        translateX.value = withTiming(pos.x, animationConfig);
        translateY.value = withTiming(pos.y, animationConfig);
      }
    }
  );

  /* replacement for removed useAnimatedGestureHandler */
  const onGestureEvent = (e: PanGestureHandlerGestureEvent) => {
    "worklet";
    const { translationX, translationY, state } = e.nativeEvent;
    if (state === State.ACTIVE && !isGestureActive.value) {
      if (!editing) return;
      ctx.value = { x: translateX.value, y: translateY.value };
      isGestureActive.value = true;
    }

    if (e.nativeEvent.state === State.ACTIVE && isGestureActive.value) {
      translateX.value = ctx.value.x + translationX;
      translateY.value = ctx.value.y + translationY;

      /* ---- reorder tiles ---- */
      const newOrder = getOrder(
        translateX.value,
        translateY.value,
        Object.keys(positions.value).length - 1
      );
      const oldOrder = positions.value[id];
      if (newOrder !== oldOrder) {
        const idToSwap = Object.keys(positions.value).find(
          (k) => positions.value[k] === newOrder
        );
        if (idToSwap) {
          const tmp = JSON.parse(JSON.stringify(positions.value));
          tmp[id] = newOrder;
          tmp[idToSwap] = oldOrder;
          positions.value = tmp;
        }
      }

      /* ---- auto-scroll ---- */
      const lowerBound = scrollY.value;
      const upperBound = lowerBound + containerHeight - SIZE;
      const maxScroll = contentHeight - containerHeight;
      const leftToScrollDown = maxScroll - scrollY.value;

      if (translateY.value < lowerBound) {
        const diff = Math.min(lowerBound - translateY.value, lowerBound);
        scrollY.value -= diff;
        scrollTo(scrollView, 0, scrollY.value, false);
        ctx.value.y -= diff;
        translateY.value = ctx.value.y + translationY;
      }
      if (translateY.value > upperBound) {
        const diff = Math.min(translateY.value - upperBound, leftToScrollDown);
        scrollY.value += diff;
        scrollTo(scrollView, 0, scrollY.value, false);
        ctx.value.y += diff;
        translateY.value = ctx.value.y + translationY;
      }
    }

    if (e.nativeEvent.state === State.END && isGestureActive.value) {
      const newPos = getPosition(positions.value[id]!);
      translateX.value = withTiming(newPos.x, animationConfig, () => {
        isGestureActive.value = false;
        runOnJS(onDragEnd)(positions.value);
      });
      translateY.value = withTiming(newPos.y, animationConfig);
    }
  };

  const style = useAnimatedStyle(() => {
    const zIndex = isGestureActive.value ? 100 : 0;
    const scale = withSpring(isGestureActive.value ? 1.05 : 1);
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: SIZE,
      height: SIZE,
      zIndex,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale },
      ],
    };
  });

  return (
    <Animated.View style={style}>
      <PanGestureHandler enabled={editing} onGestureEvent={onGestureEvent}>
        <Animated.View style={StyleSheet.absoluteFill}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

export default Item;
