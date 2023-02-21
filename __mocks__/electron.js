const path = require("path");
exports.app = {
  getPath(value) {
    if (value === "userData") return path.join("/userData");
    if (value === "appData") return path.join("/appData");
  },
};
