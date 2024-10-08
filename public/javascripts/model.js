export class Model {
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
      return this.#contacts; // this.#contacts;
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

  async addContact(formData) {
    let formDataObj = {};
    formData.entries().forEach((entry) =>
      formDataObj[entry[0]] = entry[1] ? entry[1] : null
    );
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        "headers": { "Content-Type": "application/json" },
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
