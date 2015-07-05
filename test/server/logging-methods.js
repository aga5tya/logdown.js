/* global describe, it, beforeEach, afterEach, xit */
/* jshint node:true */

'use strict'

var chai = require('chai')
var sinon = require('sinon')
var Logdown = require('../../src/')

sinon.assert.expose(chai.assert, {prefix: ''})
var assert = chai.assert

var ansiColors = {
  modifiers: {
    reset: [0, 0],
    bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  colors: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39]
  },
  bgColors: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49]
  }
};

var methods = ['debug', 'log', 'info', 'warn', 'error']
methods.forEach(function(method) {
  describe('Logdown::' + method, function() {
    var sandbox
    var symbol = ''

    if (method === 'debug') {
      symbol =
        '\u001b[' + ansiColors.colors.gray[0] + 'm' +
        '🐛' +
        '\u001b[' + ansiColors.colors.gray[1] + 'm '
    } else if (method === 'info') {
      symbol =
        '\u001b[' + ansiColors.colors.blue[0] + 'm' +
        'ℹ' +
        '\u001b[' + ansiColors.colors.blue[1] + 'm '
    } else if (method === 'warn') {
      symbol =
        '\u001b[' + ansiColors.colors.yellow[0] + 'm' +
        '⚠' +
        '\u001b[' + ansiColors.colors.yellow[1] + 'm '
    } else if (method === 'error') {
      symbol =
        '\u001b[' + ansiColors.colors.red[0] + 'm' +
        '✖' +
        '\u001b[' + ansiColors.colors.red[1] + 'm '
    }

    beforeEach(function() {
      sandbox = sinon.sandbox.create()
      sandbox.stub(global.console, method)

      Logdown.enable('*')
      process.env.NODE_DEBUG = ''
    })

    afterEach(function() {
      sandbox.restore()
    })

    it('should output multiple arguments', function() {
      try {
        var foo = new Logdown({markdown: true})

        foo[method]('one', 'two', 'three')
        assert.calledWith(
          console[method],
          symbol +
          'one two three'
        )
      } catch (error) {
        sandbox.restore()
        throw error
      }

      sandbox.restore()
    })

    it('should parse markdown in multiple arguments', function() {
      try {
        var foo = new Logdown({markdown: true})

        foo[method]('one', '*two*', 'three')
        assert.calledWith(
          console[method],
          symbol +
          'one ' +
          '\u001b[' + ansiColors.modifiers.bold[0] + 'm' +
          'two' +
          '\u001b[' + ansiColors.modifiers.bold[1] + 'm' +
          ' three'
        )
      } catch (error) {
        sandbox.restore()
        throw error
      }

      sandbox.restore()
    })

    it('should parse markdown if enabled', function() {
      try {
        var foo = new Logdown({markdown: true})

        foo[method]('lorem *ipsum*')
        assert.calledWith(
          console[method],
          symbol +
          'lorem ' +
          '\u001b[' + ansiColors.modifiers.bold[0] + 'm' +
          'ipsum' +
          '\u001b[' + ansiColors.modifiers.bold[1] + 'm'
        )

        foo[method]('lorem _ipsum_')
        assert.calledWith(
          console[method],
          symbol +
          'lorem ' +
          '\u001b[' + ansiColors.modifiers.italic[0] + 'm' +
          'ipsum' +
          '\u001b[' + ansiColors.modifiers.italic[1] + 'm'
        )

        foo[method]('lorem `ipsum`')
        assert.calledWith(
          console[method],
          symbol +
          'lorem ' +
          '\u001b[' + ansiColors.bgColors.bgYellow[0] + 'm' +
          '\u001b[' + ansiColors.colors.black[0] + 'm' +
          ' ' + 'ipsum' + ' ' +
          '\u001b[' + ansiColors.colors.black[1] + 'm' +
          '\u001b[' + ansiColors.bgColors.bgYellow[1] + 'm'
        )

        // foo[method]('lorem `ipsum` *dolor* sit _amet_')
        // assert.calledWith(
        //   console[method],
        //   'lorem ' +
        //   'ipsum%c %cdolor%c sit %camet%c'
        // )
      } catch (error) {
        sandbox.restore()
        throw error
      }

      sandbox.restore()
    })

    it('should not parse markdown if disabled', function() {
      try {
        var foo = new Logdown({markdown: false})

        foo[method]('lorem *ipsum*')
        assert.calledWith(
          console[method],
          symbol + 'lorem *ipsum*'
        )

        foo[method]('lorem _ipsum_ dolor')
        assert.calledWith(
          console[method],
          symbol + 'lorem _ipsum_ dolor'
        )

        // foo[method]('lorem `ipsum` dolor')
        // assert.calledWith(
        //   console[method],
        //   symbol + 'lorem `ipsum` dolor'
        // )
      } catch (error) {
        sandbox.restore()
        throw error
      }

      sandbox.restore()
    })

    xit('should sanitize forbidden characters', function() {
      sandbox.restore()
    })

    xit('should print prefix if present', function() {
      var foo = new Logdown({prefix: 'foo'})

      foo[method]('lorem ipsum')
      try {
        assert.calledWith(
          console[method],
          symbol +
          '\u001b[' + foo.prefixColor[0] + 'm' +
          '\u001b[' + ansiColors.modifiers.bold[0] + 'm' +
          foo.prefix +
          '\u001b[' + ansiColors.modifiers.bold[1] + 'm' +
          '\u001b[' + foo.prefixColor[1] + 'm ' +
          'lorem ipsum'
        )
      } catch (error) {
        sandbox.restore()
        throw error
      }

      sandbox.restore()
    })

    it('should sanitize strings', function() {
      try {
        var foo = new Logdown()
        foo[method]('lorem %cipsum%c sit %cdolor%c amet')
        assert.calledWith(
          console[method],
          symbol + 'lorem %cipsum%c sit %cdolor%c amet'
        )

        // var bar = new Logdown({prefix: 'bar'})
        // bar.log('lorem %cipsum% sit %cdolor% amet')
        // assert.calledWith(
        //   console[method],
        //   '%c' + bar.prefix + '%clorem ipsum sit dolor amet',
        //   'color:' + bar.prefixColor + '; font-weight:bold;',
        //   ''
        // )
      } catch (error) {
        sandbox.restore()
        throw error
      }

      sandbox.restore()
    })

    // https://github.com/caiogondim/logdown/issues/14
    xit('should print not-string arguments as is', function() {
      try {
        var foo = new Logdown()
        var obj = {foo: 1, bar: 2}
        foo[method](obj)
        assert.calledWith(
          console[method],
          symbol +
          '\u001b[' + foo.prefixColor[0] + 'm' +
          '\u001b[' + ansiColors.modifiers.bold[0] + 'm' +
          foo.prefix +
          '\u001b[' + ansiColors.modifiers.bold[1] + 'm' +
          '\u001b[' + foo.prefixColor[1] + 'm',
          obj
        )
      } catch (error) {
        sandbox.restore()
        throw error
      }

      sandbox.restore()
    })
  })
})
