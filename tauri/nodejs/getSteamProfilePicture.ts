import { JSDOM } from "jsdom";

export async function getProfilePicture(steamID: string): Promise<string | void> {
    return new Promise<string>((resolve) => {
        fetch(`http://steamcommunity.com/profiles/${steamID}/?xml=1`)
            .then(data => data.text())
            .then((data) => {

                const dom = new JSDOM("");

                const parser = new dom.window.DOMParser();

                resolve(parser.parseFromString(data, "text/xml")?.getElementsByTagName("profile")[0]?.getElementsByTagName("avatarMedium")[0]?.childNodes[0]?.nodeValue || "Nothing"
                )
            })
    }).catch(error => console.log(error));
}