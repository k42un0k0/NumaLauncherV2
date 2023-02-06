const path = require("path");
exports.app = {
  getPath(value) {
    if (value === "userData") return path.join("/userData");
  },
};
