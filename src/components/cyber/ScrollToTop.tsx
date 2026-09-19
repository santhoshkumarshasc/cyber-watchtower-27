import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Smooth Scroll to Top"
      title="Scroll to Top"
      className="fixed bottom-20 md:bottom-6 right-5 z-40 flex size-10 items-center justify-center rounded-full border border-primary/40 bg-card/90 text-primary shadow-lg backdrop-blur hover:bg-primary hover:text-primary-foreground hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
    >
      <ChevronUp className="size-5" />
    </button>
  );
}
