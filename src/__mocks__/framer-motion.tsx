import React from "react";

type MotionProps = {
  children?: React.ReactNode;
  layout?: boolean;
  whileTap?: any;
  animate?: any;
  initial?: any;
  transition?: any;
  [key: string]: any;
};

const createMotionComponent = (Component: string) => {
  const MotionComponent = ({ children, ...props }: MotionProps) => {
    // Filter out motion-specific props
    const {
      layout: _,
      whileTap: __,
      animate: ___,
      initial: ____,
      transition: _____,
      ...cleanProps
    } = props;

    return React.createElement(Component, cleanProps, children);
  };

  // Add display name
  MotionComponent.displayName = `Motion${Component}`;

  return MotionComponent;
};

export const motion = {
  div: createMotionComponent("div"),
  nav: createMotionComponent("nav"),
  button: createMotionComponent("button"),
};

export const AnimatePresence = ({ children }: { children: React.ReactNode }) =>
  children;
export const domAnimation = {};
export const LazyMotion = ({ children }: { children: React.ReactNode }) =>
  children;
export const m = motion;
