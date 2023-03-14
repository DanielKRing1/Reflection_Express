/**
 * Usage:
 *      Provide JournalId
 *      -> get Last n JournalEntries
 *      -> map JournalEntries to Reflections
 *      -> map Reflections to Thoughts
 *
 * USER
 * [unique id] pk [lastUsedJournalId] fk
 *
 * INKLINGS
 * [time id | [userId] fk [journalId] fk] pk [data]
 *
 * JOURNAL
 * [unique id] pk [userId] fk [name]
 *
 * JOURNAL ENTRY
 * [time id | [journalId] fk] pk
 * (index on [time id | journalId])
 *
 * THOUGHT
 * [time id | [journalId] fk] pk [data]
 * (index on [time id | journalId])
 *
 * REFLECTION
 * [
 *      [thought time id | journalId] fk |
 *      [journalEntry time id | journalId] fk
 * ] pk [keep]
 *
 */

/**
 * Should I make 2 requests to Server:
 *      1. Get all data + redundant data -> 1 api call   + 1 db call    + simpler caching logic                         / more bandwidth usage
 *      2. Get only relevant data        -> 2 api calls  + 2 db calls   + more complicated event-driven caching logic   / less bandwidth usage
 */
