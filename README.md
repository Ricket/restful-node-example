Usage
=====

* Install nodejs (`sudo apt-get install nodejs`)
* Start the server: `node server.js [port]` - default port is 12357
* Talk with the server in a RESTful manner. You could start with the command `curl localhost:12357`, or look in `testcases.txt` for more examples.

Known bugs and non-RESTful features
==================================

* Error messages should send HTTP error codes (e.g. the "not found" errors should send error 404).