import path from "node:path";
import { alleRouten, sitemapXml } from "../../scripts/static-routes";

const root = path.resolve(__dirname, "../..");

describe("static routes for GitHub Pages", () => {
  it("covers public pages and content detail pages", () => {
    const routen = alleRouten(root);
    expect(routen).toContain("/mitmachen");
    expect(routen).toContain("/vereine/besigheim-hilft");
    expect(routen.some((r) => r.startsWith("/veranstaltungen/"))).toBe(true);
    expect(routen.some((r) => r.startsWith("/admin"))).toBe(false);
  });

  it("builds a sitemap with absolute URLs", () => {
    const xml = sitemapXml("https://unser-besigheim.de/", ["/mitmachen"]);
    expect(xml).toContain("<loc>https://unser-besigheim.de/</loc>");
    expect(xml).toContain("<loc>https://unser-besigheim.de/mitmachen</loc>");
  });
});
