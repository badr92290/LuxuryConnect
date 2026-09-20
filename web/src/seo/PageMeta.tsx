import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DEFAULT_DESCRIPTION, SHARE_IMAGE, SITE_NAME, SITE_URL } from "./siteConfig";

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

export interface PageMetaProps {
  /** Titre propre à la page, sans le nom du site : il est ajouté ici. */
  title: string;
  description?: string;
  /** Les espaces authentifiés et la page 404 ne doivent pas être indexés. */
  noIndex?: boolean;
  image?: string;
}

/**
 * Pose le titre, la description, le lien canonique et les balises de partage
 * de la page courante. Une application à page unique ne change pas le `<head>`
 * toute seule : sans cela, chaque page hérite du titre de `index.html`.
 */
export function PageMeta({ title, description, noIndex, image }: PageMetaProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
    const desc = description ?? DEFAULT_DESCRIPTION;
    const url = `${SITE_URL}${pathname}`;
    const shareImage = `${SITE_URL}${image ?? SHARE_IMAGE}`;

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', "name", "description", desc);
    upsertMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noIndex ? "noindex, nofollow" : "index, follow",
    );
    upsertCanonical(url);

    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", desc);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertMeta('meta[property="og:image"]', "property", "og:image", shareImage);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    upsertMeta('meta[property="og:locale"]', "property", "og:locale", "fr_FR");

    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", desc);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", shareImage);
  }, [title, description, noIndex, image, pathname]);

  return null;
}
