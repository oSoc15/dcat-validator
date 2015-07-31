# DCAT Validator

Bower: Sébastien Henau
NodeJs: Stan Callewaert


## Design and usablity of the site

The final goal of this project is to make a DCAT - validator for DCAT feeds. It shows errors when mandatory fields are missing or warnings when recommended fiels aren't present. The validation can be done by manually inserting the text, uploading a file by selecting the file from your local computer or inserting a URI.

In order to install the right node_modules like bootstrap, jQuery, ... using the package.json you must have npm installed. You can find all the npm tutorials on this site: https://docs.npmjs.com/

## Usage

If anyone wants to use the code remove the code below in all the HTML which contains the script for our Google Analytics and replace it by your own Google Analytics script.
```
<script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-65756494-1', 'auto');
    ga('send', 'pageview');
</script>
```

## Installation

1. In order to install the right packages you need node.js and npm
   Follow this link to install node.js an npm
   https://docs.npmjs.com/getting-started/installing-node

2. Once the first step is done you must open your console(windows) or terminal(mac) and typ:
```
   npm install
```
This command will install all the right node_modules from the package.json and put them in a map node_modules


## Library

The validation library that is in this repository (dcat-validator.bundle.js) can be found on the github (https://github.com/oSoc15/dcat-validator.js).
This library has been browserified to one javascript file that is named dcat-validator.bundle.js. You can find the file in the js folder.


## Used libraries

### RDF-Ext:
This library supports multiple formats(json-ld, turtle, xml, ...). It consists of parsers and serializers which first parse a file and finally serializes it to turtle. Because the used validation library only validates turtle. This library will automatically install when the 'npm install' command is executed.