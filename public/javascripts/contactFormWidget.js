import { Contact } from "./contact.js";

export class ContactFormWidget {
  #form;
  #dialog;
  #tagListTemplate;
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
    this.#tagListTemplate = Handlebars.compile(
      this.#dialog.querySelector("#tagListTemplate").innerHTML
    );

    // Register event handler for tag interface.
    this.#contactExistingTagsSelectionSpan.addEventListener(
      "click",
      (event) => {
        if (event.target.classList.contains("tag")) {
          const tagClicked = event.target.dataset.tag;
          const tagsInput = this.#form.elements.tags;
          if (tagsInput.value.split(",").includes(tagClicked)) {
            this.#deselectTag(tagClicked);
          } else {
            this.#selectTag(tagClicked);
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
      const formData = new FormData(this.#form);
      const result = await this.#handleDataCallback(formData);
      if (result) {
        this.#form.reset();
        this.#form.elements.id.value = "";
        this.hide();
      } else {
        alert("Failure!");
      }
    });
    
    // Register event handlers for pretty form validation
    const name = this.#form.elements.full_name;
    name.addEventListener("input", () => {
      if (name.validity.patternMismatch) {
        name.setCustomValidity("Name is the only required field. Otherwise, what's the point?");
      } else {
        name.setCustomValidity("");
      }
    });

    const email = this.#form.elements.email;
    email.addEventListener("input", () => {
      if (email.validity.typeMismatch) {
        email.setCustomValidity("Please enter a valid email address.");
      } else {
        email.setCustomValidity("");
      }
    });

    const phone = this.#form.elements.phone_number;
    phone.addEventListener("input", () => {
      if (phone.validity.patternMismatch) {
        phone.setCustomValidity("Please enter a valid phone number.");
      } else {
        phone.setCustomValidity("");
      }
    });
    
    const tags = this.#form.elements.contactNewTagsInput;
    tags.addEventListener("input", () => {
      if (tags.validity.patternMismatch) {
        tags.setCustomValidity("Tags can't contain commas (,) otherwise you can go wild!");
      } else {
        tags.setCustomValidity("");
      }
    })
  }

  #selectTag(tagClicked) {
    const tagsInput = this.#form.elements.tags;
    if (!tagsInput.value.split(",").includes(tagClicked)) {
      tagsInput.value = tagsInput.value.split(",").concat(tagClicked).join(",");
      this.#contactExistingTagsSelectionSpan
        .querySelector(`span[data-tag='${tagClicked}']`)
        .classList.add("selected");
    }
  }

  #deselectTag(tagClicked) {
    const tagsInput = this.#form.elements.tags;
    if (tagsInput.value.split(",").includes(tagClicked)) {
      tagsInput.value = tagsInput.value
        .split(",")
        .filter((tag) => tag != tagClicked)
        .join(",");
      this.#contactExistingTagsSelectionSpan
        .querySelector(`span[data-tag='${tagClicked}']`)
        .classList.remove("selected");
    }
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
    tagContainer.innerHTML = this.#tagListTemplate({
      tags: existingTags,
    });
  }

  /**
   *
   * @param {string[]} existingTags
   * @param {Function} addContactDataHandler - Callback to add data to model.
   * @param {Contact} [contact] - Contact to update. If undefined will add new.
   */
  initContactForm(existingTags, addContactDataHandler, contact) {
    this.#renderExistingTagsSelector(
      existingTags,
      this.#form.querySelector("#contactExistingTagsSelectionSpan")
    );
    this.#handleDataCallback = addContactDataHandler;
    if (contact) {
      this.#form.elements.full_name.value = contact.full_name;
      this.#form.elements.phone_number.value = contact.phone_number;
      this.#form.elements.email.value = contact.email;
      this.#form.elements.id.value = contact.id;
      Array.from(
        this.#contactExistingTagsSelectionSpan.getElementsByClassName("tag")
      )
        .map((span) => span.dataset.tag)
        .forEach((tag) => this.#deselectTag(tag));
      this.#form.elements.tags.value = "";
      contact.tags.forEach((tag) => this.#selectTag(tag));
    }
  }

}
