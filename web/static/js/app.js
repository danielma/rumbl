import "phoenix_html"
import socket from "./socket"

import { init as initVideo } from "./video"

initVideo(socket, document.getElementById("video"))
