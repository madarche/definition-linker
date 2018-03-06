'use strict'

require('must')

const natural = require('natural')

const definition_linker = require('../..')({
    stem: function stem(text) {
        // keepStops=true
        return natural.PorterStemmerFr.tokenizeAndStem(text, true).join(' ')
    }
})

describe('Autolink', () => {

    context('addLinksInText', () => {

        it('works with empty index', () => {
            const text1 = 'L’adresse MAC, est différente de l’adresse IP.'
            definition_linker.createIndex()
            const text = definition_linker.addLinksInText(text1)
            text.must.be(text1)
        })

        it('works with empty item index', () => {
            const text1 = 'L’adresse MAC, est différente de l’adresse IP.'
            definition_linker.createIndex()
            const key = definition_linker.addToIndex('adresse IP', '#adresse-ip')
            const text = definition_linker.addLinksInText(text1, key)
            text.must.be(text1)
        })

        it('works with non-empty item index', () => {
            const text1 = 'L’adresse MAC, est différente de l’adresse IP.'
            definition_linker.createIndex()
            definition_linker.addToIndex('adresse IP', '#adresse-ip')
            const key = definition_linker.addToIndex('adresse MAC', '#adresse-mac')
            const text = definition_linker.addLinksInText(text1, key)
            text.must.be('L’adresse MAC, est différente de l’<a href="#adresse-ip">adresse IP</a>.')
        })

    })

    context('addLinksInHtml', () => {

        it('works with empty index', () => {
            const text2 = '<p>L’<em>adresse MAC</em>, est différente de l’adresse IP.</p>'
            definition_linker.createIndex()
            return definition_linker.addLinksInHtml(text2)
                .must.then.equal(text2)
        })

        it('works with empty item index', () => {
            const text2 = '<p>L’<em>adresse MAC</em>, est différente de l’adresse IP.</p>'
            definition_linker.createIndex()
            const key = definition_linker.addToIndex('adresse IP', '#adresse-ip')
            return definition_linker.addLinksInHtml(text2, key)
                .must.then.equal(text2)
        })

        it('works with non-empty item index', () => {
            const text2 = '<p>L’<em>adresse MAC</em>, est différente de l’adresse IP.</p>'
            definition_linker.createIndex()
            definition_linker.addToIndex('adresse IP', '#adresse-ip')
            const key = definition_linker.addToIndex('adresse MAC', '#adresse-mac')
            return definition_linker.addLinksInHtml(text2, key)
                .must.then.equal('<p>L’<em>adresse MAC</em>, est différente de l’<a href="#adresse-ip">adresse IP</a>.</p>')
        })

        it('works with non-empty item index honoring nolink class', () => {
            const text1 = '<p>L’<em>adresse MAC</em>, est différente de <span class="nolink">l’adresse IP</span>.</p>'
            const text2 = '<p>L’<em>adresse MAC</em>, est différente de <span class="nolink some_other_class">l’adresse IP</span>.</p>'
            const text3 = '<p>L’<em>adresse MAC</em>, est différente de <span class="some_other_class nolink">l’adresse IP</span>.</p>'
            definition_linker.createIndex()
            definition_linker.addToIndex('adresse IP', '#adresse-ip')
            const key = definition_linker.addToIndex('adresse MAC', '#adresse-mac')
            return Promise.all([
                definition_linker.addLinksInHtml(text1, key).must.then.equal(text1),
                definition_linker.addLinksInHtml(text2, key).must.then.equal(text2),
                definition_linker.addLinksInHtml(text3, key).must.then.equal(text3)
            ])
        })

        it('works with non-empty item index and doesn’t put links in links', () => {
            const text3 = '<p>L’<em>adresse MAC</em>, est <a href="https://somewhere.test/">différente</a> de l’adresse IP.</p>'
            definition_linker.createIndex()
            definition_linker.addToIndex('adresse IP', '#adresse-ip')
            const key = definition_linker.addToIndex('adresse MAC', '#adresse-mac')
            return definition_linker.addLinksInHtml(text3, key)
                .must.then.equal('<p>L’<em>adresse MAC</em>, est <a href="https://somewhere.test/">différente</a> de l’<a href="#adresse-ip">adresse IP</a>.</p>')
        })

        it('works with URLs onto which not to link', () => {
            const text_orig = `<ul>
                <li><a href="https://www.wikipedia.org/">https://www.wikipedia.org/</a></li>
                <li><a href="http://references.modernisation.gouv.fr/referentiels">http://references.modernisation.gouv.fr/referentiels</a></li>
            </ul>`
            definition_linker.createIndex()
            definition_linker.addToIndex('HTTPS', '#https')
            const key = definition_linker.addToIndex('URL', '#url')
            const text_expected = '<ul> <li><a href="https://www.wikipedia.org/">https://www.wikipedia.org/</a></li> <li><a href="http://references.modernisation.gouv.fr/referentiels">http://references.modernisation.gouv.fr/referentiels</a></li> </ul>'
            return definition_linker.addLinksInHtml(text_orig, key)
                .must.then.equal(text_expected)
        })

        it('works with the longest matches', () => {
            const text_orig = '<p>Un <em>logiciel libre</em> est un logiciel distribué suivant une licence libre.</p>'
            definition_linker.createIndex()
            definition_linker.addToIndex('licence', '#licence')
            definition_linker.addToIndex('licence libre', '#licence-libre')
            const key = definition_linker.addToIndex('logiciel libre', '#logiciel-libre')
            const text_expected = '<p>Un <em>logiciel libre</em> est un logiciel distribué suivant une <a href="#licence-libre">licence libre</a>.</p>'
            return definition_linker.addLinksInHtml(text_orig, key)
                .must.then.equal(text_expected)
        })

        it('works with spaces', () => {
            const text_orig = `<p>le chiffrement
        symétrique et le chiffrement asymétrique.</p>`
            const text_expected = '<p>le <a href="#chiffrement-symetrique">chiffrement symétrique</a> et le <a href="#chiffrement-asymetrique">chiffrement asymétrique</a>.</p>'

            definition_linker.createIndex()
            definition_linker.addToIndex('chiffrement symétrique', '#chiffrement-symetrique')
            definition_linker.addToIndex('chiffrement asymétrique', '#chiffrement-asymetrique')
            const key = definition_linker.addToIndex('chiffrement', '#chiffrement')
            return definition_linker.addLinksInHtml(text_orig, key)
                .must.then.equal(text_expected)
        })

    })

})
