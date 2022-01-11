/**
 * GitHub  https://github.com/tanaikech/HtmlFormObjectParserForGoogleAppsScript
_js<br>
 * Run HtmlFormObjectParserForGoogleAppsScript_js. This is a Javascript library for sending the HTML form object to Google Apps Script using "google.script.run".<br>
 * @param {Object} formObj Form object
 * @param {String} fields Fields value. Default is "name,type,value,files,checked".
 * @param {String} excludeTypes Exclude types. Default is "submit".
 * @param {Boolean} includeOrder Include order of each input tag in form. Default is false. When this value is true, a property of "orderOfFormObject" is included in the returned object. This value is the order of HTML form object.
 * @return {Object} Return Object
 */
function ParseFormObjectForGAS(formObj, fields, excludeTypes, includeOrder) {
  return new HtmlFormObjectParserForGoogleAppsScript(
    formObj,
    fields,
    excludeTypes,
    includeOrder
  ).Do();
}
(function (r) {
  var HtmlFormObjectParserForGoogleAppsScript;
  HtmlFormObjectParserForGoogleAppsScript = function () {
    class HtmlFormObjectParserForGoogleAppsScript {
      constructor(obj_, fieldsValue_, excludeTypes_, includeOrder_) {
        if (obj_.toString() !== "[object HTMLFormElement]") {
          throw new Error("Invalid HTMLFormElement.");
        }
        this.formObj = Array.from(obj_);
        if (this.formObj.length === 0) {
          throw new Error("No properties in the inputted form object.");
        }
        if (!fieldsValue_ || fieldsValue_ === "") {
          fieldsValue_ = "name,type,value,files,checked";
        } else if (typeof fieldsValue_ !== "string") {
          throw new Error(
            'Invalid fields. Please set it like "name,type,value,files,checked"'
          );
        }
        if (!excludeTypes_ || excludeTypes_ === "") {
          excludeTypes_ = "submit";
        } else if (excludeTypes_ === "-") {
          excludeTypes_ = "";
        } else if (typeof excludeTypes_ !== "string") {
          throw new Error('Invalid exclude types. Please set it like "submit"');
        }
        this.fields = fieldsValue_.split(",").map((g) => {
          return g.trim();
        });
        this.excludeTypes = excludeTypes_.split(",").map((g) => {
          return g.trim();
        });
        this.includeOrder = includeOrder_ || false;
      }

      async Do() {
        var ar, e, initObj, orderOfFormObject;
        try {
          ar = await Promise.all(
            this.formObj.map((obj, i) => {
              return new Promise(async (res, rej) => {
                var files, htmlObj, temp;
                htmlObj = {};
                for (i in obj) {
                  if (typeof obj[i] !== "function" && obj[i] !== null) {
                    htmlObj[i] = obj[i];
                  }
                }
                temp = {
                  [obj.name || `noName${i + 1}`]: htmlObj,
                };
                if (obj.type === "file") {
                  files = obj.files;
                  temp[obj.name].files = {};
                  temp[obj.name].files = await (async (files) => {
                    return await Promise.all(
                      [...files].map((file) => {
                        return new Promise((resolve, reject) => {
                          var fr;
                          fr = new FileReader();
                          fr.onload = (f) => {
                            return resolve({
                              filename: file.name,
                              mimeType: file.type,
                              bytes: [...new Int8Array(f.target.result)],
                            });
                          };
                          fr.onerror = (err) => {
                            return reject(err);
                          };
                          return fr.readAsArrayBuffer(file);
                        });
                      })
                    );
                  })(files).catch((err) => {
                    return rej(err);
                  });
                }
                return res(temp);
              });
            })
          );
          initObj = {};
          if (this.includeOrder) {
            orderOfFormObject = ar.flatMap((oo) => {
              var key;
              key = Object.keys(oo)[0];
              if (this.excludeTypes.includes(oo[key].type)) {
                return [];
              } else {
                return [key];
              }
            });
            initObj = { orderOfFormObject };
          }
          return ar.reduce((oo, ee) => {
            var k, v;
            [[k, v]] = Object.entries(ee);
            if (this.fields.length > 0) {
              Object.keys(v).forEach((ff) => {
                if (!this.fields.includes(ff) && !this.fields.includes("*")) {
                  return delete v[ff];
                }
              });
            }
            if (this.excludeTypes.length > 0) {
              if (
                this.excludeTypes.some((ff) => {
                  return v.type === ff;
                })
              ) {
                return oo;
              }
            }
            return Object.assign(oo, {
              [k]: oo[k] ? oo[k].concat(v) : [v],
            });
          }, initObj);
        } catch (error) {
          e = error;
          throw new Error(e);
        }
      }
    }

    HtmlFormObjectParserForGoogleAppsScript.name =
      "HtmlFormObjectParserForGoogleAppsScript_js";

    return HtmlFormObjectParserForGoogleAppsScript;
  }.call(this);
  return (r.HtmlFormObjectParserForGoogleAppsScript =
    HtmlFormObjectParserForGoogleAppsScript);
})(this);
