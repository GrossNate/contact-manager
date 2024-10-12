import { ContactFormWidget } from "./contactFormWidget.js";

/** @module View */

export class View {
  #document;
  #addContactHandler;
  #getAvailableTags;

  // Handlebars templates
  #contactListTemplate;
  #tagListTemplate;

  // Page parts
  #contactList;
  #searchTagSelector;
  #searchInputText;
  #contactFormWidget;

  #handleDeleteCallback;
  #getContactCallback;

  /**
   * @param {Document} document
   */
  constructor(document) {
    this.#document = document;

    // Extract all relevant elements from the DOM
    this.#contactList = this.#document.querySelector("#contactList");
    this.#searchTagSelector =
      this.#document.querySelector("#searchTagSelector");
    this.#searchInputText = this.#document.querySelector("#searchInputText");

    this.#contactFormWidget = new ContactFormWidget(
      this.#document.getElementById("contactForm"),
      this.#document.getElementById("contactFormDialog")
    );

    // Set up all Handlebars templates
    Handlebars.registerPartial(
      "contactPartial",
      this.#document.querySelector("#contactPartial").innerHTML
    );

    const tagListTemplate = this.#document.querySelector("#tagListTemplate");
    this.#tagListTemplate = Handlebars.compile(tagListTemplate.innerHTML);
    Handlebars.registerPartial("tagListTemplate", tagListTemplate.innerHTML);

    this.#contactListTemplate = Handlebars.compile(
      this.#document.querySelector("#contactListTemplate").innerHTML
    );

    // Add event listeners.
    this.#document
      .querySelector("#addContactButton")
      .addEventListener("click", (event) => {
        event.preventDefault();
        this.#contactFormWidget.initContactForm(
          this.#getAvailableTags(),
          this.#addContactHandler
        );
        this.#contactFormWidget.show();
      });

    this.#contactList.addEventListener("click", async (event) => {
      if (event.target.classList.contains("deleteButton")) {
        event.preventDefault();
        let contactDeleted = await this.#handleDeleteCallback(
          event.target.dataset.id
        );
        if (!contactDeleted) {
          alert("Couldn't delete!");
        }
      } else if (event.target.classList.contains("editButton")) {
        event.preventDefault();
        this.#contactFormWidget.initContactForm(
          this.#getAvailableTags(),
          this.#addContactHandler,
          await this.#getContactCallback(event.target.dataset.id)
        );
        this.#contactFormWidget.show();
      }
    });
  }

  setGetAvailableTagsFunction(callback) {
    this.#getAvailableTags = callback;
  }

  setAddContactHandler(callback) {
    this.#addContactHandler = callback;
  }

  setHandleDeleteCallback(callback) {
    this.#handleDeleteCallback = callback;
  }

  setGetContactCallback(callback) {
    this.#getContactCallback = callback;
  }

  getSearchTagSelector() {
    return this.#searchTagSelector;
  }
  getSearchInputText() {
    return this.#searchInputText;
  }

  renderContactList(contacts) {
    this.#contactList.innerHTML = this.#contactListTemplate({ contacts });
  }

  renderExistingTagsSelector(existingTags, tagContainer) {
    tagContainer.innerHTML = this.#tagListTemplate({
      tags: existingTags,
    });
  }
}
