# Obsidian

Obsidian is a web application engine, best suited for rapid development and testing of simple web applications.
It is built on top of Node and React

Obsidian is based on the belief that most web app frameworks are designed for enterprise which prioritize
speed and flexibility over simplicity and ease of use, which makes them trickier to learn,
configure, and test than is necessary for simple applications. Obsidian is for when you want to write
web apps without unnecessary friction.

#### Goals of Obsidian

Obsidian is designed to:

- Be fun to use
- Be easy to understand
- Reduce repetitive coding
- Speed up web development and debugging in simple web applications

#### Not Goals of Obsidian

Obsidian is not designed to:

- Be optimized
- Be powerful
- Speed up web development and debugging in complex web applications

## Obsidian's Principles

These principles are used to guide major decisions in the framework, and ensure that priorities are consistent across
the entire project

1. A fast runtime calculations is better than a compiled one 
2. Usable > Simple > Easy > Secure > Optimized
3. Having many similar structures is better than fewer unique ones
4. Linear beats branching
5. Stateless beats state-sensitive
6. Fewer, more general interfaces beats many specialized ones
7. Users should see their changes reflected across the system quickly
8. Users should know how to fix an error from the message alone
9. Users should not have to write Boilerplate code
10. Failing early is better than failing later

# Major Features

## Obsidian Editor

The Obsidian Editor is a tool to create web applications quickly with the help of a graph editor.
By representing the entire application as a graph the movement of data is clear and easy to understand. It
also makes code reuse incredibly easy, and makes unit testing a breeze.

## GLIB (Graph Library)

Obsidian contains a library that can be used in the editor to aid with development, these are optional tools
that cover common needs such as authentication, form validation, etc. 

## Obsidian Engine

Obsidian Engine is a web server that runs the applications made in the editor. It takes incoming requests, 
creates responses, and manages the database. It has knowledge of the complete system and can leverage that
to make many tedious tasks a breeze.
