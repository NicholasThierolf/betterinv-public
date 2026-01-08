export async function load({ params }) {

    return {
        steamID: params.steamID,
        containerID: params.containerID
    }
}