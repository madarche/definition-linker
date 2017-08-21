
Definition linker
=================

Utility to automatically create links to definition URLs, in a given block of
text/HTML.

A stemmer method must be provided to match the words given block of
text/HTML with the configured definition words.


Usage
-----

```javascript
const natural = require('natural');
const definition_linker = require('definition-linker')({
    stem: function stem(text) {
        // keepStops=true
        return natural.PorterStemmerFr.tokenizeAndStem(text, true).join(' ');
    }
});

definition_linker.createIndex();

definition_linker.addToIndex('node.js', `#node.js`);
definition_linker.addToIndex('logiciel libre, `#logiciel-libre`);
// etc.

const html = definition_linker.addLinksInHtml('Node.js est un logiciel libre);
```

### Advanced

```javascript
const natural = require('natural');
const definition_linker = require('definition-linker')({
    stem: function stem(text) {
        // keepStops=true
        return natural.PorterStemmerFr.tokenizeAndStem(text, true).join(' ');
    }
});

definition_linker.createIndex();

definition_linker.addToIndex('node.js', `#node.js`);
definition_linker.addToIndex('logiciel libre, `#logiciel-libre`);
// etc.

const html1 = definition_linker.addLinksInHtml('Node.js est un logiciel libre, '#node.js');

const html2 = definition_linker.addLinksInHtml('Il existe de nombreux logiciels libres dont Node.js', '#logiciel-libre);
```


Contributions
-------------

Pull Requests and contributions in general are welcome as long as they follow
the [Node aesthetic].

[Node aesthetic]: http://substack.net/node_aesthetic
