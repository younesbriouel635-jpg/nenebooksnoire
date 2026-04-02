const Footer = () => (
  <footer className="border-t border-border py-10 px-6 text-center">
    <p className="font-serif text-sm font-bold mb-1">NENEbooks</p>
    <p className="text-xs text-muted-foreground font-sans">
      © {new Date().getFullYear()} NENEbooks. All rights reserved.
    </p>
  </footer>
);

export default Footer;
