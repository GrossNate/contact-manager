export class Model {
  #contacts;

  /**
   * @typedef {Object} Contact
   * @param {number} id
   * @param {string} full_name
   * @param {string} email
   * @param {string} phone_number
   * @param {string[]} tags
   */

  /**
   * @typedef {Contact[]} Contacts
   */

  constructor() {
    this.#contacts = [];
  }

  static processContact(contact) {
    contact.tags = contact.tags
      ?.split(",")
      .sort()
      .map((tag) => ({
        tag: tag,
      }));
  }

  /**
   * @async
   * @return {Contacts}
   */
  async refreshContacts() {
    try {
      const response = await fetch("/api/contacts");
      let contacts = await response.json();
      contacts.forEach((contact) => Model.processContact(contact));
      this.#contacts = contacts;
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
  async addContact(formData) {
    let formDataObj = {};
    formData
      .entries()
      .forEach((entry) => (formDataObj[entry[0]] = entry[1] ? entry[1] : null));
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObj),
      });
      if (response.status === 201) {
        return true;
      } else if (response.status === 400) {
        return false;
      } else {
        throw new Error("Contact creation failed for some unexpected reason.");
      }
    } catch (error) {
      console.error(`Failed to create contact: ${error}`);
    }
  }

  /**
   *
   * @param {number} contactId
   * @returns {Contact}
   */
  async getContact(contactId) {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "GET",
      });
      if (response.status === 200) {
        let contact = await response.json();
        Model.processContact(contact);
        return contact;
      } else if (response.status === 400) {
        return false;
      } else {
        throw new Error("Couldn't get contact for some unexpected reason.");
      }
    } catch (error) {}
  }

  /**
   * @async
   * @param {integer} contactId
   * @returns {boolean}
   */
  async deleteContact(contactId) {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });
      if (response.status === 204) {
        return true;
      } else if (response.status === 400) {
        return false;
      } else {
        throw new Error("Contact deletion failed for some unexpected reason.");
      }
    } catch (error) {
      console.error(`Failed to delete contact: ${error}`);
    }
  }

  getAvailableTags(contacts = this.#contacts) {
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
}
