# Live Debug

Live Debug is an extension for use in vscode that adds "life debugging" to obsidian projects.

The goal of live debug is to reduce or eliminate the need for traditional deugging tools, as they are awkward to use, time consuming, and reactionary to issues.

# What is Live Debugging?

Live Debugging is the idea that you should be debugging your code as you write it. The way the extension does this, is by running your code every time a change is made, during execution it tracks the values of variables, and the results of expressions in your code. Then the results are displayed alongside your code so you can sanity check everything you do without any work. Live Debug is a guide that helps you write code, not a tool for when things go wrong. It greatly reduces the chance of stupid or silly mistakes that are common when writing large blocks of code. 

This only works because Obsidian enforces some requirements that make this possible. Primarily, it requires that all modules have a main function that is pure, meaning the return value is entirely based on the inputs. This means the entire application does not need to be run to use live debugging, only the current module and some test inputs.

