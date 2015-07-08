// Main javascript file

var N3 = require('./lib/n3');
require('./lib/n3').Util(global);

function validate(dcat) {
	var feedback = new Array();
	feedback['warnings'] = [];
	feedback['errors'] = [];

	//feedback['warnings'].push(warning);

	var parser = N3.Parser();
	var store = N3.Store();

	parser.parse(dcat, function (error, triple, prefixes) {
		if (triple) {
			store.addTriple(triple);
		} else {
			var datasets = store.find(null, null , "http://www.w3.org/ns/dcat#Dataset");

			for (key in datasets) {
				var properties = store.find(datasets[key].subject, null, null);
				//console.log(properties);
			}

			var distributions = store.find(null, null , "http://www.w3.org/ns/dcat#Distribution");

			for (key in distributions) {
				var properties = store.find(distributions[key].subject, null, null);
				//console.log(properties);
			}

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
								feedback['errors'].push("error, predicate: " + properties[propKey].predicate + " does not excist.");
							}
						}
					}
				}
			}
		}
	});

	return feedback;
}

var validatorRules = new Array();
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