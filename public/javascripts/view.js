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
  #addContactExistingTags;
  #addContactForm;
  
  /**
  * @property {HTMLTableCellElement} #searchTagSelector
  */
  constructor(document) {
    this.#document = document;
    this.#contactList = this.#document.querySelector("#contactList");
    this.#addContactDialog = this.#document.querySelector("#addContactDialog");
    this.#searchTagSelector = this.#document.querySelector(
      "#searchTagSelector",
    );
    this.#addContactExistingTags = this.#document.querySelector(
      "#addContactExistingTags",
    );
    this.#addContactForm = this.#document.querySelector("#addContactForm");

    // Set up all Handlebars templates
    const contactPartial = this.#document.querySelector("#contactPartial");
    Handlebars.registerPartial("contactPartial", contactPartial.innerHTML);
    contactPartial.remove(); // Not necessary, but keeps the DOM cleaner.

    const tagPartial = this.#document.querySelector("#tagPartial");
    Handlebars.registerPartial("tagPartial", tagPartial.innerHTML);
    tagPartial.remove(); // Not necessary, but keeps the DOM cleaner.

    const contactListTemplate = this.#document.querySelector(
      "#contactListTemplate",
    );
    this.#contactListTemplate = Handlebars.compile(
      contactListTemplate.innerHTML,
    );
    contactListTemplate.remove();

    const tagSelectorTemplate = this.#document.querySelector(
      "#tagSelectorTemplate",
    );
    this.#tagSelectorTemplate = Handlebars.compile(
      tagSelectorTemplate.innerHTML,
    );
    tagSelectorTemplate.remove();

    // Add event listeners for controls that don't interact with model
    this.#document.querySelector("#addContactButton").addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        this.#addContactDialog.showModal();
      },
    );

    this.#addContactDialog.querySelector("input[value='Cancel']")
      .addEventListener("click", (event) => {
        event.preventDefault();
        this.clearAndCloseAddContactDialog();
      });
  }

  clearAndCloseAddContactDialog() {
        this.#addContactForm.reset();
        this.#addContactExistingTags.dataset.tags = "";
        Array.from(this.#addContactExistingTags.querySelectorAll(".tag"))
          .forEach((span) => span.classList.remove("selected"));
        this.#addContactDialog.close();
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

  renderAddContactExistingTagsSelector(contacts) {
    const existingTags = this.#extractTagsFromContacts(contacts);
    this.#addContactExistingTags.innerHTML = this.#tagSelectorTemplate({
      tags: existingTags,
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
}
