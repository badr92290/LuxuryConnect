import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Une application à page unique conserve la position de défilement d'une page
 * à l'autre : sans cela, on arrive au milieu des conditions générales après
 * avoir cliqué sur un lien depuis le bas de l'accueil.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [pathname]);

  return null;
}
