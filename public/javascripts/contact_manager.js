class View {
  #document;

  // Handlebars templates
  #contactListTemplate;
  #tagSelectorTemplate;

  // Page parts
  #contactList;
  #addContactDialog;
  #searchTagSelector;

  constructor(document) {
    this.#document = document;
    this.#contactList = this.#document.querySelector("#contactList");
    this.#addContactDialog = this.#document.querySelector("#addContactDialog");
    this.#searchTagSelector = this.#document.querySelector(
      "#searchTagSelector",
    );

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
        this.#addContactDialog.close();
      });
  }

  async renderContactList(contacts) {
    this.#contactList.outerHTML = this.#contactListTemplate({
      contacts: await contacts,
    });
  }

  async renderSearchTagSelector(contacts) {
    const existingTags = (await contacts)
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
    this.#searchTagSelector.innerHTML = this.#tagSelectorTemplate({
      tags: existingTags,
    });
  }
}

class Model {
  #contacts;

  constructor() {
    this.#contacts = [];
  }

  async refreshContacts() {
    try {
      const response = await fetch("/api/contacts");
      let contacts = await response.json();
      contacts.forEach((contact) =>
        contact.tags = contact.tags?.split(",").sort().map((tag) => ({
          "tag": tag,
        }))
      );
      this.#contacts = contacts;
      return this.#contacts;
    } catch (error) {
      console.error(`Failed to fetch contacts: ${error}`);
    }
  }

  async getContacts() {
    if (this.#contacts.length === 0) {
      return await this.refreshContacts();
    } else {
      return this.#contacts;
    }
  }
}

class Controller {
  #model;
  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;
  }

  async init() {
    this.#view.renderContactList(await this.#model.getContacts());
    this.#view.renderSearchTagSelector(this.#model.getContacts());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const controller = new Controller(new Model(), new View(document));
  document.querySelector("#loadingP").remove();
  controller.init();
});
