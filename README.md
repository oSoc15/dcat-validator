DCAT Validator (NodeJs project)

Bower: Sébastien Henau
NodeJs: Stan Callewaert

**************
Design and usablity of the site
**************

The final goal of this project is to make a DCAT - validator for DCAT feeds. It shows errors when mandatory fields are missing or warnings when recommended fiels aren't present. The validation can be done by manually inserting the text, uploading a file by selecting the file from your local computer or inserting a URI.

___________

In order to install the right node_modules like bootstrap, jQuery, ... using the package.json you must have npm installed. You can find all the npm tutorials on this site: https://docs.npmjs.com/

___________

For installing the node_modules:

1. Follow this link to install node.js and npm:
https://docs.npmjs.com/getting-started/installing-node

2. Once the first step is done you must open your console(windows) or terminal(mac) and typ:
npm install

This command will install all the right node_modules from the package.json and put them in a map node_modules

___________

**************
Library
**************

The validation library that is in this repository (bundle.js) can be found on the github (https://github.com/oSoc15/dcat-validator.js).
This library has been browserified to one javascript file that is named bundle.js. You can find it in the js folder.
