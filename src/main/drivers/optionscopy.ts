import fs from "fs-extra";
const defaultOption: Record<string, string> = {};
defaultOption["version"] = "2230";
defaultOption["autoJump"] = "false";
defaultOption["autoSuggestions"] = "true";
defaultOption["chatColors"] = "true";
defaultOption["chatLinks"] = "true";
defaultOption["chatLinksPrompt"] = "true";
defaultOption["enableVsync"] = "true";
defaultOption["entityShadows"] = "true";
defaultOption["forceUnicodeFont"] = "true";
defaultOption["discrete_mouse_scroll"] = "false";
defaultOption["invertYMouse"] = "false";
defaultOption["realmsNotifications"] = "true";
defaultOption["reducedDebugInfo"] = "false";
defaultOption["snooperEnabled"] = "false";
defaultOption["showSubtitles"] = "false";
defaultOption["touchscreen"] = "false";
defaultOption["fullscreen"] = "false";
defaultOption["bobView"] = "false";
defaultOption["toggleCrouch"] = "false";
defaultOption["toggleSprint"] = "false";
defaultOption["mouseSensitivity"] = "0.2517605721950531";
defaultOption["fov"] = "0.75";
defaultOption["gamma"] = "1.0";
defaultOption["renderDistance"] = "20";
defaultOption["guiScale"] = "0";
defaultOption["particles"] = "0";
defaultOption["maxFps"] = "60";
defaultOption["difficulty"] = "3";
defaultOption["fancyGraphics"] = "true";
defaultOption["ao"] = "2";
defaultOption["biomeBlendRadius"] = "2";
defaultOption["renderClouds"] = "false";
defaultOption["resourcePacks"] = '["vanilla"]';
defaultOption["incompatibleResourcePacks"] = "[]";
defaultOption["lastServer"] = "a";
defaultOption["lang"] = "ja_jp";
defaultOption["chatVisibility"] = "0";
defaultOption["chatOpacity"] = "1.0";
defaultOption["textBackgroundOpacity"] = "0.5";
defaultOption["backgroundForChatOnly"] = "true";
defaultOption["hideServerAddress"] = "false";
defaultOption["advancedItemTooltips"] = "true";
defaultOption["pauseOnLostFocus"] = "true";
defaultOption["overrideWidth"] = "0";
defaultOption["overrideHeight"] = "0";
defaultOption["heldItemTooltips"] = "true";
defaultOption["chatHeightFocused"] = "1.0";
defaultOption["chatHeightUnfocused"] = "0.44366195797920227";
defaultOption["chatScale"] = "1.0";
defaultOption["chatWidth"] = "1.0";
defaultOption["mipmapLevels"] = "0";
defaultOption["useNativeTransport"] = "true";
defaultOption["mainHand"] = "right";
defaultOption["attackIndicator"] = "1";
defaultOption["narrator"] = "0";
defaultOption["tutorialStep"] = "none";
defaultOption["mouseWheelSensitivity"] = "1.0";
defaultOption["rawMouseInput"] = "true";
defaultOption["glDebugVerbosity"] = "1";
defaultOption["skipMultiplayerWarning"] = "true";
defaultOption["key_key.attack"] = "key.mouse.left";
defaultOption["key_key.use"] = "key.mouse.right";
defaultOption["key_key.forward"] = "key.keyboard.w";
defaultOption["key_key.left"] = "key.keyboard.a";
defaultOption["key_key.back"] = "key.keyboard.s";
defaultOption["key_key.right"] = "key.keyboard.d";
defaultOption["key_key.jump"] = "key.keyboard.space";
defaultOption["key_key.sneak"] = "key.keyboard.left.shift";
defaultOption["key_key.sprint"] = "key.keyboard.left.control";
defaultOption["key_key.drop"] = "key.keyboard.q";
defaultOption["key_key.inventory"] = "key.keyboard.e";
defaultOption["key_key.chat"] = "key.keyboard.t";
defaultOption["key_key.playerlist"] = "key.keyboard.tab";
defaultOption["key_key.pickItem"] = "key.mouse.middle";
defaultOption["key_key.command"] = "key.keyboard.slash";
defaultOption["key_key.screenshot"] = "key.keyboard.f2";
defaultOption["key_key.togglePerspective"] = "key.keyboard.f5";
defaultOption["key_key.smoothCamera"] = "key.keyboard.unknown";
defaultOption["key_key.fullscreen"] = "key.keyboard.f11";
defaultOption["key_key.spectatorOutlines"] = "key.keyboard.unknown";
defaultOption["key_key.swapHands"] = "key.keyboard.f";
defaultOption["key_key.saveToolbarActivator"] = "key.keyboard.c";
defaultOption["key_key.loadToolbarActivator"] = "key.keyboard.x";
defaultOption["key_key.advancements"] = "key.keyboard.l";
defaultOption["key_key.hotbar.1"] = "key.keyboard.1";
defaultOption["key_key.hotbar.2"] = "key.keyboard.2";
defaultOption["key_key.hotbar.3"] = "key.keyboard.3";
defaultOption["key_key.hotbar.4"] = "key.keyboard.4";
defaultOption["key_key.hotbar.5"] = "key.keyboard.5";
defaultOption["key_key.hotbar.6"] = "key.keyboard.6";
defaultOption["key_key.hotbar.7"] = "key.keyboard.7";
defaultOption["key_key.hotbar.8"] = "key.keyboard.8";
defaultOption["key_key.hotbar.9"] = "key.keyboard.9";
defaultOption["soundCategory_master"] = "0.7847682";
defaultOption["soundCategory_music"] = "0.0";
defaultOption["soundCategory_record"] = "1.0";
defaultOption["soundCategory_weather"] = "0.0";
defaultOption["soundCategory_block"] = "1.0";
defaultOption["soundCategory_hostile"] = "1.0";
defaultOption["soundCategory_neutral"] = "1.0";
defaultOption["soundCategory_player"] = "1.0";
defaultOption["soundCategory_ambient"] = "1.0";
defaultOption["soundCategory_voice"] = "1.0";
defaultOption["modelPart_cape"] = "true";
defaultOption["modelPart_jacket"] = "true";
defaultOption["modelPart_left_sleeve"] = "true";
defaultOption["modelPart_right_sleeve"] = "true";
defaultOption["modelPart_left_pants_leg"] = "true";
defaultOption["modelPart_right_pants_leg"] = "true";
defaultOption["modelPart_hat"] = "true";

export function optionscopy(originpath: string, copypath: string) {
  let outputStr = "";

  const text = fs.readFileSync(originpath, "utf8");
  const lines = text.toString().split("\n");
  for (const line of lines) {
    const oneline = line.toString().split(":");
    if (defaultOption[oneline[0]]) {
      outputStr += line + "\n";
    }
  }
  fs.writeFile(copypath, outputStr, (err) => {
    if (err) throw err;
  });
}
