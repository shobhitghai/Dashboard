this["App"] = this["App"] || {};
this["App"]["Template"] = this["App"]["Template"] || {};

this["App"]["Template"]["tile-opportunity"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"panel panel-primary\">\n    <div class=\"panel-heading\">\n        <div class=\"row\">\n            <div class=\"col-xs-5 tile-left-section\">\n                <span class=\"tile-type fa fa-4x\"></span>\n                <span class=\"tile-text-left\">"
    + alias3(((helper = (helper = helpers['tile-name'] || (depth0 != null ? depth0['tile-name'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"tile-name","hash":{},"data":data}) : helper)))
    + "</span>\n            </div>\n            <div class=\"col-xs-7 tile-right-section \">\n                <div class=\"tile-data-count\">"
    + alias3(((helper = (helper = helpers['tile-percent'] || (depth0 != null ? depth0['tile-percent'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"tile-percent","hash":{},"data":data}) : helper)))
    + "</div>\n                <div class=\"tab-type-text\">\n                    <span class=\"tile-percent-change\">"
    + alias3(((helper = (helper = helpers['tile-percent-change'] || (depth0 != null ? depth0['tile-percent-change'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"tile-percent-change","hash":{},"data":data}) : helper)))
    + "</span>\n                    <span class=\"tile-period-parameter\">"
    + alias3(((helper = (helper = helpers['tile-period-param'] || (depth0 != null ? depth0['tile-period-param'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"tile-period-param","hash":{},"data":data}) : helper)))
    + "</span>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});