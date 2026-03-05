import { Waves } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-primary" />
          <span className="font-display text-xl tracking-wide">SURFIA</span>
        </div>
        <div className="flex gap-8">
          {["About", "Privacy", "Terms", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-body"
            >
              {link}
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-body">© 2026 Surfia. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
