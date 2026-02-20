import { useState, useRef, useEffect } from "react";

export default function DragScroll(scrollAmount = 350) {
  const ref = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // --- 드래그 스크롤 ---
  const handleMouseDown = (e) => {
    if (!ref.current) return;
    setIsDown(true);
    ref.current.classList.add("active");
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    setIsDown(false);
    ref.current.classList.remove("active");
  };

  const handleMouseUp = () => {
    if (!ref.current) return;
    setIsDown(false);
    ref.current.classList.remove("active");
  };

  const handleMouseMove = (e) => {
    if (!isDown || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    ref.current.scrollLeft = scrollLeft - walk;
    checkArrowVisibility();
  };

  // --- 화살표 클릭 ---
  const scrollRight = () => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollLeftFunc = () => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  // --- 화살표 표시 ---
  const checkArrowVisibility = () => {
    const el = ref.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("scroll", checkArrowVisibility);
    window.addEventListener("resize", checkArrowVisibility);

    let resizeObserver;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => checkArrowVisibility());
      resizeObserver.observe(el);
    }

    checkArrowVisibility();

    return () => {
      el.removeEventListener("scroll", checkArrowVisibility);
      window.removeEventListener("resize", checkArrowVisibility);
      resizeObserver && resizeObserver.disconnect();
    };
  }, []);

  return {
    ref,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    scrollLeftFunc,
    scrollRight,
    showLeftArrow,
    showRightArrow,
  };
}
