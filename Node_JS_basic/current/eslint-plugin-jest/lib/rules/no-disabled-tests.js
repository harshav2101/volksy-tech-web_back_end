"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils");

var _default = (0, _utils.createRule)({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow disabled tests',
      recommended: false
    },
    messages: {
      missingFunction: 'Test is missing function argument',
      skippedTestSuite: 'Skipped test suite',
      skippedTest: 'Skipped test',
      pending: 'Call to pending()',
      pendingSuite: 'Call to pending() within test suite',
      pendingTest: 'Call to pending() within test',
      disabledSuite: 'Disabled test suite',
      disabledTest: 'Disabled test'
    },
    schema: [],
    type: 'suggestion'
  },
  defaultOptions: [],

  create(context) {
    let suiteDepth = 0;
    let testDepth = 0;
    return {
      'CallExpression[callee.name="describe"]'() {
        suiteDepth++;
      },

      'CallExpression[callee.name=/^(it|test)$/]'() {
        testDepth++;
      },

      'CallExpression[callee.name=/^(it|test)$/][arguments.length<2]'(node) {
        context.report({
          messageId: 'missingFunction',
          node
        });
      },

      CallExpression(node) {
        const functionName = (0, _utils.getNodeName)(node.callee);

        switch (functionName) {
          case 'describe.skip':
            context.report({
              messageId: 'skippedTestSuite',
              node
            });
            break;

          case 'it.skip':
          case 'test.skip':
            context.report({
              messageId: 'skippedTest',
              node
            });
            break;
        }
      },

      'CallExpression[callee.name="pending"]'(node) {
        if ((0, _utils.scopeHasLocalReference)(context.getScope(), 'pending')) {
          return;
        }

        if (testDepth > 0) {
          context.report({
            messageId: 'pendingTest',
            node
          });
        } else if (suiteDepth > 0) {
          context.report({
            messageId: 'pendingSuite',
            node
          });
        } else {
          context.report({
            messageId: 'pending',
            node
          });
        }
      },

      'CallExpression[callee.name="xdescribe"]'(node) {
        context.report({
          messageId: 'disabledSuite',
          node
        });
      },

      'CallExpression[callee.name=/^xit|xtest$/]'(node) {
        context.report({
          messageId: 'disabledTest',
          node
        });
      },

      'CallExpression[callee.name="describe"]:exit'() {
        suiteDepth--;
      },

      'CallExpression[callee.name=/^it|test$/]:exit'() {
        testDepth--;
      }

    };
  }

});

exports.default = _default;