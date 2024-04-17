import { addClip } from "./addClip"
import { addClipToElement } from "./addClipToElement"
import { addCustomElement } from "./addCustomElement"
import { addSubtitle } from "./addSubtitle"
import { assignClass } from "./assignClass"
import { moveLayer } from "./moveLayer"
import { createAnimation } from "./createAnimation"
import { createOrUpdateStyle } from "./createOrUpdateStyle"
import { createStyle } from "./createStyle"
import { crop } from "./crop"
import { deleteAnimation } from "./deleteAnimation"
import { deleteElement } from "./deleteElement"
import { deleteStyle } from "./deleteStyle"
import { editCustomElement } from "./editCustomElement"
import { generateImage } from "./generateImage"
import { move } from "./move"
import { moveDelta } from "./moveDelta"
import { moveDeltaWithoutEmbedded } from "./moveDeltaWithoutEmbedded"
import { print } from "./print"
import { renameElement } from "./renameElement"
import { reposition } from "./reposition"
import { setSpeed } from "./setSpeed"
import { addCroppedClip } from "./addCroppedClip"

const builtinFunctions = {
  add_clip: addClip,
  add_cropped_clip: addCroppedClip,
  add_clip_to_element: addClipToElement,
  add_custom_element: addCustomElement,
  add_subtitle: addSubtitle,
  assign_class: assignClass,
  move_layer: moveLayer,
  create_animation: createAnimation,
  create_or_update_style: createOrUpdateStyle,
  create_style: createStyle,
  crop,
  delete_animation: deleteAnimation,
  delete_element: deleteElement,
  delete_style: deleteStyle,
  edit_custom_element: editCustomElement,
  generate_image: generateImage,
  move,
  move_delta: moveDelta,
  move_delta_without_embedded: moveDeltaWithoutEmbedded,
  rename_element: renameElement,
  reposition,
  print,
  set_speed: setSpeed,
}

export default builtinFunctions
