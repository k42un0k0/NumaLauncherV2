import { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

const common: Configuration = {
  mode: isDev ? "development" : "production",
  externals: ["fsevents"],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
    alias: { "@": path.join(__dirname, "./src/") },
  },
  output: {
    publicPath: "./",
    path: path.resolve(__dirname, "build"),
    assetModuleFilename: "assets/[name][ext]",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(ico|png|svg|eot|woff?2?|jpg|ttf)$/,
        type: "asset/resource",
      },
    ],
  },
  watch: isDev,
  devtool: isDev ? "source-map" : undefined,
};

const main: Configuration = {
  ...common,
  target: "electron-main",
  entry: { main: "./src/main/main.ts" },
};

const preload: Configuration = {
  ...common,
  target: "electron-preload",
  entry: { preload: "./src/main/preload.ts" },
};

const renderer: Configuration = {
  ...common,
  target: "web",
  entry: { app: "./src/web/index.tsx" },
  plugins: [new MiniCssExtractPlugin(), new HtmlWebpackPlugin({ template: "./src/web/index.html" })],
};

export default [main, preload, renderer];
