/** @module View */

export class View {
  #document;

  // Handlebars templates
  #contactListTemplate;
  #tagSelectorTemplate;

  // Page parts
  #contactList;
  #addContactDialog;
  #searchTagSelector;
  #searchInputText;
  #addContactExistingTags;
  #addContactForm;
  #editContactDialog;
  /**
   * @private
   * @type {HTMLFormElement}
   * */
  #editContactForm;
  #editContactExistingTags;

  /**
   * @param {Document} document
   */
  constructor(document) {
    this.#document = document;
    this.#contactList = this.#document.querySelector("#contactList");
    this.#addContactDialog = this.#document.querySelector("#addContactDialog");
    this.#searchTagSelector =
      this.#document.querySelector("#searchTagSelector");
    this.#searchInputText = this.#document.querySelector("#searchInputText");
    this.#addContactExistingTags = this.#document.querySelector(
      "#addContactExistingTags"
    );
    this.#addContactForm = this.#document.querySelector("#addContactForm");
    this.#editContactDialog =
      this.#document.querySelector("#editContactDialog");
    this.#editContactForm = this.#document.querySelector("#editContactForm");
    this.#editContactExistingTags = this.#document.querySelector(
      "#editContactExistingTags"
    );

    // Set up all Handlebars templates
    const contactPartial = this.#document.querySelector("#contactPartial");
    Handlebars.registerPartial("contactPartial", contactPartial.innerHTML);
    contactPartial.remove(); // Not necessary, but keeps the DOM cleaner.

    const tagPartial = this.#document.querySelector("#tagPartial");
    Handlebars.registerPartial("tagPartial", tagPartial.innerHTML);
    tagPartial.remove(); // Not necessary, but keeps the DOM cleaner.

    const contactListTemplate = this.#document.querySelector(
      "#contactListTemplate"
    );
    this.#contactListTemplate = Handlebars.compile(
      contactListTemplate.innerHTML
    );
    contactListTemplate.remove();

    const tagSelectorTemplate = this.#document.querySelector(
      "#tagSelectorTemplate"
    );
    this.#tagSelectorTemplate = Handlebars.compile(
      tagSelectorTemplate.innerHTML
    );
    tagSelectorTemplate.remove();

    // Add event listeners for controls that don't interact with model
    this.#document
      .querySelector("#addContactButton")
      .addEventListener("click", (event) => {
        event.preventDefault();
        this.#addContactDialog.showModal();
      });

    this.#addContactDialog
      .querySelector("input[value='Cancel']")
      .addEventListener("click", (event) => {
        event.preventDefault();
        this.clearAndCloseAddContactDialog();
      });

    this.#editContactDialog
      .querySelector("input[value='Cancel']")
      .addEventListener("click", (event) => {
        event.preventDefault();
        this.#editContactDialog.close();
      });
    
    this.#editContactExistingTags.addEventListener("click", (event) => {
      if (event.target.classList.contains("tag")) {
        const tagClicked = event.target.dataset.tag;
        const tagDataset = this.#editContactExistingTags.dataset;
        if (
          tagDataset.tags
            .split(",")
            .includes(tagClicked)
        ) {
          tagDataset.tags = tagDataset.tags.split(",").filter((tag) =>
            tag != tagClicked
          ).join(",");
          event.target.classList.remove("selected");
        } else {
          tagDataset.tags = tagDataset.tags.split(",").concat(tagClicked).join(
            ",",
          );
          event.target.classList.add("selected");
        }
      }
    });
    this.#addContactExistingTags.addEventListener("click", (event) => {
      if (event.target.classList.contains("tag")) {
        const tagClicked = event.target.dataset.tag;
        const tagDataset = this.#addContactExistingTags.dataset;
        if (
          tagDataset.tags
            .split(",")
            .includes(tagClicked)
        ) {
          tagDataset.tags = tagDataset.tags.split(",").filter((tag) =>
            tag != tagClicked
          ).join(",");
          event.target.classList.remove("selected");
        } else {
          tagDataset.tags = tagDataset.tags.split(",").concat(tagClicked).join(
            ",",
          );
          event.target.classList.add("selected");
        }
      }
    });
  }

  clearAndCloseAddContactDialog() {
    this.#addContactForm.reset();
    this.#addContactExistingTags.dataset.tags = "";
    Array.from(this.#addContactExistingTags.querySelectorAll(".tag")).forEach(
      (span) => span.classList.remove("selected")
    );
    this.#addContactDialog.close();
  }

  /**
   *
   * @param {Contact} contact
   */
  showEditContactDialog(contact) {
    const editContactForm = this.#editContactForm;
    editContactForm.elements.full_name.value = contact.full_name;
    editContactForm.elements.phone_number.value = contact.phone_number;
    editContactForm.elements.email.value = contact.email;
    editContactForm.elements.id.value = contact.id;
    this.#editContactExistingTags.dataset.tags = contact.tags
      .map(({ tag }) => tag)
      .join(",");
    const tagElements = Array.from(
      this.#editContactExistingTags.getElementsByClassName("tag")
    );
    tagElements.forEach(span => span.classList.remove("selected"));
    tagElements
      .filter((span) =>
        contact.tags.map(({ tag }) => tag).includes(span.dataset.tag)
      )
      .forEach((span) => {
        span.classList.add("selected");
      });
    this.#editContactDialog.showModal();
  }

  getContactList() {
    return this.#contactList;
  }
  getAddContactExistingTags() {
    return this.#addContactExistingTags;
  }
  getAddContactForm() {
    return this.#addContactForm;
  }
  getEditContactForm() {
    return this.#editContactForm;
  }
  getSearchTagSelector() {
    return this.#searchTagSelector;
  }
  getSearchInputText() {
    return this.#searchInputText;
  }
  getAddContactExistingTags() {
    return this.#addContactExistingTags;
  }
  getEditContactExistingTags() {
    return this.#editContactExistingTags;
  }

  renderContactList(contacts) {
    this.#contactList.innerHTML = this.#contactListTemplate({ contacts });
  }

  renderExistingTagsSelector(existingTags, tagContainer) {
    tagContainer.innerHTML = this.#tagSelectorTemplate({
      tags: existingTags,
    });
  }
}
