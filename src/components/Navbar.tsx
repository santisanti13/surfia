import { Waves } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Spots", href: "/spots" },
  { label: "Forecast", href: "#" },
  { label: "Community", href: "#" },
  { label: "Journal", href: "#" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Waves className="h-6 w-6 text-primary" />
          <span className="font-display text-2xl tracking-wide">SURFIA</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-body font-medium tracking-widest uppercase text-foreground/70 hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
