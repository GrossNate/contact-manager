/** @module Contact */

export class Contact {
  /**
   *
   * @param {Object} contactBareObj
   */
  constructor(contactBareObj) {
    this.id = contactBareObj.id;
    this.full_name = contactBareObj.full_name;
    this.email = contactBareObj.email;
    this.phone_number = contactBareObj.phone_number;
    /**
     * @type {Object[]}
     */
    this.tags =
      contactBareObj.tags
        ?.split(",")
        .sort()
        .filter((tagStr) => tagStr != "") || [];
  }

  /**
   * Gets the tags as a tab-delimited string.
   * @returns {string}
   */
  getTagsStr() {
    return this.tags.join(",");
  }
}
