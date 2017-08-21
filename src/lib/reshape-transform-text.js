'use strict'

const {modifyNodes} = require('reshape-plugin-util')

// TODO: Make this list configurable
const blacklist = ['script', 'style', 'pre', 'code', 'a', 'em']

module.exports = function(opts) {
    return function plugin(tree) {

        return modifyNodes(tree, (node) => node.type === 'tag', (node) => {

            // If it's a blacklisted tag, move on
            if (blacklist.indexOf(node.name) > -1) {
                return node
            }

            // If it has no content, move on
            if (!node.content) {
                return node
            }

            node.content = node.content.map((n) => {
                if (n.type === 'text') {
                    n.content = opts.transform(n.content)
                }
                return n
            })

            return node
        })
    }
}
