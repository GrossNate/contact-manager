import { ContactFormWidget } from "./contactFormWidget.js";

/** @module View */

export class View {
  #document;
  #addContactHandler;
  #getAvailableTags;

  // Handlebars templates
  #contactListTemplate;
  #tagSelectorTemplate;

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
    const contactPartial = this.#document.querySelector("#contactPartial");
    Handlebars.registerPartial("contactPartial", contactPartial.innerHTML);

    const displayTagPartial =
      this.#document.querySelector("#displayTagPartial");
    Handlebars.registerPartial(
      "displayTagPartial",
      displayTagPartial.innerHTML
    );

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

    // Add event listeners for controls that don't interact with model
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
      
    this.getContactList().addEventListener(
      "click",
      async (event) => {
        if (event.target.classList.contains("deleteButton")) {
          event.preventDefault();
          let contactDeleted = await this.#handleDeleteCallback(event.target.dataset.id);
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
      },
    );

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


  getContactList() {
    return this.#contactList;
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
    tagContainer.innerHTML = this.#tagSelectorTemplate({
      tags: existingTags,
    });
  }
}
