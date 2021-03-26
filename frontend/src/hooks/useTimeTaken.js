import { useState, useEffect, useRef } from 'react';

import { gameStore } from '../components/GameStore';
import { msToMinutesSeconds } from '../util';

const useTimeTaken = ({ formatted = false } = {}) => {
  const {
    paused,
    millis_taken_before_started: millisTakenBeforeStarted,
    started_at: startedAt,
  } = gameStore;

  // INIT TIMER
  const [timeTaken, setTimeTaken] = useState(
    paused
      ? millisTakenBeforeStarted
      : Date.now() -
          new Date(startedAt).getTime() +
          millisTakenBeforeStarted,
  );
  const timeRef = useRef();

  // UPDATE TIMER
  useEffect(() => {
    if (paused) {
      setTimeTaken(millisTakenBeforeStarted);
    } else if (!timeRef.current) {
      timeRef.current = setInterval(
        () =>
          setTimeTaken(
            Date.now() -
              new Date(startedAt).getTime() +
              millisTakenBeforeStarted,
          ),
        1000,
      );
    }
    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
        timeRef.current = undefined;
      }
    };
  }, [
    setTimeTaken,
    timeRef,
    paused,
    millisTakenBeforeStarted,
    startedAt,
  ]);

  return formatted ? msToMinutesSeconds(timeTaken) : timeTaken;
};

export default useTimeTaken;
