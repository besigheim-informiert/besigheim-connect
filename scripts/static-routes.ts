import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * GitHub Pages only knows the files in dist/. Without a matching file, a deep
 * link like /mitmachen is answered by 404.html with HTTP status 404: the SPA
 * still renders in the browser, but search engines drop the page.
 *
 * This plugin writes a copy of index.html for every public route
 * (e.g. dist/mitmachen.html), which GitHub Pages serves for /mitmachen with
 * status 200, plus a sitemap.xml listing those routes.
 */

/** Public routes from src/App.tsx without parameters. Admin routes stay out on purpose. */
export const STATISCHE_ROUTEN = [
  "/vereine",
  "/veranstaltungen",
  "/mitmachen",
  "/barrierefrei",
  "/netzwerk-quartier",
  "/ueber-uns",
  "/kontakt",
  "/impressum",
  "/datenschutz",
];

/** Detail routes and the content folder whose JSON files supply their ids. */
const DETAIL_ROUTEN: { prefix: string; contentDir: string }[] = [
  { prefix: "/vereine", contentDir: "src/content/vereine" },
  { prefix: "/veranstaltungen", contentDir: "src/content/veranstaltungen" },
];

function contentIds(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((datei) => datei.endsWith(".json"))
    .map((datei) => JSON.parse(fs.readFileSync(path.join(dir, datei), "utf8")) as { id?: unknown })
    .map((eintrag) => eintrag.id)
    .filter((id): id is string => typeof id === "string" && /^[a-z0-9-]+$/i.test(id));
}

/** All routes that get their own HTML file, starting with "/". */
export function alleRouten(root: string): string[] {
  const details = DETAIL_ROUTEN.flatMap(({ prefix, contentDir }) =>
    contentIds(path.join(root, contentDir)).map((id) => `${prefix}/${id}`),
  );
  return [...STATISCHE_ROUTEN, ...details];
}

export function sitemapXml(siteUrl: string, routen: string[]): string {
  const basis = siteUrl.replace(/\/$/, "");
  const eintraege = ["/", ...routen]
    .map((route) => `  <url><loc>${basis}${route === "/" ? "/" : route}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege}\n</urlset>\n`;
}

export function staticRoutes(options: { siteUrl: string }): Plugin {
  let root = process.cwd();
  let outDir = "dist";

  return {
    name: "static-routes",
    apply: "build",
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const indexHtml = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      const routen = alleRouten(root);

      for (const route of routen) {
        const ziel = path.join(outDir, `${route.slice(1)}.html`);
        fs.mkdirSync(path.dirname(ziel), { recursive: true });
        fs.writeFileSync(ziel, indexHtml);
      }

      // A route that is also a directory (e.g. /veranstaltungen, which holds
      // images and detail pages) may be redirected by GitHub Pages to the
      // directory; an index.html there keeps that answer a 200 as well.
      for (const route of routen) {
        const verzeichnis = path.join(outDir, route.slice(1));
        if (fs.existsSync(verzeichnis) && fs.statSync(verzeichnis).isDirectory()) {
          fs.writeFileSync(path.join(verzeichnis, "index.html"), indexHtml);
        }
      }

      fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemapXml(options.siteUrl, routen));
    },
  };
}
