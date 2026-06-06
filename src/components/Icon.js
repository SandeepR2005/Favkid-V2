/* FavKid — line icons ported from favkid_screens/icons.jsx to react-native-svg. */
import React from "react";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { COLORS } from "../theme";

export default function Icon({ name, size = 22, stroke = 1.9, color = COLORS.text }) {
  const common = {
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
  };
  const dot = { fill: color, stroke: "none" };

  const paths = {
    home: (
      <>
        <Path d="M3 10.5 12 4l9 6.5" {...common} />
        <Path d="M5.5 9.5V20h13V9.5" {...common} />
        <Path d="M9.5 20v-5h5v5" {...common} />
      </>
    ),
    target: (
      <>
        <Circle cx="12" cy="12" r="8" {...common} />
        <Circle cx="12" cy="12" r="4" {...common} />
        <Circle cx="12" cy="12" r="0.6" {...dot} />
      </>
    ),
    grid: (
      <>
        <Rect x="3.5" y="3.5" width="7" height="7" rx="2" {...common} />
        <Rect x="13.5" y="3.5" width="7" height="7" rx="2" {...common} />
        <Rect x="3.5" y="13.5" width="7" height="7" rx="2" {...common} />
        <Rect x="13.5" y="13.5" width="7" height="7" rx="2" {...common} />
      </>
    ),
    trophy: (
      <>
        <Path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" {...common} />
        <Path d="M7 5H4v1.5A3.5 3.5 0 0 0 7 10" {...common} />
        <Path d="M17 5h3v1.5A3.5 3.5 0 0 1 17 10" {...common} />
        <Path d="M9.5 13.5 9 18h6l-.5-4.5" {...common} />
        <Path d="M7.5 20.5h9" {...common} />
      </>
    ),
    link: (
      <>
        <Path d="M9.5 14.5 14.5 9.5" {...common} />
        <Path d="M8 11 6 13a3.5 3.5 0 0 0 5 5l2-2" {...common} />
        <Path d="M16 13l2-2a3.5 3.5 0 0 0-5-5l-2 2" {...common} />
      </>
    ),
    plus: (
      <>
        <Path d="M12 5v14" {...common} />
        <Path d="M5 12h14" {...common} />
      </>
    ),
    flame: (
      <Path
        d="M12 3c1 3-1.5 4-1.5 6.5A2.5 2.5 0 0 0 13 12c.5-1 .3-2 0-2.6 2 1 3.5 3 3.5 5.6a4.5 4.5 0 1 1-9 0c0-2.2 1-3.4 2-4.6.7-.9 1.5-1.8 2-2.4Z"
        {...common}
      />
    ),
    check: <Path d="m5 12.5 4.5 4.5L19 7" {...common} />,
    lock: (
      <>
        <Rect x="5" y="10.5" width="14" height="9.5" rx="2.5" {...common} />
        <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...common} />
      </>
    ),
    clock: (
      <>
        <Circle cx="12" cy="12" r="8.5" {...common} />
        <Path d="M12 7.5V12l3 1.8" {...common} />
      </>
    ),
    chevR: <Path d="m9 5 7 7-7 7" {...common} />,
    chevL: <Path d="m15 5-7 7 7 7" {...common} />,
    chevD: <Path d="m5 9 7 7 7-7" {...common} />,
    bell: (
      <>
        <Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" {...common} />
        <Path d="M9.5 19a2.5 2.5 0 0 0 5 0" {...common} />
      </>
    ),
    image: (
      <>
        <Rect x="3.5" y="4.5" width="17" height="15" rx="3" {...common} />
        <Circle cx="8.5" cy="9.5" r="1.6" {...common} />
        <Path d="m4 17 5-4 4 3 3-2 4 3" {...common} />
      </>
    ),
    text: (
      <>
        <Path d="M5 6h14" {...common} />
        <Path d="M5 11h14" {...common} />
        <Path d="M5 16h9" {...common} />
      </>
    ),
    file: (
      <>
        <Path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" {...common} />
        <Path d="M14 3.5V8h4" {...common} />
      </>
    ),
    dice: (
      <>
        <Rect x="4" y="4" width="16" height="16" rx="4.5" {...common} />
        <Circle cx="8.5" cy="8.5" r="1.3" {...dot} />
        <Circle cx="15.5" cy="8.5" r="1.3" {...dot} />
        <Circle cx="12" cy="12" r="1.3" {...dot} />
        <Circle cx="8.5" cy="15.5" r="1.3" {...dot} />
        <Circle cx="15.5" cy="15.5" r="1.3" {...dot} />
      </>
    ),
    bolt: <Path d="M13 2 4 13.5h6L11 22l9-11.5h-6L13 2Z" {...common} />,
    spark: (
      <Path
        d="M12 3c.7 4 1.3 4.6 5 5-3.7.4-4.3 1-5 5-.7-4-1.3-4.6-5-5 3.7-.4 4.3-1 5-5Z"
        {...common}
      />
    ),
    arrowUp: (
      <>
        <Path d="M12 19V5" {...common} />
        <Path d="m6 11 6-6 6 6" {...common} />
      </>
    ),
    arrowR: (
      <>
        <Path d="M5 12h14" {...common} />
        <Path d="m13 6 6 6-6 6" {...common} />
      </>
    ),
    trend: (
      <>
        <Path d="M4 16.5 9.5 11l3.5 3.5L20 7" {...common} />
        <Path d="M15 7h5v5" {...common} />
      </>
    ),
    user: (
      <>
        <Circle cx="12" cy="8.5" r="3.8" {...common} />
        <Path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" {...common} />
      </>
    ),
    handshake: (
      <>
        <Path d="m11 14 2 2 3.5-3.5L21 16" {...common} />
        <Path d="m11 14-2-2-3 3" {...common} />
        <Path d="M3 10.5 7.5 6l3.5 1.5L14.5 6 21 10.5" {...common} />
      </>
    ),
    cal: (
      <>
        <Rect x="4" y="5.5" width="16" height="15" rx="3" {...common} />
        <Path d="M4 10h16" {...common} />
        <Path d="M8 3.5v3M16 3.5v3" {...common} />
      </>
    ),
    moon: <Path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" {...common} />,
    sun: (
      <>
        <Circle cx="12" cy="12" r="4.2" {...common} />
        <Path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" {...common} />
      </>
    ),
    edit: (
      <>
        <Path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.5 4 20Z" {...common} />
        <Path d="m14 8 2.8 2.8" {...common} />
      </>
    ),
    trash: (
      <>
        <Path d="M5 7h14" {...common} />
        <Path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" {...common} />
        <Path d="M6.5 7 7.5 20h9L17.5 7" {...common} />
      </>
    ),
    settings: (
      <>
        <Circle cx="12" cy="12" r="3" {...common} />
        <Path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.2 5.2l1.8 1.8M17 17l1.8 1.8M18.8 5.2 17 7M7 17l-1.8 1.8" {...common} />
      </>
    ),
    eye: (
      <>
        <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...common} />
        <Circle cx="12" cy="12" r="3" {...common} />
      </>
    ),
    star: (
      <Path
        d="M12 3.5 14.6 9l6 .6-4.5 4 1.3 5.9L12 16.4 6.6 19.5 7.9 13.6l-4.5-4 6-.6L12 3.5Z"
        {...common}
      />
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G>{paths[name] || null}</G>
    </Svg>
  );
}
