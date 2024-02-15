export const prepareMetaMaxRealm = async (videostrateHtml: string) => {
  // get the realm from "data-metamax-realm" attribute in html tag
  const parser = new DOMParser()
  const html = parser.parseFromString(videostrateHtml, "text/html")
  const realm = html.querySelector("html")?.getAttribute("data-metamax-realm")
  return realm ?? ""
}
