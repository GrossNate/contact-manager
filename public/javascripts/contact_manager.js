import { Controller } from './controller.js';
import { Model } from './model.js';
import { View } from './view.js';

document.addEventListener("DOMContentLoaded", () => {
  const controller = new Controller(new Model(document), new View(document));
  document.querySelector("#loadingP").remove();
  controller.init();
});
