export const luxuryEase = [0.16, 1, 0.3, 1] as const;

export const fadeUp = {
  initial: false,
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.5, ease: luxuryEase },
};

export const drawerMotion = {
  initial: { x: "-100%" },
  animate: { x: "0%" },
  exit: { x: "-100%" },
  transition: { duration: 0.5, ease: luxuryEase },
};
