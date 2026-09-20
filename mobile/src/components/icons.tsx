import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "../theme/colors";

export type IconProps = { size?: number; color?: string };

/**
 * Mêmes tracés que `web/src/components/icons.tsx` : les deux interfaces
 * partagent le même jeu d'icônes linéaires 24×24, trait 1.5.
 */
function base(children: (color: string) => React.ReactNode) {
  return function Icon({ size = 20, color = colors.text }: IconProps) {
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children(color)}
      </Svg>
    );
  };
}

export const IconInbox = base(() => (
  <>
    <Path d="M3 12h4.5l1.5 3h6l1.5-3H21" />
    <Path d="M5.5 6h13l2.5 6v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8l2.5-6Z" />
  </>
));

export const IconCalendar = base(() => (
  <>
    <Rect x="3.5" y="5" width="17" height="16" rx="2.2" />
    <Path d="M8 3v4M16 3v4M3.5 10h17" />
  </>
));

export const IconMessage = base(() => (
  <Path d="M4 5.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H9l-4.6 3.5a.6.6 0 0 1-.96-.48V17H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z" />
));

export const IconUser = base(() => (
  <>
    <Circle cx="12" cy="8.2" r="3.4" />
    <Path d="M5.2 20c1.1-3.4 3.5-5.1 6.8-5.1s5.7 1.7 6.8 5.1" />
  </>
));

export const IconPlus = base(() => (
  <>
    <Circle cx="12" cy="12" r="8.5" />
    <Path d="M12 8.5v7M8.5 12h7" />
  </>
));

export const IconList = base((color) => (
  <>
    <Path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11" />
    <Circle cx="4.2" cy="6.5" r="0.9" fill={color} stroke="none" />
    <Circle cx="4.2" cy="12" r="0.9" fill={color} stroke="none" />
    <Circle cx="4.2" cy="17.5" r="0.9" fill={color} stroke="none" />
  </>
));

export const IconArrowLeft = base(() => (
  <>
    <Path d="M19 12H5" />
    <Path d="M11 6l-6 6 6 6" />
  </>
));

export const IconPhone = base(() => (
  <Path d="M6.6 3.5 9 6.2a1 1 0 0 1-.1 1.4L7.3 9.1a12.4 12.4 0 0 0 6.6 6.6l1.5-1.6a1 1 0 0 1 1.4-.1l2.7 2.4a1 1 0 0 1 .1 1.4l-1.5 1.7a1.6 1.6 0 0 1-1.5.5C10.7 19 5 13.3 3.4 7.5a1.6 1.6 0 0 1 .5-1.5l1.7-1.5a1 1 0 0 1 1-.1Z" />
));

export const IconMail = base(() => (
  <>
    <Rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <Path d="M4.5 7 12 12.5 19.5 7" />
  </>
));

export const IconLogout = base(() => (
  <>
    <Path d="M9 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h3" />
    <Path d="M14 16l4-4-4-4" />
    <Path d="M18 12H9" />
  </>
));

export const IconSearch = base(() => (
  <>
    <Circle cx="10.8" cy="10.8" r="6.3" />
    <Path d="M20 20l-4.3-4.3" />
  </>
));

export const IconCrown = base(() => <Path d="M4 8.5 8 12l4-6 4 6 4-3.5-1.6 9.5H5.6L4 8.5Z" />);

export const IconCheck = base(() => <Path d="m5 12.5 4.5 4.5L19 7" />);

export const IconX = base(() => (
  <>
    <Path d="m6 6 12 12" />
    <Path d="M18 6 6 18" />
  </>
));

export const IconAlert = base(() => (
  <>
    <Circle cx="12" cy="12" r="8.5" />
    <Path d="M12 8v5" />
    <Path d="M12 16h.01" />
  </>
));

export const IconBell = base(() => (
  <>
    <Path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5Z" />
    <Path d="M10.2 19a2 2 0 0 0 3.6 0" />
  </>
));

export const IconCar = base(() => (
  <>
    <Path d="M4 15.5h16v3a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1H7v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-3Z" />
    <Path d="M5 15.5 6.6 9a2 2 0 0 1 1.9-1.4h7a2 2 0 0 1 1.9 1.4L19 15.5" />
    <Path d="M7.5 12.5h9" />
  </>
));

export const IconShield = base(() => (
  <>
    <Path d="M12 3.5 19 6v6c0 4.2-2.9 7.3-7 8.5-4.1-1.2-7-4.3-7-8.5V6l7-2.5Z" />
    <Path d="m9 12 2 2 4-4" />
  </>
));

export const IconSparkle = base(() => (
  <Path d="M12 4.5 13.6 9.4 18.5 11l-4.9 1.6L12 17.5l-1.6-4.9L5.5 11l4.9-1.6L12 4.5Z" />
));

export const IconStar = base(() => (
  <Path d="M12 3.5l2.6 5.6 6 .7-4.5 4.1 1.3 5.9L12 16.9 6.6 19.8l1.3-5.9L3.4 9.8l6-.7z" />
));
