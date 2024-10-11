import { Contact } from "./contact.js";

export class ContactFormWidget {
  #form;
  #dialog;
  #tagSelectorTemplate;
  #contactExistingTagsSelectionSpan;
  #handleDataCallback;

  static #uniqueStringArrReducer = (uniqueTags, tag) => {
    if (tag && !uniqueTags.includes(tag)) {
      uniqueTags.push(tag);
    }
    return uniqueTags;
  };

  /**
   *
   * @param {HTMLFormElement} form
   * @param {HTMLDialogElement} dialog
   */
  constructor(form, dialog) {
    this.#form = form;
    this.#dialog = dialog;

    // Save references to important stuff.
    this.#contactExistingTagsSelectionSpan = this.#form.querySelector(
      "#contactExistingTagsSelectionSpan"
    );

    // Register Handlebars template.
    console.log(this.#form);
    const tagSelectorTemplate = this.#dialog.querySelector(
      "#tagSelectorTemplate"
    );
    this.#tagSelectorTemplate = Handlebars.compile(
      tagSelectorTemplate.innerHTML
    );

    // Register event handler for tag interface.
    this.#contactExistingTagsSelectionSpan.addEventListener(
      "click",
      (event) => {
        if (event.target.classList.contains("tag")) {
          const tagClicked = event.target.dataset.tag;
          const tagsInput = this.#form.elements.tags;
          if (tagsInput.value.split(",").includes(tagClicked)) {
            tagsInput.value = tagsInput.value
              .split(",")
              .filter((tag) => tag != tagClicked)
              .join(",");
            event.target.classList.remove("selected");
          } else {
            tagsInput.value = tagsInput.value
              .split(",")
              .concat(tagClicked)
              .join(",");
            event.target.classList.add("selected");
          }
        }
      }
    );

    this.#form.querySelector("#cancel").addEventListener("click", (event) => {
      event.preventDefault();
      this.#form.reset();
      this.#form.elements.tags.value = "";
      this.hide();
    });

    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();
      this.#form.elements.tags.value = this.#form.elements.tags.value
        .split(",")
        .concat(this.#form.elements.contactNewTagsInput.value.split(" "))
        .filter((tag) => tag != "")
        .reduce(ContactFormWidget.#uniqueStringArrReducer, []);
      // console.log(this.#form.elements);
      const formData = new FormData(this.#form);
      const result = await this.#handleDataCallback(formData);
      if (result) {
        this.hide();
      } else {
        alert("Failure!");
      }
    });
  }
  show() {
    this.#dialog.showModal();
  }
  hide() {
    this.#dialog.close();
  }

  /**
   *
   * @param {string[]} existingTags
   * @param {HTMLSpanElement} tagContainer
   */
  #renderExistingTagsSelector(existingTags, tagContainer) {
    tagContainer.innerHTML = this.#tagSelectorTemplate({
      tags: existingTags,
    });
  }

  /**
   *
   * @param {string[]} existingTags
   * @param {Function} addContactDataHandler Callback to add data to model.
   */
  initAddContactForm(existingTags, addContactDataHandler) {
    this.#renderExistingTagsSelector(
      existingTags,
      this.#form.querySelector("#contactExistingTagsSelectionSpan")
    );
    this.#handleDataCallback = addContactDataHandler;
  }

  /**
   *
   * @param {Contact} contact
   * @param {string[]} existingTags
   */
  initEditContactForm(contact, existingTags) {}
}
