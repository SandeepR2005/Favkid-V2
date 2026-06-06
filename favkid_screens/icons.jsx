/* FavKid — custom line icons (premium, stroke-based). Exported to window. */
const Icon = ({ name, size = 22, stroke = 1.9, ...p }) => {
  const c = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round", ...p,
  };
  const paths = {
    home: <><path d="M3 10.5 12 4l9 6.5" /><path d="M5.5 9.5V20h13V9.5" /><path d="M9.5 20v-5h5v5" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" /></>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
    trophy: <><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 5H4v1.5A3.5 3.5 0 0 0 7 10" /><path d="M17 5h3v1.5A3.5 3.5 0 0 1 17 10" /><path d="M9.5 13.5 9 18h6l-.5-4.5" /><path d="M7.5 20.5h9" /></>,
    link: <><path d="M9.5 14.5 14.5 9.5" /><path d="M8 11 6 13a3.5 3.5 0 0 0 5 5l2-2" /><path d="M16 13l2-2a3.5 3.5 0 0 0-5-5l-2 2" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    flame: <><path d="M12 3c1 3-1.5 4-1.5 6.5A2.5 2.5 0 0 0 13 12c.5-1 .3-2 0-2.6 2 1 3.5 3 3.5 5.6a4.5 4.5 0 1 1-9 0c0-2.2 1-3.4 2-4.6.7-.9 1.5-1.8 2-2.4Z" /></>,
    check: <path d="m5 12.5 4.5 4.5L19 7" />,
    lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></>,
    chevR: <path d="m9 5 7 7-7 7" />,
    chevL: <path d="m15 5-7 7 7 7" />,
    chevD: <path d="m5 9 7 7 7-7" />,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M9.5 19a2.5 2.5 0 0 0 5 0" /></>,
    image: <><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="m4 17 5-4 4 3 3-2 4 3" /></>,
    text: <><path d="M5 6h14" /><path d="M5 11h14" /><path d="M5 16h9" /></>,
    file: <><path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" /><path d="M14 3.5V8h4" /></>,
    dice: <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" stroke="none" /></>,
    bolt: <path d="M13 2 4 13.5h6L11 22l9-11.5h-6L13 2Z" />,
    spark: <path d="M12 3c.7 4 1.3 4.6 5 5-3.7.4-4.3 1-5 5-.7-4-1.3-4.6-5-5 3.7-.4 4.3-1 5-5Z" />,
    arrowUp: <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
    arrowR: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    trend: <><path d="M4 16.5 9.5 11l3.5 3.5L20 7" /><path d="M15 7h5v5" /></>,
    user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></>,
    handshake: <><path d="m11 14 2 2 3.5-3.5L21 16" /><path d="m11 14-2-2-3 3" /><path d="M3 10.5 7.5 6l3.5 1.5L14.5 6 21 10.5" /></>,
    cal: <><rect x="4" y="5.5" width="16" height="15" rx="3" /><path d="M4 10h16" /><path d="M8 3.5v3M16 3.5v3" /></>,
    moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />,
    sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></>,
    edit: <><path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.5 4 20Z" /><path d="m14 8 2.8 2.8" /></>,
    trash: <><path d="M5 7h14" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /><path d="M6.5 7 7.5 20h9L17.5 7" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.2 5.2l1.8 1.8M17 17l1.8 1.8M18.8 5.2 17 7M7 17l-1.8 1.8" /></>,
    eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
    star: <path d="M12 3.5 14.6 9l6 .6-4.5 4 1.3 5.9L12 16.4 6.6 19.5 7.9 13.6l-4.5-4 6-.6L12 3.5Z" />,
  };
  return <svg {...c}>{paths[name] || null}</svg>;
};

window.Icon = Icon;
