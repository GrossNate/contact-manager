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
    document.addEventListener("contactsRefreshed", () => {
      this.refreshView();
    });
    await this.#model.refreshContacts();
    this.#setupEventHandlers();
    this.#view.setAddContactHandler(this.#model.addOrUpdateContact);
    this.#view.setGetAvailableTagsFunction(this.#model.getAvailableTags);
    this.#view.setHandleDeleteCallback(this.#model.deleteContact);
    this.#view.setGetContactCallback(this.#model.getContact);
  }

  async refreshView() {
    let contactData = await this.#model.getContacts();
    this.#view.renderContactList(contactData);
    this.#view.renderExistingTagsSelector(
      this.#model.getAvailableTags(),
      this.#view.getSearchTagSelector()
    );
  }

  /**
   * @param {DOMStringMap} dataset
   * @param {string} slot
   * @param {string} value
   */
  static addValueToDatasetSlot(dataset, slot, value) {
    let valuesArr = Controller.getValuesFromDatasetSlot(dataset, slot);
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
    let valuesArr = Controller.getValuesFromDatasetSlot(dataset, slot);
    if (!valuesArr.includes(value)) return;
    valuesArr.splice(valuesArr.indexOf(value), 1);
    dataset[slot] = valuesArr.join(",");
  }

  /**
   * @param {DOMStringMap} dataset
   * @param {string} slot
   * @param {string} value
   * @return {string[]}
   */
  static getValuesFromDatasetSlot(dataset, slot) {
    return dataset[slot].split(",").filter((value) => value != "");
  }

  async #refreshSearch() {
    const searchInputText = this.#view.getSearchInputText().value;
    const searchTagsDataset = this.#view.getSearchTagSelector().dataset;
    const excludedTags = Controller.getValuesFromDatasetSlot(
      searchTagsDataset,
      "excludedTags"
    );
    const selectedTags = Controller.getValuesFromDatasetSlot(
      searchTagsDataset,
      "selectedTags"
    );
    let contactData = await this.#model.getContacts();
    contactData = contactData.filter((contact) =>
      (contact.tags || []).every((tag) => !excludedTags.includes(tag))
    );
    contactData = contactData.filter((contact) =>
      selectedTags.every((selectedTag) =>
        (contact.tags || []).map((tag) => tag).includes(selectedTag)
      )
    );
    contactData = contactData.filter((contact) =>
      contact.full_name.toLowerCase().includes(searchInputText.toLowerCase())
    );
    this.#view.renderContactList(contactData);
  }

  #setupEventHandlers() {
    this.#view.getSearchInputText().addEventListener("input", (event) => {
      event.preventDefault();
      this.#refreshSearch();
    });
    this.#view.getSearchTagSelector().addEventListener("dblclick", (event) => {
      const classList = event.target.classList;
      if (classList.contains("tag")) {
        event.preventDefault();
        const dataset = this.#view.getSearchTagSelector().dataset;
        if (classList.contains("selected")) {
          classList.remove("selected");
          Controller.removeValueFromDatasetSlot(
            dataset,
            "selectedTags",
            event.target.dataset.tag
          );
        }
        classList.add("excluded");
        Controller.addValueToDatasetSlot(
          dataset,
          "excludedTags",
          event.target.dataset.tag
        );
        this.#refreshSearch();
      }
    });
    this.#view.getSearchTagSelector().addEventListener("click", (event) => {
      const classList = event.target.classList;
      if (classList.contains("tag")) {
        event.preventDefault();
        const dataset = this.#view.getSearchTagSelector().dataset;
        if (classList.contains("excluded")) {
          classList.remove("excluded");
          Controller.removeValueFromDatasetSlot(
            dataset,
            "excludedTags",
            event.target.dataset.tag
          );
        } else if (classList.contains("selected")) {
          classList.remove("selected");
          Controller.removeValueFromDatasetSlot(
            dataset,
            "selectedTags",
            event.target.dataset.tag
          );
        } else {
          classList.add("selected");
          Controller.addValueToDatasetSlot(
            dataset,
            "selectedTags",
            event.target.dataset.tag
          );
        }
        this.#refreshSearch();
      }
    });
  }

  // Event Handlers
  async #handleAddContactSubmit(event) {
    event.preventDefault();
    const formData = new FormData(this.#view.getAddContactForm());
    const newTagsArr = formData.get("addContactNewTagsInput").split(" ");
    const existingTagsArr = this.#view
      .getAddContactExistingTags()
      .dataset.tags.split(",");
    formData.set(
      "tags",
      newTagsArr
        .concat(existingTagsArr)
        .filter((tag) => tag != "")
        .join(",")
    );
    formData.delete("addContactNewTagsInput");

    let result = await this.#model.addOrUpdateContact(formData);
    if (result) {
      this.refreshView();
      this.#view.clearAndCloseAddContactDialog();
    } else {
      alert("Failure!");
    }
  }
}
