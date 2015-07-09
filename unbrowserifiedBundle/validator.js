var text = '@prefix dcat: <http://www.w3.org/ns/dcat#> .\n' +
	'@prefix dc: <http://purl.org/dc/terms/> .\n' +
	'@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n' +
	'@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n' +

	'<http://demo.thedatatank.com/api/dcat>\n' +
	  'a dcat:Catalog ;\n' +
	  'dc:title "The DataTank Demo" ;\n' +
	  'dc:description "A demo catalog of datasets published by The DataTank." ;\n' +
	  'dc:issued "2013-12-04T09:35:15+0000" ;\n' +
	  'dc:language <http://lexvo.org/id/iso639-3/eng> ;\n' +
	  'foaf:homepage <http://demo.thedatatank.com> ;\n' +
	  'dc:license <http://www.opendefinition.org/licenses/cc-zero> ;\n' +
	  'dc:publisher <http://thedatatank.com/#organization> ;\n' +
	  'dc:modified "2015-04-23T09:52:31+0000" ;\n' +
	  'dcat:dataset <http://demo.thedatatank.com/csv/geo>, <http://demo.thedatatank.com/json/crime>, <http://demo.thedatatank.com/xml/persons>, <http://demo.thedatatank.com/dresden/rivers>, <http://demo.thedatatank.com/france/places>, <http://demo.thedatatank.com/xls/baseball>, <http://demo.thedatatank.com/brussels/european_institutions>, <http://demo.thedatatank.com/brussels/atm>, <http://demo.thedatatank.com/brussels/infopoints>, <http://demo.thedatatank.com/brussels/youth_hostels>, <http://demo.thedatatank.com/brussels/museums>, <http://demo.thedatatank.com/brussels/parks>, <http://demo.thedatatank.com/brussels/police>, <http://demo.thedatatank.com/brussels/comics_tour>, <http://demo.thedatatank.com/flanders/datasets>, <http://demo.thedatatank.com/okfn/country-codes>, <http://demo.thedatatank.com/kortrijk/parking/shopandgo>, <http://demo.thedatatank.com/un/cofog>, <http://demo.thedatatank.com/okfn/census>, <http://demo.thedatatank.com/openflights/airlines>, <http://demo.thedatatank.com/wikipedia/nmbs/stations>, <http://demo.thedatatank.com/dbpedia/stations>, <http://demo.thedatatank.com/openbelgium/d48011dc-93a2-4239-aad3-fd294d474cb1>, <http://demo.thedatatank.com/villo/availability>, <http://demo.thedatatank.com/eandis/afschakelplan/westvlaanderen>, <http://demo.thedatatank.com/eandis/afschakelplan/oostvlaanderen>, <http://demo.thedatatank.com/dcat/demo>, <http://demo.thedatatank.com/mobilit/registrationsbyniscode>, <http://demo.thedatatank.com/csv/geo-proxy>, <http://demo.thedatatank.com/parko/states> .\n' +

	'<http://lexvo.org/id/iso639-3/eng> a dc:LinguisticSystem .\n' +
	'<http://www.opendefinition.org/licenses/cc-zero> a dc:LicenseDocument .\n' +
	'<http://thedatatank.com/#organization>\n' +
	  'a foaf:Agent ;\n' +
	  'foaf:name "The DataTank" .\n' +

	'<http://demo.thedatatank.com/brussels/museums>\n' +
	  'a dcat:Dataset ;\n' +
	  'dc:title "brussels/museums" ;\n' +
	  'dc:description "Location of the museums of the City of Brussels" ;\n' +
	  'dc:identifier "brussels/museums" ;\n' +
	  'dc:issued "2013-12-15T15:30:55+0000" ;\n' +
	  'dc:modified "2013-12-15T15:40:40+0000" ;\n' +
	  'dc:source <http://www.brussel.be/artdet.cfm/7237/Open-data-museums> ;\n' +
	  'dc:date "06-03-2012" ;\n' +
	  'dcat:distribution <http://demo.thedatatank.com/brussels/museums.json> .\n' +

	'<http://demo.thedatatank.com/brussels/museums.json>\n' +
	  'a dcat:Distribution ;\n' +
	  'dc:description "A json feed of http://demo.thedatatank.com/brussels/museums" ;\n' +
	  'dcat:mediaType "application/json" .\n' +
	  'dcat:bloebloe "application/json" .\n' +

	'<http://demo.thedatatank.com/brussels/parks>\n' +
	  'a dcat:Dataset ;\n' +
	  'dc:title "brussels/parks" ;\n' +
	  'dc:description "Location of the parks and gardens on the territory of the City of Brussels" ;\n' +
	  'dc:identifier "brussels/parks" ;\n' +
	  'dc:issued "2013-12-15T15:31:49+0000" ;\n' +
	  'dc:modified "2013-12-15T15:41:10+0000" ;\n' +
	  'dc:source <http://www.brussels.be/artdet.cfm/7232/Open-data-parks> ;\n' +
	  'dc:date "06-03-2012" ;\n' +
	  'dcat:distribution <http://demo.thedatatank.com/brussels/parks.json> .\n' +

	'<http://demo.thedatatank.com/brussels/parks.json>\n' +
	  'a dcat:Distribution ;\n' +
	  'dc:description "A json feed of http://demo.thedatatank.com/brussels/parks" ;\n' +
	  'dcat:mediaType "application/json" .';

//Include all the n3 libraries Ruben Verborgh made
var N3 = require('./lib/n3');
require('./lib/n3').Util(global);

//This line makes sure that the validate function can be used in different js file
if(window) window.validate = validate;

//The validation function with a callback to start the code after this function is done
function validate(dcat, callback) {
    
    //create an array with errors and warnings that contain objects with errror messages
	var feedback = {};
	feedback['errors'] = [];
	feedback['warnings'] = [];  

	//variable that can parse rdf file to URI's
	var parser = N3.Parser();

	//variable that can store all the triplets of the rdf file
	var store = N3.Store();

	parser.parse(dcat, function (error, triple, prefixes) {

		//if there are triples left, store them.
		//if there aren't find the errors and warnings
		if (triple) {
			store.addTriple(triple);
		} else {

			//Check dataset class
			var datasets = store.find(null, null , "http://www.w3.org/ns/dcat#Dataset");

			for (key in datasets) {
				var properties = store.find(datasets[key].subject, null, null);
			}

			//Check distrubution class
			var distributions = store.find(null, null , "http://www.w3.org/ns/dcat#Distribution");

			for (key in distributions) {
				var properties = store.find(distributions[key].subject, null, null);
				
				for(propKey in properties) {
					for(propRulesKey in validatorRules['Distribution'].properties) {
						if(properties[propKey].predicate == validatorRules['Distribution'].properties[propRulesKey].URI) {
							break;
						}
						else {
							console.log(propRulesKey + " en " + validatorRules['Distribution'].properties.length-1);
							if(propRulesKey == validatorRules['Distribution'].properties.length-1) {
								feedback['errors'].push("error, predicate: " + properties[propKey].predicate + " does not excist.");
								console.log(feedback['errors']);
							}
						}
					}
				}
			}

			//Check catalog class
			var catalogs = store.find(null, null , "http://www.w3.org/ns/dcat#Catalog");

			for (key in catalogs) {
				var properties = store.find(catalogs[key].subject, null, null);
				
				for(propKey in properties) {
					for(propRulesKey in validatorRules['Catalog'].properties) {
						if(properties[propKey].predicate == validatorRules['Catalog'].properties[propRulesKey].URI) {
							break;
						}
						else {
							if(propRulesKey == validatorRules['Catalog'].properties.length-1) {
								feedback['errors'].push({"error":"predicate: " + properties[propKey].predicate + " does not exist."});              
              				}
						}
					}
				}
			}

			//do the callback
      		callback();
		}
	});

	return feedback;
}

//the hard-coded validation rules of DCAT
var validatorRules = new Array();

//DCAT Catalog class
validatorRules['Catalog'] =
{
	"class": "Catalog",
	"prefix": "dcat",
	"required": "mandatory",
	"URI": "http://www.w3.org/ns/dcat#Catalog",
	"properties": [	
		{
		"name": "type",
		"prefix": "dct",
		"required": "mandatory",
		"Range": "rdfs:Literal",
		"URI": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
		},
		{
		"name": "title",
		"prefix": "dct",
		"required": "mandatory",
		"Range": "rdfs:Literal",
		"URI": "http://purl.org/dc/terms/title"
		},
		{
		"name": "description",
		"prefix": "dct",
		"required": "mandatory",
		"Range": "rdfs:Literal",
		"URI": "http://purl.org/dc/terms/description"
		},
		{
		"name": "issued",
		"prefix": "dct",
		"required": "recommended",
		"Range": "rdfs:LiteralDateTime",
		"URI": "http://purl.org/dc/terms/issued"
		},
		{
		"name": "modified",
		"prefix": "dct",
		"required": "recommended",
		"Range": "rdfs:LiteralDateTime",
		"URI": "http://purl.org/dc/terms/modified"
		},
		{
		"name": "language",
		"prefix": "dct",
		"required": "recommended",
		"Range": "dct:LinguisticSystem",
		"URI": "http://purl.org/dc/terms/language"
		},
		{
		"name": "publisher",
		"prefix": "dct",
		"required": "mandatory",
		"Range": "foaf:Agent",
		"URI": "http://purl.org/dc/terms/publisher"
		},
		{
		"name": "themes",
		"prefix": "dcat",
		"required": "recommended",
		"Range": "skos:ConceptScheme",
		"URI": "http://purl.org/dc/terms/themeTaxonomy"
		},
		{
		"name": "license",
		"prefix": "dct",
		"required": "recommended",
		"Range": "dct:LicenseDocument",
		"URI": "http://purl.org/dc/terms/license"
		},
		{
		"name": "rigths",
		"prefix": "dct",
		"required": "optional",
		"Range": "dct:RightsStatement",
		"URI": "http://purl.org/dc/terms/rights"
		},
		{
		"name": "spatial",
		"prefix": "dct",
		"required": "optional",
		"Range": "dct:Location",
		"URI": "http://purl.org/dc/terms/spatial"
		},
		{
		"name": "dataset",
		"prefix": "dcat",
		"required": "mandatory",
		"Range": "dcat:Dataset",
		"URI": "http://www.w3.org/ns/dcat#dataset"
		},
		{
		"name": "record",
		"prefix": "dcat",
		"required": "optional",
		"Range": "dcat:CatalogRecord",
		"URI": "http://www.w3.org/ns/dcat#record"
		},
		{
		"name": "homepage",
		"prefix": "foaf",
		"required": "recommended",
		"Range": "foaf:Document",
		"URI": "http://xmlns.com/foaf/0.1/homepage"
		}
	]
};

//DCAT CatalogRecord class
validatorRules['CatalogRecord'] =
{
  	"class": "CatalogRecord",
  	"prefix": "dcat",
  	"required": "optional",
  	"properties": [
	    {
		"name": "type",
		"prefix": "dct",
		"required": "mandatory",
		"Range": "rdfs:Literal",
		"URI": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
		},
		{
		"name": "title",
		"prefix": "dct",
		"required": "mandatory",
		"Range": "rdfs:Literal",
		"URI": "http://purl.org/dc/terms/title"
		},
		{
		"name": "description",
		"prefix": "dct",
		"required": "mandatory",
		"Range": "rdfs:Literal",
		"URI": "http://purl.org/dc/terms/description"
		},
	    {
	      "name": "issued",
	      "prefix": "dct",
	      "required": "recommended",
	      "Range": "rdfs:LiteralDateTime"
	    },
	    {
	      "name": "modified",
	      "prefix": "dct",
	      "required": "mandatory",
	      "Range": "rdfs:LiteralDateTime"
	    },
	    {
	      "name": "primaryTopic",
	      "prefix": "foaf",
	      "required": "mandatory",
	      "Range": "foaf:primaryTopic"
	    },
  	]
};

//DCAT Dataset class
validatorRules['Dataset'] =
{
  "class": "Dataset",
  "prefix": "dcat",
  "required": "mandatory",
  "properties": [
    {
      "name": "title",
      "prefix": "dct",
      "required": "mandatory",
      "Range": "rdfs:Literal"
    },
    {
      "name": "description",
      "prefix": "dct",
      "required": "mandatory",
      "Range": "rdfs:Literal"
    },
    {
      "name": "issued",
      "prefix": "dct",
      "required": "optional",
      "Range": "rdfs:LiteralDateTime"
    },
    {
      "name": "modified",
      "prefix": "dct",
      "required": "optional",
      "Range": "rdfs:LiteralDateTime"
    },
    {
      "name": "language",
      "prefix": "dct",
      "required": "optional",
      "Range": "dct:LinguisticSystem"
    },
    {
      "name": "publisher",
      "prefix": "dct",
      "required": "recommended",
      "Range": "foaf:Agent"
    },
    {
      "name": "accrualPeriodicity",
      "prefix": "dct",
      "required": "optional",
      "Range": "dct:Frequency"
    },
    {
      "name": "identifier",
      "prefix": "dct",
      "required": "optional",
      "Range": "frdfs:Literal"
    },
    {
      "name": "temporal",
      "prefix": "dct",
      "required": "optional",
      "Range": "dct:PeriodOfTime"
    },
    {
      "name": "theme",
      "prefix": "dcat",
      "required": "recommended",
      "Range": "skos:Concept"
    },
    {
      "name": "keyword",
      "prefix": "dcat",
      "required": "recommended",
      "Range": "rdfs:Literal"
    },
    {
      "name": "contactPoint",
      "prefix": "dcat",
      "required": "recommended",
      "Range": "vcard:Kind"
    },
    {
      "name": "temporal",
      "prefix": "dct",
      "required": "optional",
      "Range": "false"
    },
    {
      "name": "spatial",
      "prefix": "dct",
      "required": "optional",
      "Range": "dct:Location"
    },
    {
      "name": "distribution",
      "prefix": "dcat",
      "required": "recommended",
      "Range": "dcat:Distribution"
    },
    {
      "name": "landingPage",
      "prefix": "dcat",
      "required": "optional",
      "Range": "foaf:Document"
    }
  ]
};

//DCAT Distribution class
validatorRules['Distribution'] =
{
  "class": "Distribution",
  "prefix": "dcat",
  "required": "recommended",
  "properties": [
    {
		"name": "type",
		"prefix": "dct",
		"required": "mandatory",
		"Range": "rdfs:Literal",
		"URI": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
	},
	{
		"name": "title",
		"prefix": "dct",
		"required": "mandatory",
		"Range": "rdfs:Literal",
		"URI": "http://purl.org/dc/terms/title"
	},
	{
		"name": "description",
		"prefix": "dct",
		"required": "mandatory",
		"Range": "rdfs:Literal",
		"URI": "http://purl.org/dc/terms/description"
	},
    {
		"name": "issued",
		"prefix": "dct",
		"required": "recommended",
		"Range": "rdfs:LiteralDateTime",
		"URI": "http://purl.org/dc/terms/issued"
	},
	{
		"name": "modified",
		"prefix": "dct",
		"required": "recommended",
		"Range": "rdfs:LiteralDateTime",
		"URI": "http://purl.org/dc/terms/modified"
	},
	{
		"name": "language",
		"prefix": "dct",
		"required": "recommended",
		"Range": "dct:LinguisticSystem",
		"URI": "http://purl.org/dc/terms/language"
	},
    {
		"name": "license",
		"prefix": "dct",
		"required": "recommended",
		"Range": "dct:LicenseDocument",
		"URI": "http://purl.org/dc/terms/license"
	},
	{
		"name": "rigths",
		"prefix": "dct",
		"required": "optional",
		"Range": "dct:RightsStatement",
		"URI": "http://purl.org/dc/terms/rights"
	},
	{
		"name": "spatial",
		"prefix": "dct",
		"required": "optional",
		"Range": "dct:Location",
		"URI": "http://purl.org/dc/terms/spatial"
	},
    {
      "name": "accessURL",
      "prefix": "dcat",
      "required": "mandatory",
      "Range": "rdfs:Resource",
      "URI": "http://www.w3.org/ns/dcat#accessURL"
    },
    {
      "name": "downloadURL",
      "prefix": "dcat",
      "required": "optional",
      "Range": "rdfs:Resource",
      "URI": "http://www.w3.org/ns/dcat#downloadURL"
    },
    {
      "name": "mediaType",
      "prefix": "dcat",
      "required": "recommended",
      "Range": "dct:MediaTypeOrExtent",
      "URI": "http://www.w3.org/ns/dcat#mediaType"
    },
    {
      "name": "format",
      "prefix": "dct",
      "required": "recommended",
      "Range": "dct:MediaTypeOrExtent",
      "URI": "http://purl.org/dc/terms/format"
    },
    {
      "name": "byteSize",
      "prefix": "dcat",
      "required": "optional",
      "Range": "rdfs:LiteralDecimal",
      "URI": "http://www.w3.org/ns/dcat#byteSize"
    }
  ]
};

//DCAT ConceptScheme class
validatorRules['ConceptScheme'] =
{
  "class": "ConceptScheme",
  "prefix": "skos",
  "required": "mandatory",
  "properties": [
    {
      "name": "title",
      "prefix": "dct",
      "required": "mandatory",
      "Range": "dct:title"
    }
  ]
};

//DCAT Concept class
validatorRules['Concept'] =
{
  "class": "Concept",
  "prefix": "skos",
  "required": "mandatory",
  "properties": [
    {
      "name": "prefLabel",
      "prefix": "skos",
      "required": "mandatory",
      "Range": "skos:prefLabel"
    }
  ]
};

//DCAT Agent class
validatorRules['Agent'] =
{
  "class": "Agent",
  "prefix": "foaf",
  "required": "mandatory",
  "properties": [
    {
      "name": "name",
      "prefix": "foaf",
      "required": "mandatory",
      "Range": "foaf:name"
    }
  ]
};