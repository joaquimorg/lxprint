import { createApp } from "vue";
import VueKonva from "vue-konva";
import App from "./App.vue";
import "./index.css";
import "./App.css";
import { createPrinterContext, PrinterContextKey } from "./printerContext.js";

const app = createApp(App);
app.use(VueKonva);
const printerContext = createPrinterContext();
app.provide(PrinterContextKey, printerContext);
app.mount("#app");
