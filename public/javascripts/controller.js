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
    this.#view.renderExistingTagsSelector(contactData, this.#view.getAddContactExistingTags());
    this.#view.renderExistingTagsSelector(contactData, this.#view.getEditContactExistingTags());
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
      "excludedTags",
    );
    const selectedTags = Controller.getValuesFromDatasetSlot(
      searchTagsDataset,
      "selectedTags",
    );
    let contactData = await this.#model.getContacts();
    console.log(contactData);
    contactData = contactData.filter((contact) =>
      (contact.tags || []).every(({ tag }) => !excludedTags.includes(tag))
    );
    contactData = contactData.filter((contact) =>
      selectedTags.every((selectedTag) =>
        (contact.tags || []).map(({ tag }) => tag).includes(selectedTag)
      )
    );
    contactData = contactData.filter((contact) =>
      contact.full_name.toLowerCase().includes(searchInputText.toLowerCase())
    );
    this.#view.renderContactList(contactData);
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
        } else if (event.target.classList.contains("editButton")) {
          this.#handleEditContact.bind(this)(event);
        }
      },
    );
    this.#view.getSearchInputText().addEventListener("input", (event) => {
      event.preventDefault();
      this.#refreshSearch();
    });
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
          this.#refreshSearch();
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
          this.#refreshSearch();
        }
      },
    );
    this.#view.getAddContactExistingTags().addEventListener("click", (event) => {
      if (event.target.classList.contains("tag")) {
        const tagClicked = event.target.dataset.tag;
        const tagDataset = this.#view.getAddContactExistingTags().dataset;
        if (
          tagDataset.tags
            .split(",")
            .includes(tagClicked)
        ) {
          tagDataset.tags = tagDataset.tags.split(",").filter((tag) =>
            tag != tagClicked
          ).join(",");
          event.target.classList.remove("selected");
        } else {
          tagDataset.tags = tagDataset.tags.split(",").concat(tagClicked).join(
            ",",
          );
          event.target.classList.add("selected");
        }
      }
    });
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
    } else {
      alert("Deletion failed!");
    }
  }
  
  async #handleEditContact(event) {
    event.preventDefault();
    let contact = await this.#model.getContact(event.target.dataset.id);
    if (contact) {
      this.#view.showEditContactDialog(contact);
    } else {
      alert("Couldn't find contact to edit.");
    }
  }
}
