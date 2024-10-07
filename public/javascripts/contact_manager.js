class View {
  #document;

  // Handlebars templates
  // #contactPartial;
  #contactListTemplate;

  // Page parts
  #contactList;
  #addContactDialog;

  constructor(document) {
    this.#document = document;
    this.#contactList = this.#document.querySelector("#contactList");
    this.#addContactDialog = this.#document.querySelector("#addContactDialog");

    // const contactPartial = this.#document.querySelector("#contactPartial");
    // this.#contactPartial = Handlebars.compile(contactPartial.innerHTML);
    Handlebars.registerPartial("contactPartial", contactPartial.innerHTML);
    contactPartial.remove(); // Not necessary, but keeps the DOM cleaner.

    const contactListTemplate = this.#document.querySelector(
      "#contactListTemplate",
    );
    this.#contactListTemplate = Handlebars.compile(
      contactListTemplate.innerHTML,
    );
    contactListTemplate.remove();

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
}

class Model {
  #contacts;

  async getContacts() {
    try {
      const response = await fetch("/api/contacts");
      let contacts = await response.json();
      contacts.forEach((contact) =>
        contact.tags = contact.tags?.split(",").map((tag) => ({ "tag": tag }))
      );
      this.#contacts = contacts;
      return this.#contacts;
    } catch (error) {
      console.error(`Failed to fetch contacts: ${error}`);
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

  init() {
    this.#view.renderContactList(this.#model.getContacts());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const controller = new Controller(new Model(), new View(document));
  document.querySelector("#loadingP").remove();
  controller.init();
});
