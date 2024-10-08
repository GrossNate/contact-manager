// Adding these import statements isn't necessary for app functionality, but
// they enable JSDoc to give much more helpful code completion hints.
import { Model } from "./model.js";
import { View } from "./view.js";

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
    await this.refreshView();
    this.#setupEventHandlers();
  }

  async refreshView() {
    let contactData = await this.#model.refreshContacts();
    this.#view.renderContactList(contactData);
    this.#view.renderSearchTagSelector(contactData);
    this.#view.renderAddContactExistingTagsSelector(contactData);
  }
  /**
   * @param {DOMStringMap} dataset
   * @param {string} slot
   * @param {string} value
   */
  static addValueToDatasetSlot(dataset, slot, value) {
    let valuesArr = dataset[slot].split(",").filter((value) => value != "");
    if (valuesArr.includes(value)) return;
    valuesArr.push(value);
    dataset[slot] = valuesArr.join(",");
  }

  /**
   * @param {DOMStringMap} dataset
   * @param {string} slot
   * @param {string} value
   */
  static removeValueFromDatasetSlot(dataset, slot, value) {
    let valuesArr = dataset[slot].split(",").filter((value) => value != "");
    if (!valuesArr.includes(value)) return;
    valuesArr.splice(valuesArr.indexOf(value), 1);
    dataset[slot] = valuesArr.join(",");
  }

  #setupEventHandlers() {
    this.#view.getAddContactForm().addEventListener(
      "submit",
      this.#handleAddContactSubmit.bind(this),
    );
    this.#view.getContactList().addEventListener(
      "click",
      (event) => {
        if (event.target.classList.contains("deleteButton")) {
          this.#handleDeleteContact.bind(this)(event);
        }
      },
    );
    this.#view.getSearchTagSelector().addEventListener(
      "dblclick",
      (event) => {
        const classList = event.target.classList;
        if (classList.contains("tag")) {
          event.preventDefault();
          const dataset = this.#view.getSearchTagSelector().dataset;
          if (classList.contains("selected")) {
            classList.remove("selected");
            Controller.removeValueFromDatasetSlot(
              dataset,
              "selectedTags",
              event.target.dataset.tag,
            );
          }
          classList.add("excluded");
          Controller.addValueToDatasetSlot(
            dataset,
            "excludedTags",
            event.target.dataset.tag,
          );
        }
      },
    );
    this.#view.getSearchTagSelector().addEventListener(
      "click",
      (event) => {
        const classList = event.target.classList;
        if (classList.contains("tag")) {
          event.preventDefault();
          const dataset = this.#view.getSearchTagSelector().dataset;
          if (classList.contains("excluded")) {
            classList.remove("excluded");
            Controller.removeValueFromDatasetSlot(
              dataset,
              "excludedTags",
              event.target.dataset.tag,
            );
          } else if (classList.contains("selected")) {
            classList.remove("selected");
            Controller.removeValueFromDatasetSlot(
              dataset,
              "selectedTags",
              event.target.dataset.tag,
            );
          } else {
            classList.add("selected");
            Controller.addValueToDatasetSlot(
              dataset,
              "selectedTags",
              event.target.dataset.tag,
            );
          }
        }
      },
    );
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
      this.refreshView();
      this.#view.clearAndCloseAddContactDialog();
    } else {
      alert("Failure!");
    }
  }

  async #handleDeleteContact(event) {
    event.preventDefault();
    let contactDeleted = await this.#model.deleteContact(
      event.target.dataset.id,
    );
    if (contactDeleted) {
      this.refreshView();
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
