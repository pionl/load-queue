export default class EntryList {
    constructor () {
        /**
         * An list of QueueEntry entries
         */
        this.list = {}
    }

    /**
     * Checks if url is in the list
     * @param {string} url
     * @return {boolean}
     */
    has (url) {
        return typeof this.list[url] === 'object'
    }

    /**
     * Returns current length of the list
     * @return {Number}
     */
    length () {
        return this.keys().length
    }

    /**
     * Returns the current list keys
     * @return {Array}
     */
    keys () {
        return Object.keys(this.list)
    }

    /**
     * Pulls the first entry from the list
     * @return {QueueEntry|null}
     */
    shift () {
        const keys = this.keys()

        if (keys.length === 0) {
            return null
        }

        return this.pull(keys[0])
    }

    /**
     * Pulls the entry and deletes it from the list
     *
     * @return {QueueEntry|null}
     */
    pull (url) {
        const entry = this.list[url]

        // Delete the entry if valid and return value
        if (typeof entry === 'object') {
            this.remove(url)
            return entry
        }

        // Return null if not found
        return null
    }

    /**
     * Adds an entry to the list
     * @param {QueueEntry} entry
     * @return {EntryList}
     */
    push (entry) {
        this.list[entry.url] = entry
        return this
    }

    /**
     * Deletes given entry by its url
     * @param {string} url
     * @return {EntryList}
     */
    remove (url) {
        delete this.list[url]
        return this
    }
}
