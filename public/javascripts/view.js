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
  // Should delete this after converting to Model.prototype.getAvailableTags()
  #extractTagsFromContacts(contacts) {
    return contacts
      .flatMap((contact) => contact.tags)
      .map((tagObj) => tagObj?.tag)
      .sort()
      .reduce((uniqueTags, tag) => {
        if (tag && !uniqueTags.includes(tag)) {
          uniqueTags.push(tag);
        }
        return uniqueTags;
      }, [])
      .map((tagString) => ({ tag: tagString }));
  }

  renderContactList(contacts) {
    this.#contactList.innerHTML = this.#contactListTemplate({ contacts });
  }

  renderSearchTagSelector(contacts) {
    const existingTags = this.#extractTagsFromContacts(contacts);
    this.#searchTagSelector.innerHTML = this.#tagSelectorTemplate({
      tags: existingTags,
    });
  }

  renderExistingTagsSelector(contacts, tagContainer) {
    const existingTags = this.#extractTagsFromContacts(contacts);
    // this.#addContactExistingTags
    tagContainer.innerHTML = this.#tagSelectorTemplate({
      tags: existingTags,
    });
  }
}
