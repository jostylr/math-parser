# [math-parser](# "version: 0.1.0-pre| jostylr")

The idea is to use events to parse mathematical expressions. There is no claim to novelty, just an itch I would like to scratch and know about. 


## Directory structure

* [README.md](#readme "save:| clean raw") The standard README.
* [package.json](#npm-package "save: json  | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | clean raw") A list of growing and shrinking items todo.
* [LICENSE](#license-mit "save: | clean raw") The MIT license as I think that is the standard in the node community. 
* [.gitignore](#gitignore "save: | clean raw")

## README

math-parser
 ================ 

Nothing yet ...

Hopefully a multi-language (ascii-math, tex, maybe others) math parser that can easily convert math expressions into another form either for computation or printing. 

Useful link on [parsers vs lexers](http://stackoverflow.com/questions/2842809/lexers-vs-parsers)


## TODO

Everything

## NPM package

The requisite npm package file. 

[](# "json") 

    {
      "name": "DOCNAME",
      "description": "A math parser in node",
      "version": "DOCVERSION",
      "homepage": "https://github.com/GHUSER/DOCNAME",
      "author": {
        "name": "James Taylor",
        "email": "GHUSER@gmail.com"
      },
      "repository": {
        "type": "git",
        "url": "git://github.com/GHUSER/DOCNAME.git"
      },
      "bugs": {
        "url": "https://github.com/GHUSER/DOCNAME/issues"
      },
      "licenses": [
        {
          "type": "MIT",
          "url": "https://github.com/GHUSER/DOCNAME/blob/master/LICENSE-MIT"
        }
      ],
      "main": "index.js",
      "engines": {
        "node": ">0.6"
      },
      "dependencies":{
        "event-when": ">=0.2.0"
      },
      "keywords": ["math parser"],
      "preferGlobal": "false"
    }

## gitignore

node_modules

## LICENSE MIT


The MIT License (MIT)
Copyright (c) 2013 James Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
