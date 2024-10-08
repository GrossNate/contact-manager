export class Controller {
  #model;
  #view;

  /**
   * @param {Model} model
   * @param {View} view
   */
  constructor(model, view) {
    this.#model = model;
    this.#view = view;
  }

  async init() {
      let contactData = await this.#model.refreshContacts();
      this.#view.renderContactList(contactData);
      this.#view.renderSearchTagSelector(contactData);
      this.#view.renderAddContactExistingTagsSelector(contactData);
      this.#setupEventHandlers();
    // this.#view.renderContactList(await this.#model.getContacts());
    // this.#view.renderSearchTagSelector(await this.#model.getContacts());
    // this.#view.renderAddContactExistingTagsSelector(
    //   await this.#model.getContacts(),
    // );
    // this.#setupEventHandlers();
  }

  #setupEventHandlers() {
    this.#view.getAddContactForm().addEventListener(
      "submit",
      this.#handleAddContactSubmit.bind(this),
    );
    Array.from(this.#view.getDeleteButtons()).forEach(button => button.addEventListener(
      "click",
      this.#handleDeleteContact.bind(this),
    ));
  }

  // Event Handlers
  async #handleAddContactSubmit(event) {
    event.preventDefault();
    const formData = new FormData(this.#view.getAddContactForm());
    const newTagsArr = formData.get("addContactNewTagsInput").split(" ");
    const existingTagsArr = this.#view.getAddContactExistingTags().dataset.tags
      .split(",");
    formData.set(
      "tags",
      newTagsArr.concat(existingTagsArr).filter((tag) => tag != "").join(","),
    );
    formData.delete("addContactNewTagsInput");

    let result = await this.#model.addContact(formData);
    if (result) {
      this.init();
      this.#view.clearAndCloseAddContactDialog();
    } else {
      alert("Failure!");
    }
  }

  async #handleDeleteContact(event) {
    event.preventDefault();
    let contactDeleted = await this.#model.deleteContact(event.target.dataset.id);
    if (contactDeleted) {
      this.init();
      // let contactData = await this.#model.refreshContacts();
      // this.#view.renderContactList(contactData);
      // this.#view.renderSearchTagSelector(contactData);
      // this.#view.renderAddContactExistingTagsSelector(contactData);
      // this.#setupEventHandlers();
    } else {
      alert("Deletion failed!");
    }
  }
}
