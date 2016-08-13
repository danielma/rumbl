let player = null

export function init(domId, playerId, onReady){
  window.onYouTubeIframeAPIReady = () => {
    onIframeReady(domId, playerId, onReady)
  }
  const youtubeScriptTag = document.createElement("script")
  youtubeScriptTag.src = "//www.youtube.com/iframe_api"
  document.head.appendChild(youtubeScriptTag)
}

function onIframeReady(domId, playerId, onReady){
  player = new YT.Player(domId, {
    height: "360",
    width: "420",
    videoId: playerId,
    events: {
      "onReady": (event => onReady(event) ),
      "onStateChange": (event => onPlayerStateChange(event) ) }
  })
}

function onPlayerStateChange(event) {
  
}

export function getCurrentTime() {
  return Math.floor(player.getCurrentTime() * 1000)
}

export function seekTo(millsec) {
  return player.seekTo(millsec / 1000)
}

export default exports
