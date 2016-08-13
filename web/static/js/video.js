import Player from "./player"

export function init(socket, element) {
  if (!element) { return }

  const playerId = element.getAttribute("data-player-id")
  const videoId = element.getAttribute("data-id")
  socket.connect()

  Player.init(element.id, playerId, () => onReady(videoId, socket))
}

function esc(string) {
  const div = document.createElement("div")
  div.appendChild(document.createTextNode(string))
  return div.innerHTML
}

function renderAnnotation(container, { user, body, at }) {
  const template = document.createElement("div")

  template.innerHTML = `
    <a href="#" data-seek="${esc(at)}">
      [${formatTime(at)}]
      <b>${esc(user.username)}</b>: ${esc(body)}
    </a>
  `

  container.appendChild(template)
  container.scrollTop = container.scrollHeight
}

function scheduleMessages(container, annotations) {
  setTimeout(() => {
    const currentTime = Player.getCurrentTime()
    const remaining =  renderAtTime(annotations, currentTime, container)
    scheduleMessages(container, remaining)
  }, 1000)
}

function renderAtTime(annotations, seconds, container) {
  return annotations.filter((ann) => {
    if (ann.at > seconds) {
      return true
    } else {
      renderAnnotation(container, ann)
      return false
    }
  })
}

function formatTime(at) {
  const date = new Date(null)
  date.setSeconds(at / 1000)
  return date.toISOString().substr(14, 5)
}

function onReady(videoId, socket) {
  const msgContainer = document.getElementById("msg-container")
  const msgInput = document.getElementById("msg-input")
  const postButton = document.getElementById("msg-submit")
  const vidChannel = socket.channel(`videos:${videoId}`)

  msgContainer.addEventListener("click", (e) => {
    e.preventDefault()
    const seconds = e.target.getAttribute("data-seek") ||
                    e.target.parentNode.getAttribute("data-seek")
    if (!seconds) { return }

    Player.seekTo(seconds)
  })

  postButton.addEventListener("click", (e) => {
    vidChannel.
      push("new_annotation", { body: msgInput.value, at: Player.getCurrentTime() }).
      receive("error", (e) => console.log(e))

    msgInput.value = ""
  })

  vidChannel.on("new_annotation", (resp) => renderAnnotation(msgContainer, resp))

  vidChannel.join().
    receive("ok", ({annotations}) => {
      const ids = annotations.map((a) => a.id)
      if (ids.length > 0) {
        vidChannel.params.last_seen_id = Math.max(...ids)
      }
      scheduleMessages(msgContainer, annotations)
    }).
    receive("error", (reason) => console.log("join failed", reason))
}

export default exports
