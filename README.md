
Definition linker
=================

[![NPM version](http://img.shields.io/npm/v/definition-linker.svg)](https://www.npmjs.org/package/definition-linker)
[![Dependency Status](https://david-dm.org/madarche/definition-linker.svg)](https://david-dm.org/madarche/definition-linker)
[![devDependency Status](https://david-dm.org/madarche/definition-linker/dev-status.svg)](https://david-dm.org/madarche/definition-linker#info=devDependencies)
[![Build Status](https://travis-ci.org/madarche/definition-linker.svg?branch=master)](https://travis-ci.org/madarche/definition-linker)

Utility to automatically create links to definition URLs, in a given block of
text/HTML.

A stemmer method must be provided to match the words given block of
text/HTML with the configured definition words.


Usage
-----

### Basic

```javascript
const natural = require('natural');
const definition_linker = require('definition-linker')({
    stem: function stem(text) {
        // keepStops=true
        return natural.PorterStemmerFr.tokenizeAndStem(text, true).join(' ');
    }
});

definition_linker.createIndex();

definition_linker.addToIndex('node.js', '#node.js');
definition_linker.addToIndex('logiciel libre', '#logiciel-libre');
// etc.

const html = definition_linker.addLinksInHtml('Node.js est un logiciel libre');
```

### Advanced

`addLinksInHtml` and `addLinksInText` accept an optional parameter to exclude
linking to a specific definition.

```javascript
const natural = require('natural');
const definition_linker = require('definition-linker')({
    stem: function stem(text) {
        // keepStops=true
        return natural.PorterStemmerFr.tokenizeAndStem(text, true).join(' ');
    }
});

definition_linker.createIndex();

definition_linker.addToIndex('node.js', '#node.js');
definition_linker.addToIndex('logiciel libre', '#logiciel-libre');
// etc.

const html1 = definition_linker.addLinksInHtml('Node.js est un logiciel libre', '#node.js');

const html2 = definition_linker.addLinksInHtml('Il existe de nombreux logiciels libres dont Node.js', '#logiciel-libre');
```

#### Nolink

It is possible to disable linking on some terms in the HTML by setting a
"nolink" class:

```javascript
const natural = require('natural');
const definition_linker = require('definition-linker')({
    stem: function stem(text) {
        // keepStops=true
        return natural.PorterStemmerFr.tokenizeAndStem(text, true).join(' ');
    }
});

definition_linker.createIndex();

definition_linker.addToIndex('node.js', '#node.js');
definition_linker.addToIndex('logiciel libre, '#logiciel-libre');
// etc.

const html3 = definition_linker.addLinksInHtml('Node.js est un <span class="nolink">logiciel libre</span>', '#node.js');
```


Development
-----------

It is possible to disable linking on some terms in the HTML by setting a
"nolink" class:

```shell
export DEBUG='definition-linker'
npm test
```


Contributions
-------------

Pull Requests and contributions in general are welcome as long as they follow
the [Node aesthetic].

[Node aesthetic]: http://substack.net/node_aesthetic
