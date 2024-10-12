import { Contact } from "./contact.js";

export class Model {
  #document; // Only using this to dispatch events.
  #contacts;

  /**
   * @typedef {Contact[]} Contacts
   */

  /**
   *
   * @param {Document} document
   */
  constructor(document) {
    this.#contacts = [];
    this.#document = document;
  }

  #setContacts(contacts) {
    this.#contacts = contacts;
    this.#document.dispatchEvent(new Event("contactsRefreshed"));
  }

  /**
   * @async
   * @return {Contacts}
   */
  async refreshContacts() {
    try {
      const response = await fetch("/api/contacts");
      let contacts = await response.json();
      this.#setContacts(contacts.map((contact) => new Contact(contact)));
      return this.#contacts; // this.#contacts;
    } catch (error) {
      console.error(`Failed to fetch contacts: ${error}`);
    }
  }

  /**
   * @async
   * @return {Contacts}
   */
  async getContacts() {
    if (this.#contacts.length === 0) {
      return await this.refreshContacts();
    } else {
      return this.#contacts;
    }
  }

  /**
   * @async
   * @param {FormData} formData
   * @returns {boolean}
   */
  // Note this is expressed as an arrow function because otherwise we lose the
  // right context.
  addOrUpdateContact = async (formData) => {
    let formDataObj = {};
    formData
      .entries()
      .forEach((entry) => (formDataObj[entry[0]] = entry[1] ? entry[1] : null));
    try {
      let endpointLocation;
      let method;
      // If the id property is populated then it's an update, otherwise it's new.
      if (formDataObj.id) {
        endpointLocation = `/api/contacts/${formDataObj.id}`;
        method = "PUT";
      } else {
        endpointLocation = "/api/contacts";
        method = "POST";
      }
      const response = await fetch(endpointLocation, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObj),
      });
      if (response.status === 201) {
        this.refreshContacts();
        return true;
      } else if (response.status === 400) {
        return false;
      } else {
        throw new Error("Contact creation failed for some unexpected reason.");
      }
    } catch (error) {
      console.error(`Failed to create contact: ${error}`);
    }
  };

  /**
   *
   * @param {Contact} contact
   */
  editContact = async (contact) => {
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });
      if (response.status === 201) {
        this.refreshContacts();
        return true;
      } else if (response.status === 400) {
        return false;
      } else {
        throw new Error("Contact creation failed for some unexpected reason.");
      }
    } catch (error) {
      console.error(`Failed to edit contact: ${error}`);
    }
  };

  /**
   *
   * @param {number} contactId
   * @returns {Contact}
   */
  getContact = async (contactId) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "GET",
      });
      if (response.status === 200) {
        let contact = await response.json();
        return new Contact(contact);
      } else if (response.status === 400) {
        return false;
      } else {
        throw new Error("Couldn't get contact for some unexpected reason.");
      }
    } catch (error) {}
  };

  /**
   * @async
   * @param {integer} contactId
   * @returns {boolean}
   */
  deleteContact = async (contactId) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });
      if (response.status === 204) {
        this.refreshContacts();
        return true;
      } else if (response.status === 400) {
        return false;
      } else {
        throw new Error("Contact deletion failed for some unexpected reason.");
      }
    } catch (error) {
      console.error(`Failed to delete contact: ${error}`);
    }
  };

  /**
   *
   * @param {Contacts} contacts
   * @returns {Object[]}
   */
  getAvailableTags = (contacts = this.#contacts) => {
    return contacts
      .flatMap((contact) => contact.tags)
      .sort()
      .reduce((uniqueTags, tag) => {
        if (tag && !uniqueTags.includes(tag)) {
          uniqueTags.push(tag);
        }
        return uniqueTags;
      }, [])
      .map((tagString) => ({ tag: tagString }));
  };
}
