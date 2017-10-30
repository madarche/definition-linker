'use strict'

// const logger = require('tracer').colorConsole()
const array_segments = require('array-segments')

const reshape = require('reshape')

const mine = require('./lib/reshape-transform-text')

// () in the regexp is to preserve the split characters
const punct_regexp = /(['’,.:!])/

let config

// The provided stem method
let stem

// key: the stemmed definition term, value: the URL on which to link to
let index

function createIndex() {
    index = {}
}

/**
 * Adds the given definition term, with its associated URL, to the index
 *
 * @return {string} the key in the index
 */
function addToIndex(definition_term, definition_url) {
    const key = stem(definition_term)
    index[key] = definition_url
    return key
}

/**
 * Adds links through the search index in an item to other items, with taking
 * care to not create links on the item-itself (when the body of the item uses
 * the title of the item).
 *
 * @param {string} content
 * @param {string} title_fr
 * @return {string} the modified content
 */
function addLinksInHtml(content, title_fr) {
    // logger.debug('content:', content)

    const transform = (text) => {
        return addLinksInText(text, title_fr)
    }

    return reshape({plugins: [mine({transform})]})
        .process(content)
        .then((result) => {
            return result.output()
        })
}

/**
 *
 */
function addLinksInText(text, title_fr) {
    // logger.trace('text:', text)

    // The item index is a copy of the index without the link entry of the
    // current item, to prevent to link the item on itself.
    const index_for_this_item = Object.assign({}, index)

    if (title_fr) {
        const title_fr_s = stem(title_fr)
        // logger.trace('title_fr_s:', title_fr_s)
        delete index_for_this_item[title_fr_s]
        // logger.warn('index_for_this_item:', index_for_this_item)
    }

    if (!Object.keys(index_for_this_item).length) {
        return text
    }

    const definition_tokens = longerFirstSort(Object.keys(index_for_this_item))
    // logger.trace('definition_tokens:', definition_tokens)
    const definition_segments = definition_tokens.map((el) => {
        return el.split(' ')
    })

    const parts = text.split(punct_regexp).map((text) => {
        return text.replace(/\s+/g, ' ')
    })
    // logger.trace('parts:', parts)

    const segments = parts.map((el) => {
        return el.split(' ')
    })

    const segments_s = segments.map((segment) => {
        return segment.map((el) => {
            return stem(el)
        })
    })

    const res = segments.map((segment, idx) => {
        return addLinksInNonPunctText(segment, segments_s[idx],
                                      definition_segments, index_for_this_item)
    })
    return res.join('')
}

function addLinksInNonPunctText(segment, segment_s, definition_segments,
                                index_for_this_item) {
    // logger.info('segment:', segment)
    // logger.info('segment_s:', segment_s)
    // logger.info('definition_segments:', definition_segments)
    const matches = array_segments.match(segment_s, definition_segments, true)
    matches.forEach((match) => {
        // logger.error('match:', match)
        match.indices.forEach((index) => {
            const token = match.segment.join(' ')
            const link_url = index_for_this_item[token]
            const definition_term_start = index
            const definition_term_end = index + match.segment.length - 1
            segment[definition_term_start] = `<a href="${link_url}">${segment[definition_term_start]}`
            segment[definition_term_end] = `${segment[definition_term_end]}</a>`
            // logger.error('segment:', segment)
        })
    })

    const res = segment.join(' ')
    // logger.info('res:', res)
    return res
}

/**
 * Sorts the elements of the list in place, longer first, and returns the list
 */
function longerFirstSort(list) {
    return list.sort((a, b) => {
        return b.length - a.length
    })
}

module.exports = function(config_obj) {
    if (!config_obj) {
        throw new Error('Missing config')
    }
    if (!config_obj.stem) {
        throw new Error('Missing stem function')
    }

    config = config_obj
    stem = config.stem

    return {
        createIndex,
        addToIndex,
        addLinksInHtml,
        addLinksInText
    }
}
