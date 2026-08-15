"use client";

import { useEffect, useState } from "react";

type Props = {
  end: number;
  suffix?: string;
  duration?: number;
};

export default function Counter({
  end,
  suffix = "",
  duration = 1500,
}: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;

    const step = Math.ceil(end / (duration / 16));

    const timer = setInterval(() => {
      start += step;

      if (start >= end) {
        start = end;
        clearInterval(timer);
      }

      setCount(start);
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}