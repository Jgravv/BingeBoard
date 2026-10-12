import { useEffect, useRef } from "react";


export default function useModalHistory(openCount, closeTop) {
  const pushed = useRef(0);      
  const skipPop = useRef(false);  
  const closeRef = useRef(closeTop);
  closeRef.current = closeTop;

  useEffect(() => {
    const onPop = () => {
      if (skipPop.current) {
        skipPop.current = false;
        return;
      }
      if (pushed.current === 0) return;
      pushed.current -= 1;
      closeRef.current(); 
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const diff = openCount - pushed.current;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) window.history.pushState({ modal: true }, "");
    } else if (diff < 0) {
      skipPop.current = true;
      window.history.go(diff);
    }

    pushed.current = openCount;
  }, [openCount]);
}