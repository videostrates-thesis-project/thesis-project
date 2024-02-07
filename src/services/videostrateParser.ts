import {
  ParsedVideostrate,
  VideoClipElement,
  VideoElement,
  VideoElementType,
} from "../types/videoElement"

const example = `<body>
<video class="composited" data-start="0" data-end="10"><source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"></video>
<h1 class="composited" data-start="1" data-end="10" _="" style="
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
">Big Chungus</h1>
<video class="composited" data-start="10" data-end="20">
    <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4">
</video>
</body>`

const example2 = `<body>
<body>
  
  <div class="composited title" data-start="0" data-end="3" data-offset="0"><h1 style="width: 98%; font-size: 250%;"><span style="font-size: 80%;">Supporting video for the paper</span><br><br> <em style="font-size: 100%;">Videostrates: Collaborative, Distributed and Programmable Video Manipulation</em><br><br>
<p style="font-size: 80%;">Clemens N. Klokmose<sup>1</sup>, Christian Remy<sup>1</sup>, Janus Bager Kristensen<sup>1</sup>, Rolf Bagge<sup>1</sup>,<br>Michel Beaudouin-Lafon<sup>2,3,4,5</sup>, Wendy Mackay<sup>4,2,3,5</sup></p>
<p style="font-size: 80%;"><sup>1</sup>Aarhus University, <sup>2</sup>Université Paris-Sud, <sup>3</sup>CNRS, <sup>4</sup>INRIA, <sup>5</sup>Université Paris-Saclay</p><br>
UIST 2019</h1></div>
    <div id="intro"><video data-start="3" data-end="7" class="composited nocache" data-speed="2"><source src="https://media.cavi.au.dk/373/693380?raw=true"></video><video class="composited nocache" data-start="7" data-end="17" data-speed="2"><source src="https://media.cavi.au.dk/373/693381?raw=true"></video>
</div>
  
  <div class="composited title" data-start="17" data-end="20" data-offset="0"><h1>Scenario of use 1: Collaborative Video Editing</h1></div>
  
  <video class="composited" data-start="20" data-end="76" data-offset="0"><source src="https://media.cavi.au.dk/373/693395"></video>
  
  <div class="composited title" data-start="76" data-end="79" data-offset="0"><h1>Scenario of use 2: Live streaming</h1></div>
  
  <video class="composited" data-start="79" data-end="128" data-offset="0"><source src="https://media.cavi.au.dk/373/693368"></video>
  
    <div class="composited title" data-start="128" data-end="131" data-offset="0"><h1>Scenario of use 3: Programmable video</h1></div>
    
    <video class="composited" data-start="131" data-end="180" data-offset="0"><!--<source src="https://media.cavi.au.dk/373/693396">-->
<!--<source src="https://media.cavi.au.dk/373/693582">--><!--<source src="https://media.cavi.au.dk/373/693587">--><!--<source src="https://media.cavi.au.dk/373/693588">-->

<source src="https://media.cavi.au.dk/373/693604"></video>
  
  <!--<div class="custom composited videostrate" data-src="/perfect-dragonfly-86" data-start="3" data-end="84" __wid="iCuRpMfS" data-offset="0"></div>-->
  
  <script>
    webstrate.on("loaded", function loadedFunction() {
      let vs = document.querySelectorAll(".custom.composited.videostrate");
      vs.forEach(v => {
        console.log(v);
        let t = document.createElement("transient");
        v.appendChild(t);
        let bounds = v.getBoundingClientRect();
        let videostrate = new VideostrateView(t, v.getAttribute("data-src"), {
                          width: window.innerWidth,
                          height: window.innerHeight,
                          framerate: 60
        });
        videostrate.startLocalView();
        v.customLocalSeek = (time) => {
          videostrate.seek(time);
        };
      });      
    });
  </script>
<div class="composited subtitles"><span class="composited subtitle" data-start="3.14" data-end="7.88">The HTML view of a videostrate (right) that is played back from the vStreamer streaming server (left)</span><span class="composited subtitle" data-start="8.17" data-end="14.17">Edits to the DOM of the videostrate<br> are rendered live in the videostream</span></div></body>
</body>`

let parsed: ParsedVideostrate = {
  elements: [],
  clips: [],
}

const parseVideostrate = (text: string) => {
  const parser = new DOMParser()
  const html = parser.parseFromString(text, "text/html")

  parsed = {
    elements: [],
    clips: [],
  }

  html.body.childNodes.forEach((element) => {
    parseElement(element)
  })

  parsed.elements = parsed.elements.sort((a, b) => a.start - b.start)
  parsed.clips = parsed.clips.sort((a, b) => a.start - b.start)
  console.log(parsed)
}

const parseElement = (element: ChildNode) => {
  if (element.nodeValue === "\n") return
  const htmlElement = element as HTMLElement

  if (htmlElement?.childNodes) {
    htmlElement.childNodes.forEach((childNode) => parseElement(childNode))
  }

  if (!htmlElement?.classList || !htmlElement.classList.contains("composited"))
    return

  if (htmlElement.nodeName.toLowerCase() === "video") {
    const clip: VideoClipElement = {
      start: parseFloat(htmlElement.getAttribute("data-start") ?? "0"),
      end: parseFloat(htmlElement.getAttribute("data-end") ?? "0"),
      source:
        (htmlElement.children.item(0) as HTMLElement).getAttribute("src") ?? "",
      type: "video",
    }
    parsed.clips.push(clip)
  } else {
    const videoElement: VideoElement = {
      start: parseFloat(htmlElement.getAttribute("data-start") ?? "0"),
      end: parseFloat(htmlElement.getAttribute("data-end") ?? "0"),
      type: determineType(htmlElement),
    }
    parsed.elements.push(videoElement)
  }
}

const determineType = (element: HTMLElement): VideoElementType => {
  if (element.classList.contains("subtitle")) return "subtitle"

  return "custom"
}

parseVideostrate(example2)
